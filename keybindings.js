(function(){

bindContexts = new Object;
bindContexts.documentContext = function (node) {
	return node == document.body || node.nodeName == "A";
}

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

bindContexts.globalCon = function () { return true; }

defineBindings( 
		{ bind: "h", action: scrollAction(40), context: bindContexts.documentContext },
		{ bind: "t", action: scrollAction(-40), context: bindContexts.documentContext },
		{ bind: "g", action: scrollAction("start"), context: bindContexts.documentContext },
		{ bind: "G", action: scrollAction("end"), context: bindContexts.documentContext },
		{ bind: "\\$", action: scrollAction(null, "start"), context: bindContexts.documentContext },
		{ bind: "0", action: scrollAction(null, "end"), context: bindContexts.documentContext },
		{ bind: "r", action: function(){location.reload()}, context: bindContexts.documentContext },
		{ bind: ",", action: function(){history.back()}, context: bindContexts.documentContext },
		{ bind: "\\.", action: function(){history.forward()}, context: bindContexts.documentContext },
		{ bind: "<ctrl>u", action: scrollAction("pageUp"), context: bindContexts.globalCon },
		{ bind: "<shift><space>", action: scrollAction("pageUp"), context: bindContexts.globalCon },
		{ bind: "<ctrl>d", action: scrollAction("pageDown"), context: bindContexts.globalCon },
		{ bind: "<space>", action: scrollAction("pageDown"), context: bindContexts.globalCon },
		{ bind: "<ctrl>t", action: (function(){}), context: bindContexts.globalCon, preventDefault: false }, // dummy binding to prevent "t" from stealing <ctrl>t from the browser
//	  	{ bind: /<ctrl>u$/, action: scrollPageUp },
//	  	{ bind: /<ctrl>a$/, action: moveToStartofLine, context: "textInput" },
//	  	{ bind: /<esc>$/, action: actionSetMode("command") },
//	 	{ bind: /i$/, action: actionSetMode("insert"), context: "textInput" },
//		{ bind: /f(.?)$/, action: moveToChar, mode: "command", context: "textInput" } )
)

}());
