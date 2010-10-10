(function () {

var bindings = importModule("bindings");
var state = importModule("persistentState");
var log = importModule("log").log;
var searchTools = importModule("objectSearchTools");
var userStyle = importModule("userStyle");

var defineBindings = bindings.defineBindings,
defineContext = bindings.defineContext,
defineMode = bindings.defineMode,
_;

var privateEval = (function () {
	var inspect = searchTools.inspect,
	addUserCssRule = userStyle.addUserCssRule,
	setMode = bindings.setMode,
	enableStyles = userStyle.enableStyles,
	storeStyle = userStyle.storeStyle;
	return function (str) {
		return eval(str);
	};
}());

var javascriptConsole = (function(){

	_ = null;

	// appends a child of type elementType to this.wrapDiv
	var create = function (elementType) {
		var createdEle;
		function append(str){
			createdEle = document.createElement(str);
			this.wrapDiv.appendChild(createdEle);
		}
		if ( !this.wrapDiv ) {
			this.wrapDiv = document.createElement("div");
			this.wrapDiv.className = "wrapDiv";
		}
		append.call(this, elementType);
		
		return createdEle || true;
	};


	var open = function () {
		document.body.appendChild(this.wrapDiv);
		this.outPut.scrollTop = this.outPut.scrollHeight;
		this.query.focus();
	};
	var close = function () {
		this.query.blur();
		document.body.removeChild(this.wrapDiv);
	};
	var evalWrap = function (str) {
		try {
			return privateEval(str);
		}
		catch(error) {
			return error;
		}
	};
	var evalQuery = function () {
		var evalText = this.query.value;
		this.query.value = "";
		// should have a javascript validator here
		this.histAppend(evalText);
		var output = evalWrap(evalText);
		_ = output;
		this.outPutAppend(output, evalText);
		this.autoCompOut.clear()
	};
	var outPutAppend  = function (output, input) {
		if ( ! ( output == undefined ) ){
			output = output.toString().replace(/<(.*?)>/g, "&lt;$1&gt;");
			output = output.toString().replace(/\r\n|\n|\f|\r/g, "<br>");
		}
		this.outPut.innerHTML += this.prompt + input + "<BR>" + output + "<BR>" ;
		this.outPut.scrollTop = this.outPut.scrollHeight;
		this.outPut.style.display = "block";
	};

	var outPutClear = 	function () {
			this.innerHTML = "";
			this.style.display = "none";
		};

	var histAppend = function (history, cacheHist, histPosition) {
		return function (entry) {
			var lastEntry = history[history.length - 1]
			if ( entry != lastEntry && ! entry.match(/^\s*$/) ){
				history.push(entry);
				state.saveVariable("persistentHist", history, "session");
			}

			histPosition[0] = history.length;
			for ( var i=0; i < history.length; i++) {
				cacheHist[i] = history[i];
			}
		}
	};
	
	var navigateHist = function (history, cacheHist, histPosition, incr) {
		return function () {
			var entry = cacheHist[histPosition[0] + incr];
			if ( entry ) {
				cacheHist[histPosition[0]] = this.query.value;
				this.query.value = entry;
				histPosition[0] += incr;
			}
		}
	};
	var historySearch = function (str) {
//		str = str.replace(/([\.^$\[\]\{\}\(\)\*\?\\\+])/g, "\\$1");
		for ( var i=histPosition-1; i>=0; i-- ) {
			if ( this.history[i].search(str) != -1 ){
				histPosition = i;
				this.query.value = this.history[i];
				break;
			}
		}
	};

	defineContext("console", function (node) {
		if (node.completion)
			return node.completion.constructor === completionObject;
		else
			return false;
	} );
	defineMode("console", "command");

	return function () {

		var that = this,
		history = state.getVariable("persistentHist", "session") || [],
		cacheHist = history.slice(0),
		histPosition = [history.length];
		this.evalKey = 13;
		this.prompt = "-"+"$".fontcolor("#EB2513")+": ";

		this.create = create;
		this.open = open;
		this.close = close;
		this.evalQuery = evalQuery;
		this.outPutAppend = outPutAppend;

		this.nextHistEntry = navigateHist(history, cacheHist, histPosition, 1);
		this.prevHistEntry = navigateHist(history, cacheHist, histPosition, -1);
		this.histAppend = histAppend(history, cacheHist, histPosition);

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

		this.outPut.clear = outPutClear;
		this.autoCompOut.clear = outPutClear;

		defineBindings( { bind: "<enter>", action: function(){that.evalQuery()}, context: "console" },
						{ bind: "<esc>", action:function(){that.close()}, context: "console", hookBind: true },
						{ bind: "<ctrl>p", action:function(){that.prevHistEntry()}, context: "console" },
						{ bind: "<ctrl>n", action:function(){that.nextHistEntry()}, context: "console" },
						{ bind: "<ctrl>l", action:function(){that.outPut.clear()}, context: "console" }
			);
	}
}());

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
				var litMarks = { "\\[": ["\\]", Array], "\\{": ["\\}", Object],
					"\\'": ["\\'", String], '\\"': ['\\"', String],
					"\\/": ["\\/[img]*", RegExp]},
				matchingMark = litMarks[litMark][0],
				builtinType = litMarks[litMark][1];
				// should be replaced with something that counts the []/{} properly
				var reg = new RegExp("^"+litMark+"[^"+matchingMark+"]*"+matchingMark+"\\.?");
				if ( restEle.search(reg) != -1 ){
					restEle = restEle.replace(reg, "");
					recObj = builtinType.prototype;
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
				span.innerHTML = list[i].replace(/^.*\./, ""); 
				fragment.appendChild(span);
			}
			outPutElement.appendChild(fragment);
			outPutElement.style.display = "block";
		}
		function cycleMatches(matches) {
			var newIndex = null,
			spans = outPutElement.childNodes;

			var lastSelection = spans[lastIndex];
			if (lastSelection)
				lastSelection.style.backgroundColor = "";

			if ( lastIndex == "new") {
				newIndex = ( directionSwitch ? matches.length - 1 : 0 );

			} else {
				newIndex = lastIndex + ( directionSwitch ? -1 : 1 );
				if ( newIndex == matches.length || newIndex == -1)
					newIndex = ( directionSwitch ? matches.length - 1 : 0 );
			}

			expand(matches[newIndex]);
			var newSelection = spans[newIndex];
			newSelection.style.backgroundColor = "grey";
			newSelection.style.borderRadius = 3;

			"scrollIntoViewIfNeeded" in newSelection && newSelection.scrollIntoViewIfNeeded();

			lastIndex = newIndex;
		}
		

		if ( lastMatches ) {

			cycleMatches(lastMatches)

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
