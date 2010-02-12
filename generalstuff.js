function inspect(obj, reg) {

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

function newcli(str){
	if ( ! str ) 
		str = "cli2";
	var newcli = window[str] = new javascriptConsole();

	newcli.style.bottom = "50%";
	newcli.open()
}


var currentMouseOverElement = null;
var lastStyle = null;

var setStyle = function (ele, unset) {
	var styleAtt = "outline";
	if ( !unset )
		lastStyle = ele.style[styleAtt];
	var unStyle = lastStyle;
	ele.style[styleAtt] =( unset ? unStyle: "blue solid 2px");
//	ele.style.borderColor =( unset ? "" : "black");
}

var mouseoverHandler = function  (e) {
	_$ = e.target;
	bubbles = e.bubbles;
	currentMouseOverElement = e.target;
	setStyle(e.target);
}

var mouseoutHandler = function  (e) {
	setStyle(e.target, true);
}


var clickHandler = function  (e) {
	cli.focus();
	var name = e.target.nodeName ;
	var id = e.target.id;
	var className = e.target.className;
	if ( id )
		name += "_id$" + id;
	if (className)
		name += "_cl$" + className;
	name = name.replace(/\s+/g, "_");
	window[name] = e.target;
	cli.replace(0, cli.query.textLength, name);

}


function initSelectElement() {
	window.addEventListener("mouseover", mouseoverHandler, false);
	window.addEventListener("mouseout", mouseoutHandler, false);
	window.addEventListener("click", clickHandler, false);
}

function stopSelectElement() {
	window.removeEventListener("mouseover", mouseoverHandler, false);
	window.removeEventListener("mouseout", mouseoutHandler, false);
	window.removeEventListener("click", clickHandler, false);
	setStyle(currentMouseOverElement, true);
}


function globalfunc() {

	function isthisglobal () {
		var i = "hoho";
	}
}

function type(o){
	return !!o && Object.prototype.toString.call(o).match(/(\w+)\]/)[1];
}










