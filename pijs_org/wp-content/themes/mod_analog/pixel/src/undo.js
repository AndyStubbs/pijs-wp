/*
tools.js
*/

"use strict";

// Tool Script Container
var undoScript = ( function () {

	// Initialize Undo Code
	function initialize() {
		$.onkey( [ "Control", "z" ], "down", undo );
		$.onkey( [ "Control", "y" ], "down", redo );
	}

	function copyLayerImage( layerId, picture ) {
		var activeLayer, layerCanvas, copyCanvas;

		if( picture == null ) {
			picture = pixel.activePicture;
		}

		if( layerId == null ) {
			layerId = picture.activeLayerId;
		}

		// Get the active layer data
		activeLayer = picture.layers[ layerId ];

		// Get the canvas from the layer
		layerCanvas = activeLayer.$screen.canvas();

		// Create the canvas
		copyCanvas = pixel.copyCanvas( layerCanvas );

		return copyCanvas;
	}

	function startDrawAction( actionName, layer ) {
		var action, undoCanvas;

		if( layer == null ) {
			layer = pixel.activeLayer;
		}

		undoCanvas = copyLayerImage( layer.id, layer.picture );

		// Create the action
		action = {
			"action": actionName,
			"undoCanvas": undoCanvas,
			"layerId": layer.id,
			"undoCallback": null,
			"data": null
		};

		return action;
	}

	// Push action onto undo stack
	function addAction( action, picture ) {

		// Get reference to active picture
		if( picture == null ) {
			picture = pixel.activePicture;
		}

		// Copy the current canvas for redo
		if( action.redoDraw ) {
			action.redoCanvas = copyLayerImage( action.layerId, picture );
		}

		// Push the action onto the stack
		picture.undoStack.push( action );

		// Clear the redo stack
		picture.redoStack = [];

		// Temporary
		//showStacks();
	}

	// function showStacks() {
	// 	var i, undoStack, redoStack, action, divs;

	// 	undoStack = pixel.activePicture.undoStack;
	// 	redoStack = pixel.activePicture.redoStack;

	// 	divs = document.querySelectorAll( ".undo" );
	// 	for( i = 0; i < divs.length; i++ ) {
	// 		divs[ i ].parentElement.removeChild( divs[ i ] );
	// 	}

	// 	for( i = 0; i < undoStack.length; i++ ) {
	// 		action = undoStack[ i ];
	// 		createUndoElement( action, "U" );
	// 	}

	// 	for( i = 0; i < redoStack.length; i++ ) {
	// 		action = redoStack[ i ];
	// 		createUndoElement( action, "R" );
	// 	}

	// 	function createUndoElement( action, name ) {

	// 		var div = document.createElement( "div" );
	// 		div.className = "undo";
	// 		div.style.border = "1px solid black";
	// 		div.style.display = "inline-block";
	// 		div.style.width = "100px";
	// 		div.style.height = "115px";
	// 		div.style.fontSize = "14px";
	// 		div.style.verticalAlign = "top";
	// 		div.innerHTML = name + " - " + action.action + " - " + action.layerId + "<br />";
	// 		if( action.redoCanvas ) {
	// 			div.appendChild( action.redoCanvas );
	// 		} else if( action.undoCanvas ) {
	// 			div.appendChild( action.undoCanvas );
	// 		}
	// 		document.getElementById( "preview" ).appendChild( div );
	// 	}
	// }

	function undo() {
		var picture, action;

		if( $.util.isFunction( pixel.undoAction ) ) {
			pixel.undoAction();
			return;
		}

		picture = pixel.activePicture;
		if( picture.undoStack.length === 0 ) {
			return;
		}

		action = picture.undoStack.pop();
		doAction(
			action, action.undoCallback, action.undoCanvas, action.undoDraw
		);
		picture.redoStack.push( action );

		// Temporary
		// showStacks();

	}

	function redo() {
		var picture, action;

		picture = pixel.activePicture;
		if( picture.redoStack.length === 0 ) {
			return;
		}

		action = picture.redoStack.pop();
		doAction(
			action, action.redoCallback, action.redoCanvas, action.redoDraw
		);
		picture.undoStack.push( action );

		// Temporary
		// showStacks();
	}

	function doAction( action, callback, canvas, isDraw ) {
		var picture, layer;

		//console.log( action.action, action.layerId );
		picture = pixel.activePicture;

		if( callback ) {
			callback( action.data );
		}

		if( isDraw ) {

			// Get the layer from the active picture
			layer = picture.layers[ action.layerId ];

			// Draw the image onto the layer
			layer.$screen.cls();
			layer.$screen.drawImage( canvas, 0, 0 );
			layer.$screen.render();

			// Refresh temp
			layerScript.refreshTemp();

		}

		layerScript.drawLayers();
	}

	// Return API
	return {
		"initialize": initialize,
		"startDrawAction": startDrawAction,
		"addAction": addAction,
		"copyLayerImage": copyLayerImage
	};

// End of file encapsulation
} )();
