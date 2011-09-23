(function () {

var History = function(value, str) {

	this.root = new historyNode(value);
	this.root.parent = null;
	this.current = this.root;
	this.tip = this.root; //the tip of the history
	this.addNode = str == "tip" ? addTipEntry : addCurrentEntry;
	this.add = str == "tip" ? addTipEntry : addCurrentEntry;
	this.prevNode = prevNode;
	this.nextNode = nextNode;
	this.prev = prevNode;
	this.next = nextNode;
	this.setCurrentNode = setCurrentNode;
	this.set = setCurrentNode;
	this.update = updateCurrent;
	this.forEach = forEach;
};


function forEach(func) {
	var node = this.root;
	while (node) {
		func(node);
		node = node.child;
	}
};

function updateCurrent(value) {
	this.current.value = value;
};

function addEntryToNode(node, value) {
	//log(this.value);
	if ( JSON.stringify(value) == JSON.stringify(node.value) ) return false;
	var newNode = new historyNode(value);
	newNode.parent = node;
	node.nodes.unshift(newNode);
	node.child = newNode;
	this.setCurrentNode(newNode);
	( node == this.tip )&&( this.tip = newNode );
	//log(this.currentNode.value);
	return newNode;
};

// adds a new history entry after the tip and sets it to current
// this is the style consoles use for their history
function addTipEntry(value) {
	addEntryToNode.call(this, this.tip, value);
};

// adds a new history entry after the current and sets it to current
// this will create a new history branch descending from current
// this is how browsers history works, though this isn't destructive
function addCurrentEntry(value) {
	//log(this.currentNode.value);
	addEntryToNode.call(this, this.current, value);
};

function getCurrentValue () {
	return this.current.value;
};

function setCurrentNode(node) {
	if ( node )
		this.current = node;
};

function prevNode() {
	var previous = this.current.parent;
	if ( previous ) {
		this.setCurrentNode(previous);
		return previous.value;
	}
	return null
};

function nextNode() {
	var next = this.current.child;
	if ( next ) {
		this.setCurrentNode(next);
		return next.value;
	}
	return null
};

function historySearch() {

};


function historyNode(value) {
	this.value = value;
	this.nodes = [];
	this.parent;
	this.child;
};

createModule("History", { history: History });


})();
