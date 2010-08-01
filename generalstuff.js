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


function type(o){
	return !!o && Object.prototype.toString.call(o).match(/(\w+)\]/)[1];
}



// alert wrapper

var oldAlert = alert;

function message(input) {
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


function $(id) {
	return document.getElementById(id);
}


// from: http://blog.andyhot.gr/a/TapFX/?permalink=Allowing_Tapestry_components_to_contribute_CSS.html&smm=y
function addRemoteStyleSheet(styleUrl) {
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
function buildChildNodeTree(element) {

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
function dereferenceChildNodeTree(childNodeTree) {

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


function log() {


	var output = new String;
	for (var i=0;i<arguments.length;i++) {
		output += arguments[i]+"\n";
	}
	output = output.replace(/\n$/, "");

	opera.postError(output);
}

function removeElement(element) {
	storeStyle(element, {display: "none"});
}







