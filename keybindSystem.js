// keybinding system
//
// keypress does not fire when a modifier is down on chromium,
// does fire on opera and firefox.
//
// e.preventDefault only works on keypress in opera.
//
// Chrome and firefox reports weirds keycodes on keydown/up for some keys.
//
// Firefox reports e.charCode instead of e.keyCode on keypress (esc, tab etc. uses keycode)
// 
// Modifier keys does not fire onkeypress (opera, chrome and ff).
//
// Esc, tab and backspace only fires keydown/up in chrome, keypress fires
// in opera and ff.
//
// alt-gr does not fire anything in opera, fires keydown/up in chrome,
// and fires everything in ff (no key/charcode in either browser though).

// Examples on how one would bind stuff:
//
// defineBindings( { bind: /h$/, action: scrollDown },
// 				   { bind: /<ctrl>u$/, action: scrollPageUp },
// 				   { bind: /<ctrl>a$/, action: moveToStartofLine, context: "textInput" },
// 				   { bind: /<esc>$/, action: actionSetMode("command") },
// 				   { bind: /i$/, action: actionSetMode("insert"), context: "textInput" },
// 				   { bind: /f(.?)$/, action: moveToChar, mode: "command", context: "textInput" } )
(function () {

var keybindings = new Array;
var keybindSystem = {};

function evaluateKeycode(keycode, eventType, which, modifiersDown) {

	var keyIsModifier = false, charIsSpecial = false;
	if ( keycode.replace )
		keycode = keycode.replace(/^U\+/, "0x");
	var character = String.fromCharCode(keycode); 
	switch(keycode) {
		case 16: case "Shift":
			character = "<shift>";
			keyIsModifier = true;
			break;
		case 17: case "Control":
			character = "<ctrl>";
			keyIsModifier = true;
			break;
		case 18: case "Alt":
			character = "<alt>";
			keyIsModifier = true;
			break;
		case 27: case "0x001B":
			character = "<esc>";
			charIsSpecial = true;
			break;
		case 9: case "0x0009":
			character = "<tab>";
			charIsSpecial = true;
			break;
		case 8: case "0x0008":
			character = "<backspace>";
			charIsSpecial = true;
			break;
		case 32: case "0x0020":
			charIsSpecial = true;
			break;
		case 13: case "Enter":
			character = "<enter>";
			charIsSpecial = true;
			break;
	}
	if ( eventType === "keydown" || eventType === "keyup" ) {
		switch(keycode) {
			case 40: case "Down":
				character = "<down>";
				charIsSpecial = true;
				break;
			case 39: case "Right":
				character = "<right>";
				charIsSpecial = true;
				break;
			case 38: case "Up":
				character = "<up>";
				charIsSpecial = true;
				break;
			case 37: case "Left":
				character = "<left>";
				charIsSpecial = true;
				break;
			case 45: case "Insert":
				character = "<insert>";
				charIsSpecial = true;
				break;
			case 46: case "Delete":
				character = "<delete>";
				charIsSpecial = true;
				break;
			case 36: case "Home":
				character = "<home>";
				charIsSpecial = true;
				break;
			case 35: case "End":
				character = "<end>";
				charIsSpecial = true;
				break;
			case 33: case "PageUp":
				character = "<pageUp>";
				charIsSpecial = true;
				break;
			case 34: case "PageDown":
				character = "<pageDown>";
				charIsSpecial = true;
				break;
		}
	}
	if ( eventType.search(/mouse|click/) !== -1 ) {
			character = "<"+eventType+keycode+">";
	}

	if ( which === 0 || modifiersDown || charIsSpecial )
		var keydown = true, keypress = false;
	else
		keydown = false, keypress = true;

	if ( keyIsModifier )
		keydown = false, keypress = false;

	if ( character === "<" || character === ">" )
		character = "\\"+character;

	return [ character, charIsSpecial, keydown, keypress];
}

log.keyLogging = false;
log.actionLogging = false;
keyeventHandler.preventDefault = false;
function keyeventHandler(e) {

	var eventType = e.type;
	var ctrl = e.ctrlKey ? "<ctrl>" : "", alt = e.altKey?"<alt>" : "",
		meta = e.metaKey ? "<meta>" : "";
	var modifiers = ctrl+alt+meta;
	var shift = e.shiftKey ? "<shift>" : "";

	var keycode = e.keyCode, charcode = e.charCode, which = e.which,
		keyId = e.keyIdentifier, button = e.button;
	//button has to be last as it could be 0 which is falsy
	var code = keyId || keycode || charcode || button;
	var evalArray = evaluateKeycode(code, eventType, which, modifiers);

	var character = evalArray[0], charIsSpecial = evalArray[1];
	var handleKeyOnKeydown = evalArray[2], handleKeyOnKeypress = evalArray[3];

	function keylog () {
		if ( log.keyLogging ) {
			var cha = charcode ? "charcode: "+charcode+", " : "";
			var ke = keycode ? "keycode: "+keycode+", " : "";
			var whi = which ? "which: "+which+", " : "";
			var id = keyId ? "keyId: "+keyId+", " : "";
			var keyid = (ke+cha+whi+id).replace(/, $/, "");
			log("eventType: "+eventType+", target: "+target,
					keyid,
					"modifiers: "+modifiers+shift,
//					"inputString: "+inputString,
					key ? "key: '"+key+"'":"");
		}
	}

	var key = "";
	if ( eventType === "keypress" ) {
		if ( handleKeyOnKeypress ) {
			key += character;
		} else if ( keyeventHandler.preventDefault ) {
			e.preventDefault();
			keyeventHandler.preventDefault == false;
		}
	}
	else if ( eventType === "keydown" && handleKeyOnKeydown ) {
		key += modifiers;
		if ( !charIsSpecial ) {
			if ( !shift )
				character = character.toLowerCase();
			else if ( character === character.toLowerCase() )
				key += shift;
		} else {
			key += shift;
		}
		key += character;
	}
	else if ( eventType.search(/mouse|click/) !== -1 ) {
		key = modifiers + shift + character;
	}

	keylog();
	var target = e.target;
	if ( key ) {
		if ( keybindHandler(key, target) ) {
			e.preventDefault();
			keyeventHandler.preventDefault = true;
		}
	}

	if ( eventType === "keyup") {
		keyeventHandler.preventDefault = false; 
		if ( log.keyLogging )
			log("-------end");
	}
}


var inputString = new String;
function keybindHandler(key, eventTarget) {

	var matches = [], match;
	var bind, action, mode, context, longest=0, length, binding;
	inputString += key;

	for ( var i=0; i < keybindings.length; i++ ) {

		binding = keybindings[i];
		bind = binding.bind;
		context = getContext(binding.context);
		match = inputString.match(bind+"$");

		if ( match && context(eventTarget) ) {
			length = match[0].length;
			if ( binding.hookBind ) length = 0;
			matches.unshift({index: i, match: match, priority: length});
		}
	}
	
	matches.sort( function (a, b) {
			if ( a.priority === 0 ) return -1;
			if ( b.priority === 0 ) return 1;
			if ( a.priority < b.priority ) return 1;
			if ( a.priority > b.priority ) return -1;
			return 0;
			});

	for ( var i=0; i < matches.length; i++ ){
		binding = keybindings[matches[i].index]
		action = binding.action;
		if ( log.actionLogging && !binding.hookBind )
			log("binding: "+binding.bind, "action taken: "+action, "eventTarget: "+eventTarget, "match: "+matches[i].match);
		try {
			action(matches[i].match, eventTarget); 
		} catch(e) { log(e); };
		if ( ! binding.hookBind ) {
			inputString = "";
			return binding.preventDefault;
		}
	}
	return false;
}


window.addEventListener("keydown", keyeventHandler, false);
window.addEventListener("keypress", keyeventHandler, false);
window.addEventListener("keyup", keyeventHandler, false);
window.addEventListener("click", keyeventHandler, false);
window.addEventListener("dblclick", keyeventHandler, false);
window.addEventListener("mouseover", keyeventHandler, false);
window.addEventListener("mouseout", keyeventHandler, false);
window.addEventListener("mousedown", keyeventHandler, false);
window.addEventListener("mouseup", keyeventHandler, false);



// action should get fed the match
// special characters: <ctrlalt>, <shift>, <ctrl>, <esc>, <alt>, <tab>, <enter>, <backspace>
// use \< and \> to escape < and >
// you also need to escape characters with special meanings in regexps
// context can either be a context class or a specific element
// keyregexp need to end in an $, should fix this
// not sure if modes should be implemented in regexps, propably not
// { bind: regExp, action: function, mode: string, context: string/function, actiontype: string, preventDefault: boolean, stopPropagating: boolean} 

var contexts = new Object;
keybindSystem.defineContext = function (name, func) {
	contexts[name] = func;
};
var getContext = function (name) {
	return contexts[name] || name;
};

function evalMode(context, modeName) {
	return getContext(context).mode === modeName;
}

keybindSystem.defineMode = function (contextName, modeName) {

	context = getContext(contextName);

	var mode = function (target) {
		return context(target) &&
			evalMode(contextName, modeName);
	};
	
	contexts[contextName+"."+modeName] = mode;

};

keybindSystem.setMode = function (context, mode) {
	return function () {
		getContext(context).mode = mode;
	};
};


keybindSystem.defineBindings = function () {

	for ( var i=0; i < arguments.length; i++ ) {

		var binding = arguments[i];
		if ( ! binding.bind ) 
			break;
		binding.preventDefault = binding.preventDefault === false ? false : true;
		binding.stopPropagating = binding.stopPropagating || false;
		binding.context = binding.context || "document";
		if ( type(binding.context) === "String" )
			binding.context = getContext(binding.context);
		binding.mode = binding.mode || "default"; 
		binding.mode = binding.mode || "default"; 
		binding.hookBind = binding.hookBind || false; 
		binding.action = binding.action || function(){}; 
		binding.subMap = binding.subMap || false; 

		keybindings.push(binding);
	}
};

keybindSystem.deleteBindings = function () {

	var index;
	for ( var i=0; i < arguments.length; i++ ) {
		index = keybindings.indexOf(arguments[i]);
		keybindings.splice(index, 1);
	}
};

createModule("bindings", keybindSystem);

}());
