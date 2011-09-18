(function () {

var state = importModule("persistentState");
var log = importModule("log").log;
var persistentCssRules = state.getVariable("persistentCssRules") || [];
var disableStyles = state.getVariable("disableStyles");
disableStyles = disableStyles !== undefined ? disableStyles : false;

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
	html.appendChild(stylesheet).title = "localStyle";
}
addLocalStyleSheet();

var addUserCssRule = function (rule) {

	var stylesheet = getLocalStylesheet();
	stylesheet.disabled = disableStyles;
	rule = rule.replace(/!important/, "");
	rule = rule.replace(/\}/, "!important }");
	try { 
		stylesheet.insertRule(rule, 0); 
		return true;
	}
	catch(error){ 
		log("catch error: "+error);
		return false;
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
setTimeout(applyPersistentCss, 1);

var storeStyle = function (rule) {
	if (addUserCssRule(rule)) {
		persistentCssRules.push(rule);
		state.saveVariable("persistentCssRules", persistentCssRules);
	}
};

var enableStyles = function (bool) {
	getLocalStylesheet().disabled = !bool;
	state.saveVariable("disableStyles", !bool);
};

createModule("userStyle", {
		storeStyle: storeStyle,
		addUserCssRule: addUserCssRule,
		enableStyles: enableStyles
});

}());
