(function(){

var bindings = importModule("bindings");

var defineBindings = bindings.defineBindings,
defineContext = bindings.defineContext,
setMode = bindings.setMode,
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
		{ bind: "<ctrl>s", action: selectElement(), context: "global" },
		{ bind: "<ctrl>[^dus]", context: "global", preventDefault: false }, // dummy binding to enable certain standard keybindings
		{ bind: "<esc>", action: blurInput, context: "textInput"},
		{ bind: "<ctrl>u", action: clearInput, context: "textInput"},
		{ bind: "<ctrl>d", action: forwardDelete, context: "textInput"},
		{ bind: "<ctrl>a", action: moveToLineStart, context: "textInput"},
		{ bind: "<ctrl>e", action: moveToLineEnd, context: "textInput"},
		{ bind: "<ctrl>o", context: "textInput", subMap: true },
		{ bind: "<ctrl>o(.)", action: moveToKey, context: "textInput" }
);

function blurInput(match, input) {
	input.blur();
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

function clearInput(match, eventTarget) { eventTarget.value = ""; };

function forwardDelete(match, input) {

	var value = input.value;
	var pos = input.selectionEnd

	var right = value.slice(pos + 1);
	var left = value.slice(0, pos);

	input.value = left + right;
	setCursorPosition(input, pos);
}

function moveToLineEnd(match, input) {
	var end = input.textLength;
	setCursorPosition(input, end);
}

function moveToLineStart(match, input) {
	setCursorPosition(input, 0);
}

function moveToKey(match, input) {

	var key = match[1];
	if ( input.selectionEnd == input.selectionStart ) {
		var position = input.selectionEnd;
		var str = input.value.slice(position);
		var newPosition = str.indexOf(key)+position;
		if ( newPosition == position )
			newPosition = str.indexOf(key, 1)+position;

		if ( newPosition > position )
			input.setSelectionRange(newPosition, newPosition);
//		log("key: "+key,"str: "+str,"newPosition: "+newPosition, "matchL: "+match);

	}
}

// ---}}} end text edit functions



}())
