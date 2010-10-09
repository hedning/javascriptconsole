(function(){

var modules = {};

// from crockford
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

createModule = function (name, moduleObject) {
	if ( modules[name] )
		throw "Module already exist";
	return modules[name] = moduleObject;
};

importModule = function (name) {
	var module = modules[name],
	args = Array.prototype.slice(arguments, 1);
	if (typeof module === "function")
		module = module.apply({}, args);
	module = Object.create(module);
	module.constructor = undefined;
	return module;
};

}());
