(function(){

var bindings = importModule("bindings");
var log = importModule("log").log;

var defineBindings = bindings.defineBindings,
defineContext = bindings.defineContext,
setMode = bindings.setMode,
deleteBindings = bindings.deleteBindings,
defineMode = bindings.defineMode;


defineContext("document", function (node) {
	nodeName = node.nodeName.toLowerCase();
	return nodeName !== "input" && nodeName !== "textarea" && !node.isContentEditable;
});

defineContext("global", function () { return true; });

defineContext("textInput", function (node) { 
	var nodeName = node.nodeName.toLowerCase();
	if ( nodeName === "input" || nodeName === "textarea" || node.isContentEditable )
		return true;
	else
		return false;
});

defineMode("textInput", "command");

defineContext("link", function (node) {
	if ( node.nodeName.toLowerCase() === "a" )
		return true;
});


defineBindings( 
		{ bind: "h", action: scrollAction(40), context: "document" },
		{ bind: "t", action: scrollAction(-40), context: "document" },
		{ bind: "d", action: scrollAction(0, -40), context: "document" },
		{ bind: "n", action: scrollAction(0, 40), context: "document" },
		{ bind: "g", action: scrollAction("start"), context: "document" },
		{ bind: "G", action: scrollAction("end"), context: "document" },
		{ bind: "\\$", action: scrollAction(null, "end"), context: "document" },
		{ bind: "0", action: scrollAction(null, "start"), context: "document" },
		{ bind: "r", action: function(){location.reload()}, context: "document" },
		{ bind: ",", action: function(){history.back()}, context: "document" },
		{ bind: "\\.", action: function(){history.forward()}, context: "document" },
		{ bind: "<ctrl>u", action: scrollAction("pageUp"), context: "global" },
		{ bind: "<shift> ", action: scrollAction("pageUp"), context: "document" },
		{ bind: "<ctrl>d", action: scrollAction("pageDown"), context: "global" },
		{ bind: " ", action: scrollAction("pageDown"), context: "document" },
		{ bind: "<ctrl>[^dus]", context: "global", preventDefault: false }, // dummy binding to enable certain standard keybindings
		{ bind: "<esc>", action: commandMode, context: "textInput"},
		{ bind: "<[^<>]*>", context: "textInput.command", preventDefault: false},
		{ bind: "<esc>", action: blurInput, context: "textInput.command"},
		{ bind: ".", context: "textInput.command"},
		{ bind: "i", action: insertMode, context: "textInput.command"},
		{ bind: "<ctrl>u", action: clearInput, context: "textInput"},
		{ bind: "<ctrl>d", action: forwardDelete, context: "textInput"},
		{ bind: "<ctrl>a", action: moveToLineStart, context: "textInput"},
		{ bind: "<ctrl>e", action: moveToLineEnd, context: "textInput"},
		{ bind: "\\$", action: moveToLineEnd, context: "textInput.command"},
		{ bind: "0", action: moveToLineStart, context: "textInput.command"},
		{ bind: "<ctrl>o", context: "textInput", subMap: true },
		{ bind: "<ctrl>o(.)", action: moveToKey, context: "textInput" },
		{ bind: "f", action: moveToKey, context: "textInput.command", subMap: true },
		{ bind: "f(.)", action: moveToKey, context: "textInput.command" }
);

function blurInput(match) {
	this.blur();
}


// zoom bindings for chromium
if ( window.chrome ) {

	function zoom(match) {
		var zoomLevel = 100 + (10*Number(match[1]));
		document.body.style.zoom = zoomLevel+"%";
	}

	defineBindings(
			{ bind: "z([0-9])", action: zoom, context: "document" },
			{ bind: "zz", action: function(){document.body.style.zoom = "100%"}, context: "document" }
	);
}


function scrollAction(y, x) {
	var relative;
	if ( type(x) == "Number" || type(y) == "Number" || y == "pageDown" || y == "pageUp" )
		relative = true;

	if ( relative ) {
		return function () {
			var argX = x;
			var argY = y;
			var clientHeight = document.documentElement.clientHeight;
			var innerHeight = window.innerHeight;
			if ( ! x )
				argX = 0;
			if ( y == null )
				argY = 0;
			if ( y == "pageDown" )
				 argY = clientHeight <= innerHeight ? clientHeight-10 : innerHeight-10;
			if ( y == "pageUp" )
				 argY = clientHeight <= innerHeight ? -clientHeight+10 : -innerHeight+10;
//			log("x: "+x+", "+argX,"y: "+y+", "+argY);
			scrollBy(argX,argY);
		}
	} else {
		return function () {
			var argX;
			var argY;
			if ( x == undefined )
				argX = window.pageXOffset;
			if ( y == null )
				argY = window.pageYOffset;
			if ( y == "end" )
				argY = document.documentElement.scrollHeight;
			if ( y == "start" )
				argY = 0;
			if ( x == "end" )
				argX = document.documentElement.scrollWidth;
			if ( x == "start" )
				argX = 0;
//			log("x: "+x+", "+argX,"y: "+y+", "+argY);
			scroll(argX,argY);
		}
	}
}



// ---{{{ start text edit functions



function setCursorPosition(input, index) {
	input.setSelectionRange(index, index);
}

function clearInput(match) { this.value = ""; };

function forwardDelete(match) {

	var value = this.value;
	var pos = this.selectionEnd

	var right = value.slice(pos + 1);
	var left = value.slice(0, pos);

	this.value = left + right;
	setCursorPosition(this, pos);
}

function moveToLineEnd(match) {
	var end = this.textLength;
	setCursorPosition(this, end);
}

function moveToLineStart(match) {
	setCursorPosition(this, 0);
}

function moveToKey(match) {

	var key = match[1];
	if ( this.selectionEnd == this.selectionStart ) {
		var position = this.selectionEnd;
		var str = this.value.slice(position);
		var newPosition = str.indexOf(key)+position;
		if ( newPosition == position )
			newPosition = str.indexOf(key, 1)+position;

		if ( newPosition > position )
			this.setSelectionRange(newPosition, newPosition);
//		log("key: "+key,"str: "+str,"newPosition: "+newPosition, "matchL: "+match);

	}
}

function commandMode(match) {
	setMode(this, "command");
	this.style.outline = "red 1px solid";
}
function insertMode(match) {
	setMode(this, "");
	this.style.outline = "";
}



// ---}}} end text edit functions

(function(){
	var currentMouseOverElement = null,
	lastStyle = null,
	mouseoverBinding = { bind: "<mouseover.>", action: mouseoverHandler },
	mouseoutBinding = { bind: "<mouseout.>", action: mouseoutHandler },
	clickBinding = { bind: "<click0>", action: clickHandler };

	function setStyle(ele, unset) {
		var styleAtt = "outline";
		if ( !unset )
			lastStyle = ele.style[styleAtt];
		var unStyle = lastStyle;
		ele.style[styleAtt] =( unset ? unStyle: "blue solid 1px");
	};


	function mouseoverHandler(match) {
		currentMouseOverElement = this;
		setStyle(this);
	}

	function mouseoutHandler(match) {
		setStyle(this, true);
	}

	function clickHandler(match) {
		var cli = document.getElementsByClassName("wrapDiv")[0];
		var input = cli.getElementsByTagName("textarea")[0];
		var name = this.nodeName, id = this.id, className = this.className;
		if ( id )
			name += "_id$" + id;
		if (className)
			name += "_class$" + className;
		name = name.replace(/[^\w$_]+/g, "_");
		window[name] = this;
		input.value = name;
	}

	var initSelectElement = function () {
		defineBindings(mouseoutBinding, mouseoverBinding, clickBinding);
	};

	var stopSelectElement = function () {
		deleteBindings(mouseoutBinding, mouseoverBinding, clickBinding);
		setStyle(currentMouseOverElement, true);
	};

	function selectElement() {
		var toggle = false;
		return function () {
			if ( ! toggle ) {
				initSelectElement();
				toggle = true;
			} else {
				stopSelectElement();
				toggle = false;
			}
		}
	}
	defineBindings({ bind: "<ctrl>s", action: selectElement(), context: "global" })

}());


}())
