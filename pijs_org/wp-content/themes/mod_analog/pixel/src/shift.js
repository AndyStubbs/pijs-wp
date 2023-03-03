/*
shift.js
*/

"use strict";

// Controls Script Container
var shiftScript = ( function () {

	function initialize() {
		$.onkey( [ "Control", "ArrowLeft" ], "down", shiftLeft );
		$.onkey( [ "Control", "ArrowRight" ], "down", shiftRight );
		$.onkey( [ "Control", "ArrowUp" ], "down", shiftUp );
		$.onkey( [ "Control", "ArrowDown" ], "down", shiftDown );
	}

	function shiftLeft() {
		shiftImage( -1, 0 );
	}

	function shiftRight() {
		shiftImage( 1, 0 );
	}

	function shiftUp() {
		shiftImage( 0, -1 );
	}

	function shiftDown() {
		shiftImage( 0, 1 );
	}

	function shiftImage( dx, dy, layer ) {
		var $temp, action;

		if( layer == null ) {
			layer = pixel.activeLayer;
		}

		$temp = pixel.activePicture.$temp;
		action = undoScript.startDrawAction( "shift" );
		$temp.cls();
		$temp.drawImage( layer.$screen, dx, dy );
		$temp.render();
		layerScript.finalizeTemp();
		layerScript.drawLayers();
		action.undoDraw = true;
		action.redoDraw = true;
		undoScript.addAction( action );
	}

	// Picture Script return API
	return {
		"initialize": initialize
	};

	// End of file encapsulation
} )();
