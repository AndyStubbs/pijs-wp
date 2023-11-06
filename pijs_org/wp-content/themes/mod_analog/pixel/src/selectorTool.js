/*
selectorTool.js
*/

"use strict";

// Select Tool
var selectorTool = ( function () {
	var m_options, m_settings, m_isDrawing, m_isMoved, m_rect, m_pivot,
		m_moveSize, m_move, m_moveHidden, m_resizeTools, m_rotateTool,
		m_resizeDotSize, m_isResizing, m_copyCanvas, m_selectionCanvas,
		m_isActive, m_isMovingPixels, m_finalAction, m_defaultRadius,
		m_rotateIconBuffer, m_clipboardWriteStatus, m_clipboardReadStatus;

	m_options = [
		"selectorAction", "selectorFinalize", "drawOption",
		"snapToAngleOption", "effectsOption"
	];
	m_settings = {
		"selectorAction": "actionSelect",
		"drawOption": "drawPixel",
		"snapToAngle": 1
	};
	m_isDrawing = false;
	m_isMoved = false;
	m_moveSize = 15;
	m_moveHidden = true;
	m_resizeDotSize = 11;
	m_isResizing = false;
	m_selectionCanvas = null;
	m_isActive = false;
	m_isMovingPixels = false;
	m_finalAction = null;
	m_rect = emptyRect();
	m_resizeTools = [ {
			"id": "selectorNW",
			"pos": [ 0, 0 ],
			"offX": m_resizeDotSize * 2,
			"offY": m_resizeDotSize * 2
		}, {
			"id": "selectorN",
			"pos": [ 0.5, 0 ],
			"offX": m_resizeDotSize,
			"offY": m_resizeDotSize * 2
		}, {
			"id": "selectorNE",
			"pos": [ 1, 0 ],
			"offX": 0,
			"offY": m_resizeDotSize * 2
		}, {
			"id": "selectorE",
			"pos": [ 1, 0.5 ],
			"offX": 0,
			"offY": m_resizeDotSize
		}, {
			"id": "selectorSE",
			"pos": [ 1, 1 ],
			"offX": 0,
			"offY": 0
		}, {
			"id": "selectorS",
			"pos": [ 0.5, 1 ],
			"offX": m_resizeDotSize,
			"offY": 0
		}, {
			"id": "selectorSW",
			"pos": [ 0, 1 ],
			"offX": m_resizeDotSize * 2,
			"offY": 0
		}, {
			"id": "selectorW",
			"pos": [ 0, 0.5 ],
			"offX": m_resizeDotSize * 2,
			"offY": m_resizeDotSize
		},
	];
	m_defaultRadius = 75;
	m_rotateIconBuffer = 40;

	// Create Tool
	function createTool( button ) {
		var i;

		button.addEventListener( "click", selectTool );
		button.innerHTML = "<div style='background-image:url(" + g_themeUrl + "/pixel/select.png);'>" +
			"</div>";

		// Create the move image tool icon
		pixel.initElementDragging(
			"#selectorMove", selectorMoveStarted, selectorMoved,
			selectorMoveStop, selectorGetLimits
		);
		m_move = document.querySelector( "#selectorMove" );

		// Create resize dot's tool icon
		for( i = 0; i < m_resizeTools.length; i++ ) {
			m_resizeTools[ i ].element = document.getElementById(
				m_resizeTools[ i ].id
			);
			m_resizeTools[ i ].element.dataset.index = i;

			pixel.initElementDragging(
				"#" + m_resizeTools[ i ].id, selectorMoveStarted,
				resizeToolMoved, selectorMoveStop, resizeGetLimits
			);
		}

		// Create the angle tool icon
		pixel.initElementDragging(
			"#selectorAngle", selectorMoveStarted, angleMoved,
			angleMoveStop, selectorGetLimits
		);
		m_rotateTool = document.getElementById( "selectorAngle" );

		// Add Select all keys
		$.onkey( [ "Control", "a" ], "down", selectAll );

		// Add copy keys
		$.onkey( [ "Control", "c" ], "down", copy );
		$.onkey( [ "Control", "l" ], "down", copyLayers );

		// Add cut keys
		$.onkey( [ "Control", "x" ], "down", cut );
		$.onkey( [ "Control", "k" ], "down", cutLayers );

		// Add paste keys
		//$.onkey( [ "Control", "v" ], "down", paste );
		window.addEventListener( "paste", pasteEvent);

		// Delete keys
		$.onkey( [ "Control", "Delete" ], "down", deletePixelsLayers );
		$.onkey( "Delete", "down", deletePixels );

		// Set the action keys
		pixel.actionKeys.push( "Control" );
		pixel.actionKeys.push( "a" );
		pixel.actionKeys.push( "c" );
		pixel.actionKeys.push( "l" );
		//pixel.actionKeys.push( "v" );
		pixel.actionKeys.push( "x" );
		pixel.actionKeys.push( "k" );
		pixel.actionKeys.push( "Delete" );

		// Get permission to read from the clipboard
		navigator.permissions.query( { "name": "clipboard-read" } )
			.then( function ( status ) {
				var promptStatus;

				m_clipboardReadStatus = status.state;
				if( m_clipboardReadStatus === "prompt" ) {
					promptStatus = window.confirm(
						"Do you wish to enable clipboard-read?"
					);
					if( promptStatus ) {
						m_clipboardReadStatus = "granted";
					}
				}
			} )
			.catch( function ( ex ) {
				// Default to granted status
				m_clipboardReadStatus = "granted";
				pasteEvent( e );
			} );

		// Get permission to write to the clipboard
		navigator.permissions.query( { "name": "clipboard-write" } )
			.then( function ( status ) {
				var promptStatus;

				m_clipboardWriteStatus = status.state;
				if( m_clipboardWriteStatus === "prompt" ) {
					promptStatus = window.confirm(
						"Do you wish to enable clipboard-write?"
					);
					if( promptStatus ) {
						m_clipboardWriteStatus = "granted";
					}
				}
			} )
			.catch( function ( ex ) {
				// Default to granted status
				m_clipboardWriteStatus = "granted";
			} );
	}

	function resetRotation( picture ) {
		var width;

		if( picture == null ) {
			picture = pixel.activePicture;
		}

		picture.angle = 0;
		m_rotateTool.innerHTML = "0&deg;";

		// Make sure not hovering over resize icon
		width = pixel.screenX2( m_rect.width * 0.5, picture );
		if( pixel.screenX2( m_rect.width * 0.5, picture ) < m_defaultRadius ) {
			picture.radius = width + m_rotateIconBuffer;
		} else {
			picture.radius = width - m_rotateIconBuffer;
		}

	}

	function copy() {
		copyData( pixel.activeLayer.$screen.canvas() );
	}

	function copyLayers() {
		copyData( pixel.activePicture.$preview.canvas() );
	}

	function cut() {
		copyData( pixel.activeLayer.$screen.canvas() );
		deletePixels();
	}

	function cutLayers() {
		copyData( pixel.activePicture.$preview.canvas() );
		deletePixelsLayers()
	}

	function deletePixels() {
		var action;

		if( ! pixel.activePicture.hasRect ) {
			return;
		}

		action = undoScript.startDrawAction( "delete pixels" );
		action.undoDraw = true;
		action.redoDraw = true;

		// Clear the pixels of the selection area from the canvas
		pixel.activeLayer.$screen.canvas().getContext( "2d" ).clearRect(
			m_rect.x, m_rect.y, m_rect.width, m_rect.height
		);

		// Update the layers
		layerScript.refreshTemp();
		layerScript.drawLayers();

		// Cancel selection
		cancelSelection();

		// Add selection change to the undo stack
		undoScript.addAction( action );
	}

	function deletePixelsLayers() {
		var data, i, canvas, layer;

		if( ! pixel.activePicture.hasRect ) {
			return;
		}

		data = {
			"layers": [],
			"rect": copyRect( m_rect )
		};

		// Loop through all the layers
		for( i = 0; i < pixel.activePicture.orderedLayers.length; i++ ) {

			// Get the canvas from the layer
			layer = pixel.activePicture.orderedLayers[ i ];
			canvas = layer.$screen.canvas();
			data.layers.push( {
				"canvas": pixel.copyCanvas( canvas )
			} );

			// Delete the area from the canvas
			canvas.getContext( "2d" ).clearRect(
				m_rect.x, m_rect.y, m_rect.width, m_rect.height
			);
		}

		// Update the layers
		layerScript.refreshTemp();
		layerScript.drawLayers();

		// Cancel selection
		cancelSelection();

		undoScript.addAction( {
			"action": "Delete Pixels Layers",
			"undoCanvas": null,
			"layerId": pixel.activePicture.layerId,
			"data": data,
			"undoCallback": undoDeletePixelsLayers,
			"redoCallback": redoDeletePixelsLayers,
			"undoRedraw": false,
			"redoRedraw": false
		} );
	}

	function undoDeletePixelsLayers( data ) {
		var i, layer, layerData;

		// Loop through all the layers
		for( i = 0; i < pixel.activePicture.orderedLayers.length; i++ ) {

			// Get the canvas from the layer
			layer = pixel.activePicture.orderedLayers[ i ];
			layerData = data.layers[ i ];
			layer.$screen.drawImage( layerData.canvas, 0, 0 );

		}

		// Update the layers
		layerScript.refreshTemp();
		layerScript.drawLayers();

		// Cancel selection
		cancelSelection();

	}

	function redoDeletePixelsLayers( data ) {
		var i, layer;

		// Delete the screen data
		for( i = 0; i < pixel.activePicture.orderedLayers.length; i++ ) {

			layer = pixel.activePicture.orderedLayers[ i ];
			layer.$screen.canvas().getContext( "2d" ).clearRect(
				data.rect.x, data.rect.y, data.rect.width, data.rect.height
			);

		}

		// Update the layers
		layerScript.refreshTemp();
		layerScript.drawLayers();

		// Cancel selection
		cancelSelection();

	}

	function copyData( canvas ) {
		var context;

		finalizeSelection();

		// Create a new canvas
		m_copyCanvas = document.createElement( "canvas" );

		// If nothing selected then select all
		if( m_rect.width < 1 || m_rect.height < 1 ) {
			selectAll();
		}

		m_copyCanvas.width = m_rect.width;
		m_copyCanvas.height = m_rect.height;

		context = m_copyCanvas.getContext( "2d" );
		
		context.drawImage(
			canvas,
			m_rect.x, m_rect.y, m_rect.width, m_rect.height,
			0, 0, m_rect.width, m_rect.height
		);

		// Temporary
		if( pixel.addTempImages ) {
			document.getElementById( "preview" ).appendChild( m_copyCanvas );
		}

		// If permissions not granted the return
		if( m_clipboardWriteStatus !== "granted" ) {
			return;
		}

		// Copy image to clipboard
		m_copyCanvas.toBlob( function ( blob ) {
			try {
				navigator.clipboard.write(
					[ new ClipboardItem( { "image/png": blob } ) ]
				);
			} catch( ex ) {
				m_clipboardWriteStatus = "failed";
			}
		}, "image/png", 1.0 );

	}

	function getSelectionPixels() {
		var tempCanvas, tempContext, screenCanvas, selContext;

		if( m_isMovingPixels ) {
			return;
		}

		// Undo selection
		pixel.undoAction = cancelSelection;

		// Create finalize selection action
		m_finalAction = undoScript.startDrawAction( "finalize selection move" );
		m_finalAction.redoDraw = true;
		m_finalAction.undoDraw = true;

		// Mark picute as moving
		m_isMovingPixels = true;
		document.getElementById( "actionFinalize" ).disabled = false;

		// Create a new canvas to hold the selection pixels
		m_selectionCanvas = document.createElement( "canvas" );
		m_selectionCanvas.width = m_rect.width;
		m_selectionCanvas.height = m_rect.height;
		selContext = m_selectionCanvas.getContext( "2d" );

		// Get the screen canvas
		screenCanvas = pixel.activeLayer.$screen.canvas();

		// Clear the temp canvas
		tempCanvas = pixel.activePicture.$temp.canvas();
		pixel.activePicture.$temp.cls();

		// Draw the screen onto the temp canvas
		tempContext = tempCanvas.getContext( "2d" );
		tempContext.drawImage( screenCanvas, 0, 0 );

		// Copy the selection area into the selection canvas
		selContext.drawImage(
			tempCanvas,
			m_rect.x, m_rect.y, m_rect.width, m_rect.height,
			0, 0, m_rect.width, m_rect.height,
		);

		// Clear the pixels of the selection area from the selection canvas
		tempContext.clearRect(
			m_rect.x, m_rect.y, m_rect.width, m_rect.height
		);

		drawRect();

		// Temporary
		if( pixel.addTempImages ) {
			m_selectionCanvas.style.border = "1px solid red";
			document.getElementById( "preview" ).appendChild( m_selectionCanvas );
		}
	}

	function pasteEvent( e ) {
		var item, blob, img;

		// If permission to read clipboard is not granted then use local copy
		if( m_clipboardReadStatus !== "granted" ) {
			paste();
			return;
		}

		// If no write status and we have a local copy then use local copy
		if( m_clipboardWriteStatus !== "granted" && m_copyCanvas ) {
			paste();
			return;
		}

		// If there is no clipboard item use local copy
		if(
			! e.clipboardData ||
			! e.clipboardData.items ||
			e.clipboardData.items.length < 1
		) {
			paste();
			return;
		}

		// Get the clipboard item
		item = e.clipboardData.items[ 0 ];

		// If it is not an image then use local copy
		if( item.type.indexOf( "image" ) === -1 ) {
			paste();
			return;
		}

		// Copy item to copy canvas
		blob = item.getAsFile();
		img = new Image();
		img.src = URL.createObjectURL( blob );
		img.onload = function () {
			m_copyCanvas = document.createElement( "canvas" );
			m_copyCanvas.width = img.width;
			m_copyCanvas.height = img.height;
			m_copyCanvas.getContext( "2d" ).drawImage( img, 0, 0 );
			paste();
		}

	}

	function paste() {
		var x, y, screen, pctX, pctY;

		if( ! m_copyCanvas ) {
			return;
		}
		if( ! m_isActive ) {
			selectTool();
		}

		finalizeSelection();

		screen = document.getElementById( "screen" );

		// Undo selection
		pixel.undoAction = cancelSelection;

		// Create finalize selection action
		m_finalAction = undoScript.startDrawAction( "finalize paste" );
		m_finalAction.redoDraw = true;
		m_finalAction.undoDraw = true;

		// Set the selector option to move
		updateOption( "selectorAction", "actionMove", true );
		toolScript.updateOption( "actionMove" );

		// Calculate the position to paste the image
		x = Math.floor( pixel.pixelX2( screen.scrollLeft ) );
		y = Math.floor( pixel.pixelY2( screen.scrollTop ) );

		// Create a new canvas to hold the selection pixels
		m_selectionCanvas = pixel.copyCanvas( m_copyCanvas );

		// Temporary
		if( pixel.addTempImages ) {
			m_selectionCanvas.style.border = "1px solid red";
			document.getElementById( "preview" )
				.appendChild( m_selectionCanvas );
		}

		// Update the rect
		m_rect.x = x;
		m_rect.y = y;
		m_rect.tx = x;
		m_rect.ty = y;
		m_rect.width = m_copyCanvas.width;
		m_rect.height = m_copyCanvas.height;
		m_rect.twidth = m_copyCanvas.width;
		m_rect.theight = m_copyCanvas.height;

		// Redraw the rect
		m_isMovingPixels = true;
		document.getElementById( "actionFinalize" ).disabled = false;
		document.getElementById( "actionClearSelect" ).disabled = false;
		effectsScript.enableEffects( false );

		pixel.activePicture.hasRect = true;
		m_isDrawing = true;
		m_isMoved = true;
		stopDrawing();

		// Draw the layers
		layerScript.drawLayers();
	}

	function selectAll() {

		startDrawing();

		m_rect = {
			"x": 0,
			"y": 0,
			"tx": 0,
			"ty": 0,
			"width": pixel.activePicture.width,
			"height": pixel.activePicture.height,
			"twidth": pixel.activePicture.width,
			"theight": pixel.activePicture.height
		};

		document.getElementById( "actionClearSelect" ).disabled = false;
		if( m_isActive ) {
			effectsScript.enableEffects( false );
		}

		pixel.activePicture.hasRect = true;
		m_isDrawing = true;
		m_isMoved = true;
		stopDrawing();
		if( ! m_isActive ) {
			hideSelector();
		}
	}

	// Select Tool
	function selectTool() {
		toolScript.setActiveTool( selectorTool, m_options, m_settings );
		m_isActive = true;
		refreshSelection();
	}

	function refreshSelection( skipTemp ) {
		if( pixel.activePicture.hasRect ) {
			showSelector();
			updateFilter();
			if( m_isActive ){
				effectsScript.enableEffects( false );
			}
		} else {
			pixel.activePicture.$effects.cls();
			updateFilter();
			layerScript.drawLayers();
			hideSelector();
			if( m_isActive ) {
				effectsScript.enableEffects( true );
			}
		}
		if( ! skipTemp ) {
			layerScript.refreshTemp();
		}
	}

	function deselectTool() {
		finalizeSelection();
		hideSelector();
		m_isActive = false;
		updateFilter();
		drawRect();
	}

	function showSelector() {
		var i;

		m_move.style.display = "block";
		for( i = 0; i < m_resizeTools.length; i++ ) {
			m_resizeTools[ i ].element.style.display = "block";
		}
		m_rotateTool.style.display = "block";

		m_moveHidden = false;
		drawSelector();
	}

	function hideSelector() {
		var i;

		m_move.style.display = "none";
		m_moveHidden = true;
		for( i = 0; i < m_resizeTools.length; i++ ) {
			m_resizeTools[ i ].element.style.display = "none";
		}
		m_rotateTool.style.display = "none";

	}

	function copyRect( rect ) {
		var copy;

		copy = {
			"x": rect.x,
			"y": rect.y,
			"tx": rect.x,
			"ty": rect.y,
			"width": rect.width,
			"height": rect.height,
			"twidth": rect.twidth,
			"theight": rect.theight,
			"showRect": rect.showRect
		};

		return copy;
	}

	function emptyRect() {
		return {
			"x": -1,
			"y": -1,
			"tx": -1,
			"ty": -1,
			"width": 0,
			"height": 0,
			"twidth": 0,
			"theight": 0,
			"showRect": false
		};
	}

	function startDrawing() {
		finalizeSelection();
		layerScript.refreshTemp();
	}

	// Pen Down
	function penDown( $screen, pen, $effects ) {

		startDrawing();

		m_pivot = {
			"x": pen.x,
			"y": pen.y
		};

		m_rect = {
			"x": pen.x,
			"y": pen.y,
			"tx": pen.x,
			"ty": pen.y,
			"width": 1,
			"height": 1,
			"twidth": 1,
			"theight": 1,
			"showRect": true
		};

		m_isDrawing = true;
		m_isMoved = false;
		drawRect();
		hideSelector();
	}

	// Pen Move
	function penMove( $screen, pen, $effects ) {
		if( m_isDrawing ) {
			m_isMoved = true;
			m_rect.width = Math.abs( pen.x - m_pivot.x ) + 1;
			m_rect.height = Math.abs( pen.y - m_pivot.y ) + 1;
			m_rect.x = Math.min( pen.x, m_pivot.x );
			m_rect.y = Math.min( pen.y, m_pivot.y );
			m_rect.tx = m_rect.x;
			m_rect.ty = m_rect.y;
			m_rect.twidth = m_rect.width;
			m_rect.theight = m_rect.height;
			drawRect();
		}
	}

	// Pen Up
	function penUp( $screen, pen, $effects ) {
		if( m_isDrawing ) {
			resetRotation();
		}
		stopDrawing();
	}

	// Stop Drawing
	function stopDrawing() {

		// If not currently drawing then just return
		if( ! m_isDrawing ) {
			return false;
		}

		m_isDrawing = false;
		m_isResizing = false;
	
		// Selector tool has to have been moved otherwize cancel selection
		if( ! m_isMoved || m_rect.width < 1 || m_rect.height < 1 ) {
			pixel.activePicture.$effects.cls();
			layerScript.drawLayers();
			pixel.activePicture.hasRect = false;
			document.getElementById( "actionClearSelect" ).disabled = true;
			effectsScript.enableEffects( true );

			m_rect.showRect = false;
			pixel.drawGrid( m_rect );
			m_rect = emptyRect();
			pixel.updateStatusBar();
			return false;
		}

		m_rect.showRect = true;
		m_isMoved = false;
		pixel.activePicture.hasRect = true;
		document.getElementById( "actionClearSelect" ).disabled = false;
		effectsScript.enableEffects( false );

		// Show the selector
		showSelector();

		pixel.updateStatusBar();
		return true;
	}

	// Draw Rect
	function drawRect() {
		var $effects, color;

		$effects = pixel.activePicture.$effects;

		// Clear the screen and set color
		$effects.cls();

		if( m_isActive ) {

			// Set the color
			if( m_isMovingPixels ) {
				color = pixel.selectorMoveColor;
			} else {
				color = pixel.selectorColor;
			}
			$effects.setColor( color );

			// Draw the rectangle
			$effects.rect(
				m_rect.tx, m_rect.ty, m_rect.twidth, m_rect.theight, color
			);
			$effects.render();
		}

		// Draw the selection pixels onto the effects canvas
		if( m_selectionCanvas && ! pixel.activeLayer.hidden ) {
		//if( m_selectionCanvas ) {
			drawRotatedImage( $effects );
		}

		layerScript.drawLayers();

		pixel.drawGrid( {
			"x": m_rect.tx,
			"y": m_rect.ty,
			"width": m_rect.twidth,
			"height": m_rect.theight,
			"showRect": m_rect.showRect
		} );

	}

	function updateFilter( picture, isForced ) {
		if( picture == null ) {
			picture = pixel.activePicture;
		}

		if( picture.hasRect && ( ! m_isActive || isForced ) ) {
			picture.filterRect = copyRect( m_rect );
			if(
				picture.filterRect.width === picture.width &&
				picture.filterRect.height === picture.height
			) {
				picture.filterRect.isFullScreen = true;
			} else {
				picture.filterRect.isFullScreen = false;
			}
		} else {
			picture.filterRect.x = 0;
			picture.filterRect.y = 0;
			picture.filterRect.width = picture.width;
			picture.filterRect.height = picture.height;
			picture.filterRect.tx = 0;
			picture.filterRect.ty = 0;
			picture.filterRect.twidth = picture.width;
			picture.filterRect.theight = picture.height;
			picture.filterRect.isFullScreen = true;
		}
	}

	function cancelSelection() {

		// Temporary
		if( pixel.addTempImages && m_selectionCanvas ) {
			m_selectionCanvas.parentElement.removeChild( m_selectionCanvas );
		}

		// Remove references
		m_selectionCanvas = null;
		pixel.undoAction = null;

		// Clear flags
		m_isMovingPixels = false;
		pixel.activePicture.hasRect = false;
		document.getElementById( "actionFinalize" ).disabled = true;
		document.getElementById( "actionClearSelect" ).disabled = true;
		if( m_isActive ) {
			effectsScript.enableEffects( true );
		}

		// Clear the effects
		pixel.activePicture.$effects.cls();

		// Clear the rect
		m_rect = emptyRect();

		pixel.drawGrid( m_rect );

		// update screen data
		layerScript.refreshTemp();
		layerScript.drawLayers();

		// Remove selection bar
		refreshSelection();
	}

	function finalizeSelection( picture, layerId ) {
		var $temp, layer;

		if( ! m_isMovingPixels ) {
			return;
		}

		pixel.undoAction = null;
		m_isMovingPixels = false;
		document.getElementById( "actionFinalize" ).disabled = true;

		if( picture == null ) {
			picture = pixel.activePicture;
		}

		if( layerId == null ) {
			layerId = picture.activeLayerId;
		}

		// Draw the selection canvas onto the temp canvas
		if( m_selectionCanvas ) {

			// Get the temp canvas
			$temp = picture.$temp;

			// Get the layer
			layer = picture.layers[ layerId ];

			// Draw the temp layer
			$temp = picture.$temp;

			drawRotatedImage( $temp, picture );

			// Reset picture data
			resetRotation( picture );

			// Remove reference to the selction canvas
			m_selectionCanvas = null;

			// Draw on the layer screen
			layer.$screen.cls();
			layer.$screen.drawImage( $temp, 0, 0, 0, 0, 0, layer.alpha );
			layerScript.drawLayers( picture );
			layerScript.refreshTemp( layer );

			// Add selection change to the undo stack
			undoScript.addAction( m_finalAction, picture );

		}

	}

	function drawRotatedImage( $temp, picture ) {
		var context, x, y, anchorX, anchorY;

		if( picture == null ) {
			picture = pixel.activePicture;
		}
		if( m_settings[ "drawOption" ] === "drawAliased" ) {
			$temp.setPixelMode( false );
		}
		context = $temp.canvas().getContext( "2d" );
		x = Math.floor( m_rect.tx + m_rect.twidth / 2 );
		y = Math.floor( m_rect.ty + m_rect.theight / 2 );
		anchorX = Math.floor( m_rect.twidth * 0.5 );
		anchorY = Math.floor( m_rect.theight * 0.5 );
		context.translate( x, y );
		context.rotate( picture.angle );
		context.drawImage(
			m_selectionCanvas,
			0, 0, m_selectionCanvas.width, m_selectionCanvas.height,
			-anchorX, -anchorY, m_rect.twidth, m_rect.theight
		);
		context.rotate( -picture.angle );
		context.translate( -x, -y );
		if( m_settings[ "drawOption" ] === "drawAliased" ) {
			$temp.setPixelMode( true );
		}
	}

	function onScrollEvent() {
		if( m_isActive ) {
			drawSelector();
		}
	}

	function onResize() {
		refreshSelection();
		if( ! m_isActive ) {
			hideSelector();
		}
	}

	function drawSelector() {

		if( pixel.activePicture.hasRect ) {
			drawRect();
		} else {
			pixel.activePicture.$effects.cls();
			layerScript.drawLayers();
		}

		updateCursorPosition(
			m_move, 0.5, 0.5, m_moveSize, m_moveSize, m_moveSize, false
		);
		drawResizeTools( false );
		updateRotateToolPosition( false );
	}

	function drawResizeTools( isMoving, index ) {
		var i;

		if( ! pixel.activePicture.hasRect ) {
			return;
		}

		// Create resize dot's
		for( i = 0; i < m_resizeTools.length; i++ ) {
			if( ! isMoving && index !== i ) {
				updateCursorPosition(
					m_resizeTools[ i ].element,
					m_resizeTools[ i ].pos[ 0 ],
					m_resizeTools[ i ].pos[ 1 ],
					m_resizeTools[ i ].offX,
					m_resizeTools[ i ].offY,
					m_resizeDotSize, true
				);
			} else {
				updateCursorPosition(
					m_resizeTools[ i ].element,
					m_resizeTools[ i ].pos[ 0 ],
					m_resizeTools[ i ].pos[ 1 ],
					m_resizeTools[ i ].offX,
					m_resizeTools[ i ].offY,
					m_resizeDotSize, isMoving
				);
			}
		}
	}

	function updateRotateToolPosition( useTempPosition ) {
		var x, y, width, height, moveRect;

		if( m_settings[ "selectorAction" ] !== "actionMove" ) {
			m_rotateTool.style.display = "none";
			return;
		} else {
			m_rotateTool.style.display = "block";
		}
		if( useTempPosition ) {
			width = pixel.screenX2( m_rect.twidth );
			height = pixel.screenX2( m_rect.theight );
		} else {
			width = pixel.screenX2( m_rect.width );
			height = pixel.screenX2( m_rect.height );
		}

		// // Make sure there is enough room for the icon if not move it away
		// if( width < m_defaultRadius && m_rotationRadius < width ) {
		// 	m_rotationRadius = width + m_defaultRadius;
		// }

		// Calculate the position of the rotation tool icon
		moveRect = m_move.getBoundingClientRect();
		x = moveRect.left +
			Math.cos( pixel.activePicture.angle ) * pixel.activePicture.radius;
		y = moveRect.top +
			Math.sin( pixel.activePicture.angle ) * pixel.activePicture.radius;

		// TODO - Make sure rotation icon is not hovering over resize icon

		m_rotateTool.style.left = x + "px";
		m_rotateTool.style.top = y + "px";

		// updateCursorPosition(
		// 	m_rotateTool, x, y, m_moveSize, m_moveSize, m_moveSize,
		// 	useTempPosition
		// );
	}

	function updateCursorPosition(
		cursor, factorX, factorY, offsetX, offsetY, size, useTempPosition
	) {
		var rect, x, y, scrollBarWidth, scrollBarHeight;

		if( m_moveHidden ) {
			return;
		}

		// Calculate the scroll bar width
		scrollBarWidth = pixel.screen.offsetWidth - pixel.screen.clientWidth;

		// Calculate the scroll bar height
		scrollBarHeight = pixel.screen.offsetHeight - pixel.screen.clientHeight;

		// Get the size of the container
		rect = pixel.getScreenLimits( size );

		// Calculate the position of the cursor
		if( useTempPosition ) {
			x = pixel.screenX( m_rect.tx + m_rect.twidth * factorX ) - offsetX;
			y = pixel.screenY( m_rect.ty + m_rect.theight * factorY ) - offsetY;
		} else {
			x = pixel.screenX( m_rect.x + m_rect.width * factorX ) - offsetX;
			y = pixel.screenY( m_rect.y + m_rect.height * factorY ) - offsetY;
		}

		// Make sure cursor is over the screen container
		if(
			x >= rect.x1 &&
			x <= rect.x2 &&
			y >= rect.y1 &&
			y <= rect.y2
		) {
			cursor.style.left = x + "px";
			cursor.style.top = y + "px";
			cursor.style.display = "block";
		} else {
			cursor.style.display = "none";
		}
	}

	// Update Option
	function updateOption( name, value, skipSelectionPixels ) {
		var i, img;

		m_settings[ name ] = value;
		if( m_settings[ "selectorAction" ] === "actionSelect" ) {
			img = "2";
		} else {
			img = "";
		}

		if( name === "drawOption" || name === "snapToAngle" ) {
			drawRect();
			return;
		}

		if( name === "effectsOption" ) {
			runEffect( value );
			return;
		}

		if( value === "actionClearSelect" ) {
			cancelSelection();
		}

		if( m_isMovingPixels ) {
			finalizeSelection();
		}

		if( img === "" ) {
			m_move.classList.add( "selectorMove2" );
		} else {
			m_move.classList.remove( "selectorMove2" );
		}
		for( i = 0; i < m_resizeTools.length; i++ ) {
			if( img === "" ) {
				m_resizeTools[ i ].element.classList.add( "selectorDot2" );
			} else {
				m_resizeTools[ i ].element.classList.remove( "selectorDot2" );
			}
		}
		if( img === "" ) {
			m_rotateTool.classList.add( "selectorAngle2" );
		} else {
			m_rotateTool.classList.remove( "selectorAngle2" );
		}
		if( ! skipSelectionPixels ) {
			refreshSelection();
		}

		pixel.updateStatusBar();
	}

	function runEffect( name ) {
		if( ! m_selectionCanvas ) {
			getSelectionPixels();
		}
		effectsScript[ name ]( m_selectionCanvas );
		updateOption( "selectorAction", "actionMove" );
		toolScript.updateOption( "actionMove" );
	}

	function selectorMoveStarted() {
		if( m_settings[ "selectorAction" ] === "actionMove" ) {
			getSelectionPixels();
		}
	}

	// Selector Moved
	function selectorMoved( dx, dy ) {
		m_rect.tx = m_rect.x + Math.round( pixel.pixelX2( dx ) );
		m_rect.ty = m_rect.y + Math.round( pixel.pixelY2( dy ) );
		m_rect.twidth = m_rect.width;
		m_rect.theight = m_rect.height;

		drawRect();
		drawResizeTools( true );
		updateRotateToolPosition( true );
		pixel.updateStatusBar();
	}

	// Selector Stopped Moving
	function selectorMoveStop( dx, dy ) {
		if( m_rect.twidth >= 1 || m_rect.theight >= 1 ) {
			m_rect.x = m_rect.tx;
			m_rect.y = m_rect.ty;
			m_rect.width = m_rect.twidth;
			m_rect.height = m_rect.theight;
			m_isDrawing = true;
			m_isMoved = true;
			stopDrawing();
		} else {
			m_rect.tx = m_rect.x;
			m_rect.ty = m_rect.y;
			m_rect.twidth = m_rect.width;
			m_rect.theight = m_rect.height;
			drawSelector();
		}
	}

	function resizeToolMoved( dx, dy, index ) {
		var resizeToolData, rectCopy;

		m_isResizing = true;
		rectCopy = copyRect( m_rect );
		resizeToolData = m_resizeTools[ index ];
		switch( resizeToolData.id ) {
			case "selectorNW":
				m_rect.tx = m_rect.x + Math.round( pixel.pixelX2( dx ) );
				m_rect.ty = m_rect.y + Math.round( pixel.pixelY2( dy ) );
				m_rect.twidth = m_rect.width +
					Math.round( pixel.pixelX2( -dx ) );
				m_rect.theight = m_rect.height +
					Math.round( pixel.pixelY2( -dy ) );
				break;
			case "selectorN":
				m_rect.ty = m_rect.y + Math.round( pixel.pixelY2( dy ) );
				m_rect.theight = m_rect.height +
					Math.round( pixel.pixelY2( -dy ) );
				break;
			case "selectorNE":
				m_rect.ty = m_rect.y + Math.round( pixel.pixelY2( dy ) );
				m_rect.twidth = m_rect.width +
					Math.round( pixel.pixelX2( dx ) );
				m_rect.theight = m_rect.height +
					Math.round( pixel.pixelY2( -dy ) );
				break;
			case "selectorE":
				m_rect.twidth = m_rect.width +
					Math.round( pixel.pixelX2( dx ) );
				break;
			case "selectorSE":
				m_rect.twidth = m_rect.width +
					Math.round( pixel.pixelX2( dx ) );
				m_rect.theight = m_rect.height +
					Math.round( pixel.pixelY2( dy ) );
				break;
			case "selectorS":
				m_rect.theight = m_rect.height +
					Math.round( pixel.pixelY2( dy ) );
				break;
			case "selectorSW":
				m_rect.tx = m_rect.x + Math.round( pixel.pixelX2( dx ) );
				m_rect.twidth = m_rect.width +
					Math.round( pixel.pixelX2( -dx ) );
				m_rect.theight = m_rect.height +
					Math.round( pixel.pixelY2( dy ) );
				break;
			case "selectorW":
				m_rect.tx = m_rect.x + Math.round( pixel.pixelX2( dx ) );
				m_rect.twidth = m_rect.width +
					Math.round( pixel.pixelX2( -dx ) );
				break;
		}

		if( m_rect.twidth < 1 || m_rect.theight < 1 ) {
			m_rect = rectCopy;
			return;
		}

		updateCursorPosition(
			m_move, 0.5, 0.5, m_moveSize, m_moveSize, m_moveSize, true
		);
		drawRect();
		drawResizeTools( false, index );
		updateRotateToolPosition( true );
		pixel.updateStatusBar();
	}

	function angleMoved( dx, dy ) {
		var angle, moveRect, angleRect, dx2, dy2, snapTo;

		// Get Rects
		moveRect = m_move.getBoundingClientRect();
		angleRect = m_rotateTool.getBoundingClientRect();

		// Calculate the distance to center
		dx2 = angleRect.left - moveRect.left;
		dy2 = angleRect.top - moveRect.top;

		// Calculate angle and radius
		angle = Math.atan2( dy2, dx2 );
		pixel.activePicture.radius = Math.sqrt( dx2 * dx2 + dy2 * dy2 );
		snapTo = m_settings[ "snapToAngle" ];
		if( $.inkey( "Control" ) ) {
			snapTo = 15;
		}
		if( snapTo > 0 ) {
			angle = Math.round(
				$.util.radiansToDegrees( angle )
			);
			angle = Math.floor( angle / snapTo ) * snapTo;
			angle = $.util.degreesToRadian( angle );
		}
		pixel.activePicture.angle = angle;

		angle = Math.round(
			$.util.radiansToDegrees( pixel.activePicture.angle )
		);
		if( angle < 0 ) {
			angle = angle + 360;
		}

		m_rotateTool.innerHTML = angle + "&deg;";

		drawRect();
		pixel.updateStatusBar();
	}

	function angleMoveStop() {
		updateRotateToolPosition( true );
	}

	function selectorGetLimits() {
		return pixel.getScreenLimits( m_moveSize );
	}

	function resizeGetLimits( index ) {
		var resizeTool, limits, x1, y1, x2, y2;

		// Get the tool data
		resizeTool = m_resizeTools[ index ];
		limits = pixel.getScreenLimits( m_resizeDotSize );

		// Left and right
		if( resizeTool.pos[ 0 ] === 0 ) {

			// Left side
			x2 = pixel.screenX( m_rect.x + m_rect.width - 1 ) -
				m_resizeDotSize * 2;
			if( x2 < limits.x2 ) {
				limits.x2 = x2;
			}

		} else if( resizeTool.pos[ 0 ] === 1 ) {

			// Right side
			x1 = pixel.screenX( m_rect.x + 1 );
			if( x1 > limits.x1 ) {
				limits.x1 = x1;
			}
		}

		// Up and down
		if( resizeTool.pos[ 1 ] === 0 ) {

			// Bottom side
			y2 = pixel.screenY( m_rect.y + m_rect.height - 1 ) -
				m_resizeDotSize * 2;
			if( y2 < limits.y2 ) {
				limits.y2 = y2;
			}

		} else if( resizeTool.pos[ 1 ] === 1 ) {

			// Top side
			y1 = pixel.screenY( m_rect.y + 1 );
			if( y1 > limits.y1 ) {
				limits.y1 = y1;
			}
		}

		return limits;
	}

	function layerChanged( oldLayer ) {

		if( oldLayer == null ) {
			layerScript.refreshTemp();
			cancelSelection();
			return;
		}

		// if moving pixels then draw the pixels onto the screen
		if( m_isMovingPixels ) {
			finalizeSelection( oldLayer.picture, oldLayer.id );
		}

		layerScript.refreshTemp();

		// If changing to a different picture
		if( pixel.activePicture !== oldLayer.picture ) {

			// Apply the filter to the old picture
			updateFilter( oldLayer.picture, true );

			// Apply the selection to the new picture if it has any
			if( pixel.activePicture.hasRect ) {
				m_rect = copyRect( pixel.activePicture.filterRect );
			} else {
				cancelSelection();
			}
		}
		refreshSelection();
	}

	function getMessage() {
		var msg, angle;

		msg = " - Select Tool";

		if( m_isDrawing ) {
			msg += " - Drawing";
		}

		if( m_isMovingPixels ) {
			msg += " - Moving Pixels";
		}

		if( m_rect.twidth > 0 && m_rect.theight > 0 ) {
			msg += " - ";
			msg += "(" + m_rect.tx + ", " + m_rect.ty + ")-(" +
				( m_rect.twidth + m_rect.tx ) + ", " +
				( m_rect.theight + m_rect.ty ) + ")";
			msg += " " + m_rect.twidth + " x " + m_rect.theight;

			if( m_settings.selectorAction === "actionMove" ) {
				angle = Math.round(
					$.util.radiansToDegrees( pixel.activePicture.angle )
				);
				if( angle < 0 ) {
					angle += 360;
				}
				msg += " - " + angle + "&deg;";
			}
		}

		return msg;
	}

	function getRect() {
		return m_rect;
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
		"onScrollEvent": onScrollEvent,
		"onResize": onResize,
		"name": "selector-tool",
		"copyRect": copyRect,
		"getRect": getRect,
		"usesColors": false,
		"getMessage": getMessage
	};

// End of file encapsulation
} )();

toolScript.addTool( selectorTool );
