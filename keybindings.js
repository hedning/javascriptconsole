(function(){

bindContexts = new Object;
defineContext("document", function (node) {
	return node == document.body || node.nodeName == "A";
});

defineContext("global", function () { return true; });




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
);


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
			log( clientHeight, innerHeight );
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
				argY = document.documentElement.offsetHeight;
			if ( y == "start" )
				argY = 0;
			if ( x == "end" )
				argX = document.documentElement.offsetWidth;
			if ( x == "start" )
				argX = 0;
//			log("x: "+x+", "+argX,"y: "+y+", "+argY);
			scroll(argX,argY);
		}
	}
}

}());
