defineBindings( 
		{ bind: /h$/, action: (function() {window.scrollBy(0,25)}) },
		{ bind: /t$/, action: function() {window.scrollBy(0,-25)} }
//	  	{ bind: /<ctrl>u$/, action: scrollPageUp },
//	  	{ bind: /<ctrl>a$/, action: moveToStartofLine, context: "textInput" },
//	  	{ bind: /<esc>$/, action: actionSetMode("command") },
//	 	{ bind: /i$/, action: actionSetMode("insert"), context: "textInput" },
//		{ bind: /f(.?)$/, action: moveToChar, mode: "command", context: "textInput" } )
)
