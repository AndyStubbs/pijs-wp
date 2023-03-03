/*
pixel.js
*/

"use strict";

// Pixel Script
var pixel = ( function () {
	var m_data, windowSize;

	m_data = {
		"addTempImages": false,
		"debugStatusBar": false,
		"selectorColor": "#3223CA75",
		"selectorMoveColor": "#02117575",
		"color1": "#2D0059AA",
		"color2": "#8000FFAA",
		"initialize": initialize,
		"selectItem": selectItem,
		"initElementDragging": initElementDragging,
		"screenX": screenX,
		"screenY": screenY,
		"screenX2": screenX2,
		"screenY2": screenY2,
		"pixelX": pixelX,
		"pixelY": pixelY,
		"pixelX2": pixelX2,
		"pixelY2": pixelY2,
		"tools": [],
		"pictures": [],
		"activeTool": 0,
		"defaultWidth": 100,
		"defaultHeight": 100,
		"activePicture": null,
		"activeLayer": null,
		"screen": null,
		"screenRect": null,
		"mouse": {
			"pen": {
				"x": -1,
				"y": -1,
				"lastX": -1,
				"lastY": -1,
				"buttons": 0
			},
			"screen": {
				"x": -1,
				"y": -1,
				"lastX": -1,
				"lastY": -1,
				"buttons": 0
			}
		},
		"grid": null,
		"drawGrid": drawGrid,
		"resizeGrid": resizeGrid,
		"serializePicture": serializePicture,
		"copyCanvas": copyCanvas,
		"undoAction": null,
		"updateStatusBar": updateStatusBar,
		"actionKeys": [],
		"setActionKeys": setActionKeys,
		"clearActionKeys": clearActionKeys,
		"getScreenLimits": getScreenLimits,
		"minGridSize": 30,
		"showGrid": true,
		"foregroundOverlay": null,
		"overlayAlpha": 128
	};

	// Initialize the App
	function initialize() {
		var loadingDiv, resizeCallback, resizeCallback2;

		windowSize = $.util.getWindowSize();

		// Calculate screen data
		m_data.screen = document.getElementById( "screen" );
		m_data.screenRect = m_data.screen.getBoundingClientRect();

		// Mouse event handler for screen
		m_data.screen.addEventListener( "mousedown", mouseDown );
		m_data.screen.addEventListener( "mousemove", mouseMove );
		m_data.screen.addEventListener( "mouseup", mouseUp );

		m_data.screen.addEventListener( "touchstart", touchStart );
		m_data.screen.addEventListener( "touchmove", touchMove );
		m_data.screen.addEventListener( "touchend", touchEnd );

		// Get the grid
		m_data.grid = document.getElementById( "grid" );

		// Disable right click on the screen
		m_data.screen.addEventListener( "contextmenu", function ( e ) {
			e.preventDefault();
		} );

		// Add event listener for scrolling
		m_data.screen.addEventListener( "scroll", onScrollEvent );

		// Initialize Tools
		colorScript.initialize();
		toolScript.initialize();
		layerScript.initialize();
		pictureScript.initialize();
		pictureScript.createNewPicture( m_data.defaultWidth, m_data.defaultHeight );
		undoScript.initialize();
		controlsScript.initialize();
		animatorScript.initialize();
		helpScript.initialize();
		shiftScript.initialize();

		// Set the action keys
		setActionKeys();

		// Window resized event handler
		window.addEventListener( "resize", function () {
			var size;

			clearTimeout( resizeCallback );
			resizeCallback = setTimeout( function () {
				m_data.screenRect = m_data.screen.getBoundingClientRect();
				resizePictures();
				resizeGrid();
				selectorTool.onResize();
			}, 1 );

			// Skip fade if window width hasn't changed
			size = $.util.getWindowSize();
			if( size.width === windowSize.width ) {
				windowSize = size;
				return;
			}
			windowSize = size;

			// Show loading div while resizing
			document.body.appendChild( loadingDiv );
			loadingDiv.style.backgroundColor = "rgba(33, 22, 226, 255)";
			loadingDiv.style.color = "rgba(255, 255, 255, 255)";
			clearTimeout( resizeCallback2 );
			resizeCallback2 = setTimeout( function () {
				fadeOut( loadingDiv, 0, 500 );
			}, 1000 );
		} );
		resizeGrid();

		// Fade out loading screen
		loadingDiv = document.getElementById( "loadingDiv" );
		fadeOut( loadingDiv, 1000, 1000 );
	}

	function fadeOut( div, startTime, duration ) {
		setTimeout( function () {
			div.style.transitionDuration = ( duration / 1000 ) + "s";
			div.style.backgroundColor = "rgba(33, 22, 226, 0)";
			div.style.color = "rgba(255, 255, 255, 0)";
			setTimeout( function () {
				div.parentElement.removeChild( loadingDiv );
			}, duration );
		}, startTime );
	}

	function resizePictures() {
		var i, scrollLeft, scrollTop;

		scrollLeft = pixel.activePicture.scrollLeft;

		for( i = 0; i < m_data.pictures.length; i++ ) {
			pictureScript.calcRect( m_data.pictures[ i ] );
		}

		m_data.screen.scrollLeft = pixel.activePicture.scrollLeft;
		m_data.screen.scrollTop = pixel.activePicture.scrollTop;
	}

	function onScrollEvent( e ) {

		// Update picture scrolling
		pixel.activePicture.scrollLeft = m_data.screen.scrollLeft;
		pixel.activePicture.scrollTop = m_data.screen.scrollTop;

		// Trigger selector tool scroll event
		selectorTool.onScrollEvent();
		shapeTool.onScrollEvent();

		// Draw the grid
		pixel.drawGrid();

	}

	function mouseDown( e ) {
		updateMouseData( e );
		if( ! isMouseOverScrollBars() ) {
			toolScript.penDown();
		}
	}

	function mouseMove( e ) {
		updateMouseData( e );
		if( ! isMouseOverScrollBars() ) {
			toolScript.penMove();
		}
	}

	function mouseUp( e ) {
		updateMouseData( e );
		if( ! isMouseOverScrollBars() ) {
			toolScript.penUp();
		}
	}

	function touchStart( e ) {
		var touchObject = e.changedTouches[ 0 ];
		touchObject.buttons = 1;
		mouseDown( touchObject );
		e.preventDefault();
	}

	function touchMove( e ) {
		var touchObject = e.changedTouches[ 0 ];
		touchObject.buttons = 1;
		mouseMove( touchObject );
		e.preventDefault();
	}

	function touchEnd( e ) {
		var touchObject = e.changedTouches[ 0 ];
		touchObject.buttons = 1;
		mouseUp( touchObject );
		e.preventDefault();
	}

	function isMouseOverScrollBars() {
		var scrollBarWidth, scrollBarHeight;

		// Calculate the scroll bar width
		scrollBarWidth = m_data.screen.offsetWidth -
			m_data.screen.clientWidth;

		// Calculate the scroll bar height
		scrollBarHeight = m_data.screen.offsetHeight -
			m_data.screen.clientHeight;
		
		if(
			m_data.mouse.screen.x > m_data.screenRect.width - scrollBarWidth
		) {
			return true;
		}

		if(
			m_data.mouse.screen.y > m_data.screenRect.height - scrollBarHeight
		) {
			return true;
		}

		return false;
	}

	function updateMouseData( e ) {
		var mouse, zoomData;

		mouse = m_data.mouse;
		zoomData = m_data.activePicture.zoomData;

		// Get the screen data
		mouse.screen.lastX = mouse.screen.x;
		mouse.screen.lastY = mouse.screen.y;
		mouse.screen.buttons = e.buttons;
		mouse.screen.x = e.pageX - m_data.screenRect.left;
		mouse.screen.y = e.pageY - m_data.screenRect.top;

		// Get the pen data
		mouse.pen.lastX = mouse.pen.x;
		mouse.pen.lastY = mouse.pen.y;
		mouse.pen.buttons = e.buttons;

		// Pen X
		mouse.pen.x = Math.floor(
			( mouse.screen.x + m_data.screen.scrollLeft ) *
			zoomData.ratioToPixelX
		);

		// Pen Y
		mouse.pen.y = Math.floor(
			( mouse.screen.y + m_data.screen.scrollTop ) *
			zoomData.ratioToPixelY
		);

		updateStatusBar();
	}

	function updateStatusBar() {
		var msg, mouse;

		mouse = m_data.mouse;

		if( pixel.activePicture ) {
			msg = pixel.activePicture.width + "x" + pixel.activePicture.height +
				" ";
		} else {
			msg += "100x100 - ";
		}

		msg += pixel.activeTool.getMessage();

		if( m_data.debugStatusBar ) {
			msg += " - (" + mouse.pen.x + ", " + mouse.pen.y +
				") - (" + mouse.screen.x + ", " + mouse.screen.y + ")";
		} else {
			msg += " - (" + mouse.pen.x + ", " + mouse.pen.y + ")";
		}

		document.getElementById( "statusMsg" ).innerHTML = msg;

		document.querySelector( "#statusColor1 div" ).style
			.backgroundColor = colorScript.getColor().s;
		document.querySelector( "#statusColor2 div" ).style
			.backgroundColor = colorScript.getColor2().s;
	}

	function selectItem( element, selectorName, queryString ) {
		var selectedElement;

		// Find the current selected element
		if( queryString ) {
			selectedElement = document.querySelector( queryString );
		} else {
			selectedElement = document.querySelector( "." + selectorName );
		}

		// Selected element is already selected
		if( selectedElement === element ) {
			return;
		}

		// Deselect the previous selected element
		if( selectedElement ) {
			selectedElement.className = selectedElement.className
				.replace( selectorName, "" ).replace( /\s+/, " " );
		}

		element.className = element.className.trim() + " " + selectorName;

	}

	function screenX( px, picture ) {
		var scroll;

		if( picture == null ) {
			picture = m_data.activePicture;
		}
		picture = m_data.activePicture;
		scroll = m_data.screen.scrollLeft;

		return ( px * picture.zoomData.ratioToScreenX ) +
			picture.rect.left - scroll;
	}

	function screenY( py, picture ) {
		var scroll;

		if( picture == null ) {
			picture = m_data.activePicture;
		}
		scroll = m_data.screen.scrollTop;
		return ( py * picture.zoomData.ratioToScreenY ) +
			picture.rect.top - scroll;
	}

	function screenX2( px, picture ) {
		if( picture == null ) {
			picture = m_data.activePicture;
		}
		return ( px * picture.zoomData.ratioToScreenX );
	}

	function screenY2( py, picture ) {
		if( picture == null ) {
			picture = m_data.activePicture;
		}

		return ( py * picture.zoomData.ratioToScreenY )
	}

	function pixelX( sx, picture ) {
		if( picture == null ) {
			picture = m_data.activePicture;
		}
		return ( sx - picture.rect.left ) *
			m_data.activePicture.ratioToPixelX;
	}

	function pixelY( sy, picture ) {
		if( picture == null ) {
			picture = m_data.activePicture;
		}

		return ( sy - picture.rect.top ) *
			picture.ratioToPixelY;
	}

	function pixelX2( sx, picture ) {
		if( picture == null ) {
			picture = m_data.activePicture;
		}

		return sx / picture.zoomData.ratioToScreenX;
	}

	function pixelY2( sy, picture ) {

		if( picture == null ) {
			picture = m_data.activePicture;
		}

		return sy / picture.zoomData.ratioToScreenY;
	}

	function initElementDragging(
		name, callbackStart, callbackMove, callbackStop, callbackGetLimits
	) {
		var move, isMoving, last, offset, limits, index, lockX, lockY;

		move = document.querySelector( name );
		move.className = move.className + " draggable";

		move.addEventListener( "mousedown", _mouseDown );
		document.body.addEventListener( "mousemove", _mouseMove );
		document.body.addEventListener( "mouseup", _mouseUp );

		move.addEventListener( "touchstart", _touchStart );
		document.body.addEventListener( "touchmove", _touchMove );
		document.body.addEventListener( "touchend", _touchEnd );

		function updateOffset( pos, offset ) {
			if( pos.x > limits.x2 ) {
				offset.x = limits.x2 - move.offsetLeft;
			}

			if( pos.x < limits.x1 ) {
				offset.x = limits.x1 - move.offsetLeft;
			}

			if( pos.y > limits.y2 ) {
				offset.y = limits.y2 - move.offsetTop;
			}

			if( pos.y < limits.y1 ) {
				offset.y = limits.y1 - move.offsetTop;
			}
		}

		function _mouseDown( e ) {
			// Trigger move start
			callbackStart();

			// This is to fix an issue where the mousedown is registering
			// with a different element than the position of the mouse.
			move = document.elementsFromPoint( e.pageX, e.pageY )[ 0 ];

			if( move.className.indexOf( "draggable" ) === -1 ) {
				move = this;
			}

			lockX = !!( move.dataset.lockx );
			lockY = !!( move.dataset.locky );
			index = parseInt( move.dataset.index );

			// Start dragging the element
			isMoving = true;
			limits = callbackGetLimits( index );
			offset = {
				"x": 0,
				"y": 0
			};
			last = {
				"x": e.pageX,
				"y": e.pageY
			};
		}

		function _mouseMove( e ) {
			var mouse, pos;

			if( ! isMoving ) {
				return;
			}

			mouse = {
				"x": e.pageX,
				"y": e.pageY
			};

			if( last && mouse ) {
				offset.x = mouse.x - last.x;
				offset.y = mouse.y - last.y;
				if( lockX ) {
					offset.x = 0;
				}
				if( lockY ) {
					offset.y = 0;
				}
				pos = {
					"x": move.offsetLeft + offset.x,
					"y": move.offsetTop + offset.y
				};
				updateOffset( pos, offset );
				move.style.transform = "" + 
					"translate(" + offset.x + "px, " + offset.y + "px)";
				callbackMove( offset.x, offset.y, index );
			}
		}

		function _mouseUp( e ) {
			if( ! isMoving ) {
				return;
			}

			isMoving = false;
			move.style.transform = "translate(0,0)";
			move.style.left = move.offsetLeft + offset.x + "px";
			move.style.top = move.offsetTop + offset.y + "px";

			callbackStop( offset.x, offset.y, index );
			offset.x = 0;
			offset.y = 0;
		}

		function _touchStart( e ) {
			var touchObj = e.changedTouches[ 0 ];
			touchObj.buttons = 1;
			_mouseDown( touchObj );
			//e.preventDefault();
		}

		function _touchMove( e ) {
			var touchObj = e.changedTouches[ 0 ];
			touchObj.buttons = 1;
			_mouseMove( touchObj );
			//e.preventDefault();
		}

		function _touchEnd( e ) {
			var touchObj = e.changedTouches[ 0 ];
			touchObj.buttons = 1;
			_mouseUp( touchObj );
			//e.preventDefault();
		}

	}

	function resizeGrid() {
		var scrollBarWidth, scrollBarHeight;

		// Calculate the scroll bar width
		scrollBarWidth = m_data.screen.offsetWidth -
			m_data.screen.clientWidth;

		// Calculate the scroll bar height
		scrollBarHeight = m_data.screen.offsetHeight -
			m_data.screen.clientHeight;

		// Calc the size of the grid canvas
		m_data.grid.width = m_data.screenRect.width - scrollBarWidth;
		m_data.grid.height = m_data.screenRect.height - scrollBarHeight;

		if( m_data.grid.width > m_data.activePicture.zoomData.rect.width ) {
			m_data.grid.width = m_data.activePicture.zoomData.rect.width;
		}
		if( m_data.grid.height > m_data.activePicture.zoomData.rect.height ) {
			m_data.grid.height = m_data.activePicture.zoomData.rect.height;
		}
		m_data.grid.style.width = m_data.grid.width + "px";
		m_data.grid.style.height = m_data.grid.height + "px";
		drawGrid();
	}

	function drawGrid( rect ) {
		var context, pixelWidth, pixelHeight, width, height, x, y, offX, offY,
			zoomData;

		// Get coordinates
		width = m_data.grid.width;
		height = m_data.grid.height;

		// Clear the context
		context = m_data.grid.getContext( "2d" );
		context.clearRect( 0, 0, width, height );

		// Get Zoom Data
		zoomData = m_data.activePicture.zoomData;
		pixelWidth = zoomData.ratioToScreenX;
		pixelHeight = zoomData.ratioToScreenX;

		if(
			m_data.showGrid && 
			pixelWidth > m_data.minGridSize &&
			pixelHeight > m_data.minGridSize
		) {

			// X Offset
			offX = Math.floor( m_data.screen.scrollLeft / pixelWidth ) *
				pixelWidth - m_data.screen.scrollLeft;

			// Y Offset
			offY = Math.floor( m_data.screen.scrollTop / pixelHeight ) *
				pixelHeight - m_data.screen.scrollTop;

			// Start Drawing
			context.beginPath();

			// Draw Vertical Lines
			for( y = offY; y < height; y += pixelHeight ) {
				context.moveTo( offX, y );
				context.lineTo( width, y );
			}

			// Draw Horizontal Lines
			for( x = offX; x < width; x += pixelWidth ) {
				context.moveTo( x, offY );
				context.lineTo( x, height );
			}

			context.strokeStyle = "rgba( 55, 55, 55, 0.5)";
			context.stroke();

		}

		if( rect === undefined ) {
			rect = selectorTool.getRect();
		}
		if( rect.showRect && rect.width > 0 && rect.height > 0 ) {
			context.save();
			context.lineWidth = 2;
			context.beginPath();
			context.setLineDash( [ 5, 5 ] );
			context.rect(
				screenX2( rect.x ) - m_data.screen.scrollLeft,
				screenY2( rect.y ) - m_data.screen.scrollTop,
				screenX2( rect.width ),
				screenY2( rect.height )
			);
			context.strokeStyle = "rgba(0, 0, 0, 0.75)";
			context.stroke();
			context.beginPath();
			context.setLineDash( [ 5, 5 ] );
			context.lineDashOffset = -5;
			context.rect(
				screenX2( rect.x ) - m_data.screen.scrollLeft,
				screenY2( rect.y ) - m_data.screen.scrollTop,
				screenX2( rect.width ),
				screenY2( rect.height )
			);
			context.strokeStyle = "rgba(255, 255, 255, 0.75)";
			context.stroke();
			context.restore();
		}
	}

	// Serializes the active picture
	function serializePicture( picture, copyAll ) {
		var picture, screens, data, layer, i;

		screens = [
			"$main", "$effects", "$temp", "$temp2", "$preview"
		];

		// Copy all the changed canvases
		data = {};
		for( i = 0; i < screens.length; i++ ) {
			if( copyAll || picture[ screens[ i ] ].changed ) {
				data[ screens[ i ] ] = copyCanvas(
					picture[ screens[ i ] ].canvas()
				);
			} else {
				data[ screens[ i ] ] = null;
			}
			if( ! copyAll ) {
				picture[ screens[ i ] ].changed = false;
			}
		}

		// Copy all the changed layer canvases
		data.layers = [];
		for( i = 0; i < picture.orderedLayers.length; i++ ) {
			layer = picture.orderedLayers[ i ];
			if( copyAll || layer.changed ) {
				data.layers.push( {
					"canvas": copyCanvas( layer.$screen.canvas() ),
					"alpha": layer.alpha,
					"id": layer.id,
					"hidden": layer.hidden
				} );
			}
			if( ! copyAll ) {
				layer.changed = false;
			}
		}

		// Copy the filterRect
		if( copyAll || picture.filterRect.changed ) {
			data.filterRect = selectionTool.copyRect( picture.filterRect );
		}
		if( ! copyAll ) {
			picture.filterRect.changed = false;
		}
	}

	function copyCanvas( srcCanvas ) {
		var destCanvas;

		destCanvas = document.createElement( "canvas" );
		destCanvas.width = srcCanvas.width;
		destCanvas.height = srcCanvas.height;
		destCanvas.getContext( "2d" ).drawImage( srcCanvas, 0 , 0 );

		return destCanvas;
	}

	function setActionKeys() {
		var i;

		for( i = 0; i < m_data.actionKeys.length; i++ ) {
			$.setActionKey( m_data.actionKeys[ i ], true );
		}
	}

	function clearActionKeys() {
		var i;

		for( i = 0; i < m_data.actionKeys.length; i++ ) {
			$.setActionKey( m_data.actionKeys[ i ], false );
		}
	}

	function getScreenLimits( itemSize ) {
		var rect, size, scrollBarWidth, scrollBarHeight;

		// rect = pixel.screen.getBoundingClientRect();
		// scrollBarWidth = pixel.screen.offsetWidth - pixel.screen.clientWidth;
		// scrollBarHeight = pixel.screen.offsetHeight - pixel.screen.clientHeight;

		// return {
		// 	"x1": rect.left,
		// 	"y1": rect.top,
		// 	"x2": rect.left + rect.width - ( itemSize * 2 ) - scrollBarWidth,
		// 	"y2": rect.top + rect.height - ( itemSize * 2 ) - scrollBarHeight
		// };
		size = $.util.getWindowSize();
		return {
			"x1": itemSize,
			"y1": itemSize,
			"x2": size.width - itemSize * 2,
			"y2": size.height - itemSize * 2
		};
	}

	return m_data;

// End of file encapsulation
} )();

// Initialize pixel when ready
$.ready( function () {
	pixel.initialize();
} );
