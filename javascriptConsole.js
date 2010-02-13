function javascriptConsole () {


	_ = null;
	var obj = this;
	this.evalKey = 13;
	this.prompt = "$ ".fontcolor("grey");
	this.history = [];
	this.currentHistIndex = 0;

	// appends a child of type elementType to this.wrapDiv
	this.create = function (elementType) {
		var createdEle;
		function append(str){
			createdEle = document.createElement(str);
			if ( str == "div" )
				this.applyStyle(createdEle, this.outStyle);
			else 
				this.applyStyle(createdEle, this.queryStyle);
			this.wrapDiv.appendChild(createdEle);
		}
		if ( !this.wrapDiv ) {
			this.wrapDiv = document.createElement("div");
			this.applyStyle(this.wrapDiv, this.wrapDivStyle);
			this.wrapDiv.style.display = "none";
			document.body.appendChild(this.wrapDiv);
		}
		append.call(this, elementType);
		
		return createdEle || true;
	}


	this.open = function () {
		//this.applyStyle(this.query, this.queryStyle);
		this.wrapDiv.style.display = "block";
		// temporarily
		this.helpOut.style.display = "none";
		this.outPut.scrollTop = this.outPut.scrollHeight;
		this.focus();
	}
	this.close = function () {
		this.query.blur();
		this.wrapDiv.style.display = "none";
	}
	this.focus = function () {
		this.query.focus();
	}
	this.evalWrap = function (str) {
		try {
			return eval.call(null, str); // calls eval from window
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
		_ = output;
		this.outPutAppend(output, evalText);
		this.autoCompOut.clear()
	}
	this.histAppend = function (entry) {
		var lastEntry = this.history[this.history.length - 1];
		if ( entry == lastEntry )
			return false;
		else
			this.history.push(entry);
	}
	this.outPutAppend  = function (output, input) {
		if ( ! ( output == undefined ) ){
			output = output.toString().replace(/<(.*?)>/g, "&lt;$1&gt;");
			output = output.toString().replace(/\r\n|\n|\f|\r/g, "<br>");
		}
		this.outPut.innerHTML += this.prompt + input + "<BR>" + output + "<BR>" ;
		this.outPut.scrollTop = this.outPut.scrollHeight;
		this.outPut.style.display = "block";
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
	this.help = function (str){

		var lHref = "https://developer.mozilla.org/Special:Search?search=";
		var rHref = "&type=fulltext&go=Search";

		this.helpOut.src = lHref+str+rHref;
		this.query.blur();
		this.helpOut.focus();
		this.helpOut.style.display = "block";
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

	this.wordConstituents = "[/\\w\\{\\}_$\\.\\[\\]\"']";

	function splitString (str, position) {

		var output = [];
		var lBuffer = str.slice(0, position);
		var rBuffer = str.slice(position, str.length);

		var lWordReg = new RegExp(obj.wordConstituents+"*$");
		var rWordReg = new RegExp("^"+obj.wordConstituents+"*");

		var lWord = lBuffer.match(lWordReg)[0] ;
		var rWord = rBuffer.match(rWordReg)[0] ;

		var left = lBuffer.slice(0,lBuffer.length - lWord.length);
		var right = rBuffer.slice(rWord.length, rBuffer.length);
		var word = lWord + rWord;
		return ( [ left, word, right ] );
	}

	this.completor = function (word, leftContext, rightContext) {

		if ( word == "." )
			return false;

		function getElement (value) {
			var elementReg = /^([^\.]*\.)*/;
			var element = elementReg.exec(value)[0];
			return element;
		}

		function getRest (value) {

			var restReg = /\.?([^\.]*)$/;
			var rest = restReg.exec(value)[0].replace(/\./, "").replace(/\$/, "\\$");
			return rest;
		}

		// all the standard words and such that "for ... in" doesn't loop trough
		// should take this outside and run a test for all the properties first
		var builtIns = [ "function", "new", "var", "eval", "while", "break", 
			"return", "true", "false", "switch", "for", "if", "typeof" ];
		var standardNode = ["RegExp", "Function", "Array", 
			"scroll", "scrollBy", "Object", "String", "Number", "Boolean", ];
		var objectNode = [ "toString", "constructor", "hasOwnProperty",
		  /*"isProtoTypeOf",*/ "propertyIsEnumerable", "valueOf", "__lookupGetter__",
		  "__lookupSetter__" ];
		var stringNode = [ "match", "charAt", "charCodeAt", "concat",
		  "indexOf", "lastIndexOf", "length", "replace", "search", "slice",
		  "split", "substr", "substring", "toLowerCase", "toUpperCase",
		  "anchor", "big", "blink", "bold", "fontcolor", "fontsize", "italics",
		  "link", "small", "strike", "sub", "sup" ];
		var regexpNode = [ "global", "ignorecase", "lastIndex", "multiline",
			"source", "exec", "test" ];
		var functionNode = [ "apply", "call", "length", "prototype" ];
		var lengthNode = [];
		var numberNode = ["toExponential", "toFixed", "toPrecision"];
		var arrayNode = [  "input",  "pop", "push", "reverse",
			"shift", "sort", "splice", "unshift", "concat", "join", "slice",
			"indexOf", "lastIndexOf", "filter", "forEach", "every", "map",
			"some" ];

		var element = getElement(word);
		var rest = RegExp( "^" + getRest(word), "i");
		var nodes = [];
		var matches = [];
		var recObj = window;
		var objType = null;

		if ( element ){
			var restEle = element;

			// replaces starting literals with their prototype
			var litMark = "\\" + element.match(/^[\[{"'\/]/); // ]}
			if ( litMark != "\\null" ) {
				var matchingMark;
				var builtinType;
				switch ( litMark ) {
					case "\\[":
						matchingMark = "\\]";
						builtinType = Array.prototype;
						break;
					case "\\{":
						matchingMark = "\\}";
						builtinType = Object.prototype;
						break;
					case '\\"':
						matchingMark = '\\"';
						builtinType = String.prototype;
						break;
					case "\\'":
						matchingMark = "\\'";
						builtinType = String.prototype;
						break;
					case '\\/':
						matchingMark = '\\/';
						builtinType = RegExp.prototype;
						break;
				}
				// should be replaced with something that counts the []/{} properly
				var reg = new RegExp("^"+litMark+"[^"+matchingMark+"]*"+matchingMark+"\\.?");
				if ( restEle.search(reg) != -1 ){
					restEle = restEle.replace(reg, "");
					recObj = builtinType;
				}
			}
			// builds up the element we'll look for matches in
			while (restEle != ""){
				// regexps this large is rather unreadable, fix and structure?
				var ele = restEle.match(/^\[?[^\.\[]*/)[0];
				if ( ele.search(/^\[/) != -1 ){
					ele = ele.replace(/^\["?([^\.\]"]*)"?\]/, "$1");
				}
				recObj = recObj[ele];
				restEle = restEle.replace(/^\[?[^\.\[]*\.?/, "");
			} 
			if (recObj)
				objType = type(recObj);
			builtIns = [];
		} else {
			nodes = nodes.concat(standardNode); 
		}
			


		// all the characters that can't be used in string in element.string
		// used to weed out the nodes such as window["foo.bar"] and similar
		// rather ugly though
		var nonConstitutents = this.wordConstituents.replace(/^\[([^\.]*)\\.([^\.]*)\]$/, "[\^$1$2]|\\.");
		// adds matching properties/methods
		for ( var i in recObj ) {
			var match = "";
			if ( i.search(nonConstitutents) == -1){
				if ( i.search(/^[0-9]+$/) != -1 ){
					false;
				} else {

				match = i;
					if ( i.search(rest) != -1){
						matches.push(element + match);
					}
				}
			}
		}
		if ( objType ) {
				nodes = nodes.concat(objectNode, stringNode, regexpNode, arrayNode,
						functionNode, numberNode);
		}
		// adds the matching builtins methods and properties of the object
		for ( var i = 0; i < nodes.length; i++ ) {
			if ( nodes[i].search(rest) != -1){
				if ( recObj[nodes[i]] != undefined )
					matches.push(element + nodes[i]);
			}
		}
		// adds the matching builtins, like typeof
		for ( var i = 0; i < builtIns.length; i++ ) {
			if ( builtIns[i].search(rest) != -1){
					matches.push(element + builtIns[i]);
			}
		}

		return matches;

	}

	var lastMatches = null;
	var lastIndex = "new";

	this.complete = function(directionSwitch) {

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

		// will not complete if you haven't started a word
		if ( ! activeWord )
			return false ;

		var obj = this;
		function expand (str) {
			obj.replace(startWord, endWord, str);
			var newPosition = startWord + str.length;
			obj.query.setSelectionRange(newPosition, newPosition);
		}
		function expandToClosest (list, word) {
			var commonPart = "";
			var common = true;
			var preserveCase = false;
			var shortest = list[0].length;
			var testCommon = word;

			for ( var p = 0; p < shortest; p++ ) {
				testCommon = list[0][p];
				
				for ( var i = 1; i < list.length; i++ ) {
					var curr = list[i];
					if ( shortest > curr.length )
						shortest = curr.length;
					
					var reg = new RegExp( curr[p], "i");
					if ( testCommon != curr[p] ) {
						if ( testCommon.search(reg) == -1 ){
							common = false;
							break;
						} else {
							preserveCase = true;
						}
					}
				}

				if ( common ) {
					if (preserveCase) {
						if ( p < word.length )
							commonPart += word[p];
						else
							commonPart += list[0][p];
					} else {
						commonPart += list[0][p];
					}
				} else
					break;
			}

			if ( commonPart ) {
				expand(commonPart);
			}

		}
		function showComps (list) {

			var output = "";
			var spanClose = "</span>";
			for ( var i=0; i<list.length; i++ ) {
				var spanOpen = "<span id=\"cli" + i + "\">";
				output += spanOpen+list[i].replace(/^.*\./, "")+spanClose+" ";
			}
			obj.autoCompOut.innerHTML = output;
			obj.autoCompOut.style.display = "block";

		}
		function cycleMatches() {

			newIndex = null; 

			var lastSelection = document.getElementById("cli"+lastIndex);
			if (lastSelection)
				lastSelection.style.backgroundColor = "";

			if ( lastIndex == "new") {
				newIndex = ( directionSwitch ? lastMatches.length - 1 : 0 );

			} else {
				newIndex = lastIndex + ( directionSwitch ? -1 : 1 );
				if ( newIndex == lastMatches.length || newIndex == -1)
					newIndex = ( directionSwitch ? lastMatches.length - 1 : 0 );
			}

			expand(lastMatches[newIndex]);
			var newSelection = document.getElementById("cli"+newIndex);
			newSelection.style.backgroundColor = "grey";

			lastIndex = newIndex;
		}
		

		if ( lastMatches ) {

			cycleMatches()

		} else {

			matches = this.completor(activeWord, leftContext, rightContext);

			this.autoCompOut.clear();

			if ( matches.length == 0 ){
				return false;
			} else if ( matches.length == 1 ) {
				expand(matches[0]);
			} else {
				lastMatches = matches;
				lastIndex = "new";
				expandToClosest(matches, activeWord);
				showComps(matches);
			}

		}
		return true;
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
		marginTop: 0,
		borderTop: "0",
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
		display: "none",
		padding: "0",
		paddingLeft: "2",
		paddingBottom: "2",
		paddingTop: "2",
		margin: "0",
		border: 0,
		borderBottom: "1",
		borderStyle: "solid",
		borderColor: "grey",
		backgroundColor: "black",
		fontFamily: "Verdana",
		fontSize: "14",
		color: "white",
		width: "100%",
		maxWidth: "100%",
		maxHeight: "430",
		}


	this.applyStyle = function (element, style) {
		for ( var i in style ) {
			element.style[i] = style[i];
		}
	}

	this.outPut = this.create("div");
	this.autoCompOut = this.create("div");
	this.query = this.create("textarea");
	this.helpOut = this.create("iframe");
	this.helpOut.style.borderTop = 1;
	this.helpOut.style.borderStyle = "solid"
	this.helpOut.style.borderColor = "grey"
	this.query.rows = 1;


	this.outPut.clear = function () {
		this.innerHTML = "";
		this.style.display = "none";
	}
	this.autoCompOut.clear = function () {
		this.innerHTML = "";
		this.style.display = "none";
	}

	this.style = this.wrapDiv.style;
	this.currentStyle = this.wrapDiv.currentStyle;


	// bindings -- should be replaced by a more general and better system
	var ctrlKey = false;
	function cliKeyHandler (e) {
		
		// when ctrl is down browsers return a capital letter
		// most browsers doesn't return e.ctrlKey being true
		// on keypress...
		var keycode = e.keyCode || e.charCode;
		var character= String.fromCharCode(keycode);
		if ( ctrlKey ) {
			character = character.toUpperCase();
		}
		// evalkey is enter as standard
		if ( keycode == obj.evalKey ){ 
			if ( !e.shiftKey ) {
				obj.evalQuery();
				e.preventDefault();
			}
		}
		// 27 is escape
		else if ( keycode == 27 ) 
			obj.close();
		else if ( keycode == 9 ) {
			obj.complete(e.shiftKey);
			if ( !ctrlKey )
				e.preventDefault();
			else
				obj.insert("    ");
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
			obj.outPut.clear();
			e.preventDefault();
		}

		if ( keycode != 9 ){
			lastMatches = null;
			lastIndex = "new";
			obj.autoCompOut.clear();
		}

		ctrlKey = false;
	}
	function ctrlKeyHandler (e) {
		ctrlKey = e.ctrlKey;
	}

	this.query.addEventListener("keypress", cliKeyHandler, false);
	this.query.addEventListener("keydown", ctrlKeyHandler, false);
}


function queryopenHandler (element, character) { 
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

document.addEventListener("DOMContentLoaded", function() {

cli = new javascriptConsole();


// chrome doesn't report event.ctrlKey on keypress.... nor escape it seems
window.addEventListener("keypress", queryopenHandler(cli, ";"), false);

}, false)

function help(str){
	cli.help.call(cli,str);
}
