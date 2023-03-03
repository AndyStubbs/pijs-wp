/*
picture.js
*/

"use strict";

// Picture Script Container
var pictureScript = ( function () {

	function initialize() {}

	// Create a new image
	function createNewPicture( width, height ) {
		var sdim, picture, pictureIndex, isFirst, oldLayer;

		// Create the main screen
		sdim = width + "x" + height;

		// Get the index of the picture
		pictureIndex = pixel.pictures.length;

		// Hide the current active picture
		if( pixel.activePicture ) {
			pixel.activePicture.$main.canvas().style.display = "none";
			isFirst = false;
		} else {
			isFirst = true;
		}

		// Hide the current active picture layers
		layerScript.hideLayers();

		// Create the new picture
		picture = {
			"$main": createNewScreen( sdim, false ),
			"$effects": createNewScreen( sdim, true ),
			"angle": 0,
			"radius": 60,
			"filterRect": {
				"x": 0, "y": 0, "width": width, "height": height,
				"tx": 0, "ty": 0, "twidth": width, "theight": height,
				"showRect": false
			},
			"$temp": createNewScreen( sdim, true ),
			"$temp2": createNewScreen( sdim, true ),
			"$preview": createPreviewScreen( sdim, pictureIndex ),
			"layers": {},
			"orderedLayers": [],
			"layerCount": 0,
			"activeLayerId": 0,
			"sdim": sdim,
			"width": width,
			"height": height,
			"id": pictureIndex,
			"undoStack": [],
			"redoStack": [],
			"rect": null,
			"zoomData": null,
			"zoom": 1,
			"lastZoom": 1
		};

		// Temporary
		if( pixel.addTempImages ) {
			picture.$temp.canvas().style.border = "1px solid green";
			document.getElementById( "preview" ).appendChild( picture.$temp.canvas() );
			picture.$effects.canvas().style.border = "1px solid purple";
			document.getElementById( "preview" ).appendChild( picture.$effects.canvas() );
			picture.$temp2.canvas().style.border = "1px solid orange";
			document.getElementById( "preview" ).appendChild( picture.$temp2.canvas() );
		}

		oldLayer = pixel.activeLayer;

		// Set the new picture to active
		pixel.activePicture = picture;

		calcRect( picture );

		// Add picture to the global array
		pixel.pictures.push( picture );

		// Create a new layer
		layerScript.createNewPicture( picture, isFirst );

		// Resize the grid
		pixel.resizeGrid();

	}

	function calcRect( picture ) {
		var rect, canvas;

		// Only use the active picture to calculate rect size
		canvas = pixel.activePicture.$main.canvas();

		// Calculate the ratios
		rect = canvas.getBoundingClientRect();
		picture.rect = rect;
		picture.ratioToScreenX = rect.width / picture.width;
		picture.ratioToScreenY = rect.height / picture.height;
		picture.ratioToPixelX = picture.width / rect.width;
		picture.ratioToPixelY = picture.height / rect.height;

		calcZoom( picture );
	}

	function calcZoom( picture ) {
		var zoomData, rect, canvas;

		canvas = picture.$main.canvas();
		rect = picture.rect;

		// Create the zoom data
		zoomData = {
			"rect": {
				"x": rect.x,
				"left": rect.left,
				"top": rect.top,
				"y": rect.y,
				"width": rect.width * picture.zoom,
				"height": rect.height * picture.zoom,
				"right": rect.left + ( rect.width * picture.zoom ),
				"bottom": rect.top + ( rect.height * picture.zoom )
			},
			"ratioToScreenX": ( rect.width * picture.zoom ) / picture.width,
			"ratioToScreenY": ( rect.height * picture.zoom ) / picture.height,
			"ratioToPixelX": ( picture.width / picture.zoom ) / rect.width,
			"ratioToPixelY": ( picture.height / picture.zoom ) / rect.height
		};

		// Attach to picture
		picture.zoomData = zoomData;

		// Set the canvas size
		canvas.style.width = zoomData.rect.width + "px";
		canvas.style.height = zoomData.rect.height + "px";
	}

	function setZoom( picture, zoom ) {
		picture.lastZoom = picture.zoom;
		picture.zoom = zoom;
		if( zoom > 1 ) {
			document.getElementById( "screen" ).style.overflow = "auto";
		} else {
			document.getElementById( "screen" ).style.overflow = "hidden";
		}
		calcZoom( picture );
	}

	// Create main screen
	function createNewScreen( sdim, isOffscreen ) {
		var $screen;

		if( isOffscreen ) {
			$screen = $.screen( {
				"aspect": sdim,
				"isOffscreen": true
			} );
		} else {
			$screen = $.screen( {
				"aspect": sdim,
				"container": "screen",
				"isOffscreen": false
			} );
			$screen.canvas().className = optionsTool.getBackground();
			$screen.setEnableContextMenu( false );
		}

		return $screen;
	}

	// Create the preview screen
	function createPreviewScreen( sdim, pictureIndex ) {
		var previewDiv, $screen;

		previewDiv = document.createElement( "div" );
		previewDiv.className = "previewItem";
		previewDiv.dataset.pictureIndex = pictureIndex;
		previewDiv.addEventListener( "click", previewScreenClick );
		document.getElementById( "preview" ).appendChild( previewDiv );
		$screen = $.screen( sdim, previewDiv );
		$screen.canvas().className = optionsTool.getBackground();
		pixel.selectItem(
			previewDiv, "selected-tool", "#preview .selected-tool"
		);

		return $screen;
	}

	// Preview screen click
	function previewScreenClick() {
		// If control key is held down then select foreground overlay
		if( $.inkey( "Control" ) ) {
			if( document.querySelector( ".foreground-overlay" ) === this ) {
				pixel.foregroundOverlay = null;
				this.className = this.className
					.replace( "foreground-overlay", "" ).replace( /\s+/, " " );
			} else {
				pixel.selectItem( this, "foreground-overlay" );
				pixel.foregroundOverlay = this.querySelector( "canvas" );
			}
			layerScript.drawLayers();
		} else {
			selectPicture( this );
		}
	}

	// Picture Selected
	function selectPicture( previewItemDiv ) {
		var picture;

		// Make sure that it isn't already selected
		if( previewItemDiv.className.indexOf( "selected-tool" ) === -1 ) {

			// Get reference to the picture
			picture = pixel.pictures[ previewItemDiv.dataset.pictureIndex ];

			// Hide the current active picture
			pixel.activePicture.$main.canvas().style.display = "none";

			// Hide the active layers
			layerScript.hideLayers();

			// Select the current preview item
			pixel.selectItem(
				previewItemDiv, "selected-tool", "#preview .selected-tool"
			);

			// Set the active picture
			pixel.activePicture = picture;

			// Set the active layer
			//pixel.activeLayer = picture.layers[ picture.activeLayerId ];

			// Show the active picture
			pixel.activePicture.$main.canvas().style.display = "inline-block";

			// Unhide the layers
			layerScript.unhideLayers();

			// Select the active layer
			layerScript.selectLayer(
				picture.layers[ picture.activeLayerId ].div
			);

			// Update the layer image
			layerScript.drawLayers();

			// Draw the grid
			pixel.resizeGrid();
		}
	}

	function deletePictureCommand( pictureId ) {
		var i, id;

		if( pictureId === "all" ) {
			for( i = 0; i < pixel.pictures.length; i++ ) {
				deletePicture( pixel.pictures[ i ].id, true );
			}
			pixel.pictures = [];
			pixel.activePicture = null;
		} else {
			id = deletePicture( pictureId );

			// Set the next active picture
			if( pixel.pictures.length > 0 ) {
				pixel.activePicture = pixel.pictures[ id ];
				selectPicture(
					pixel.activePicture.$preview.canvas().parentElement
				);
			} else {
				pixel.activePicture = null;
				createNewPicture( pixel.defaultWidth, pixel.defaultHeight );
			}
		}
	}

	function deletePicture( id, skipReorder ) {
		var picture, previewItem, i, layerItem;

		picture = pixel.pictures[ id ];

		// Remove the refrence to the foregroundoverlay
		if( picture.$preview.canvas() === pixel.foregroundOverlay ) {
			pixel.foregroundOverlay = null;
		}

		// Delete the layers
		layerScript.deleteLayers( picture );

		// Remove the main picture canvas
		picture.$main.removeScreen();
		picture.$effects.removeScreen();
		picture.$temp.removeScreen();
		picture.$temp2.removeScreen();

		// Remove the preview item
		previewItem = picture.$preview.canvas().parentElement;
		picture.$preview.removeScreen();
		previewItem.parentElement.removeChild( previewItem );

		// Re-ID the picture id's that come after
		if( ! skipReorder ) {

			// Remove references to the picture object
			pixel.pictures.splice( id, 1 );

			for( i = id; i < pixel.pictures.length; i++ ) {

				// Get the layer Item from the DOM
				layerItem = document.getElementById(
					layerScript.getPictureLayerId( pixel.pictures[ i ] )
				);

				// Update the id in the pictures array
				pixel.pictures[ i ].id = i;

				// Update the id in the layer item DOM
				layerItem.id = layerScript.getPictureLayerId( pixel.pictures[ i ] );

				// Update the id in the preview items dom
				previewItem = pixel.pictures[ i ].$preview.canvas().parentElement;
				previewItem.dataset.pictureIndex = i;
			}

			// If the next id doesn't exist
			if( id >= pixel.pictures.length ) {
				id = pixel.pictures.length - 1;
			}
		}

		return id;

	}

	// Picture Script return API
	return {
		"initialize": initialize,
		"createNewPicture": createNewPicture,
		"setZoom": setZoom,
		"calcRect": calcRect,
		"deletePicture": deletePictureCommand
	};

// End of file encapsulation
} )();
