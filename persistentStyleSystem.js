(function () {

var state = importModule("persistentState");
var log = importModule("log").log;
var persistentStyles = new Array;
var persistentCssRules = state.getVariable("persistentCssRules");
var ruleCount = 0;


function getLocalStylesheet() {
	for ( var i=0; i < document.styleSheets.length; i++) {
		if ( document.styleSheets[i].title == "localStyle")
			return document.styleSheets[i];
	}
	return false;
}


function addLocalStyleSheet () {

	var styleSheet = document.createElement("link");
	var head = document.documentElement.firstElementChild;

	styleSheet.rel = "stylesheet";
	styleSheet.title = "localStyle";
	head.appendChild(styleSheet);

	styleCount = document.styleSheets.length;
	//log("styleCount: "+styleCount);

	return document.styleSheets[styleCount-1];
}

var localStylesheet = addLocalStyleSheet();
log("site: "+location.hostname  , "stylesheet: "+localStylesheet.title );


addUserCssRule = function (rule) {

	log(localStylesheet.insertRule);
	log("cssRule: "+rule);

	localStylesheet = getLocalStylesheet();
	try { 
		localStylesheet.insertRule(rule, 0); 
	}
	catch(error){ 
		err = error;
		log("catch error: "+error);
	}

}




function applyPersistentCss() {

	var i=0;
	var rule;
	if ( persistentCssRules ) {
		while ( rule = persistentCssRules[i] ) {
			addUserCssRule(rule);
			i++;
		}
	}
}

applyPersistentCss();

function getPersistentStyles() {

	var i=0;
	while ( localStorage["persistentStyleElement"+i] ) {

		var element = dereferenceChildNodeTree(eval(localStorage["persistentStyleElement"+i]));
		var style = localStorage["persistentStyle"+i];
		var urlRule = null;

		if ( localStorage["persistentUrlRule"+i] )
			urlRule = eval(localStorage["persistentUrlRule"+i]);
		if (element) {
			persistentStyles.push( { element : element , urlRule : urlRule , style : style } );
		}

		i++;
	}

	ruleCount = persistentStyles.length;

}

applyStyles = function () {

	getPersistentStyles();

	var element;
	var style;
	var urlRule;

	for ( var i=0; i < persistentStyles.length; i++ ) {

		log(persistentStyles[i].element+"\n"+ persistentStyles[i].element.constructor);
		element = persistentStyles[i].element;
		eval("style = " + persistentStyles[i].style);

		for ( var k in style ) {
			element.style[k] = style[k];
		}
	}
//	applyPersistentCss();
}

storeStyle = function (element, style) {

	if ( type(element) == "String") {
		if ( persistentStyles )
			persistentStyles = [];
		persistentCssRules.push(element);
		state.saveVariable("persistentCssRules", persistentCssRules);

	} else {

		var treeId = "[" + buildChildNodeTree(element).toString() + "]";
		var styleString = "{";

		for ( var i in style ) {
			styleString += i + ":'"+style[i]+"',";
		}
		styleString = styleString.replace(/,$/, "");
		styleString += "}";

		localStorage.setItem("persistentStyleElement"+ruleCount, treeId);
		localStorage.setItem("persistentStyle"+ruleCount, styleString);
		ruleCount++;
	}
}

//document.addEventListener("load", applyStyles(), false);
//

document.addEventListener("DOMContentLoaded", function() {
	applyStyles();
}, false)

}) ()
