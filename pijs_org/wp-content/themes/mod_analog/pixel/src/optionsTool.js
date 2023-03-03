/*
optionsTool.js
*/

"use strict";

// Options Tool
var optionsTool = ( function () {
	var m_options, m_settings, m_backgrounds;

	m_options = [
		"backgroundOption", "showGridOption", "gridSizeOption",
		"overlayVisOption", "effectsOption",
	];
	m_settings = {
		"backgroundOption": "backgroundLight",
		"showGridOption": "showGridShow",
		"minGridSize": 30,
		"overlayVisOption" : 50
	};
	m_backgrounds = {
		"backgroundLight": "back-light",
		"backgroundMed": "back-med",
		"backgroundDark": "back-dark",
		"backgroundMix": "back-mix",
	};

	// Create Tool
	function createTool( button ) {
		button.addEventListener( "click", selectTool );
		button.innerHTML = "<div style='background-image:url(" + g_themeUrl + "/pixel/options.png);'>" +
			"</div>";
	}

	// Select Tool
	function selectTool() {
		toolScript.setActiveTool( optionsTool, m_options, m_settings );
		effectsScript.enableEffects( false );
	}

	function deselectTool() {}

	// Pen Down
	function penDown( $screen, pen, $effects ) {}

	// Pen Move
	function penMove( $screen, pen, $effects ) {}

	// Pen Up
	function penUp( $screen, pen, $effects ) {}

	// Update Option
	function updateOption( name, value ) {
		if( name === "backgroundOption" ) {
			setBackgroundImages( value );
		}
		if( name === "showGridOption" ) {
			pixel.showGrid = ( value === "showGridShow" );
			pixel.drawGrid();
		}
		if( name === "minGridSize" ) {
			pixel.minGridSize = value;
			pixel.drawGrid();
		}
		if( m_settings[ name ] ) {
			m_settings[ name ] = value;
		}

		if( name === "effectsOption" ) {
			runEffect( value );
			return;
		}

		if( name === "overlayVisPct" ) {
			pixel.overlayAlpha = Math.floor( value * 2.55 );
			layerScript.drawLayers();
		}
	}

	function runEffect( name ) {
		var action;

		action = undoScript.startDrawAction( "effect" );
		layerScript.refreshTemp();
		effectsScript[ name ]( pixel.activePicture.$temp.canvas() );
		layerScript.finalizeTemp();
		layerScript.drawLayers();
		action.undoDraw = true;
		action.redoDraw = true;
		undoScript.addAction( action );
	}

	function setBackgroundImages( value ) {
		var elements, i, className, oldClassName;

		className = m_backgrounds[ value ];
		oldClassName = m_backgrounds[ m_settings[ "backgroundOption" ] ];
		elements = document.querySelectorAll( "." + oldClassName );
		for( i = 0; i < elements.length; i++ ) {
			elements[ i ].className = elements[ i ].className
				.replace( oldClassName, className );
		}
	}

	function layerChanged( oldLayer ) {
		effectsScript.enableEffects( false );
	}

	function getMessage() {
		return " - Options Tool";
	}

	function getBackground() {
		return m_backgrounds[ m_settings[ "backgroundOption" ] ];
	}

	function getSettings() {
		return m_settings;
	}

	// Options Tool API return
	return {
		"createTool": createTool,
		"selectTool": selectTool,
		"deselectTool": deselectTool,
		"penDown": penDown,
		"penMove": penMove,
		"penUp": penUp,
		"updateOption": updateOption,
		"layerChanged": layerChanged,
		"name": "options-tool",
		"usesColors": false,
		"getMessage": getMessage,
		"getBackground": getBackground,
		"getSettings": getSettings
	};

// End of file encapsulation
} )();

toolScript.addTool( optionsTool );
