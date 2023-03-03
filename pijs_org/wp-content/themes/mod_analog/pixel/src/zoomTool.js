/*
zoomTool.js
*/

"use strict";

// Select Tool
var zoomTool = ( function () {
	var m_options, m_settings;

	m_options = [ "zoomLevel" ];
	m_settings = {
		"zoom": 1
	};

	// Create Tool
	function createTool( button ) {
		button.addEventListener( "click", selectTool );
		button.innerHTML = "<div style='background-image:url(" + g_themeUrl + "/pixel/magnify.png);'>" +
			"</div>";
	}

	// Select Tool
	function selectTool() {
		toolScript.setActiveTool( zoomTool, m_options, m_settings );
	}

	function deselectTool() {

	}

	// Pen Down
	function penDown( $screen, pen, $effects ) {

		if( pen.buttons === 1 ) {
			m_settings[ "zoom" ] += 1;
		} else {
			m_settings[ "zoom" ] -= 1;
			if( m_settings[ "zoom" ] === 0 ) {
				m_settings[ "zoom" ] = 1;
			}
		}

		updateZoom( m_settings[ "zoom" ] );
		toolScript.updateOption( "zoom", m_settings[ "zoom" ] );
		scrollToZoom( pen, m_settings[ "zoom" ] );
	}

	// Pen Move
	function penMove( $screen, pen, $effects ) {

	}

	// Pen Up
	function penUp( $screen, pen, $effects ) {

	}

	// Update Option
	function updateOption( name, value ) {
		m_settings[ name ] = value;
		updateZoom( m_settings[ "zoom" ] );
		scrollToZoom( false, value );
	}

	function scrollToZoom( isClick, zoom ) {
		var lastZoom, x, y, screen, rect, zoomData;

		if( zoom > 1 ) {
			screen = pixel.screen;
			rect = pixel.screenRect;
			lastZoom = pixel.activePicture.lastZoom;
			if( isClick ) {
				x = pixel.mouse.screen.x;
				y = pixel.mouse.screen.y;
				screen.scrollLeft += x * zoom - x * lastZoom;
				screen.scrollTop += y * zoom - y * lastZoom;
			} else {
				zoomData = pixel.activePicture.zoomData;
				screen.scrollLeft = ( zoomData.rect.width - rect.width ) / 2;
				screen.scrollTop = ( zoomData.rect.height - rect.height ) / 2;
			}
		}
		if( lastZoom === 1 || zoom === 1 ) {
			pixel.resizeGrid();
		} else {
			pixel.drawGrid();
		}
		if( $.util.isFunction( pixel.activeTool.zoomSet ) ) {
			pixel.activeTool.zoomSet();
		}
	}

	function updateZoom( zoom ) {
		pictureScript.setZoom( pixel.activePicture, zoom );
	}

	function layerChanged( oldLayer ) {

		if( oldLayer == null ) {
			return;
		}

		// If the picture has changed
		if( oldLayer.picture !== pixel.activePicture ) {

			// Update the zoom
			updateOption( "zoom", pixel.activePicture.zoom );
			toolScript.updateOption( "zoom", m_settings[ "zoom" ] );

			// Update the screen scroll position
			pixel.screen.scrollLeft = pixel.activePicture.scrollLeft;
			pixel.screen.scrollTop = pixel.activePicture.scrollTop;

		}

	}

	function getMessage() {
		return " - Zoom Tool";
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
		"name": "zoom-tool",
		"usesColors": false,
		"getMessage": getMessage
	};

// End of file encapsulation
} )();

toolScript.addTool( zoomTool );
