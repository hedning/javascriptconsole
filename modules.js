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
	if ( typeof moduleObject !== "object" )
		throw "Module '" +name+"' is not an object";

	return modules[name] = moduleObject;
};

importModule = function (name) {
	var module = Object.create(modules[name]);
	module.constructor = undefined;
	return module;
};

}());
