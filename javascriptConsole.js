(function () {

var bindings = importModule("bindings");
var state = importModule("persistentState");

var defineBindings = bindings.defineBindings,
defineContext = bindings.defineContext,
setMode = bindings.setMode,
defineMode = bindings.defineMode;

var privateEval = (function () {
	return function (str) {
		return eval(str);
	};
}());

function javascriptConsole() {

	_ = null;
	var obj = this;
	this.evalKey = 13;
	this.prompt = "$ ".fontcolor("grey");


	// appends a child of type elementType to this.wrapDiv
	this.create = function (elementType) {
		var createdEle;
		function append(str){
			createdEle = document.createElement(str);
			this.wrapDiv.appendChild(createdEle);
		}
		if ( !this.wrapDiv ) {
			this.wrapDiv = document.createElement("div");
			this.wrapDiv.className = "wrapDiv";
			this.wrapDiv.style.display = "none";
			document.body.appendChild(this.wrapDiv);
		}
		append.call(this, elementType);
		
		return createdEle || true;
	};


	this.open = function () {
		//this.applyStyle(this.query, this.queryStyle);
		this.wrapDiv.style.display = "block";
		// temporarily
		this.outPut.scrollTop = this.outPut.scrollHeight;
		this.focus();
	};
	this.close = function () {
		this.query.blur();
		this.wrapDiv.style.display = "none";
	};
	this.focus = function () {
		this.query.focus();
	};
	this.evalWrap = function (str) {
		try {
			return privateEval(str);
		}
		catch(error) {
			return error;
		}
	};
	this.evalQuery = function () {
		var evalText = this.query.value;
		this.query.value = "";
		// should have a javascript validator here
		this.histAppend(evalText);
		var output = this.evalWrap(evalText);
		_ = output;
		this.outPutAppend(output, evalText);
		this.autoCompOut.clear()
	};
	this.outPutAppend  = function (output, input) {
		if ( ! ( output == undefined ) ){
			output = output.toString().replace(/<(.*?)>/g, "&lt;$1&gt;");
			output = output.toString().replace(/\r\n|\n|\f|\r/g, "<br>");
		}
		this.outPut.innerHTML += this.prompt + input + "<BR>" + output + "<BR>" ;
		this.outPut.scrollTop = this.outPut.scrollHeight;
		this.outPut.style.display = "block";
	};

	this.history = state.getVariable("persistentHist") || [];
	var histPosition = this.history.length;
	var cacheHist = this.history.slice(0);

	this.histAppend = function (entry) {
		var lastEntry = this.history[this.history.length - 1]
		if ( entry != lastEntry && ! entry.match(/^\s*$/) ){
			this.history.push(entry);
			state.saveVariable("persistentHist", this.history);
		}

		histPosition = this.history.length;
		cacheHist = this.history.slice(0);
	};
	
	this.prevHistEntry = function () {
		var prevEntry = cacheHist[histPosition - 1];
		if ( prevEntry ) {
			cacheHist[histPosition] = this.query.value;
			this.query.value = prevEntry;
			histPosition--;
		}
	};

	this.nextHistEntry = function () {
		var nextEntry = cacheHist[histPosition + 1];
		if ( nextEntry || nextEntry == "") {
			cacheHist[histPosition] = this.query.value;
			this.query.value = nextEntry;
			histPosition++;
		}

	};

	this.historySearch = function (str) {
//		str = str.replace(/([\.^$\[\]\{\}\(\)\*\?\\\+])/g, "\\$1");
		for ( var i=histPosition-1; i>=0; i-- ) {
			if ( this.history[i].search(str) != -1 ){
				histPosition = i;
				this.query.value = this.history[i];
				break;
			}
		}
	};

	this.applyStyle = function (element, style) {
		for ( var i in style ) {
			element.style[i] = style[i];
		}
	};

	this.outPut = this.create("div");
	this.autoCompOut = this.create("div");
	this.outPut.style.display = "none"; 
	this.autoCompOut.style.display = "none";
	this.query = this.create("textarea");
	this.query.rows = 1;

	this.query.completion = new completionObject(this.query, this.autoCompOut);
	this.complete = this.query.completion.complete;

	this.wrapDiv.className = "wrapDiv"; 
	this.outPut.className = "outPut"; 
	this.autoCompOut.className = "autoCompOut";
	this.query.className = "query";

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

	defineContext("console", function (node) {
		return node == obj.query;
	} );
	defineMode("console", "command");

	defineBindings( { bind: "<enter>", action: function(){obj.evalQuery()}, context: "console" },
					{ bind: "<esc>", action:function(){obj.close()}, context: "console.command", hookBind: true },
					{ bind: "<ctrl>p", action:function(){obj.prevHistEntry()}, context: "console" },
					{ bind: "<ctrl>n", action:function(){obj.nextHistEntry()}, context: "console" },
					{ bind: "<ctrl>l", action:function(){obj.outPut.clear()}, context: "console" }
			);
}

(function(){
	var cli;
	function openJavascriptConsole () {
		if (!cli)
			cli = new javascriptConsole();
		cli.open();
	};
	defineBindings({ bind: ";", action: openJavascriptConsole, context: "document"});
}());


function completionObject(inputElement, outPutElement) {

	this.insert = function (str, position) {
		if ( ! position ) {
			if ( inputElement.selectionEnd != inputElement.selectionStart )
				return false;
			position = inputElement.selectionEnd;
		}
		var value = inputElement.value;

		inputElement.value = value.slice(0, position) + str 
			+ value.slice(position, value.length);
	};

	this.replace = function(start, end, replacement) {
		var value = inputElement.value;
		var leftContext = value.slice(0,start);
		var rightContext = value.slice(end,value.length);

		inputElement.value = leftContext + replacement + rightContext;
	};

	this.wordConstituents = "[/\\w\\{\\}_$\\.\\[\\]\"']";

	var obj = this;
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
		var standardNode = ["Event", "RegExp", "Function", "Array", 
			"scroll", "scrollBy", "Object", "String", "Number", "Boolean", ];
		var objectNode = [ "toString", "constructor", "hasOwnProperty",
		  "isProtoTypeOf", "propertyIsEnumerable", "valueOf", "__lookupGetter__",
		  "__lookupSetter__", "match", "charAt", "charCodeAt", "indexOf",
		  "lastIndexOf", "length", "replace", "search", "slice",
		  "split", "substr", "substring", "toLowerCase", "toUpperCase",
		  "anchor", "big", "blink", "bold", "fontcolor", "fontsize", "italics",
		  "link", "small", "strike", "sub", "sup", "global", "ignorecase", 
		  "lastIndex", "multiline", "source", "exec", "test", "apply",
		  "call", "prototype", "toExponential", "toFixed", "toLocaleString",
		  "toPrecision", "input",  "pop", "push", "reverse", 
		  "shift", "sort", "splice", "unshift", "concat", "join", "slice",
		  "indexOf", "fromCharCode", "filter", "forEach", "every", "map",
		  "some", "setItem", "removeItem"];

		var element = getElement(word);
		var rest = RegExp( "^" + getRest(word), "i");
		var matches = [];
		var recObj = window;

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
						matchingMark = '\\/[igm]*';
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
				if ( recObj == undefined )
					return [];
			} 
			builtIns = [];
		} else {
			objectNode = standardNode;
		}

		// all the characters that can't be used in string in element.string
		// used to weed out the nodes such as window["foo.bar"] and similar
		// rather ugly though
		var nonConstitutents = this.wordConstituents.replace(/^\[([^\.]*)\\.([^\.]*)\]$/, "[\^$1$2]|\\.");
		// adds matching properties/methods
		for ( var i in recObj ) {
			var match = "";
			if ( i.search(nonConstitutents) == -1 && i.search(/^[0-9]/) == -1 ){
				if ( i.search(rest) != -1){
					matches.push(element + i); }
			}
		}
		// adds the matching builtins methods and properties of the object
		for ( var i = 0; i < objectNode.length; i++ ) {
			if ( objectNode[i].search(rest) != -1 && recObj[objectNode[i]] != undefined ) {
					matches.push(element + objectNode[i]);
			}
		}
		// adds the matching builtins, like typeof
		for ( var i = 0; i < builtIns.length; i++ ) {
			if ( builtIns[i].search(rest) != -1){
					matches.push(builtIns[i]);
			}
		}

		return matches;

	};

	var lastMatches = null;
	var lastIndex = "new";

	this.complete = function(directionSwitch) {

		if ( !( inputElement.selectionEnd == inputElement.selectionStart ) )
			return false;

		var inPutString = inputElement.value;
		var position = inputElement.selectionEnd;
		var valueTab = splitString(inPutString, position);
		var leftContext = valueTab[0];
		var activeWord = valueTab[1];
		var rightContext = valueTab[2];
		var startWord = leftContext.length;
		var endWord = startWord + activeWord.length;

		// will not complete if you haven't started a word
		if ( ! activeWord )
			return false ;

		function expand (str) {
			obj.replace(startWord, endWord, str);
			var newPosition = startWord + str.length;
			inputElement.setSelectionRange(newPosition, newPosition);
		}
		function expandToClosest (list, word) {
			var commonPart = "";
			var common = true;
			var shortest = list[0].length;
			var testCommon = word;

			for ( var p = 0; p < shortest; p++ ) {
				testCommon = list[0][p];
				var preserveCase = false;

				for ( var i = 1; i < list.length; i++ ) {
					var curr = list[i];
					if ( shortest > curr.length )
						shortest = curr.length;
					
					if ( curr[p] != testCommon ) {
						if ( curr[p].toLowerCase() != testCommon.toLowerCase() ) {
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

			var fragment = document.createDocumentFragment();
			for ( var i=0; i<list.length; i++ ) {
				var span = document.createElement("span");
				var separator = document.createElement("span");
				separator.innerHTML = " ";
				span.id = "cli" + i;
				span.style.lineHeight = "normal";
				span.innerHTML = list[i].replace(/^.*\./, ""); 
				fragment.appendChild(span);
				fragment.appendChild(separator);
			}
			outPutElement.appendChild(fragment);
			outPutElement.style.display = "block";

		}
		function cycleMatches() {

			var newIndex = null;

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

			var matches = this.completor(activeWord, leftContext, rightContext);

			outPutElement.clear();

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
	};

	function clearComp (match) {
		if ( match[0] != "<tab>" && match[0] != "<shift><tab>" ) {
			lastMatches = null;
			lastIndex = "new";
			outPutElement.clear();
		}
	}


	defineBindings( { bind: ".*", action: clearComp, context: "console", hookBind: true} );
	defineBindings( { bind: "<shift><tab>", action: function(){ obj.complete(true)}, context: "console" } );
	defineBindings( { bind: "<tab>", action: function(){ obj.complete()}, context: "console" } );
	
}
}())
