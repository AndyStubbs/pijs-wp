/*
dropperTool.js
*/

"use strict";

// Dropper Tool
var dropperTool = ( function () {
	var m_options, m_settings, m_button, m_view, m_viewColor;

	m_options = [];
	m_settings = {};

	// Create Tool
	function createTool( button ) {
		button.addEventListener( "click", selectTool );
		button.innerHTML = "<div style='background-image:url(" + g_themeUrl + "/pixel/dropper.png);'>" +
			"</div>";
		m_view = document.getElementById( "colorPickerView" );
		m_viewColor = document.querySelector( "#colorPickerView div" );
	}

	// Select Tool
	function selectTool() {
		toolScript.setActiveTool( dropperTool, m_options, m_settings );
	}

	function deselectTool() {
		pixel.activePicture.$effects.cls();
	}

	// Pen Down
	function penDown( $screen, pen, $effects ) {
		m_button = pen.buttons;
		m_view.style.display = "block";
		readColor( $screen, pen );
	}

	// Pen Move
	function penMove( $screen, pen, $effects ) {
		if( pen.buttons > 0 ) {
			readColor( $screen, pen );
		}
		$effects.cls();
		$effects.setPen( "pixel", 1 );
		$effects.setColor( pixel.selectorColor );
		$effects.pset( pen.x, pen.y );
		$effects.render();
		layerScript.drawLayers();
	}

	// Pen Up
	function penUp( $screen, pen, $effects ) {
		var color;

		color = readColor( $screen, pen );
		colorScript.setColor( color, m_button );
		m_view.style.display = "none";
	}

	function readColor( $screen, pen ) {
		var color;

		color = $screen.getPixel( pen.x, pen.y );
		m_view.style.left = ( pixel.screenX( pen.x ) - 7 ) + "px";
		m_view.style.top = ( pixel.screenY( pen.y ) - 30 ) + "px";
		m_viewColor.style.backgroundColor = color.s;

		return color;
	}

	// Update Option
	function updateOption( name, value ) {
		m_settings[ name ] = value;
	}

	function layerChanged( oldLayer ) {}

	function getMessage() {
		return " - Color Picker Tool";
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
		"name": "dropper-tool",
		"usesColors": false,
		"getMessage": getMessage
	};

// End of file encapsulation
} )();

toolScript.addTool( dropperTool );
