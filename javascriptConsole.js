function javascriptConsole () {

	this.query = null;
	this.outPut = null;
	this.autoCompOut = null;
	this.wrapDiv = null;
	this.prompt = "<span style=\"color:grey;\">$ </span>";
	this.history = [];
	this.currentHistIndex = 0;
	this.clear = function () {
		this.outPut.innerHTML = "";
	}


	this.create = function () {
		if (! this.wrapDiv ) {
			this.wrapDiv = document.createElement("div");
			this.applyStyle(this.wrapDiv, this.wrapDivStyle);
			this.wrapDiv.style.display = "none";
			document.body.appendChild(this.wrapDiv);
			if ( ! this.outPut ){
				this.outPut = document.createElement("div");
				this.applyStyle(this.outPut, this.outStyle);
				this.wrapDiv.appendChild(this.outPut);
			}
			if ( ! this.autoCompOut ){
				this.autoCompOut = document.createElement("div");
				this.applyStyle(this.autoCompOut, this.outStyle);
				this.wrapDiv.appendChild(this.autoCompOut);
			}
			if (! this.query ){
				// this is rather ugly and should be delegated elsewhere
				this.query = document.createElement("input");
				this.query.rows = 1;
				this.applyStyle(this.query, this.queryStyle);
				this.wrapDiv.appendChild(this.query);
			}
		}
	}


	this.open = function () {
		//this.applyStyle(this.query, this.queryStyle);
		this.wrapDiv.style.display = "block";
		this.outPut.scrollTop = this.outPut.scrollHeight;
		this.focus();
	}
	this.close = function () {
		this.query.blur();
		this.wrapDiv.style.display = "none";
		document.body.focus();
	}
	this.focus = function () {
		this.query.focus();
	}
	this.evalWrap = function (str) {
		try {
			return eval(str);
		}
		catch(error) {
			return error;
		}
	}
	this.evalQuery = function () {
		var evalText = this.query.value;
		this.query.value = "";
		// should have a javascript validator here
		if ( evalText.match(/^\s*$/))
			return false;
		this.histAppend(evalText);
		this.currentHistIndex = this.history.length;
		var output = this.evalWrap(evalText);
		this.outPutAppend(output, evalText);
	}
	this.histAppend = function (entry) {
		var lastEntry = this.history[this.history.length - 1];
		if ( entry == lastEntry )
			return false;
		else
			this.history.push(entry);
	}
	this.outPutAppend  = function (output, input) {
//		globalinput = input;
//		input = input.toString().replace(/\n$/, "");
//		output = output.toString().replace(/^\r/, "");
		if ( ! ( output == undefined ) ){
			output = output.toString().replace(/<(.*?)>/g, "&lt;$1&gt;");
			output = output.toString().replace(/\r\n|\n|\f|\r/g, "<br>");
		}
//		output = "<pre>" + output + "</pre>";
		this.outPut.innerHTML += this.prompt + input + "<BR>" + output + "<BR>" ;
//		this.outPut.innerHTML += this.prompt + input + output ;
		this.outPut.scrollTop = this.outPut.scrollHeight;
	}
	
	this.prevHistEntry = function () {
		var prevEntry = this.history[this.currentHistIndex - 1];
		 if ( prevEntry ) {
			this.currentHistIndex--;
			this.query.value = prevEntry;
		}
	}

	this.nextHistEntry = function () {
		var nextEntry = this.history[this.currentHistIndex + 1];
		if ( nextEntry ) {
			this.currentHistIndex++;
			this.query.value = nextEntry;
		}
	}
	   // should propably move this to a separate css sheet
	this.wrapDivStyle = { overflow: "hidden",
		position: "fixed",
		right: "0",
		left: "0",
		bottom: "1",
		padding: "0",
		margin: "0",
		width: "100%",
		maxWidth: "100%",
		borderTop: "1",
		borderRight: "0",
		borderLeft: "0",
		borderBottom: "0",
		borderStyle: "solid",
		borderColor: "grey",
		backgroundColor: "black",
		color: "white",
		textAlign: "left",
		zIndex: 7,
		}
	this.queryStyle = { overflow: "hidden",
		width: "100%",
		backgroundColor: "black",
		color: "white",
		height: "auto",
		margin: 0,
		marginTop: 1,
		borderTop: "1",
		borderRight: "0",
		borderLeft: "0",
		borderBottom: "0",
		borderStyle: "solid",
		borderColor: "white",
		padding: 2,
		fontFamily: "Verdana",
		fontSize: "14",
		}
	this.outStyle = { overflow: "auto",
		padding: "0",
		margin: "0",
		border: 0,
		backgroundColor: "black",
		fontFamily: "Verdana",
		fontSize: "14",
		color: "white",
		width: "105%",
		maxWidth: "105%",
		maxHeight: "31em",
		}


	this.applyStyle = function (element, style) {
		for ( i in style ) {
			element.style[i] = style[i];
		}
	}

	this.create();

	this.style = this.wrapDiv.style;
	this.currentStyle = this.wrapDiv.currentStyle;


	// bindings -- should be replaced by a more general and better system
	var ctrlKey = false;
	var obj = this;
	var cliKeyHandler = function (e) {
		
		// when ctrl is down browsers return a capital letter
		// most browsers doesn't return e.ctrlKey being true
		// on keypress...
		var keycode = e.keyCode || e.charCode;
		var character= String.fromCharCode(keycode);
		// 13 is enter
		if ( keycode == 13 ){ 
			obj.evalQuery();
			e.preventDefault();
		}
		// 27 is escape
		else if ( keycode == 27 ) 
			obj.close();
		else if ( ( character == "P" || character == "p" ) && ctrlKey){
			obj.prevHistEntry();
			e.preventDefault();
		}
		else if ( ( character == "N" || character == "n" ) && ctrlKey ){
			obj.nexobjtEntry();
			e.preventDefault();
		}
		else if ( ( character == "L" || character == "l" ) && ctrlKey ){
			obj.clear();
			e.preventDefault();
		}

		ctrlKey = false;
	}
	var ctrlKeyHandler = function(e) {
		ctrlKey = e.ctrlKey;
	}

	this.query.addEventListener("keypress", cliKeyHandler, false);
	this.query.addEventListener("keydown", ctrlKeyHandler, false);
}


var queryopenHandler = function (element, character) { 
	return function (e) {
		var keycode = e.keyCode || e.charCode;
		var chr = String.fromCharCode(keycode);
		var ctrl = e.ctrlKey;
		var target = e.target;

		if ( target.nodeName.toLowerCase() != 'input' && target.nodeName.toLowerCase() != 'textarea' && target.nodeName.toLowerCase() != 'div'){
			if ( chr == character){
				element.open();
				e.preventDefault();
			}
		}
	}
}

window.addEventListener("load", function() {

cli = new javascriptConsole();


// chrome doesn't report event.ctrlKey on keypress.... nor escape it seems
window.addEventListener("keypress", queryopenHandler(cli, ";"), false);

}, false)


function inspect(obj, reg) {

	var output = "";
	if ( reg ) {
		for ( i in obj ){
			if ( i.match(reg) )
				output += i + "\n";
		}
	} else {
		for ( i in obj ) {
				output += i + "\n";
		}
	}

	return output.replace(/\n$/, "");
}	









