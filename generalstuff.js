(function () {
inspect = function (obj, reg) {

	var output = "";
	if ( reg ) {
		for ( var i in obj ){
			if ( i.match(reg) )
				output += i + "\n";
		}
	} else {
		for ( var i in obj ) {
				output += i + "\n";
		}
	}

	return output.replace(/\n$/, "");
}	

newcli = function (str){
	if ( ! str ) 
		str = "cli2";
	var newcli = window[str] = new javascriptConsole();

	newcli.style.bottom = "50%";
	newcli.open()
}


var currentMouseOverElement = null;
var lastStyle = null;

function setStyle(ele, unset) {
	var styleAtt = "outline";
	if ( !unset )
		lastStyle = ele.style[styleAtt];
	var unStyle = lastStyle;
	ele.style[styleAtt] =( unset ? unStyle: "blue solid 2px");
//	ele.style.borderColor =( unset ? "" : "black");
}

function mouseoverHandler(e) {
	_$ = e.target;
	bubbles = e.bubbles;
	currentMouseOverElement = e.target;
	setStyle(e.target);
}

function mouseoutHandler(e) {
	setStyle(e.target, true);
}


function clickHandler(e) {
	cli.focus();
	e.preventDefault();
	var name = e.target.nodeName ;
	var id = e.target.id;
	var className = e.target.className;
	if ( id )
		name += "_id$" + id;
	if (className)
		name += "_class$" + className;
	name = name.replace(/[^\w$_]+/g, "_");
	window[name] = e.target;
	cli.query.completion.replace(0, cli.query.textLength, name);

}


initSelectElement = function () {
	window.addEventListener("mouseover", mouseoverHandler, false);
	window.addEventListener("mouseout", mouseoutHandler, false);
	window.addEventListener("click", clickHandler, false);
}

stopSelectElement = function () {
	window.removeEventListener("mouseover", mouseoverHandler, false);
	window.removeEventListener("mouseout", mouseoutHandler, false);
	window.removeEventListener("click", clickHandler, false);
	setStyle(currentMouseOverElement, true);
}


type = function (o){
	return !!o && Object.prototype.toString.call(o).match(/(\w+)\]/)[1];
}



// alert wrapper

var oldAlert = alert;

message = function (input) {
	function close() {
		document.body.removeChild(outbox);
	}


	var outbox = document.createElement("div");
	var closebutton = document.createElement("button");
	var closebutton = document.createElement("button");

	if ( input != undefined )
		outbox.innerHTML = input + "<br>";
	closebutton.innerHTML = "close";
	outbox.appendChild(closebutton);
	outbox.style.position = "fixed";
	outbox.style.overflow = "visible";
	outbox.style.maxHeight = window.innerHeight;
	outbox.style.maxWidth = 500;
	outbox.style.textAlign = "center";
	outbox.style.backgroundColor = "grey";
	outbox.style.padding = 5;
	outbox.style.border = "2px solid black";
	closebutton.addEventListener("click", close, false);
	document.body.appendChild(outbox);
	outbox.style.minWidth = getComputedStyle(closebutton).width;
	var style = getComputedStyle(outbox);
	horizontalMargin = (window.innerWidth - style.width.replace(/px/,""))/2;
	var verticalMargin = (window.innerHeight - style.height.replace(/px/,""))/2;
	outbox.style.left = horizontalMargin;
	outbox.style.right = horizontalMargin;
//	outbox.style.top = verticalMargin;
	outbox.style.bottom = verticalMargin;

}


function reportSizeInit() {

	var outbox = document.createElement("div");
	document.body.appendChild(outbox);


	function reportSizeHandler (e) {
	outbox.innerHTML = "innerHeight: "+window.innerHeight+"<br>"+"innerWidth: "+window.innerWidth;
	outbox.style.width = 400;
	outbox.style.height = 200;
	outbox.style.backgroundColor = "grey";
	outbox.style.padding = 5;
	outbox.style.border = "2px solid black";
	closebutton.addEventListener("click", close, false);
	document.body.appendChild(outbox);
	outbox.style.minWidth = getComputedStyle(closebutton).width;
	var style = getComputedStyle(outbox);
	var horizontalMargin = (window.innerWidth - style.width.replace(/px/,""))/2;
	var verticalMargin = (window.innerHeight - style.height.replace(/px/,""))/2;
	outbox.style.left = horizontalMargin;
	outbox.style.right = horizontalMargin;



	}



}


$ = function (id) {
	return document.getElementById(id);
}


// from: http://blog.andyhot.gr/a/TapFX/?permalink=Allowing_Tapestry_components_to_contribute_CSS.html&smm=y
addRemoteStyleSheet = function (styleUrl) {
	var styles = "@import url('" + styleUrl + "');";
	var newSS=document.createElement('link');
	newSS.rel='stylesheet';
	newSS.href='data:text/css,'+escape(styles);
	document.getElementsByTagName("head")[0].appendChild(newSS);
}


// returns and array with all the direct ancestors of element, the element at the start of the array, then the parent etc.
function buildAncestorTree(element) {

	var ancestorTree = new Array;
	var currAncestor = element;

	while ( currAncestor != document.body.parentElement ) {

		ancestorTree.push(currAncestor);
		currAncestor = currAncestor.parentElement;
	}

	return ancestorTree;
}


// return type: array
// describes the tree you have to traverse to get to element with element.childNodes[i], starting at document.body
buildChildNodeTree = function (element) {

	var ancestorTree = buildAncestorTree(element);
	var childNodeTree = new Array;
	var childNodes;

	for ( var i=1; i < ancestorTree.length; i++) {

		childNodes = ancestorTree[i].childNodes;

		for ( var k=0; k < childNodes.length; k++ ) {
			if ( childNodes[k] == ancestorTree[i-1] ) {
				childNodeTree.push(k);
				break;
			}
		}

	}

	childNodeTree.reverse();
	return childNodeTree;

}


// takes an array with numbers and builds a tree like document.body.childNodes[array[0]].childNodes[array[1]]...
dereferenceChildNodeTree = function (childNodeTree) {

	var element = document.body;

	for ( i=0; i < childNodeTree.length; i++ ) {

		var childNodeCount = childNodeTree[i];
		element = element.childNodes[childNodeCount];
		if (!element) {
			return false;
		}
	}

	return element;
}


log = function () {


	var output = new String;
	for (var i=0;i<arguments.length;i++) {
		output += arguments[i]+"\n";
	}
	output = output.replace(/\n$/, "");

	if (window.opera)
		opera.postError(output);
	else
		console.log(output);
}

removeElement = function (element) {
	storeStyle(element, {display: "none"});
};



//---{{{ keybinding system
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
(function () {

var keybindings = new Array;

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
			character = "<space>";
			charIsSpecial = true;
			break;
		case 13: case "Enter":
			character = "<enter>";
			charIsSpecial = true;
			break;
	}
	if ( eventType == "keydown" || eventType == "keyup" ) {
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

	if ( which == 0 || modifiersDown || charIsSpecial )
		var keydown = true, keypress = false;
	else
		keydown = false, keypress = true

	if ( keyIsModifier )
		keydown = false, keypress = false;

	return [ character, charIsSpecial, keydown, keypress];
}

log.keyLogging = false;
log.actionLogging = false;
keyeventHandler.preventDefault = false;
function keyeventHandler(e) {

	var eventType = e.type;
	var ctrl = e.ctrlKey?"<ctrl>":"", alt = e.altKey?"<alt>":"", meta = e.metaKey?"<meta>":"";
	var modifiersDown = ctrl+alt+meta;
	var shift = e.shiftKey ? "<shift>" : "";

	var keycode = e.keyCode, charcode = e.charCode, which = e.which, keyId = e.keyIdentifier;
	var code = keyId || keycode || charcode;
	var evalArray = evaluateKeycode(code, eventType, which, modifiersDown); 
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
					"modifiers: "+modifiersDown+shift,
//					"inputString: "+inputString,
					key ? "key: "+key:"");
		}
	}

	var key = "";
	if ( eventType == "keypress" ) {
		if ( handleKeyOnKeypress ) {
			if ( character == "<" || character == ">" )
				character = "\\"+character;
			key += character;
		} else if ( keyeventHandler.preventDefault ) {
			e.preventDefault();
			keyeventHandler.preventDefault == false;
		}
	} 
	else if ( eventType == "keydown" && handleKeyOnKeydown ) {

		if ( modifiersDown ) {
			key += modifiersDown;
			if ( !charIsSpecial ) {
				if ( !shift ) 
					character = character.toLowerCase();
				else if ( character == character.toLowerCase() )
					key += shift;
			} else {
				key += shift ? shift : "";
			}
		} else {
			key += shift ? shift : "";
		}
		if ( character == "<" || character == ">" )
			character = "\\"+character;
		key += character;
	}

	keylog();
	var target = e.target;
	if ( key ) {
		if ( keybindHandler(key, target) ) {
			e.preventDefault();
			keyeventHandler.preventDefault = true;
		}
	}

	if ( eventType == "keyup") {
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
		context = binding.context;
		match = inputString.match(bind+"$");

		if ( match && context(eventTarget) ) {
			length = match[0].length;

			if ( length >= longest ) {
				matches.splice(0, 0, {index: i, match: match});
				longest = length;
			} else {
				matches.push({index: i, match: match});
			}
		}
	}


	for ( var i=0; i < matches.length; i++ ){
		binding = keybindings[matches[i].index]
		action = binding.action;
		if ( log.actionLogging && !binding.hookBind )
			log("binding: "+binding.bind, "action taken: "+action, "eventTarget: "+eventTarget, "match: "+matches[i].match);
		action(matches[i].match, eventTarget);
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



// action should get fed the match
// special characters: <ctrlalt>, <shift>, <ctrl>, <esc>, <alt>, <tab>, <enter>, <backspace>, <space>
// use \< and \> to escape < and >
// you also need to escape characters with special meanings in regexps
// context can either be a context class or a specific element
// keyregexp need to end in an $, should fix this
// not sure if modes should be implemented in regexps, propably not
// { bind: regExp, action: function, mode: string, context: string/node, actiontype: string, preventDefault: boolean, stopPropagating: boolean} 

var contexts = new Object;
defineContext = function (name, func) {
	contexts[name] = func;
}
getContext = function(name) {
	return contexts[name];
}


defineBindings = function () {

	for ( var i=0; i < arguments.length; i++ ) {

		var binding = arguments[i];
		if ( ! binding.bind ) 
			break;
		binding.preventDefault = binding.preventDefault != undefined ? binding.preventDefault : true;
		binding.stopPropagating = binding.stopPropagating ? true : false;
		binding.context = binding.context ? binding.context : "document";
		if ( type(binding.context) === "String" )
			binding.context = getContext(binding.context);
		binding.mode = binding.mode ? binding.mode : "default"; 
		binding.hookBind = binding.hookBind ? binding.hookBind : false; 

		keybindings.push(binding);
	}
}


function actionSetMode(mode) {

	function setMode () {
	}
	return setMode;
}

})();

// Examples on how one would bind stuff:
//
// defineBindings( { bind: /h$/, action: scrollDown },
// 				   { bind: /<ctrl>u$/, action: scrollPageUp },
// 				   { bind: /<ctrl>a$/, action: moveToStartofLine, context: "textInput" },
// 				   { bind: /<esc>$/, action: actionSetMode("command") },
// 				   { bind: /i$/, action: actionSetMode("insert"), context: "textInput" },
// 				   { bind: /f(.?)$/, action: moveToChar, mode: "command", context: "textInput" } )





//---}}} keybinding system



})()
