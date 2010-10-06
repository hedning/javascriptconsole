(function(){

var modules = {};

createModule = function (name, moduleObject) {
	if ( modules[name] )
		throw "Module already exist";
	if ( typeof moduleObject !== "function" )
		throw "Module '" +name+"' is not a constructor (function)";

	return modules[name] = moduleObject;
};

importModule = function (name) {
	var module = new modules[name];
	module.constructor = undefined;
	return module;
};

}());
