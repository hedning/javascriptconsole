(function(){


var defineBindings = importModule("bindings").defineBindings;
var History = importModule("History").history;

log.scrollLogging = true;
function log() {
	var log = importModule("log").log;
	if ( log.scrollLogging )
		log.apply(window, arguments);
}

var scrollHistory = new History({x: window.scrollX, y: window.scrollY});

var lastid;
var scrollVis = undefined;
function scrollHandler (e) {

	var innerHeight = window.innerHeight;
	var innerWidth = window.innerWidth;
	var cord = { x: window.scrollX, y: window.scrollY};
	var lastCord = scrollHistory.current.value;
	if ( lastCord.y == cord.y && lastCord.x == cord.x) {
		return ;
	}
	var width = document.documentElement.clientWidth < innerWidth ? document.documentElement.clientWidth: innerWidth;
	var height = document.documentElement.clientHeight < innerHeight ? document.documentElement.clientHeight: innerHeight;

	if (!scrollVis) {
		scrollVis = document.createElement("div");
		scrollVis.style.position = "absolute";
		scrollVis.style.zIndex = 700;
		scrollVis.style.backgroundColor = "hsla(120, 100%, 10%, 0.20)";
		document.body.appendChild(scrollVis);
	}
	var style = { display: "block",
		top: lastCord.y+"px", left: lastCord.x+"px",
		height: height+"px", width: width+"px",
		backgroundColor: "hsla(120,100%,10%,0.20)"
	};
	var delay = 2000;

	if ( Math.abs(cord.y-lastCord.y) > height*0.35 || Math.abs(cord.x-lastCord.x)>width*0.35) {
		scrollHistory.add(cord);
		for ( var i in style )
			scrollVis.style.setProperty(i, style[i]);
		clearTimeout(lastid);
		lastid = setTimeout( function () {  scrollVis.style.display = "none";
			   }, delay );
	}
	scrollHistory.update(cord);
}


function scrollNext() {
	var cord = scrollHistory.next();
	cord && window.scroll(cord.x, cord.y);
}

function scrollPrev () {
	var cord = scrollHistory.prev();
	cord && window.scroll(cord.x, cord.y);
}


defineBindings( { bind: "<ctrl>o", action: scrollPrev },
				{ bind: "<ctrl>i", action: scrollNext } );

window.addEventListener("scroll", scrollHandler, false);

}());
