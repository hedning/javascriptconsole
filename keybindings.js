(function(){

bindContexts = new Object;
defineContext("document", function (node) {
	return node == document.body || node.nodeName == "A";
});

defineContext("global", function () { return true; });

function scrollAction(x, y) {
	var relative;
	if ( type(x) == "Number" )
		relative = true;
	if ( type(y) == "Number" )
		relative = true;
	if ( x == "pageDown" )
		relative = true;
	if ( x == "pageUp" )
		relative = true;

	if ( relative ) {
		if ( ! y )
			y = 0;
		if ( x == null )
			x = 0;
		return function () {
			var clientHeight = document.documentElement.clientHeight;
			var innerHeight = window.innerHeight
			if ( x == "pageDown" )
				 x = clientHeight <= innerHeight ? clientHeight-10 : innerHeight-10;
			if ( x == "pageUp" )
				 x = clientHeight <= innerHeight ? -clientHeight+10 : -innerHeight+10;
			log("x: "+x);
			scrollBy(y,x);
		}
	} else {
		return function () {
			if ( ! y )
				y = window.pageYOffset;
			if ( x == null )
				x = window.pageXOffset;
			if ( x == "end" )
				x = document.documentElement.offsetHeight;
			if ( x == "start" )
				x = 0;
			if ( y == "end" )
				y = document.documentElement.offsetWidth;
			if ( y == "start" )
				y = 0;
			scroll(y,x);
		}
	}
}


defineBindings( 
		{ bind: "h", action: scrollAction(40), context: "document" },
		{ bind: "t", action: scrollAction(-40), context: "document" },
		{ bind: "g", action: scrollAction("start"), context: "document" },
		{ bind: "G", action: scrollAction("end"), context: "document" },
		{ bind: "\\$", action: scrollAction(null, "start"), context: "document" },
		{ bind: "0", action: scrollAction(null, "end"), context: "document" },
		{ bind: "r", action: function(){location.reload()}, context: "document" },
		{ bind: ",", action: function(){history.back()}, context: "document" },
		{ bind: "\\.", action: function(){history.forward()}, context: "document" },
		{ bind: "<ctrl>u", action: scrollAction("pageUp"), context: "global" },
		{ bind: "<shift><space>", action: scrollAction("pageUp"), context: "global" },
		{ bind: "<ctrl>d", action: scrollAction("pageDown"), context: "global" },
		{ bind: "<space>", action: scrollAction("pageDown"), context: "document" },
		{ bind: "<ctrl>t", action: (function(){}), context: "global", preventDefault: false }, // dummy binding to prevent "t" from stealing <ctrl>t from the browser
		{ bind: "<ctrl>u", action: (function(){}), context: "console", preventDefault: false } // dummy binding to prevent "t" from stealing <ctrl>t from the browser
//	  	{ bind: /<ctrl>u$/, action: scrollPageUp },
//	  	{ bind: /<ctrl>a$/, action: moveToStartofLine, context: "textInput" },
//	  	{ bind: /<esc>$/, action: actionSetMode("command") },
//	 	{ bind: /i$/, action: actionSetMode("insert"), context: "textInput" },
//		{ bind: /f(.?)$/, action: moveToChar, mode: "command", context: "textInput" } )
)

}());
