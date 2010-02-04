window.addEventListener("load", function() {
cli = {
	query : null,
	outPut : null,
	prompt : "$ ",
	history : [],
	currentHistIndex : 0,
	clear: function () {
		this.outPut.innerText = "";
	},
	create :  	function () {
					if (! this.query ){
						// this is rather ugly and should be delegated elsewhere
						this.query = document.createElement("textarea");
						this.query.rows = 1;
						this.applyStyle(this.query, this.queryStyle);
						this.query.style.display = "none";
						document.body.appendChild(this.query);
					}
					if ( ! this.outPut ){
						this.outPut = document.createElement("div");
						this.applyStyle(this.outPut, this.outStyle);
						this.outPut.style.display = "none";
						document.body.appendChild(this.outPut);
					}
				},
	open : 		function () {
					this.applyStyle(this.query, this.style);
					this.query.style.display = "block";
					this.outPut.style.display = "block";
					this.focus();
		   		},
	close : 	function () {
					this.query.style.display = "none";
					this.outPut.style.display = "none";
				},
	focus : 	function () {
					var position = window.pageYOffset;
					this.query.focus();
					window.scroll(0,position);
				},
	evalQuery: 	function () {
					var evalText = this.query.innerText;
					this.query.innerText = "";
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
					   this.outPut.innerText += this.prompt + input + "\n" + output + "\n" ;
					   this.outPut.scrollTop = this.outPut.scrollHeight;
				   },
	prevHistEntry: function () {
					   var prevEntry = this.history[this.currentHistIndex - 1];
					   if ( prevEntry ) {
						   this.currentHistIndex--;
						   this.query.innerText = prevEntry;
					   }
				   },
	nextHistEntry: function () {
					   var nextEntry = this.history[this.currentHistIndex + 1];
					   if ( nextEntry ) {
						   this.currentHistIndex++;
						   this.query.innerText = nextEntry;
					   }
				   },
	queryStyle: {
		overflow: "hidden",
		position: "fixed",
		right: 0,
		left: 0,
		bottom: 0,
		padding: "2px 0 0 0",
		width: "100%",
		backgroundColor: "black",
		color: "white",
		fontFamily: "Verdana",
		fontSize: "14",
		   },
	outStyle: {
		overflow: "hidden",
		position: "fixed",
		right: 0,
		left: 0,
		bottom: 22,
		padding: "0",
		width: "100%",
		//maxHeight: "26ex",
		backgroundColor: "black",
		color: "white",
		fontFamily: "Verdana",
		fontSize: "14",
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

	if ( keycode == 13 )
		cli.evalQuery();
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

}




var queryopenHandler = function (e) { 
	keycode = e.keyCode || e.charCode;
	character = String.fromCharCode(keycode);
	ctrl = e.ctrlKey;
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

}, false)





