(function(){

var modules = {};

createModule = function (name, moduleObject) {
	if ( modules[name] )
		throw "Module already exist";
	return modules[name] = moduleObject;
};

importModule = function (name) {
	return modules[name];
};

}());
