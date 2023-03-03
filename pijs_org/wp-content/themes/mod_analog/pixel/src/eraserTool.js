/*
eraserTool.js
*/

"use strict";

// Pen Tool
var eraserTool = ( function () {
	var m_isDrawing, m_options, m_settings, m_action, m_shapes;

	m_options = [
		"sizeOption", "shapeOption", "reflectOption"
	];
	m_settings = {
		"sizeInput": 1,
		"shapeOption": "shapeSquare",
		"reflectOption": "reflectN"
	};
	m_isDrawing = false;
	m_shapes = {
		"shapeSquare": "square",
		"shapeCircle": "circle"
	};

	// Create Tool
	function createTool( button ) {
		button.addEventListener( "click", selectTool );
		button.innerHTML = "<div style='background-image:url(" + g_themeUrl + "/pixel/eraser.png);'>" +
			"</div>";
	}

	// Select Tool
	function selectTool() {
		toolScript.setActiveTool( eraserTool, m_options, m_settings );
	}

	function deselectTool() {
		pixel.activePicture.$effects.cls();
	}

	// Pen Down
	function penDown( $screen, pen ) {
		var $temp;

		pixel.activePicture.$effects.cls();
		$temp = pixel.activePicture.$temp;
		$temp.setColor( $.util.convertToColor( "rgba(0, 0, 0, 0)" ) );
		layerScript.refreshTemp();
		m_action = undoScript.startDrawAction( "pen" );
		startPen( $temp );
		drawPixel( $temp, pen );
		stopPen( $temp );
		layerScript.drawLayers();
		m_isDrawing = true;
	}
 
	function reflectX( pen ) {
		return {
			"x": pen.x * -1 + pixel.activePicture.width - 1,
			"y": pen.y,
			"lastX": pen.lastX * -1 + pixel.activePicture.width - 1,
			"lastY": pen.lastY
		};
	}

	function reflectY( pen ) {
		return {
			"x": pen.x,
			"y": pen.y * -1 + pixel.activePicture.height - 1,
			"lastX": pen.lastX,
			"lastY": pen.lastY * -1 + pixel.activePicture.height - 1
		};
	}

	function reflectXY( pen ) {
		return {
			"x": pen.x * -1 + pixel.activePicture.width - 1,
			"y": pen.y * -1 + pixel.activePicture.height - 1,
			"lastX": pen.lastX * -1 + pixel.activePicture.width - 1,
			"lastY": pen.lastY * -1 + pixel.activePicture.height - 1
		};
	}

	function startPen( $screen ) {
		$screen.setPen(
			m_shapes[ m_settings.shapeOption ], m_settings.sizeInput
		);
	}

	function stopPen( $screen ) {
		$screen.setPen( "pixel", 1 );
	}

	// Pen Move
	function penMove( $screen, pen ) {
		var $temp, tPen, $effects;

		$effects = pixel.activePicture.$effects;
		if( m_isDrawing ) {
			$temp = pixel.activePicture.$temp;
			startPen( $temp );

			// Draw Normal
			$temp.line( pen.x, pen.y, pen.lastX, pen.lastY );

			// Draw Reflected X
			if(
				m_settings[ "reflectOption" ] === "reflectX" ||
				m_settings[ "reflectOption" ] === "reflectXY"
			) {
				tPen = reflectX( pen );
				$temp.line( tPen.x, tPen.y, tPen.lastX, tPen.lastY );
			}

			// Draw Reflected Y
			if(
				m_settings[ "reflectOption" ] === "reflectY" ||
				m_settings[ "reflectOption" ] === "reflectXY"
			) {
				tPen = reflectY( pen );
				$temp.line( tPen.x, tPen.y, tPen.lastX, tPen.lastY );
			}

			// Draw Reflected XY
			if( m_settings[ "reflectOption" ] === "reflectXY" ) {
				tPen = reflectXY( pen );
				$temp.line( tPen.x, tPen.y, tPen.lastX, tPen.lastY );
			}

			$temp.render();
			stopPen( $temp );
			layerScript.drawLayers();
		}

		$effects.cls();
		$effects.setPen(
			m_shapes[ m_settings.shapeOption ], m_settings.sizeInput
		);
		$effects.setColor( pixel.selectorColor );
		drawPixel( $effects, pen );
		$effects.setPen( "pixel", 1 );
		layerScript.drawLayers();
	}

	// Pen Up
	function penUp( $screen, pen ) {
		// Drawing is done
		if( m_isDrawing ) {
			layerScript.finalizeTemp();

			m_isDrawing = false;
			m_action.undoDraw = true;
			m_action.redoDraw = true;
			undoScript.addAction( m_action );
		}

	}

	function drawPixel( $temp, pen ) {
		var tPen;

		// Draw Normal
		$temp.pset( pen.x, pen.y );

		// Draw Reflected X
		if(
			m_settings[ "reflectOption" ] === "reflectX" ||
			m_settings[ "reflectOption" ] === "reflectXY"
		) {
			tPen = reflectX( pen );
			$temp.pset( tPen.x, tPen.y );
		}

		// Draw Reflected Y
		if(
			m_settings[ "reflectOption" ] === "reflectY" ||
			m_settings[ "reflectOption" ] === "reflectXY"
		) {
			tPen = reflectY( pen );
			$temp.pset( tPen.x, tPen.y );
		}

		// Draw Reflected XY
		if( m_settings[ "reflectOption" ] === "reflectXY" ) {
			tPen = reflectXY( pen );
			$temp.pset( tPen.x, tPen.y );
		}

		$temp.render();
	}

	// Update Option
	function updateOption( name, value ) {
		//console.log( name, value );
		m_settings[ name ] = value;
	}

	function layerChanged() {
		layerScript.refreshTemp();
	}

	function getMessage() {
		return " - Eraser Tool";
	}

	// Pen Tool API return
	return {
		"createTool": createTool,
		"selectTool": selectTool,
		"deselectTool": deselectTool,
		"penDown": penDown,
		"penMove": penMove,
		"penUp": penUp,
		"updateOption": updateOption,
		"layerChanged": layerChanged,
		"name": "eraser-tool",
		"usesColors": true,
		"getMessage": getMessage
	};

// End of file encapsulation
} )();

toolScript.addTool( eraserTool );
