window.onload = function(){
cli = {
	query : null,
	history : [],
	create :  	function () {
					if (! this.query ){
						this.query = document.createElement("textarea");
						this.query.style.position = "fixed";
						this.query.style.overflow = "hidden";
						this.query.style.bottom = 0;
						this.query.style.left = 0;
						this.query.style.right = 0;
						this.query.style.padding = 0;
						this.query.style.borderTopColor = "white";
						this.query.style.width = "100%";
						this.query.style.display = "none";
						this.query.rows = 1;
						this.query.style.backgroundColor = "black";
						this.query.style.color = "white";
						document.body.appendChild(this.query);
					}
				},
	open : 		function () {
					this.query.style.display = "block";
					this.focus();
		   		},
	close : 	function () {
					this.query.style.display = "none";
				},
	focus : 	function () {
					this.query.focus();
				},
	evalQuery: 	function () {
					var evalText = this.query.innerText;
					this.query.innerText = "";
					// should have a javascript validator here
					this.histAppend(evalText);
					var output = eval(evalText);
					this.outPutAppend(output);
				},
	histAppend: function (entry) {
					var lastEntry = this.history[this.history.length - 1];
					if ( entry == "" ) 
						return false;
					else if ( entry == lastEntry )
						return false;
					else
						this.history.push(entry);
				},
	outPutAppend : function (output) {
				   },
	prevHistEntry: function () {
					   var prevEntry = this.history[this.history.length - 1];
					   if ( prevEntry ) 
						   this.query.innerText = prevEntry;
				   },
	nextHistEntry: function () {
					   var nextEntry = this.history[this.history.length + 1];
					   if ( nextEntry ) 
						   this.query.innerText = this;
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
	else if ( character == "p" && e.ctrlKey )
		cli.prevHistEntry();

}




var queryopenHandler = function (e) { 
	var keycode = e.keyCode || e.charCode;
	var character = String.fromCharCode(keycode);
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

}

