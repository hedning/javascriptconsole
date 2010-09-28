(function () {


(function(){
	var inspect = function (obj, reg) {
		var output = "";
		if ( !reg ) reg = /./;
		for ( var i in obj ){
			if ( i.match(reg) )
				output += i + "\n";
		}
		return output.replace(/\n$/, "");
	};

	createModule("objectSearchTools", function () {
			this.inspect = inspect;
		});

}());


type = function (o){
	return !!o && Object.prototype.toString.call(o).match(/(\w+)\]/)[1];
};



// alert wrapper

var oldAlert = alert;

var message = function (input) {
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

};


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

// from: http://blog.andyhot.gr/a/TapFX/?permalink=Allowing_Tapestry_components_to_contribute_CSS.html&smm=y
addRemoteStyleSheet = function (styleUrl) {
	var styles = "@import url('" + styleUrl + "');";
	var newSS=document.createElement('link');
	newSS.rel='stylesheet';
	newSS.href='data:text/css,'+escape(styles);
	document.getElementsByTagName("head")[0].appendChild(newSS);
};


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

};


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
};

(function(){
var log = function () {


	var output = new String;
	for (var i=0;i<arguments.length;i++) {
		output += typeof arguments[i]== "object" ? JSON.stringify(arguments[i]): arguments[i];
		output += "\n";
	}
	output = output.replace(/\n$/, "");

	if (window.opera)
		opera.postError(output);
	else
		window.console && console.log(output);
};

createModule("log", function(){ this.log = log; });

}());



createModule("persistentState", (function () {
	var identifier = "myStoredVariable:";

	var storeType = function (store) {
		return store === "session" ? sessionStorage: localStorage;
	};

	this.saveVariable = function (name, variable, type) {
		var stringifiedVar = JSON.stringify(variable);
		var store = storeType(type)
		store.setItem(identifier+name, stringifiedVar);
	};

	this.getVariable = function (name, type) {
		var store = storeType(type);
		var stringified = store[identifier+name];
		return stringified ? JSON.parse(stringified) : false;
	};

	this.deleteVariable = function (name, type) {
		var oldVar = getVariable(name, type);
		var store = storeType(type);
		store.removeItem(identifier+name);
		return oldVar;
	}
})
);


(function(){

	var store = [];
	var ids = [];

	var storeData = function (element, key, value ) {
		var id = ids.indexOf(element);
		if ( id === -1 ) {
			id = ids.push(element) - 1;
			store[id] = {};
		}
		store[id][key] = value;
	};

	var getData = function (element, key) {
		var id = ids.indexOf(element);
		return id === -1 ? undefined : store[id][key];
	};

	var deleteData = function (element, key) {
		var id = ids.indexOf(element);
		if ( !id ) {
			return false;
		}
		delete store[id][key];
	};

	createModule("dataStore", function () {
		this.storeData = storeData;
		this.deleteData = storeData;
		this.getData = getData;
	});
}());



}());
