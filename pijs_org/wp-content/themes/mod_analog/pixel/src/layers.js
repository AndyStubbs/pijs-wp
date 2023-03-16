/*
layers.js
*/

"use strict";

// Layer Script container
var layerScript = ( function () {

	var m_alphaChanging, m_oldAlpha;

	m_alphaChanging = false;

	// Initialize Layer Script
	function initialize() {
		initLayerButtons();
	}

	// Initialize Layer Buttons
	function initLayerButtons() {
		document.getElementById( "newLayer" ).addEventListener(
			"click", createNewLayerButtonClick
		);
		document.getElementById( "deleteLayer" ).addEventListener(
			"click", deleteLayerButtonClick
		);
		document.getElementById( "mergeLayer" ).addEventListener(
			"click", mergeLayerButtonClick
		);
		document.getElementById( "copyLayer" ).addEventListener(
			"click", copyLayerButtonClick
		);
		document.getElementById( "moveLayerUp" ).addEventListener(
			"click", moveLayerUpButtonClick
		);
		document.getElementById( "moveLayerDown" ).addEventListener(
			"click", moveLayerDownButtonClick
		);
	}

	// Get the index of the layer
	function findLayerOrder( layer ) {
		var i;
		for( i = 0; i < pixel.activePicture.orderedLayers.length; i++ ) {
			if( pixel.activePicture.orderedLayers[ i ] === layer ) {
				return i;
			}
		}
	}

	// Compute the layer id
	function getPictureLayerId( picture ) {
		return "picture_" + picture.id + "_layer";
	}

	// Set the status of layer buttons
	function updateLayerButtonStatus() {
		var index;

		// User can't delete the last layer.
		if( pixel.activePicture.orderedLayers.length === 1 ) {
			document.getElementById( "deleteLayer" ).setAttribute(
				"disabled", "disabled"
			);
		} else {
			document.getElementById( "deleteLayer" ).removeAttribute(
				"disabled"
			);
		}

		// Get the index of the selected layer
		index = findLayerOrder( pixel.activeLayer );

		// Merge layer up can only occur if a layer above exists
		if( index === 0 ) {
			document.getElementById( "mergeLayer" ).setAttribute(
				"disabled", "disabled"
			);
		} else {
			document.getElementById( "mergeLayer" ).removeAttribute(
				"disabled"
			);
		}

		// Make sure layer cannot be moved past the beginning
		if( index === 0 ) {
			document.getElementById( "moveLayerUp" ).setAttribute(
				"disabled", "disabled"
			);
		} else {
			document.getElementById( "moveLayerUp" ).removeAttribute(
				"disabled"
			);
		}

		// Make sure layer cannot be moved past the end
		if( index === pixel.activePicture.orderedLayers.length - 1 ) {
			document.getElementById( "moveLayerDown" ).setAttribute(
				"disabled", "disabled"
			);
		} else {
			document.getElementById( "moveLayerDown" ).removeAttribute(
				"disabled"
			);
		}
	}

	// Create new layre button click
	function createNewLayerButtonClick() {
		var layerId, orderIndex;

		createNewLayer( pixel.activePicture );

		layerId = pixel.activePicture.activeLayerId;
		orderIndex = findLayerOrder( pixel.activeLayer );

		undoScript.addAction( {
			"action": "New Layer",
			"layerId": layerId,
			"data": { "layerId": layerId, "orderIndex": orderIndex },
			"undoDraw": false,
			"redoDraw": false,
			"undoCallback": function ( data ) {
				deleteLayer( data.layerId );
			},
			"redoCallback": function ( data ) {
				var currentOrder, amount;

				// Create the layer back
				createNewLayer( pixel.activePicture, data.layerId );

				// Move the back to the correct position
				currentOrder = pixel.activePicture.orderedLayers.length - 1;
				amount = data.orderIndex - currentOrder;
				moveLayer( amount, data.layerId );
			}
		} );
	}

	// Delete Layer Button Click
	function deleteLayerButtonClick() {
		var layerId, orderIndex, action;

		layerId = pixel.activePicture.activeLayerId;
		orderIndex = findLayerOrder( pixel.activeLayer );

		// Create the action
		action = undoScript.startDrawAction( "Delete Layer" );
		action.data = {
			"layerId": layerId, "orderIndex": orderIndex,
			"alpha": pixel.activeLayer.alpha,
			"hidden": pixel.activeLayer.hidden
		};

		// Undo Action
		action.undoCallback = function ( data ) {
			var currentOrder, amount;

			// Create the layer back
			createNewLayer(
				pixel.activePicture, data.layerId, data.alpha, data.hidden
			);

			// Move the back to the correct position
			currentOrder = pixel.activePicture.orderedLayers.length - 1;
			amount = data.orderIndex - currentOrder;
			moveLayer( amount, data.layerId );
		};

		// Redo Action
		action.redoCallback = function ( data ) {
			deleteLayer( data.layerId );
		};

		action.redoDraw = false;
		action.undoDraw = true;

		// Add the action to the undo script
		undoScript.addAction( action );

		// Delete the layer
		deleteLayer( pixel.activePicture.activeLayerId );
	}

	function deleteLayer( layerId, forced ) {
		var layer, index;

		// Don't delete the last layer
		if( pixel.activePicture.orderedLayers.length === 1 && ! forced ) {
			return;
		}

		// Get the selected layer
		layer = pixel.activePicture.layers[ layerId ];

		// Get the index order of the selected layer
		index = findLayerOrder( layer );

		// Remove the screen
		layer.$screen.removeScreen();

		// Delete the layer from the layers container
		delete pixel.activePicture.layers[ layerId ];

		// Delete the layer from the ordered layers container
		pixel.activePicture.orderedLayers.splice( index, 1 );

		// Delete the layer div
		layer.div.parentElement.removeChild( layer.div );

		if( forced ) {
			return;
		}

		// Select the nearest layer
		index -= 1;
		if( index < 0 ) {
			index = 0;
		}
		selectLayer( pixel.activePicture.orderedLayers[ index ].div );

		// Redraw the layers
		refreshTemp();
		drawLayers();
	}

	// Merge layers - button click
	function mergeLayerButtonClick() {
		var layerId1, layerId2, layer1, layer2, currentLayerOrder, action;

		// Get the active layer
		layerId1 = pixel.activePicture.activeLayerId;
		layer1 = pixel.activePicture.layers[ layerId1 ];

		// Get the index order of the selected layer
		currentLayerOrder = findLayerOrder( layer1 );

		// Get the second layer
		layer2 = pixel.activePicture.orderedLayers[ currentLayerOrder - 1 ];
		layerId2 = layer2.id;

		// Create the action
		action = {
			"action": "Merge Layers",
			"undoCanvas": null,
			"layerId": layerId1,
			"data": {
				"layerOrder1": currentLayerOrder,
				"layerCanvas1": undoScript.copyLayerImage( layerId1 ),
				"layerCanvas2": undoScript.copyLayerImage( layerId2 ),
				"layerId1": layerId1,
				"layerId2": layerId2,
				"layerAlpha1": layer1.alpha,
				"hidden": layer1.hidden
			}
		};

		// Undo action
		action.undoCallback = function ( data ) {
			var layer1, layer2, currentOrder, amount;

			// Create the layer back
			createNewLayer(
				pixel.activePicture, data.layerId1, data.layerAlpha1,
				data.hidden
			);

			// Move the back to the correct position
			currentOrder = pixel.activePicture.orderedLayers.length - 1;
			amount = data.layerOrder1 - currentOrder;
			moveLayer( amount, data.layerId1 );

			// Get the layer references
			layer1 = pixel.activePicture.layers[ data.layerId1 ];
			layer2 = pixel.activePicture.layers[ data.layerId2 ];

			// Clear layer2
			layer2.$screen.cls();

			// Draw the old images back
			layer1.$screen.drawImage( data.layerCanvas1 );
			layer2.$screen.drawImage( data.layerCanvas2 );
			layer1.$screen.render();
			layer2.$screen.render();
			refreshTemp();
			drawLayers();
		};

		action.redoCallback = function ( data ) {
			mergeLayers(
				pixel.activePicture.layers[ data.layerId1 ],
				pixel.activePicture.layers[ data.layerId2 ]
			);
		};

		// Add the action to the undo stack
		undoScript.addAction( action );

		// Merge the layers
		mergeLayers( layer1, layer2 );
	}

	function mergeLayers( layer1, layer2 ) {

		if( ! layer1.hidden ) {

			// Draw current layer on top of previous layer
			layer2.$screen.drawImage(
				layer1.$screen, 0, 0, 0, 0, 0, layer1.alpha
			);

		}

		// Delete the active layer
		deleteLayer( layer1.id );

		refreshTemp();
		drawLayers();

	}

	function copyLayerButtonClick() {
		var layerId1, layer1, layerId2, action;

		// Get the active layer
		layerId1 = pixel.activePicture.activeLayerId;
		layer1 = pixel.activePicture.layers[ layerId1 ];

		layerId2 = copyLayer( layer1 );

		// Create the action
		action = {
			"action": "Copy Layers",
			"undoCanvas": null,
			"layerId": layerId1,
			"data": {
				"layerId1": layerId1,
				"layerId2": layerId2
			}
		};

		action.undoCallback = function ( data ) {
			deleteLayer( data.layerId2 );
		};

		action.redoCallback = function ( data ) {
			copyLayer(
				pixel.activePicture.layers[ data.layerId1 ],
				data.layerId2
			);
		};

		undoScript.addAction( action );
	}

	function copyLayer( layer1, layerId2 ) {
		var layer1, layer2, currentLayerOrder, copyOrder;

		// Get the index order of the selected layer
		currentLayerOrder = findLayerOrder( layer1 );

		// Get the second layer
		createNewLayer( pixel.activePicture, layerId2 );
		copyOrder = pixel.activePicture.orderedLayers.length - 1;
		layer2 = pixel.activePicture.orderedLayers[ copyOrder ];
		layerId2 = layer2.id;

		// Move the layer
		moveLayer( currentLayerOrder - copyOrder, layerId2 );

		// Draw current layer on top of copy layer
		layer2.$screen.drawImage( layer1.$screen, 0, 0 );

		refreshTemp();
		drawLayers();

		return layerId2;
	}

	// Move Layer Up - button click
	function moveLayerUpButtonClick() {
		var layerId;

		layerId = pixel.activePicture.activeLayerId;
		moveLayer( -1, layerId );

		// Add move layer change to the undo stack
		undoScript.addAction( {
			"action": "Move Layer Down",
			"layerId": layerId,
			"undoDraw": false,
			"redoDraw": false,
			"data": { "layerId": layerId, "move": -1 },
			"undoCallback": function ( data ) {
				moveLayer( -data.move, data.layerId );
			},
			"redoCallback": function ( data ) {
				moveLayer( data.move, data.layerId );
			}
		} );
	}

	// Move Layer Down - button click
	function moveLayerDownButtonClick() {
		var layerId;

		layerId = pixel.activePicture.activeLayerId;
		moveLayer( 1, layerId );

		// Add move layer change to the undo stack
		undoScript.addAction( {
			"action": "Move Layer Down",
			"layerId": layerId,
			"undoDraw": false,
			"redoDraw": false,
			"data": { "layerId": layerId, "move": 1 },
			"undoCallback": function ( data ) {
				moveLayer( -data.move, data.layerId );
			},
			"redoCallback": function ( data ) {
				moveLayer( data.move, data.layerId );
			}
		} );
	}

	// Move Layer
	function moveLayer( amount, layerId ) {
		var layer, index1, index2, children, i;

		if( amount === 0 ) {
			return;
		}

		// Get the selected layer
		layer = pixel.activePicture.layers[ layerId ];

		// Get the index order of the selected layer
		index1 = findLayerOrder( layer );

		// Get the index for the layer to swap with
		index2 = index1 + amount;

		// Move the layer
		if( amount > 0 ) {
			layer.div.parentElement.insertBefore(
				pixel.activePicture.orderedLayers[ index2 ].div,
				pixel.activePicture.orderedLayers[ index1 ].div
			);
		} else {
			layer.div.parentElement.insertBefore(
				pixel.activePicture.orderedLayers[ index1 ].div,
				pixel.activePicture.orderedLayers[ index2 ].div
			);
		}

		// Reorder layers
		pixel.activePicture.orderedLayers = [];
		children = layer.div.parentElement.querySelectorAll( ".layer-item " );
		for( i = 0; i < children.length; i++ ) {
			pixel.activePicture.orderedLayers.push(
				pixel.activePicture.layers[ parseInt( children[ i ].dataset.layer ) ]
			);
		}

		// // Placeholders
		// layer1 = pixel.activePicture.orderedLayers[ index1 ];
		// layer2 = pixel.activePicture.orderedLayers[ index2 ];

		// // Swap the layer
		// temp = layer1;
		// pixel.activePicture.orderedLayers[ index1 ] = layer2;
		// pixel.activePicture.orderedLayers[ index2 ] = temp;

		updateLayerButtonStatus();

		// Redraw the layers
		drawLayers();
	}

	// Create new picture
	function createNewPicture( picture, isFirst ) {
		var picturesLayerDiv;

		// Create the pictures layer div
		picturesLayerDiv = document.createElement( "div" );
		picturesLayerDiv.id = getPictureLayerId( picture );
		picturesLayerDiv.className = "picture-layers";

		// Append to document
		document.getElementById( "layers" ).appendChild( picturesLayerDiv );

		// Create the first layer
		createNewLayer( picture, null, null, null, isFirst );
	}

	// Create new layer
	function createNewLayer( picture, layerId, alpha, hidden, isFirst ) {
		var layerDiv, layerImage, $screen, layer;

		// Get the layer id
		if( layerId == null ) {
			layerId = picture.layerCount;
			picture.layerCount += 1;
		}

		if( alpha == null ) {
			alpha = 255;
		}

		if( hidden === undefined ) {
			hidden = false;
		}

		// Create layer Div
		layerDiv = createLayerDiv(
			layerId, getPictureLayerId( picture ), alpha, hidden
		);

		// Create screen
		layerImage = layerDiv.querySelector( ".layer-image" );
		$screen = $.screen( picture.sdim, layerImage, false, true );
		$screen.canvas().className = optionsTool.getBackground();

		// Create the layer
		layer = {
			"$screen": $screen,
			"alpha": alpha,
			"div": layerDiv,
			"id": layerId,
			"hidden": hidden,
			"changed": false,
			"picture": picture
		};

		// Add the picture to the layer
		picture.layers[ layerId ] = layer;
		picture.orderedLayers.push( layer );

		selectLayer( layerDiv, isFirst );
	}

	// Create Layer Div
	function createLayerDiv( layerId, containerId, alpha, hidden ) {
		var layerDiv, layerImage, layerVisCheck, sliderDiv, sliderSpan,
			alphaSlider;

		if( alpha == null ) {
			alpha = 255;
		}

		// Create layer Div
		layerDiv = document.createElement( "div" );
		layerDiv.className = "layer-item";
		layerDiv.addEventListener( "click", layerClicked );
		layerDiv.dataset.layer = layerId;

		// Create the sliderDiv
		sliderDiv = document.createElement( "div" );

		// Create the slider span
		sliderSpan = document.createElement( "span" );
		sliderSpan.className = "slider-span";
		sliderSpan.innerHTML = Math.round( alpha / 255 * 100 ) + "%";

		// Create the alpha slider
		alphaSlider = document.createElement( "input" );
		alphaSlider.type = "range";
		alphaSlider.min = 0;
		alphaSlider.max = 255;
		alphaSlider.value = alpha;
		alphaSlider.step = 1;
		alphaSlider.className = "slider";
		alphaSlider.dataset.selectable = "no";
		alphaSlider.dataset.layer = layerId;
		alphaSlider.addEventListener( "input", sliderInput );
		alphaSlider.addEventListener( "change", sliderChange );

		// Create layer image
		layerImage = document.createElement( "div" );
		layerImage.className = "layer-image";

		// Create layer visibility checkbox
		layerVisCheck = document.createElement( "input" );
		layerVisCheck.setAttribute( "type", "checkbox" );
		if( ! hidden ) {
			layerVisCheck.setAttribute( "checked", "checked" );
		}
		layerVisCheck.addEventListener( "change", layerVisChanged );
		layerVisCheck.dataset.layer = layerId;
		layerVisCheck.dataset.selectable = "no";

		// place elements
		sliderDiv.appendChild( sliderSpan );
		sliderDiv.appendChild( alphaSlider );
		layerDiv.appendChild( sliderDiv );
		layerDiv.appendChild( layerVisCheck );
		layerDiv.appendChild( layerImage );

		// Layers Container
		document.getElementById( containerId ).appendChild( layerDiv );

		return layerDiv;
	}

	function sliderInput() {
		var layerId, alpha, layer;

		layerId = parseInt( this.dataset.layer );

		if( ! m_alphaChanging ) {
			m_oldAlpha = pixel.activePicture.layers[ layerId ].alpha;
		}
		m_alphaChanging = true;

		layer = pixel.activePicture.layers[ layerId ];
		alpha = parseInt( layer.div.querySelector( ".slider" ).value );

		changeLayerAlpha( layerId, alpha );
	}

	// Layer Transparency Slider - Change
	function sliderChange() {
		var layerId, alpha, layer;

		m_alphaChanging = false;
		layerId = parseInt( this.dataset.layer );
		layer = pixel.activePicture.layers[ layerId ];
		alpha = parseInt( layer.div.querySelector( ".slider" ).value );

		if( m_oldAlpha === undefined ) {
			m_oldAlpha = pixel.activePicture.layers[ layerId ].alpha;
		}

		// Add move layer change to the undo stack
		undoScript.addAction( {
			"action": "Alpha Change",
			"layerId": layerId,
			"undoDraw": false,
			"redoDraw": false,
			"data": {
				"layerId": layerId,
				"newAlpha": alpha,
				"oldAlpha": m_oldAlpha
			},
			"undoCallback": function ( data ) {
				var slider;
				slider = pixel.activePicture.layers[ data.layerId ].$screen
					.canvas().parentElement.parentElement
					.querySelector( "input[type=range]" );
				slider.value = data.oldAlpha;
				changeLayerAlpha( data.layerId, data.oldAlpha );
			},
			"redoCallback": function ( data ) {
				var slider;
				slider = pixel.activePicture.layers[ data.layerId ].$screen
					.canvas().parentElement.parentElement
					.querySelector( "input[type=range]" );
				slider.value = data.newAlpha;
				changeLayerAlpha( data.layerId, data.newAlpha );
			}
		} );

		changeLayerAlpha( layerId, alpha );
		m_oldAlpha = undefined;
	}

	function changeLayerAlpha( layerId, alpha ) {
		var layer;

		layer = pixel.activePicture.layers[ layerId ];
		layer.alpha = alpha;

		layer.div.querySelector( ".slider-span" ).innerHTML = Math.round(
			( alpha / 255 ) * 100
		) + "%";

		refreshTemp();
		drawLayers();
	}

	// Select a Layer
	function selectLayer( layerDiv, isFirst ) {
		var oldLayer;

		oldLayer = pixel.activeLayer;

		// Add selection border to layer
		pixel.selectItem( layerDiv, "selected-layer" );

		// Set the active layer
		pixel.activePicture.activeLayerId = parseInt( layerDiv.dataset.layer );
		pixel.activeLayer = pixel.activePicture
			.layers[ pixel.activePicture.activeLayerId ];

		// Update layer button state
		updateLayerButtonStatus();

		// Update the activeTool
		if( isFirst ) {
			pixel.activeTool.layerChanged( null );

			// If the active tool is not the selector tool then call
			// layer changed on the selector tool
			if( pixel.activeTool !== selectorTool ) {
				selectorTool.layerChanged( null );
			}
		} else {
			pixel.activeTool.layerChanged( oldLayer );

			// Call change layer for selector tool
			if( pixel.activeTool !== selectorTool ) {
				selectorTool.layerChanged( oldLayer );
			}
		}

		pixel.updateStatusBar();
	}

	// Layer Clicked
	function layerClicked( e ) {
		if( e.target.dataset.selectable !== "no" ) {
			selectLayer( this );
		}
	}

	// Layer Hide/Show change
	function layerVisChanged( e ) {
		var layerId, actionName, isHidden, checkbox;

		checkbox = this;
		layerId = parseInt( checkbox.dataset.layer );

		if( checkbox.checked ) {
			isHidden = false;
			actionName = "Hide Layer";
		} else {
			isHidden = true;
			actionName = "Show Layer"
		}

		// Set the layer visibility
		setLayerVisibility( layerId, isHidden );

		// Add visibility change to the undo stack
		undoScript.addAction( {
			"action": actionName,
			"layerId": layerId,
			"undoDraw": false,
			"redoDraw": false,
			"data": { "layerId": layerId, "isHidden": isHidden },
			"undoCallback": function ( data ) {
				var checkbox;

				setLayerVisibility( data.layerId, ! data.isHidden );
				checkbox = pixel.activePicture.layers[ data.layerId ].$screen
					.canvas().parentElement.parentElement
					.querySelector( "input[type=checkbox]" );
				checkbox.checked = data.isHidden;
			},
			"redoCallback": function ( data ) {
				var checkbox;

				setLayerVisibility( data.layerId, data.isHidden );
				checkbox = pixel.activePicture.layers[ data.layerId ].$screen
					.canvas().parentElement.parentElement
					.querySelector( "input[type=checkbox]" );
				checkbox.checked = ! data.isHidden;
			}
		} );
	}

	// Set the layer visibility
	function setLayerVisibility( layerId, isHidden ) {
		pixel.activePicture.layers[ layerId ].hidden = isHidden;
		drawLayers();
	}

	// Draw the layers
	function drawLayers( picture ) {
		var i, layer, rect, $temp2;

		if( picture == null ) {
			picture = pixel.activePicture;
		}

		picture.$main.cls();
		picture.$preview.cls();
		for( i = 0; i < picture.orderedLayers.length; i++ ) {
			layer = picture.orderedLayers[ i ];
			if( ! layer.hidden ) {

				// if it is the active layer
				if( layer.id === picture.activeLayerId ) {

					// Draw the selected layer onto temp2
					$temp2 = picture.$temp2;
					$temp2.cls();
					$temp2.drawImage( layer.$screen, 0, 0 );

					// Clear the clipped area from the temp2
					rect = picture.filterRect;
					$temp2.canvas().getContext( "2d" )
						.clearRect( rect.x, rect.y, rect.width, rect.height );

					// Draw the temp2 onto main canvas
					picture.$main.drawImage(
						$temp2, 0, 0, 0, 0, 0, layer.alpha
					);

					// Draw a clipped image
					drawClippedImage(
						picture.$main.canvas(),
						picture.$temp.canvas(),
						layer.alpha
					);

				} else {

					// Draw the selected layer
					picture.$main.drawImage(
						layer.$screen, 0, 0, 0, 0, 0, layer.alpha
					);

				}

			}
		}
		picture.$preview.drawImage( picture.$main, 0, 0 );

		// Draw the effects
		picture.$main.drawImage(
			picture.$effects, 0, 0, 0, 0, 0, 128
		);

		if(
			pixel.foregroundOverlay &&
			pixel.foregroundOverlay !== picture.$preview.canvas()
		) {
			picture.$main.drawImage(
				pixel.foregroundOverlay, 0, 0, 0, 0, 0, pixel.overlayAlpha
			);
		}
	}

	function drawClippedImage( canvasOnto, canvasFrom, alpha ) {
		var rect, context;

		context = canvasOnto.getContext( "2d" );
		context.save();

		// Add clipping region
		rect = pixel.activePicture.filterRect;
		context.beginPath();
		context.rect( rect.x, rect.y, rect.width, rect.height );
		context.clip();

		// Set the layer transparency
		context.globalAlpha = alpha / 255;

		// Draw the clipped image
		context.drawImage( canvasFrom, 0, 0 );

		context.restore();
	}

	function finalizeTemp( layer ) {
		var $temp, $temp2, $screen, rect;

		if( layer == null ) {
			layer = pixel.activeLayer;
		}

		$temp = layer.picture.$temp;
		$temp2 = layer.picture.$temp2;
		$screen = layer.$screen;

		// Draw the screen onto temp2
		$temp2.cls();
		$temp2.drawImage( $screen, 0, 0 );

		// Clear the clipped area from the temp2
		rect = layer.picture.filterRect;
		$temp2.canvas().getContext( "2d" )
			.clearRect( rect.x, rect.y, rect.width, rect.height );

		// Draw the temp2 screen
		$screen.cls();
		$screen.drawImage(
			$temp2, 0, 0, 0, 0, 0, 255
		);

		// Draw the clipped image back onto the screen
		layerScript.drawClippedImage(
			$screen.canvas(), $temp.canvas(), 255
		);

	}

	function refreshTemp( layer ) {
		var tempCanvas, layerCanvas, tempContext;

		if( layer == null ) {
			layer = pixel.activeLayer;
		}

		// Get the canvases
		layerCanvas = layer.$screen.canvas();
		tempCanvas = layer.picture.$temp.canvas();
		tempContext = tempCanvas.getContext( "2d" );

		// Draw the layer screen onto the temp canvas
		tempContext.clearRect( 0, 0, tempCanvas.width, tempCanvas.height );
		tempContext.drawImage(
			layerCanvas, 0, 0, tempCanvas.width, tempCanvas.height
		);
	}

	// Hide any previous layers
	function hideLayers() {
		var pictureLayer;

		if( pixel.activePicture ) {
			pictureLayer = document.getElementById(
				getPictureLayerId( pixel.activePicture )
			);
			if( pictureLayer ) {
				pictureLayer.style.display = "none";
			}
		}
	}

	// Unhide any previous layers
	function unhideLayers() {
		var pictureLayer, div;

		if( pixel.activePicture ) {
			pictureLayer = document.getElementById(
				getPictureLayerId( pixel.activePicture )
			);
			if( pictureLayer ) {
				pictureLayer.style.display = "block";
				div = pixel.activeLayer.div;
				pixel.selectItem( div, "selected-layer" );
			}
		}
	}

	// Copy Layers
	function copyLayers( original ) {
		var i, layer, layer2;

		// Delete the first layer
		deleteLayer( pixel.activeLayer.id, true );

		// Create the new layers
		// i starts at 1 because the original layer image
		for( i = 0; i < original.orderedLayers.length; i++ ) {
			layer = original.orderedLayers[ i ];
			createNewLayer(
				pixel.activePicture, null, layer.alpha, layer.hidden
			);
		}

		// Copy the layer data
		for( i = 0; i < original.orderedLayers.length; i++ ) {
			layer = original.orderedLayers[ i ];
			layer2 = pixel.activePicture.orderedLayers[ i ];

			// Draw the layer image
			layer2.$screen.drawImage( layer.$screen, 0, 0 );

			// Copy the layer data
			// layer2.alpha = layer.alpha;
			// layer2.hidden = layer.hidden;

			// Make sure the checkbox is set correctly
			// if( layer2.hidden ) {
			// 	layer2.div.querySelector(
			// 		"input[type='checkbox']"
			// 	).checked = false;
			// }

			// Set the alpha slider value
			// layer2.div.querySelector(
			// 	"input[type='range']"
			// ).value = layer2.alpha;
		}

		refreshTemp();
		drawLayers();
	}

	// Delete Layers
	function deleteLayers( picture ) {
		var i, container, picture;

		if( picture == null ) {
			picture = pixel.activePicture;
		}

		// Delete the screens
		for( i = 0; i < picture.orderedLayers.length; i++ ) {
			picture.orderedLayers[ i ].$screen.removeScreen();
		}

		// Delete the html container
		container = document.getElementById(
			getPictureLayerId( picture )
		);
		container.parentElement.removeChild( container );
	}

	// layerScript API return
	return {
		"initialize": initialize,
		"drawLayers": drawLayers,
		"createNewPicture": createNewPicture,
		"createNewLayer": createNewLayer,
		"hideLayers": hideLayers,
		"unhideLayers": unhideLayers,
		"copyLayers": copyLayers,
		"deleteLayers": deleteLayers,
		"getPictureLayerId": getPictureLayerId,
		"drawClippedImage": drawClippedImage,
		"refreshTemp": refreshTemp,
		"selectLayer": selectLayer,
		"finalizeTemp": finalizeTemp,
		"setLayerVisibility": setLayerVisibility,
		"changeLayerAlpha": changeLayerAlpha
	};

// End of file encapsulation
} )();
