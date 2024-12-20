const OPEN_FOLDER_ENTITY = "▼";
const CLOSED_FOLDER_ENTITY = "▲";
var mustBuildCommands  = false;
var g_fontSize = 18;

function printIndex( commands ) {
	var i, strContents, strLetter, isDivOpen, strIndex, name;
	strIndex = "";
	strContents = "<div>";
	strLetter = "";
	isDivOpen = false;
	for( i = 0; i < commands.length; i++ ) {
		name = commands[ i ].name;
		if( name.charAt( 0 ).toUpperCase() !== strLetter ) {
			strLetter = name.charAt( 0 ).toUpperCase();
			strIndex += "* <a href='#letter_" + strLetter + "' onclick='scrollToLink(event)'>" + strLetter + "</a> ";
			if( isDivOpen ) {
				strContents += "</div>";
			}
			strContents += printBorderLine( strLetter ) + "<div class='contents-letter'>";
			isDivOpen = true;
		}
		strContents += "<span class='wide-span'><a href='#command_" + name + "' onclick='scrollToLink(event)'>" + name + "</a></span>";
	}
	if( isDivOpen ) {
		strContents += "</div>";
	}
	strContents += "</div>";
	document.getElementById( "index-list" ).innerHTML = strIndex;
	document.getElementById( "contents" ).innerHTML = strContents;
}

function printIndex2( commands ) {
	var i, ul, li;

	ul = document.createElement( "ul" );
	for( i = 0; i < commands.length; i++ ) {
		li = document.createElement( "li" );
		li.innerHTML = "<a href='#command_" + commands[ i ].name + "' onclick='scrollToLink(event)'>" + commands[ i ].name + "</a>";
		ul.appendChild( li );
	}
	document.getElementById( "menu" ).appendChild( ul );
	let div = document.createElement( "div" );
	div.innerHTML = "&nbsp;<br />&nbsp;";
	document.getElementById( "menu" ).appendChild( div );
}

function printCommands( commands ) {
	var msg, i, j, msgParam, name;
	msg = "<h1>Commands</h1>";
	for( i = 0; i < commands.length; i++ ) {
		name = commands[ i ].name;
		msg += "<section id='command_" + name + "'>";
		msg += printBorderLine( name );
		msg += "<div class='tabbed'>" + commands[ i ].description + "</div>";
		msg += "<div>&nbsp;</div>";

		// Syntax
		msg += "<div class='sectionTitle'>Syntax:</div>";
		msg += "<div class='tabbed'>" + name + "(";
		msgParam = "";
		for( j = 0; j < commands[ i ].parameters.length; j++ ) {
			msgParam += commands[ i ].parameters[ j ] + ", ";
		}
		if( msgParam.length > 0 ) {
			msgParam = msgParam.substring( 0, msgParam.length - 2 );
			msgParam;
		}
		if( msgParam !== "" ) {
			msgParam = " " + msgParam + " ";
		}
		msg += msgParam + ");</div>";

		// Parameters List
		if( msgParam !== "" ) {
			msg += "<div>&nbsp;</div>";
			msg += "<div class='sectionTitle'>Parameters:</div>";
			msg += "<table class='tabbed'>";
			for( j = 0; j < commands[ i ].parameters.length; j++ ) {
				if( commands[ i ].pdata ) {
					msg += "<tr><td class='param-name'>" +
						commands[ i ].parameters[ j ] + "</td><td>" + commands[ i ].pdata[ j ] +
						"</td></tr>";
				}
			}
			if( commands[ i ].pdata && commands[ i ].pdata.length > j ) {
				msg += "<tr><td colspan='2'>" + commands[ i ].pdata[ j ] + "</td></tr>";
			}
			msg += "</table>";
		}		
		
		// Return Data
		if( commands[ i ].returns ) {
			msg += "<div>&nbsp;</div>";
			msg += "<div class='sectionTitle'>Return Data:</div>";
			msg += "<div class='tabbed'>" + commands[ i ].returns + "</div>"
		}
		
		// See also
		if( commands[ i ].seeAlso ) {
			msg += "<div>&nbsp;</div>";
			msg += "<div class='sectionTitle'>See Also:</div>";
			msg += "<div class='tabbed'>";
			let minWidth = 180;
			for( j = 0; j < commands[ i ].seeAlso.length; j++ ) {
				let seeAlso = commands[ i ].seeAlso[ j ];
				if(seeAlso.length * 13 > minWidth) {
					minWidth = seeAlso.length * 13;
				}
			}
			for( j = 0; j < commands[ i ].seeAlso.length; j++ ) {
				let seeAlso = commands[ i ].seeAlso[ j ];
				msg += "<div class='see-also' style='min-width:" + minWidth + "px;'>" +
					"* " +
					"<a href='#command_" + seeAlso + "' onclick='scrollToLink(event)'>" +
					seeAlso + "</a>&nbsp;</div>";
			}
			msg += "</div>";
		}
		
		msg += "<div>&nbsp;</div>";
		msg += "<div class='sectionTitle'>Example:</div>";
		msg += "<div class='example'><pre><code class='lang-javascript' id='example-code-" + i + "'>" + commands[ i ].example + "</pre></code></div>";
		msg += "<div class='tabbed'>";
		msg += "<input type='button' class='btn-retro btn-red' value='Run' onclick='runExample(\"" + commands[ i ].name + "\")' />";
		msg += "<input type='button' class='btn-retro btn-red' value='Copy' onclick='copyExample(" + i +")' />";
		msg += "<input type='button' class='btn-retro btn-red' value='Playground' onclick='gotoPlayground(" + i +")' />";
		msg += "<p><a href='#main' onclick='scrollToLink(event)'>Top</a></p>";
		msg += "</div>";
		msg += "</section>";
	}
	document.getElementById( "allCommands" ).innerHTML = msg;
}

function printBorderItem( label ) {
	var msg1, msg2, msg3, i;
	msg1 = "&#x2554;";
	msg2 = "&#x2551; " + label + " &#x2551;";
	msg3 = "&#x255A;";
	for( i = 0; i < label.length + 2; i++ ) {
		msg1 += "&#x2550;";
		msg3 += "&#x2550;";
	}
	msg1 += "&#x2557;";
	msg3 += "&#x255D;";

	return "<div class='border'>" + msg1 + "\n" + msg2 + "\n" + msg3 + "</div>";
}

function printBorderLine( label ) {
	var width, count, msg, msg1, msg2, msg3, i;
	width = document.querySelector( ".commands-page" ).getBoundingClientRect().width + 300;
	count = Math.floor( width / g_fontSize ) - label.length * 2;
	if( width <= 1000 ) {
		count += label.length * 2;
	}

	msg = "<div class='border' id='letter_" + label + "'>";
	msg1 = "&#x2554;";
	msg3 = "&#x255A;";
	for( i = 0; i < label.length + 2; i++ ) {
		msg1 += "&#x2550;";
		msg3 += "&#x2550;";
	}
	msg1 += "&#x2557;";
	msg2 = "&#x2551; " + label + " &#x2560;";
	msg3 += "&#x255D;";
	for( i = 0; i < count; i++ ) {
		msg1 += " ";
		msg2 += "&#x2550;";
		msg3 += " ";
	}

	if( width > 1000 ) {
		msg1 += "&#x2554;";
		msg3 += "&#x255A;";
		for( i = 0; i < label.length + 2; i++ ) {
			msg1 += "&#x2550;";
			msg3 += "&#x2550;";
		}
		msg1 += "&#x2557;";
		msg2 += "&#x2563; " + label + " &#x2551;";
		msg3 += "&#x255D;";
	}
	msg += "\n" + msg1 + "\n" + msg2 + "\n" + msg3 + "\n</div>";
	return msg;
}

( function( $ ) {

	$.getJSON( g_helpFile ).done( function ( commands ) {
		printIndex( commands );
		printCommands( commands );
		document.querySelectorAll( "pre code" ).forEach( ( block ) => {
			hljs.highlightBlock( block );
		} );
		scrollToHash();
	} );

	var resizeTimeout;
	window.addEventListener( "resize", function () {
		window.clearTimeout( resizeTimeout );
		resizeTimeout = window.setTimeout( function () {
			document.querySelectorAll( ".border" ).forEach( function ( block ) {
				var name = block.id.substring( block.id.indexOf( "_" ) + 1 );
				block.innerHTML = printBorderLine( name );
			} );
		}, 100 );
	} );

	function scrollToHash() {
		// Get the current URL
		const currentUrl = window.location.href;
		// Check if the URL has a hash
		if (currentUrl.indexOf("#") !== -1) {
			// Get the hash value
			const hashValue = currentUrl.substring(currentUrl.indexOf("#") + 1);
			// Scroll to the element with the corresponding ID
			const targetElement = document.getElementById(hashValue);
			if (targetElement) {
			// Calculate the offset from the top of the page
			const offset = targetElement.getBoundingClientRect().top + window.scrollY - 50; // 50px above the element
			// Scroll to the element instantly and slightly above it
			window.scrollTo({ top: offset, behavior: "instant" });
			}
		}
	}

}( jQuery ));

function scrollToLink(event) {
	// Prevent the default behavior of the link
	event.preventDefault();
	// Get the hash value from the link
	const hashValue = event.target.hash.substring(1);
	// Get the target element
	const targetElement = document.getElementById(hashValue);
	if (targetElement) {
		// Calculate the offset from the top of the page
		const offset = targetElement.getBoundingClientRect().top + window.scrollY - 50; // 50px above the element
		// Scroll to the element with the corresponding ID
		window.scrollTo({ top: offset, behavior: "instant" });
	}
}
