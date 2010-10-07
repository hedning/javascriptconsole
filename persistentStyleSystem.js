(function () {

var state = importModule("persistentState");
var log = importModule("log").log;
var persistentStyles = new Array;
var persistentCssRules = state.getVariable("persistentCssRules") || [];
var disableStyles = state.getVariable("disableStyles");
disableStyles = disableStyles !== undefined ? disableStyles : false;
var ruleCount = 0;


function getLocalStylesheet() {
	for ( var i=0; i < document.styleSheets.length; i++) {
		if ( document.styleSheets[i].title == "localStyle")
			return document.styleSheets[i];
	}
	return false;
}


function addLocalStyleSheet () {
	var html = document.documentElement,
	stylesheet = document.createElement("style");
	stylesheet.title = "localStyle";
	html.appendChild(stylesheet);
}
addLocalStyleSheet();

var addUserCssRule = function (rule) {

	var stylesheet = getLocalStylesheet();
	if ( ! stylesheet ) {
		setTimeout(function(){addUserCssRule(rule)}, 20);
		return false;
	}
	stylesheet.disabled = disableStyles;
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
	while ( rule = persistentCssRules[i] ) {
		addUserCssRule(rule);
		i++;
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

var enableStyles = function (bool) {
	getLocalStylesheet().disabled = !bool;
	state.saveVariable("disableStyles", !bool);
};

createModule("userStyle", function(){
		this.storeStyle = storeStyle;
		this.addUserCssRule = addUserCssRule;
		this.enableStyles = enableStyles;
});


document.addEventListener("DOMContentLoaded", function() {
	applyStyles();
}, false)

}());
