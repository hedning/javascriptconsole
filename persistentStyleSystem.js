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
	var head = document.getElementsByTagName("head")[0];
	if ( ! head ) {
		setTimeout(addLocalStyleSheet, 20);
		return false;
	}

	var stylesheet = document.createElement("style");
	stylesheet.rel = "stylesheet";
	stylesheet.title = "localStyle";
	head.appendChild(stylesheet);
}
addLocalStyleSheet();

var addUserCssRule = function (rule) {

	var stylesheet = getLocalStylesheet();
	if ( ! stylesheet ) {
		setTimeout(function(){addUserCssRule(rule)}, 20);
		return false;
	}
	rule = rule.replace(/!important/, "");
	rule = rule.replace(/\}/, "!important }");
	try { 
		stylesheet.insertRule(rule, 0); 
	}
	catch(error){ 
		err = error;
		log("catch error: "+error);
	}

};


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

var applyStyles = function () {

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
};

var storeStyle = function (element, style) {

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
};

createModule("userStyle", function(){
		this.storeStyle = storeStyle;
		this.addUserCssRule = storeStyle;
});


document.addEventListener("DOMContentLoaded", function() {
	applyStyles();
}, false)

}());
