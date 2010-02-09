function javascriptConsole () {

	this.query = null;
	this.outPut = null;
	this.autoCompOut = null;
	this.evalKey = 13;
	this.wrapDiv = null;
	this.prompt = "$ ".fontcolor("grey");
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

	this.insert = function (str, position) {
		if ( ! position ) {
			if ( this.query.selectionEnd != this.query.selectionStart )
				return false;
			position = this.query.selectionEnd;
		}
		var value = this.query.value;

		this.query.value = value.slice(0, position) + str 
			+ value.slice(position, value.length);
	}

	this.replace = function(start, end, replacement) {
		var value = this.query.value;
		var leftContext = value.slice(0,start);
		var rightContext = value.slice(end,value.length);

		this.query.value = leftContext + replacement + rightContext;
	}


	var splitString = function(str, position) {

		var output = [];
		var lBuffer = str.slice(0, position);
		var rBuffer = str.slice(position, str.length);

		var wordSeperator = "[\\w_\\.\\[\\]\"]";
		var lWordReg = new RegExp(wordSeperator+"*$");
		var rWordReg = new RegExp("^"+wordSeperator+"*");

		var lWord = lBuffer.match(lWordReg)[0] ;
		var rWord = rBuffer.match(rWordReg)[0] ;

		var left = lBuffer.slice(0,lBuffer.length - lWord.length);
		var right = rBuffer.slice(rWord.length, rBuffer.length);
		var word = lWord + rWord;
		return ( [ left, word, right ] );
	}

	this.completor = function (word) {

		var getElement = function (value) {
			var elementReg = RegExp("^([^\\.]*\\.)*")
			var element = elementReg.exec(value)[0];
			element = element.replace(/\.$/, "");
			return element;
		}

		var getRest = function (value) {

			var restReg = /\.?([^\.]*)$/
			var rest = restReg.exec(value)[0].replace(/\./, "");
			return rest;
		}

		var element = getElement(word);
		var rest = RegExp( "^" + getRest(word), "i");
		var nodes = [];
		var matches = [];
		var recObj = window;

		
		if ( element ){
			var restEle = element;
			while (restEle != ""){
				var ele = restEle.match(/^\[?[^\.\[]*/)[0];
				if ( ele.search(/^\[/) != -1 ){
					ele = ele.replace(/^\["?([^\.\]"]*)"?\]/, "$1");
				}
				recObj = recObj[ele];
				restEle = restEle.replace(/^\[?[^\.\[]*\.?/, "");
			}
		}

		for ( var i in recObj ) {
			nodes.push(i);
		}

		for ( var i = 0; i < nodes.length; i++ ) {
			if ( nodes[i].match(rest) ){
				var dot = "";
				if ( element == "")
					dot = "";
				else
					dot = ".";
				matches.push(element + dot + nodes[i]);
			}
		}

		return matches;

	}

	var lastMatches = null;
	var lastIndex = "0" ;

	this.complete = function(str) {

		if ( !( this.query.selectionEnd == this.query.selectionStart ) )
			return false;

		var inPutString = this.query.value;
		var position = this.query.selectionEnd;
		var valueTab = splitString(inPutString, position);
		var leftContext = valueTab[0];
		var activeWord = valueTab[1];
		var rightContext = valueTab[2];
		var startWord = leftContext.length;
		var endWord = startWord + activeWord.length;

		var obj = this;
		var expand = function (str) {
			obj.replace(startWord, endWord, str);
			var newPosition = startWord + str.length;
			obj.query.setSelectionRange(newPosition, newPosition);
		}
		var expandToClosest = function (list, word) {
			var commonPart = word;
			var start = word.length;
			var p = -1;
			var common = true;
			var shortest = list[0].length;
			var testCommon = word;

			for ( var p = start; p < shortest; p++ ) {
				testCommon = list[0][p];
				for ( var i = 1; i < list.length; i++ ) {
					var curr = list[i];
					if ( shortest > curr.length )
						shortest = curr.length;
					
					var reg = new RegExp( curr[p], "i");
					if ( testCommon.search(reg) == -1 ){
						common = false;
						break;
					}
				}
				
				if ( common )
					commonPart += list[0][p];
				else
					break;
			}

			if ( commonPart ) {
				expand(commonPart);
			}

		}
		var showComps = function (list) {

			var output = "";
			var spanClose = "</span>";
			for ( var i=0; i<list.length; i++ ) {
				var spanOpen = "<span id=\"cli" + i + "\">";
				output += spanOpen+list[i]+spanClose+"<br>";
			}

			obj.autoCompOut.innerHTML = output;

		}
		

		if ( lastMatches ) {
			if ( lastMatches.length <= lastIndex )
				lastIndex = 0;
			expand(lastMatches[lastIndex]);

			var curr = document.getElementById("cli"+lastIndex);
			var prev = document.getElementById("cli"+(lastIndex-1<0 ? lastMatches.length -1 : lastIndex - 1) );
			curr.style.backgroundColor = "blue";
			if (prev)
				prev.style.backgroundColor = "inherit";
			lastIndex++;

		} else {

			matches = this.completor(activeWord);

			this.autoCompOut.innerHTML = "";

			if ( matches.length == 0 ){
				return false;
			} else if ( matches.length == 1 ) {
				expand(matches[0]);
			} else {
				lastMatches = matches;
				expandToClosest(matches, activeWord);
				showComps(matches);
			}

		}
	}


	   // should propably move this to a separate css sheet
	this.wrapDivStyle = { overflow: "hidden",
		position: "fixed",
		right: "7",
		left: "7",
		bottom: "2",
		padding: "0",
		margin: "auto",
		width: "auto",
		maxWidth: "700",
		borderTop: "1",
		borderRight: "0",
		borderLeft: "0",
		borderBottom: "0",
		borderWidth: "2",
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
		borderTop: "2",
		borderRight: "0",
		borderLeft: "0",
		borderBottom: "0",
		borderStyle: "solid",
		borderColor: "grey",
		padding: 2,
		fontFamily: "Verdana",
		fontSize: "14",
		padding: "4",
		}
	this.outStyle = { overflow: "hidden",
		padding: "0",
		paddingLeft: "2",
		margin: "0",
		border: 0,
		backgroundColor: "black",
		fontFamily: "Verdana",
		fontSize: "14",
		color: "white",
		width: "100%",
		maxWidth: "100%",
		maxHeight: "432",
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
		if ( ctrlKey ) {
			character = character.toUpperCase();
		}
		// 13 is enter
		if ( keycode == obj.evalKey ){ 
			obj.evalQuery();
			e.preventDefault();
		}
		// 27 is escape
		else if ( keycode == 27 ) 
			obj.close();
		else if ( keycode == 9 ) {
			e.preventDefault();
			obj.complete();
		}
		else if ( character == "P" && ctrlKey){
			obj.prevHistEntry();
			e.preventDefault();
		}
		else if ( character == "N" && ctrlKey ){
			obj.nextHistEntry();
			e.preventDefault();
		}
		else if ( character == "L" && ctrlKey ){
			obj.clear();
			e.preventDefault();
		}


		if ( keycode != 9 ){
			lastMatches = null;
			lastIndex = 0;
			obj.autoCompOut.innerHTML = "";
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

function newcli(str){
	if ( ! str ) 
		str = "cli2";
	var newcli = window[str] = new javascriptConsole();

	newcli.style.bottom = "50%";
	newcli.open()
}


var currentMouseOverElement = null;

var setStyle = function (ele, unset) {
	ele.style.backgroundColor =( unset ? "" : "blue");
	ele.style.color =( unset ? "" : "black");
}

var mouseoverHandler = function  (e) {
	currentMouseOverElement = e.target;
	setStyle(e.target);
}

var mouseoutHandler = function  (e) {
	e.target.style.backgroundColor = "";
	e.target.style.color = "";
	setStyle(e.target, true);
}


var clickHandler = function  (e) {
	selectedElement = e.target;
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

