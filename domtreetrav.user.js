

function dom_tree_build (start_node) {

	document.documentElement.text = "";
	var indent_level = -1;
	var space_per_indent = 4;
	var current_object = "window.";
	var inspected_elements = {}
	last_element = null;
	function indent() {
		var spaces = "";
		for ( var i = 0; i < space_per_indent; i++)
			spaces += "-";
		spaces += "+";
		return spaces;
	}
	function auto_indent() {
		var spaces = "";
		for (var i = 0; i < indent_level; i++) 
			spaces += indent();
		return spaces;
	}

	function add_element_text(text, element){
		document.documentElement.innerHTML += "<p>" + auto_indent() + text + " " + typeof(element[text]) +"</p>";
	}

	function start_object(){
		++indent_level;
		document.documentElement.innerHTML += '<div class="' + indent_level + '">';
	}
	function end_object(){
		--indent_level;
		document.documentElement.innerHTML += '</div>';
	}

	function recurse_objects(element) {

		start_object();
		inspected_elements[element] = true ;
		
		for ( var i in element) {

			var val = element[i];
			last_element = i ;
			if ( !( i == "java" || 
					i == "netscape" || 
					i == "sun" || 
					i == "Packages" 
					)) {

				if ( !inspected_elements[val] ) {
					add_element_text(i, element);
					if ( typeof(val) == "object" ) {
						recurse_objects(val);
					}
				}
				//add_element_text(i, element);
			}
		}
		end_object();
	}

	recurse_objects(start_node);
}

