(function(){

var modules = {};

createModule = function (name, moduleObject) {
	return modules[name] = moduleObject;
};

importModule = function (name) {
	return modules[name];
};

}());
