/*
paintTool.js
*/

"use strict";

// Paint Tool
var paintTool = ( function () {
	var m_options, m_settings;

	m_options = [ "toleranceOption", "noiseOption" ];
	m_settings = {
		"toleranceInput": 100,
		"noiseInput": 0,
	};

	// Create Tool
	function createTool( button ) {
		button.addEventListener( "click", selectTool );
		button.innerHTML = "<div style='background-image:url(" + g_themeUrl + "/pixel/bucket.png);'>" +
			"</div>";
	}

	// Select Tool
	function selectTool() {
		toolScript.setActiveTool( paintTool, m_options, m_settings );
	}

	function deselectTool() {}

	// Pen Down
	function penDown( $screen, pen ) {
		var action, $temp, noise, color, rect;

		// Don't allow paint if outside of selection area
		if( pixel.activePicture.hasRect ) {
			rect = pixel.activePicture.filterRect;
			if(
				pen.x < rect.x ||
				pen.x > rect.x + rect.width ||
				pen.y < rect.y ||
				pen.y > rect.y + rect.height
			) {
				return;
			}
		}

		$temp = pixel.activePicture.$temp;
		layerScript.refreshTemp();
		action = undoScript.startDrawAction( "paint" );
		if( m_settings.noiseInput > 0 ) {
			noise = Math.floor( ( m_settings.noiseInput / 100 ) * 255 );
			$temp.setPen( "pixel", 1, noise );
		} else {
			$temp.setPen( "pixel", 1, 0 );
		}
		if( pen.buttons === 1 ) {
			color = colorScript.getColor();
		} else {
			color = colorScript.getColor2();
		}
		$temp.paint(
			pen.x, pen.y, color,
			m_settings.toleranceInput / 100
		);
		$temp.render();
		layerScript.finalizeTemp();
		layerScript.drawLayers();
		action.undoDraw = true;
		action.redoDraw = true;
		undoScript.addAction( action );
	}

	function penMove( $screen, pen, $effects ) {
		$effects.cls();
		$effects.setPen( "pixel", 1 );
		$effects.setColor( pixel.selectorColor );
		$effects.pset( pen.x, pen.y );
		$effects.render();
		layerScript.refreshTemp();
		layerScript.drawLayers();
	}

	function penUp() {}

	// Update Option
	function updateOption( name, value ) {
		//console.log( name, value );
		m_settings[ name ] = value;
	}

	function layerChanged() {
		layerScript.refreshTemp();
	}

	function getMessage() {
		return " - Paint Tool";
	}

	// Paint Tool API return
	return {
		"createTool": createTool,
		"selectTool": selectTool,
		"deselectTool": deselectTool,
		"penDown": penDown,
		"penMove": penMove,
		"penUp": penUp,
		"updateOption": updateOption,
		"layerChanged": layerChanged,
		"name": "paint-tool",
		"usesColors": true,
		"getMessage": getMessage
	};

// End of file encapsulation
} )();

toolScript.addTool( paintTool );
