(function () {

var bindings = importModule("bindings");
var state = importModule("persistentState");
var logTools = importModule("log");
var searchTools = importModule("objectSearchTools");
var userStyle = importModule("userStyle");
var History = importModule("History").history;

var consoleCompletion = [];

var defineBindings = bindings.defineBindings,
defineContext = bindings.defineContext,
defineMode = bindings.defineMode,
log = logTools.log,
_;

var privateEval = (function () {
	var consoleContext = [bindings, logTools, searchTools, userStyle, {"_":""}];
	for (var i=0; i < consoleContext.length; i++) {
		for (var k in consoleContext[i]) {
			eval("var "+k+"= consoleContext["+i+"]['"+k+"']");
			consoleCompletion.push(k);
		}

	}
	return function (str) {
		with (window) {
			return eval(str);
		}
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
			document.body.appendChild(this.wrapDiv);
		}
		append.call(this, elementType);
		
		return createdEle || true;
	};


	var open = function () {
		this.wrapDiv.style.display = "block";
		this.outPut.scrollTop = this.outPut.scrollHeight;
		this.query.focus();
	};
	var close = function () {
		this.query.blur();
		this.wrapDiv.style.display = "none";
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
		var evalText = this.query.textContent;
		this.histAppend(evalText);
		this.query.clear();
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

	var queryClear = function () {
		this.textContent = "";
	};

	var histAppend = function (history) {
		return function (entry) {
			var lastEntry = history.current.parent;
			lastEntry = lastEntry ? lastEntry.value[0] : undefined;
			if ( entry !== lastEntry && ! entry.match(/^\s*$/) ){
				history.set(history.tip);
				history.update([entry, entry]);
				history.add(["",""]);
//				state.saveVariable("persistentHist", history, "session");
			}

			history.forEach(function (node) {
					log(node.value);
					node.value[1] = node.value[0];
					});
		}
	};

	var navigateHist = function (history, incr) {
		return function () {
			history.current.value[1] = this.query.textContent;
			var entry = history[incr]();
			if (entry) {
				this.query.textContent = entry[1];
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


	return function () {

		var that = this,
//		history = state.getVariable("persistentHist", "session") || [],
		history = new History("", "tip");

		function context(node) {
			return node === that.query;
		}
		defineBindings({ bind: "<enter>", action: function(){that.evalQuery()},
				context: context },
					{ bind: "<esc>", action:function(){that.close()},
				context: context, hookBind: true },
					{ bind: "<ctrl>p", action:function(){that.prevHistEntry()},
				context: context },
					{ bind: "<ctrl>n", action:function(){that.nextHistEntry()},
				context: context },
					{ bind: "<ctrl>l", action:function(){that.outPut.clear()},
				context: context }
		);


		this.prompt = "-"+"$".fontcolor("#EB2513")+": ";

		this.create = create;
		this.open = open;
		this.close = close;
		this.evalQuery = evalQuery;
		this.outPutAppend = outPutAppend;

		this.nextHistEntry = navigateHist(history, "next");
		this.prevHistEntry = navigateHist(history, "prev");
		this.histAppend = histAppend(history);

		this.outPut = this.create("div");
		this.autoCompOut = this.create("div");
		this.outPut.style.display = "none";
		this.autoCompOut.style.display = "none";
		this.query = this.create("div");
		this.query.contentEditable = true;
		this.query.clear = queryClear;

		this.query.completion = new completionObject(this.query, this.autoCompOut);

		this.wrapDiv.className = "wrapDiv";
		this.outPut.className = "outPut";
		this.autoCompOut.className = "autoCompOut";
		this.query.className = "query";

		this.outPut.clear = outPutClear;
		this.autoCompOut.clear = outPutClear;
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
		var value = inputElement.textContent;

		inputElement.textContent = value.slice(0, position) + str
			+ value.slice(position, value.length);
	};

	this.replace = function(replacement) {
		document.execCommand("delete");
		document.execCommand("insertHTML", false, replacement)
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
			"return", "true", "false", "switch", "for", "if", "typeof", "JSON",
	 		"throw", "decodeURI", "decodeURIComponent",
			"encodeURI", "encodeURIComponent", "isFinite", "isNan", "parseFloat",
			"parseInt", "Infinity", "NaN", "undefined", "delete", "instanceof",
			"const", "void"];
		builtIns = builtIns.concat(consoleCompletion);
		var standardNode = ["Event", "RegExp", "Function", "Array",
			"scroll", "scrollBy", "Object", "String", "Number", "Boolean","Math",
			"Date", "Error", "frames", "escape", "unescape", "Node", "Attr",
			"Comment", "NodeList", "Text", "Notation", "DocumentFragment",
			"DocumentType", "Entity", "NameList", "NamedNodeMap", "TypeInfo",
			"ProcessingInstruction", "CDATASection", "CustomEvent", "focus",
			"ReferenceError", "SyntaxError", "RangeError", "TypeError",
			"URIError", "CharacterData", "DOMError", "DOMException",
			"DOMErrorHandler", "DOMConfiguration", "DOMImplementation",
			"DOMImplementationList", "DOMImplementationRegistry",
			"DOMImplementationSource", "DOMLocator", "DOMObject", "DOMString",
			"DOMStringList", "DOMTimeStamp", "DOMUserData", "EntityReference",
			"HTMLLinkElement", "HTMLHeadElement"];
		var objectNode = [ "toString", "constructor", "hasOwnProperty",
			"isPrototypeOf", "propertyIsEnumerable", "valueOf", "__lookupGetter__",
			"__lookupSetter__", "match", "charAt", "charCodeAt", "indexOf",
			"lastIndexOf", "length", "replace", "search", "slice", "create",
			"split", "substr", "substring", "toLowerCase", "toUpperCase",
			"anchor", "big", "blink", "bold", "fontcolor", "fontsize", "italics",
			"link", "small", "strike", "sub", "sup", "global", "ignorecase",
			"lastIndex", "multiline", "source", "exec", "test", "apply",
			"call", "prototype", "toExponential", "toFixed", "toLocaleString",
			"toPrecision", "input",  "pop", "push", "reverse",
			"shift", "sort", "splice", "unshift", "concat", "join", "slice",
			"indexOf", "fromCharCode", "filter", "forEach", "every", "map",
			"some", "setItem", "removeItem", "clear", "__proto__", "parse", "stringify",
			"postMessage", "reduce", "reduceRight", "getTime", "abs", "acos",
			"asin", "atan", "atan2", "ceil", "exp", "floor", "log", "max", "min",
			"pow", "random", "round", "sin", "sqrt", "tan", "E", "LN2", "LN10",
			"LOG2E", "LOG10E", "PI", "SQRT1_2", "SQRT2"];

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
		for (var i = 0, l = objectNode.length; i < l; i++) {
			if ( objectNode[i].search(rest) != -1 && recObj[objectNode[i]] != undefined ) {
					matches.push(element + objectNode[i]);
			}
		}
		// adds the matching builtins, like typeof
		for (var i = 0, l = builtIns.length; i < l; i++) {
			if ( builtIns[i].search(rest) != -1){
					matches.push(builtIns[i]);
			}
		}

		return matches.filter((function () {
				var li = [];
				return function (match) {
					if ( li.indexOf(match) !== -1 )
						return false;
					li.push(match);
					return true;
					}
				}()));
	};

	var createCycle = function (matches) {
			var spans = outPutElement.childNodes,
			end = matches.length - 1,
			i = -1;
			return function (direction) {
				spans[i] &&(spans[i].style.cssText = "");
				i += direction ? -1: 1;
				if (i < 0) i = end; if (i > end) i = 0;
				spans[i] &&(spans[i].style.cssText = 
						"border-radius: 3px; background-color: grey");
				return matches[i];
			};
	};

	// Takes two array-like arguments and returns their common part
	function common(a, b) {
		var common = new a.constructor,
		l = a.length;
		for (var j=0; j < l; j++) {
			if (a[j].toLowerCase() === b[j].toLowerCase())
				common = common.concat(a[j]);
			else
				break;
		}
		return common;
	}
	function expandToClosest(list) {
		return list.reduce(common);
	}

	function showComps (list) {
		var fragment = document.createDocumentFragment();
		for (var i = 0, l = list.length; i < l; i++) {
			var span = document.createElement("span");
			span.innerHTML = list[i].replace(/^.*\./, ""); 
			span.className = "completionItem";
			fragment.appendChild(span);
		}
		outPutElement.appendChild(fragment);
		outPutElement.style.display = "block";
	}

	var inCycle = false;
	this.complete = (function(){
		var cycle;

		return function(directionSwitch) {

		if ( !( inputElement.selectionEnd == inputElement.selectionStart ) )
			return false;

		var inPutString = inputElement.textContent,
		s = window.getSelection(),
		range = s.getRangeAt(0),
		position = range.startOffset,
		valueTab = splitString(inPutString, position),
		leftContext = valueTab[0],
		activeWord = valueTab[1],
		rightContext = valueTab[2],
		startWord = leftContext.length,
		endWord = startWord + activeWord.length;

		if ( ! activeWord )
			return false ;

		function expand (str) {
			var r = s.getRangeAt(0),
			tNode = r.startContainer,
			leftText = tNode.textContent.slice(0, startWord) + str,
			rightText = tNode.textContent.slice(startWord + activeWord.length);
			tNode.textContent = leftText + rightText;
			r.setEnd(r.endContainer, startWord + str.length);
			r.collapse(false); s.removeAllRanges(); s.addRange(r);
		}

		if (inCycle) {
			expand(cycle(directionSwitch));
		} else {

			var matches = this.completor(activeWord, leftContext, rightContext);

			outPutElement.clear();

			if ( matches.length === 0 ){
				return false;
			} else if ( matches.length === 1 ) {
				expand(matches[0]);
			} else {
				cycle = createCycle(matches);
				inCycle = true;
				expand(expandToClosest(matches, activeWord));
				showComps(matches);
			}

		}
		return true;
	};
	}());

	function clearComp (match) {
		if ( match[0] != "<tab>" && match[0] != "<shift><tab>" ) {
			inCycle = false;
			outPutElement.clear();
		}
	}
	function context(node) {
		return obj === node.completion;
	}

	defineBindings( { bind: ".*", action: clearComp, context: context, hookBind: true} );
	defineBindings( { bind: "<shift><tab>", action: function(){ this.completion.complete(true)}, context: context } );
	defineBindings( { bind: "<tab>", action: function(){ this.completion.complete()}, context: context } );
	
}
}())
