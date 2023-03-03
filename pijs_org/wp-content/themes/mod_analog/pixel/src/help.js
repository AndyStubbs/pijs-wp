/*
animator.js
*/

"use strict";

// Controls Script Container
var helpScript = ( function () {
	var m_pages, m_index;
	
	m_pages = [ 
		[ "help-commands", "Commands" ],
		[ "help-color", "Colorbar" ],
		[ "help-color-buttons", "Control Buttons" ],
		[ "help-toolbar", "Toolbar" ],
		[ "help-tool-options", "Tool Options" ],
		[ "help-screen", "Screen" ],
		[ "help-layer-buttons", "Layer Buttons" ],
		[ "help-layers", "Layers" ],
		[ "help-image-controls", "Image Buttons" ],
		[ "help-images", "Images" ],
		[ "help-status-bar", "Statusbar" ]
	];
	m_index = 0;

	function initialize() {
		document.getElementById( "helpButton" )
			.addEventListener( "click", openHelp );
		document.getElementById( "helpLeft" )
			.addEventListener( "click", moveLeft );
		document.getElementById( "helpRight" )
			.addEventListener( "click", moveRight );
		document.getElementById( "helpOk" )
			.addEventListener( "click", closeHelp );
	}

	function openHelp() {

		// Show the help popup
		document.getElementById( "helpPopup" ).style.display = "block";
		document.getElementById( "modalPopup" ).style.display = "block";

		update();
	}

	function moveLeft() {
		m_index -= 1;
		update();
	}

	function moveRight() {
		m_index += 1;
		update();
	}

	function update() {
		document.getElementById( "helpImage" )
			.src = g_themeUrl + "/pixel/" + m_pages[ m_index ][ 0 ] + ".png";
		document.getElementById( "helpTitle" )
			.innerHTML = m_pages[ m_index ][ 1 ] + " - " + ( m_index + 1 ) +
			" of " + m_pages.length;
		document.querySelector( ".activeHelpMessage" ).className = "";
		document.getElementById( m_pages[ m_index ][ 0 ] )
			.className = "activeHelpMessage";
		updateButtons();
	}
	function updateButtons() {
		if( m_index === 0 ) {
			document.getElementById( "helpLeft" ).disabled = true;
		} else {
			document.getElementById( "helpLeft" ).disabled = false;
		}
		if( m_index === m_pages.length - 1 ) {
			document.getElementById( "helpRight" ).disabled = true;
		} else {
			document.getElementById( "helpRight" ).disabled = false;
		}
	}

	function closeHelp() {
		document.getElementById( "helpPopup" ).style.display = "none";
		document.getElementById( "modalPopup" ).style.display = "none";
	}

	// Picture Script return API
	return {
		"initialize": initialize,
		"openHelp": openHelp,
		"closeHelp": closeHelp
	};

	// End of file encapsulation
} )();
