window.addEventListener("load", function() {
cli = {
	query : null,
	outPut : null,
	wrapDiv : null,
	prompt : "$ ",
	history : [],
	currentHistIndex : 0,
	clear: function () {
		this.outPut.innerHTML = "";
	},
	create :  	function () {
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
						if (! this.query ){
							// this is rather ugly and should be delegated elsewhere
							this.query = document.createElement("textarea");
							this.query.rows = 1;
							this.applyStyle(this.query, this.queryStyle);
							this.wrapDiv.appendChild(this.query);
						}
					}
				},
	open : 		function () {
					this.applyStyle(this.query, this.style);
					this.wrapDiv.style.display = "block";
					//this.wrapDiv.style.display = "block";
					this.outPut.scrollTop = this.outPut.scrollHeight;
					this.focus();
		   		},
	close : 	function () {
					this.wrapDiv.style.display = "none";
					//this.outPut.style.display = "none";
				},
	focus : 	function () {
					var y = window.pageYOffset;
					var x = window.pageXOffset;
					this.query.focus();
					//window.scroll(x,y);
				},
	evalQuery: 	function () {
					var evalText = this.query.value;
					this.query.value = "";
					// should have a javascript validator here
					if ( evalText.match(/^\s*$/))
						return false;
					this.histAppend(evalText);
					this.currentHistIndex = this.history.length; 
					var output = eval(evalText);
					this.outPutAppend(output, evalText);
				},
	histAppend: function (entry) {
					var lastEntry = this.history[this.history.length - 1];
					if ( entry == lastEntry )
						return false;
					else
						this.history.push(entry);
				},
	outPutAppend : function (output, input) {
					   this.outPut.innerHTML += this.prompt + input + "<BR>" + output + "<BR>" ;
					   this.outPut.scrollTop = this.outPut.scrollHeight;
				   },
	prevHistEntry: function () {
					   var prevEntry = this.history[this.currentHistIndex - 1];
					   if ( prevEntry ) {
						   this.currentHistIndex--;
						   this.query.innerHTML = prevEntry;
					   }
				   },
	nextHistEntry: function () {
					   var nextEntry = this.history[this.currentHistIndex + 1];
					   if ( nextEntry ) {
						   this.currentHistIndex++;
						   this.query.innerHTML = nextEntry;
					   }
				   },
	wrapDivStyle: {
		overflow: "hidden",
		position: "fixed",
		right: "0",
		left: "0",
		bottom: "0",
		padding: "0",
		margin: "0",
		width: "100%",
		maxWidth: "100%",
		backgroundColor: "black",
		color: "white",
		fontFamily: "Verdana",
		fontSize: "14",
		textAlign: "left",
		   },
	queryStyle: {
		overflow: "hidden",
		width: "100%",
		backgroundColor: "black",
		color: "white",
		border: 0,
		fontFamily: "Verdana",
		fontSize: "14",
		 },		   
	outStyle: {
		overflow: "auto",
		bottom: "24",
		padding: "2",
		margin: "0",
		borderColor: "white",
		borderTop: "0",
		borderRight: "0",
		borderLeft: "0",
		borderBottom: "1",
		borderStyle: "solid",
		width: "105%",
		maxWidth: "105%",
		maxHeight: "24em",
		   },


	applyStyle: function (element, style) {
					for ( i in style ) {
						element.style[i] = style[i];
					}
				},
	
}

cli.create();


// bindings -- should be replaced by a more general and better system

var cliKeyHandler = function (e) {
	
	var keycode = e.keyCode || e.charCode;
	var character= String.fromCharCode(keycode);

	if ( keycode == 13 ){
		cli.evalQuery();
		e.preventDefault();
	}
	else if ( keycode == 27 )
		cli.close();
	else if ( character == "P" && e.ctrlKey ){
		cli.prevHistEntry();
		e.preventDefault();
	}
	else if ( character == "N" && e.ctrlKey ){
		cli.nextHistEntry();
		e.preventDefault();
	}
	else if ( character == "L" && e.ctrlKey ){
		cli.clear();
		e.preventDefault();
	}

}




var queryopenHandler = function (e) { 
	var keycode = e.keyCode || e.charCode;
	var character = String.fromCharCode(keycode);
	var ctrl = e.ctrlKey;
	var target = e.target;

	if ( target.nodeName.toLowerCase() != 'input' && target.nodeName.toLowerCase() != 'textarea' && target.nodeName.toLowerCase() != 'div'){
		if ( character == ";" ){
			cli.open();
			e.preventDefault();
		}
	}

}


cli.query.addEventListener("keypress", cliKeyHandler, false);
window.addEventListener("keypress", queryopenHandler, false);

function inspect(obj, reg) {

	var output
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





}, false)





