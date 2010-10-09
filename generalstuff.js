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

	createModule("objectSearchTools", {
			inspect: inspect
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

createModule("log", {log : log});

}());


// from http://www.json.org/js.html
var reviver = function (key, value) {
	var type;
	if (value && typeof value === 'object') {
		type = value.type;
		if (typeof type === 'string' && typeof window[type] === 'function') {
			return new (window[type])(value);
		}
	}
	return value;
};

var identifier = "myStoredVariable:";
var storeType = function (store) {
	return store === "session" ? sessionStorage: localStorage;
};
createModule("persistentState", {

	saveVariable: function (name, variable, type) {
		var stringifiedVar = JSON.stringify(variable);
		var store = storeType(type)
		store.setItem(identifier+name, stringifiedVar);
	},

	getVariable: function (name, type) {
		var store = storeType(type);
		var stringified = store[identifier+name];
		return stringified ? JSON.parse(stringified, reviver) : undefined;
	},

	deleteVariable: function (name, type) {
		var oldVar = getVariable(name, type);
		var store = storeType(type);
		store.removeItem(identifier+name);
		return oldVar;
	}
});


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
		if (!id) {
			return false;
		}
		delete store[id][key];
	};
	createModule("dataStore", {
		storeData: storeData,
		deleteData: storeData,
		getData: getData
	});
}());



}());
