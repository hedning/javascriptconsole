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

	console.log(output);
}

removeElement = function (element) {
	storeStyle(element, {display: "none"});
}



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
//(function () {

var inputString = new String;

function keybindHandler(e) {

	var eventType = e.type;
	var modifiersDown = e.ctrlKey?"<ctrl>":false|| e.altKey?"<alt>":false;
	var modifiersDown = (e.ctrlKey && e.altKey)?"<ctrlalt>": modifiersDown;
	var keyIsModifier = false;
	var charIsSpecial = false;
	var shift = e.shiftKey?"<shift>":false;
	var keycode = e.keyCode;
	var charcode = e.charCode;
	var target = type(e.target);
	var charCharacter = String.fromCharCode(charcode);
	var keyCharacter;

	var code = keycode || charcode;
	var character = String.fromCharCode(code);


	switch(keycode.toString()) {
		case "16":
			character = "<shift>";
			keyIsModifier = true;
			break;
		case "17":
			character = "<ctrl>";
			keyIsModifier = true;
			break;
		case "18":
			character = "<alt>";
			keyIsModifier = true;
			break;
		case "27":
			character = "<esc>";
			charIsSpecial = true;
			break;
		case "9":
			character = "<tab>";
			charIsSpecial = true;
			break;
		case "8":
			character = "<backspace>";
			charIsSpecial = true;
			break;
		case "32":
			character = "<space>";
			charIsSpecial = true;
			break;
		case "13":
			character = "<enter>";
			charIsSpecial = true;
			break;
	}

	if ( keyIsModifier )
		return false;

	function keylog () {
		log("eventType: "+eventType+", target: "+target,
				"keycode: "+keycode+";"+character+", "+modifiersDown+", "+shift,
				"inputString: "+inputString,
				"charcode: "+charcode+" "+charCharacter);
	}

//	if ( !keyIsModifier ) {
		if ( eventType == "keypress" && !modifiersDown && !charIsSpecial) {


			inputString += character;
			keylog();
		}
		if ( eventType == "keydown" && ( modifiersDown || charIsSpecial )) {

			if ( modifiersDown ) {
				inputString += modifiersDown;
				if ( !charIsSpecial ) {
					if ( !shift ) 
						character = character.toLowerCase();
					else if ( character == character.toLowerCase() )
						inputString += shift;
				} else {
					inputString += shift ? shift : "";
				}
			
			} else {
				inputString += shift ? shift : "";
			}
			inputString += character;
			keylog();
		}
//	}


	if ( !/</.test(keyCharacter) && eventType == "keyup")
		log("-------end");
}

window.addEventListener("keydown", keybindHandler, false);
window.addEventListener("keypress", keybindHandler, false);
window.addEventListener("keyup", keybindHandler, false);




// action should get fed the match
// special characters: <ctrlalt>, <shift>, <ctrl>, <esc>, <alt>, <tab>, <enter>, <backspace>, <space>
// use \< and \> to escape them, propably
// you also need to escape characters with special meanings in regexps
function bindKeypress(keyRegExp, action, context, preventDefault, stopPropagating) {

	if ( !preventDefault )
		preventDefault = true;
	if ( !stopPropagating )
		stopPropagating = false;


}

//})()

// Examples on how one would bind stuff:
// bindKeypress( /oe/, newpage, body), nested
// bindKeypress( /h/, scrollDown, body )
// bindKeypress( /t/, scrollUp body )
// bindKeypress( /<ctrl>u/, scrollPageUp, "*" ), modifier
// bindKeypress( /\/*/, search, body), not sure about this one
// bindKeypress( /\//, search, body)
// bindKeypress( /<ctrl>a/, moveToStart, textArea)
// bindKeypress( /<ctrl>k/, deleteToEndOfLine, textArea)
// bindKeypress( /<ctrl>f?/, moveToChar, textArea)





//---}}} keybinding system



})()
