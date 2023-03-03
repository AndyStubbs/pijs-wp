/*
controls.js
*/

"use strict";

// Controls Script Container
var controlsScript = ( function () {

	var m_$lastView, m_lastCanvas, m_imageTypes, m_spriteData, m_undoStack, m_tempSpriteData;

	m_undoStack = [];
	m_imageTypes = [
		"image/bmp", "image/gif", "image/vnd.microsoft.icon", "image/jpeg",
		"image/png", "image/svg+xml", "image/tiff", "image/webp"
	];

	// Initialize buttons
	function initialize() {
		var dragEvents, i;

		g_myIndexDB.init( "Pi.js Pixel", "Items" );

		// Prevent default behavior on drag events
		function noDrop( e ) {
			e.preventDefault();
			e.stopPropagation();
		}
		dragEvents = [
			"drag", "dragstart", "dragend", "dragover",
			"dragenter", "dragleave", "drop"
		];
		for( i = 0; i < dragEvents.length; i++ ) {
			document.body.addEventListener( dragEvents[ i ], noDrop );
		}

		// Change background on drag over
		function dragOver( e ) {
			document.getElementById( "dragOverPopup" ).style.display = "block";
		}
		dragEvents = [ "dragover", "dragenter" ];
		for( i = 0; i < dragEvents.length; i++ ) {
			document.body.addEventListener( dragEvents[ i ], dragOver );
		}

		// Change background on drag out
		function dragOut( e ) {
			document.getElementById( "dragOverPopup" ).style.display = "none";
		}
		dragEvents = [ "dragleave", "dragend", "drop" ];
		for( i = 0; i < dragEvents.length; i++ ) {
			document.getElementById( "dragOverPopup" )
				.addEventListener( dragEvents[ i ], dragOut );
		}

		// Dropped File
		function droppedFile( e ) {
			var droppedFiles;

			animatorScript.closeAnimator();
			loadImageButtonClicked();
			droppedFiles = e.dataTransfer.files[ 0 ];
			document.getElementById( "loadImageFile" )
				.files = e.dataTransfer.files;
			loadImageFileChanged();
		}

		document.getElementById( "dragOverPopup" ).addEventListener(
			"drop", droppedFile
		);
		document.getElementById( "newImageButton" ).addEventListener(
			"click", newPictureButtonClicked
		);
		document.getElementById( "loadImageButton" ).addEventListener(
			"click", loadImageButtonClicked
		);
		document.getElementById( "copyImageButton" ).addEventListener(
			"click", copyPictureButtonClicked
		);
		document.getElementById( "saveImageButton" ).addEventListener(
			"click", saveImageButtonPopupClicked
		);
		document.getElementById( "deleteImageButton" ).addEventListener(
			"click", deletePictureButtonClicked
		);
		document.getElementById( "newImageOk" ).addEventListener(
			"click", newImageOkClicked
		);
		document.getElementById( "newImageCancel" ).addEventListener(
			"click", newImageCancelClicked
		);
		document.getElementById( "loadImageSpritesheet" ).addEventListener(
			"change", loadImageSpritesheetChanged
		);
		document.getElementById( "btnGenerateFrames" ).addEventListener(
			"click", btnGenerateFramesClicked
		);
		document.getElementById( "loadImageFile" ).addEventListener(
			"change", loadImageFileChanged
		);
		document.getElementById( "loadImageOk" ).addEventListener(
			"click", loadImageOkClicked
		);
		document.getElementById( "loadImageCancel" ).addEventListener(
			"click", loadImageCancelClicked
		);
		document.getElementById( "saveImageType" ).addEventListener(
			"change", saveImageTypeChanged
		);
		document.getElementById( "saveImageOk" ).addEventListener(
			"click", saveImageOkClicked
		);
		document.getElementById( "saveImageCancel" ).addEventListener(
			"click", saveImageCancelClicked
		);
		document.getElementById( "selAllFrames" ).addEventListener(
			"change", selAllFramesChanged
		);
		document.getElementById( "btnResetFrames" ).addEventListener(
			"click", btnResetFramesClick
		);
		document.getElementById( "chkAutoDetect" ).addEventListener(
			"change", chkAutoDetectChanged
		);
		document.getElementById( "btnUnselect" ).addEventListener(
			"click", btnUnselectClicked
		);
		document.getElementById( "btnMoveFrameUp" ).addEventListener(
			"click", btnMoveFrameUpClicked
		);
		document.getElementById( "btnMoveFrameDown" ).addEventListener(
			"click", btnMoveFrameDownClicked
		);
		document.getElementById( "loadImageFrameX" ).addEventListener(
			"change", loadImageFrameXChanged
		);
		document.getElementById( "loadImageFrameY" ).addEventListener(
			"change", loadImageFrameYChanged
		);
		document.getElementById( "loadImageFrameWidth" ).addEventListener(
			"change", loadImageFrameWidthChanged
		);
		document.getElementById( "loadImageFrameHeight" ).addEventListener(
			"change", loadImageFrameHeightChanged
		);
		document.getElementById( "btnUndoFrames" ).addEventListener(
			"click", btnUndoFramesClick
		);
		document.getElementById( "btnCreateFrame" ).addEventListener(
			"click", btnCreateFrameClicked
		);
		document.getElementById( "btnUpdateFrame" ).addEventListener(
			"click", btnUpdateFrameClicked
		);
		document.getElementById( "btnRemoveFrame" ).addEventListener(
			"click", btnRemoveFrameClicked
		);
		window.addEventListener( "beforeunload", autoSaveWorkspace );
		setTimeout( function () {
			loadAutoSavedWorkspace();
			startAutoSave();
		}, 100 );
	}

	function startAutoSave() {
		var isIdle;

		function setIdle() {
			isIdle = false;
		}

		window.addEventListener( "touchstart", setIdle );
		window.addEventListener( "touchmove", setIdle );
		window.addEventListener( "touchend", setIdle );
		window.addEventListener( "mousemove", setIdle );
		window.addEventListener( "mousedown", setIdle );
		window.addEventListener( "mouseup", setIdle );
		window.addEventListener( "keydown", setIdle );
		window.addEventListener( "keyup", setIdle );

		setInterval( function () {
			if( isIdle ) {
				autoSaveWorkspace();
			}
			isIdle = true;
		}, 5000 );
	}

	function loadAutoSavedWorkspace() {
		var i;
		g_myIndexDB.getItem( "workspace" ).then( ( data ) => {
			if( data === null ) {
				return;
			}
			for( i in data.options ) {
				if( i !== "effectsOption" ) {
					optionsTool.updateOption( i, data.options[ i ] );
				}
			}
			colorScript.setColors( data.colors );
			pixel.updateStatusBar();
			pictureScript.deletePicture( "all" );
			for( i = 0; i < data.pictures.length; i++ ) {
				createPixelPicture( data.pictures[ i ] );
			}
		} );
	}

	function autoSaveWorkspace() {
		var data;

		document.getElementById( "statusMsg" ).innerHTML = "Autosave";
		data = {
			"pictures": getWorkspaceData(),
			"options": optionsTool.getSettings(),
			"colors": colorScript.getColors()
		};
		g_myIndexDB.setItem( "workspace", data );
		setTimeout( function () {
			if(
				document.getElementById( "statusMsg" ).innerHTML === "Autosave"
			) {
				document.getElementById( "statusMsg" ).innerHTML = "";
			}
		}, 1000 );
	}

	// New Picture Button
	function newPictureButtonClicked() {

		// Clear the action keys
		pixel.clearActionKeys();

		// Show the newImagePopup
		document.getElementById( "newImagePopup" ).style.display = "block";
		document.getElementById( "modalPopup" ).style.display = "block";

		// Focus on the Ok button
		document.getElementById( "newImageOk" ).focus();

	}

	function loadImageButtonClicked() {

		// Clear the action keys
		pixel.clearActionKeys();

		// Show the newImagePopup
		document.getElementById( "loadImagePopup" ).style.display = "block";
		document.getElementById( "modalPopup" ).style.display = "block";

		// Focus on the Ok button
		document.getElementById( "loadImageOk" ).focus();
	}

	function loadImageSpritesheetChanged() {
		if( document.getElementById( "loadImageSpritesheet" ).checked ) {
			document.querySelector( ".editSpritesheetFrames" ).style.opacity = "";
			document.querySelectorAll( ".editSpritesheetFrames input" ).forEach( function ( input ) {
				input.disabled = false;
			} );
			document.getElementById( "btnUnselect" ).disabled = true;
			document.getElementById( "selAllFrames" ).disabled = false;
			if( m_undoStack.length === 0 ) {
				document.getElementById( "btnUndoFrames" ).disabled = true;
			} else {
				document.getElementById( "btnUndoFrames" ).disabled = false;
			}
			drawSpriteSheetGrid();
			chkAutoDetectChanged();
		} else {
			document.querySelector( ".editSpritesheetFrames" ).style.opacity = "0.5";
			document.querySelectorAll( ".editSpritesheetFrames input" ).forEach( function ( input ) {
				input.disabled = true;
			} );
			document.getElementById( "selAllFrames" ).disabled = true;
			removeSpriteSheetGrid();
		}
	}

	function chkAutoDetectChanged() {
		if( document.getElementById( "chkAutoDetect" ).checked ) {
			document.getElementById( "loadImageWidth" ).disabled = true;
			document.getElementById( "loadImageHeight" ).disabled = true;
			document.getElementById( "loadImageMarginX" ).disabled = true;
			document.getElementById( "loadImageMarginY" ).disabled = true;
		} else {
			document.getElementById( "loadImageWidth" ).disabled = false;
			document.getElementById( "loadImageHeight" ).disabled = false;
			document.getElementById( "loadImageMarginX" ).disabled = false;
			document.getElementById( "loadImageMarginY" ).disabled = false;
		}
	}

	function btnGenerateFramesClicked() {
		if( document.getElementById( "chkAutoDetect" ).checked ) {
			autoDetectFramesClicked();
		} else {
			generateFramesClicked();
		}
	}

	function autoDetectFramesClicked() {
		$.ready( function () {
			addToUndostack( m_spriteData );
			m_spriteData = $.getSpritesheetData( "spritesheet" );
			drawSpriteSheetGrid();
			updateSelAllFrame();
		} );
	}

	function copySpriteData( spriteData, isResetSelected ) {
		let copy = {
			"frameCount": spriteData.frameCount,
			"frames": []
		};
		spriteData.frames.forEach( function ( frame ) {
			let frameSelected = frame.selected;
			if( isResetSelected ) {
				frameSelected = false;
			}
			copy.frames.push( {
				"x": frame.x,
				"y": frame.y,
				"width": frame.width,
				"height": frame.height,
				"selected": frameSelected
			} );
		} );
		return copy;
	}

	function addToUndostack( spriteData ) {
		let copy = copySpriteData( spriteData, true );
		m_undoStack.push( copy );
		document.getElementById( "btnUndoFrames" ).disabled = false;
	}

	function generateFramesClicked() {
		var data, width, height, x, y;

		addToUndostack( m_spriteData );
		m_spriteData = {
			"frameCount": 0,
			"frames": []
		};

		data = getLoadImageData();
		width = m_$lastView.canvas().width;
		height = m_$lastView.canvas().height;
		for(
			y = data.marginY; y < height; y += data.height + data.marginY
		) {
			for(
				x = data.marginX; x < width; x += data.width + data.marginX
			) {
				if( m_spriteData.frames.length >= 5000 ) {
					y = height;
					break;
				}
				m_spriteData.frames.push( {
					"x": x,
					"y": y,
					"width": data.width,
					"height": data.height,
					"selected": false
				} );
			}
		}
		m_spriteData.frameCount = m_spriteData.frames.length;
		drawSpriteSheetGrid();
		updateSelAllFrame();
	}

	function updateSelAllFrameText() {
		document.querySelectorAll( "#selAllFrames option" ).forEach( function ( option ) {
			let i = parseInt( option.value );
			let frame = m_spriteData.frames[ i ];
			option.innerHTML = "Frame " + i + ": " + frame.width + "x" + frame.height;
			option.selected = frame.selected;
		} );
	}

	function updateSelAllFrame() {
		var i, selAllFrames, option, frame;
		selAllFrames = document.getElementById( "selAllFrames" );
		selAllFrames.innerHTML = "";
		for( i = 0; i < m_spriteData.frames.length; i++ ) {
			frame = m_spriteData.frames[ i ];
			option = document.createElement( "option" );
			option.value = i;
			option.innerHTML = "Frame " + i + ": " + frame.width + "x" + frame.height;
			option.selected = frame.selected;
			selAllFrames.appendChild( option );
		}
		document.getElementById( "newImageItemMessage" ).innerHTML = "&nbsp;";
		document.getElementById( "newImageItemMessage" ).classList.remove( "error" );
		//selAllFramesChanged();
	}

	function selAllFramesChanged() {
		let selsSelected = [];
		m_tempSpriteData = null;
		m_spriteData.frames.forEach( function ( frame ) {
			frame.selected = false;
		} );
		document.querySelectorAll( "#selAllFrames :checked" ).forEach( function ( option ) {
			let index = parseInt( option.value );
			m_spriteData.frames[ index ].selected = true;
			selsSelected.push( index );
		} );

		drawSpriteSheetGrid();
		document.getElementById( "newImageItemMessage" ).classList.remove( "error" );
		if( selsSelected.length === 0 ) {
			document.getElementById( "btnUnselect" ).disabled = true;
			document.getElementById( "btnUpdateFrame" ).disabled = true;
			document.getElementById( "btnRemoveFrame" ).disabled = true;
			document.getElementById( "newImageItemMessage" ).innerHTML = "&nbsp;";
			return;
		}
		document.getElementById( "btnUnselect" ).disabled = false;
		document.getElementById( "btnUpdateFrame" ).disabled = false;
		document.getElementById( "btnRemoveFrame" ).disabled = false;
		let x = 0;
		let y = 0;
		let width = 0;
		let height = 0;
		if( selsSelected.length === 1 ) {
			document.getElementById( "newImageItemMessage" ).innerHTML = "* Frame " +
				selsSelected[ 0 ] + " selected";
			let frame = m_spriteData.frames[ selsSelected[ 0 ] ];
			x = frame.x;
			y = frame.y;
			width = frame.width;
			height = frame.height;
		} else {
			document.getElementById( "newImageItemMessage" ).innerText = "* Multiple Frames Selected";
			document.getElementById( "newImageItemMessage" ).classList.add( "error" );
			let xs = [];
			let ys = [];
			let ws = [];
			let hs = [];
			for( let i = 0; i < selsSelected.length; i++ ) {
				let frame = m_spriteData.frames[ selsSelected[ i ] ];
				xs.push( frame.x );
				ys.push( frame.y );
				ws.push( frame.width );
				hs.push( frame.height );
			}
			x = Math.round( getMedian( xs ) );
			y = Math.round( getMedian( ys ) );
			width = Math.round( getMedian( ws ) );
			height = Math.round( getMedian( hs ) );
		}
		document.getElementById( "loadImageFrameX" ).value = x;
		document.getElementById( "loadImageFrameY" ).value = y;
		document.getElementById( "loadImageFrameWidth" ).value = width;
		document.getElementById( "loadImageFrameHeight" ).value = height;
	}

	function btnUnselectClicked() {
		document.querySelectorAll( "#selAllFrames :checked" ).forEach( function ( option ) {
			let index = parseInt( option.value );
			m_spriteData.frames[ index ].selected = false;
			option.selected = false;
			document.getElementById( "newImageItemMessage" ).innerHTML = "&nbsp;";
		} );
		drawSpriteSheetGrid();
		selAllFramesChanged();
	}

	function btnMoveFrameUpClicked() {
		addToUndostack( m_spriteData );
		let frames = m_spriteData.frames;
		for( let i = 1; i < frames.length; i++ ) {
			if( frames[ i ].selected ) {
				let temp = frames[ i - 1 ];
				frames[ i - 1 ] = frames[ i ];
				frames[ i ] = temp;
			}
		}
		updateSelAllFrame();
		selAllFramesChanged();
	}

	function btnMoveFrameDownClicked() {
		addToUndostack( m_spriteData );
		let frames = m_spriteData.frames;
		for( let i = frames.length - 2; i > 0; i-- ) {
			if( frames[ i ].selected ) {
				let temp = frames[ i + 1 ];
				frames[ i + 1 ] = frames[ i ];
				frames[ i ] = temp;
			}
		}
		updateSelAllFrame();
		selAllFramesChanged();
	}

	function loadImageFrameXChanged() {
		//addToUndostack( m_spriteData );
		if( ! m_tempSpriteData ) {
			m_tempSpriteData = copySpriteData( m_spriteData );
		}
		let frames = m_tempSpriteData.frames;
		for( let i = 0; i < frames.length; i++ ) {
			if( frames[ i ].selected ) {
				frames[ i ].x = getInt( "loadImageFrameX" );
			}
		}
		drawSpriteSheetGrid( m_tempSpriteData );
	}

	function loadImageFrameYChanged() {
		//addToUndostack( m_spriteData );
		if( ! m_tempSpriteData ) {
			m_tempSpriteData = copySpriteData( m_spriteData );
		}
		let frames = m_tempSpriteData.frames;
		for( let i = 0; i < frames.length; i++ ) {
			if( frames[ i ].selected ) {
				frames[ i ].y = getInt( "loadImageFrameY" );
			}
		}
		drawSpriteSheetGrid( m_tempSpriteData );
	}

	function loadImageFrameWidthChanged() {
		//addToUndostack( m_spriteData );
		if( ! m_tempSpriteData ) {
			m_tempSpriteData = copySpriteData( m_spriteData );
		}
		let frames = m_tempSpriteData.frames;
		for( let i = 0; i < frames.length; i++ ) {
			if( frames[ i ].selected ) {
				frames[ i ].width = getInt( "loadImageFrameWidth" );
			}
		}
		drawSpriteSheetGrid( m_tempSpriteData );
		//updateSelAllFrameText();
	}

	function loadImageFrameHeightChanged() {
		//addToUndostack( m_spriteData );
		if( ! m_tempSpriteData ) {
			m_tempSpriteData = copySpriteData( m_spriteData );
		}
		let frames = m_tempSpriteData.frames;
		for( let i = 0; i < frames.length; i++ ) {
			if( frames[ i ].selected ) {
				frames[ i ].height = getInt( "loadImageFrameHeight" );
			}
		}
		drawSpriteSheetGrid( m_tempSpriteData );
		//updateSelAllFrameText();
	}

	function btnUndoFramesClick() {
		m_spriteData = m_undoStack.pop();
		if( m_undoStack.length === 0 ) {
			document.getElementById( "btnUndoFrames" ).disabled = true;
		}
		updateSelAllFrame();
		selAllFramesChanged();
	}

	function btnUpdateFrameClicked() {
		if( m_tempSpriteData ) {
			addToUndostack( m_spriteData );
			m_spriteData = m_tempSpriteData;
			m_tempSpriteData = null;
			drawSpriteSheetGrid();
			updateSelAllFrameText();
		}
	}

	function btnCreateFrameClicked() {
		let frames = m_spriteData.frames;
		let index = -1;
		for( let i = 0; i < frames.length; i++ ) {
			if( frames[ i ].selected ) {
				index = i;
			}
			frames[ i ].selected = false;
		}

		let frame = {
			"x": parseInt( document.getElementById( "loadImageFrameX" ).value ),
			"y": parseInt( document.getElementById( "loadImageFrameY" ).value ),
			"width": parseInt( document.getElementById( "loadImageFrameWidth" ).value ),
			"height": parseInt( document.getElementById( "loadImageFrameHeight" ).value ),
			"selected": true
		};

		if( index === -1 || index + 1 === m_spriteData.frames.length ) {
			m_spriteData.frames.push( frame );
		} else {
			m_spriteData.frames.splice( index + 1, 0, frame );
		}
		m_spriteData.frameCount = m_spriteData.frames.length;
		updateSelAllFrame();
		selAllFramesChanged();
	}

	function btnRemoveFrameClicked() {
		addToUndostack( m_spriteData );
		let frames = m_spriteData.frames;
		for( let i = frames.length - 1; i >= 0; i-- ) {
			if( frames[ i ].selected ) {
				frames.splice( i, 1 );
			}
		}
		updateSelAllFrame();
		selAllFramesChanged();
	}

	function btnResetFramesClick() {
		addToUndostack( m_spriteData );
		m_spriteData = {
			"frameCount": 0,
			"frames": []
		};
		updateSelAllFrame();
		selAllFramesChanged();
	}

	function getMedian( list ) {
		list.sort( function (a, b ) {
			return a - b;
		} );
		let mid = Math.floor( list.length / 2 );
		if( list.length % 2 ) {
			return list[ mid ];
		}
		return ( list[ mid - 1 ] + list[ mid ] ) / 2;
	}

	function loadImageFileChanged( e ) {
		var fileInput, loadImageViewerDiv, loadImageSpriteForm, statsDiv,
			spritesheetCheck;

		fileInput = document.getElementById( "loadImageFile" );
		loadImageViewerDiv = document.getElementById( "loadImageViewer" );
		loadImageSpriteForm = document.getElementById( "loadImageSpriteForm" );
		spritesheetCheck = document.getElementById( "loadImageSpritesheet" );
		statsDiv = document.getElementById( "loadImageStats" );

		// Clear the image viewer
		if( m_$lastView ) {
			m_$lastView.removeScreen();
			m_$lastView = null;
		}
		loadImageViewerDiv.innerHTML = "";
		loadImageViewerDiv.style.backgroundImage = "";

		if( fileInput.value === "" ) {
			document.querySelector( ".loadImageMidSection" ).style.display = "none";
			document.getElementById( "loadImagePopup" ).classList.remove( "fullsize" );
			document.getElementById( "loadImagePopup" ).classList.remove( "midsize" );
			document.getElementById( "loadImageOk" ).disabled = "disabled";
			statsDiv.style.display = "none";
			spritesheetCheck.parentElement.style.display = "none";
			document.getElementById( "workspacePreview" ).style.display = "none";
		} else {
			document.getElementById( "loadImagePopup" ).classList.add( "fullsize" );
			document.getElementById( "loadImagePopup" ).classList.remove( "midsize" );
			// Load the image viewer based on data type
			if( m_imageTypes.indexOf( fileInput.files[ 0 ].type ) > - 1) {
				loadImageSpriteForm.style.display = "inline-block";
				spritesheetCheck.parentElement.style.display = "inline-block";
				loadImageSpritesheetChanged();
				loadImageViewer( fileInput.files[ 0 ] );
				statsDiv.style.display = "none";
				document.querySelector( ".loadImageMidSection" ).style.display = "";
				document.getElementById( "workspacePreview" ).style.display = "none";
			} else {
				loadImageSpriteForm.style.display = "none";
				statsDiv.style.display = "inline-block";
				//showHideSpriteSheetForm( true );
				document.querySelector( ".loadImageMidSection" ).style.display = "none";
				document.getElementById( "workspacePreview" ).style.display = "";
				loadPixelViewer( fileInput.files[ 0 ] );
			}

			// Remove the diasabled attribute from the ok button
			document.getElementById( "loadImageOk" )
				.removeAttribute( "disabled" );
		}
	}

	function loadPixelViewer( file ) {
		loadPixelFile( file, function ( data ) {
			var workspacePreview, i;

			// Get load image viewer
			workspacePreview = document.getElementById( "workspacePreview" );

			if( ! validatePixelFormat( data ) ) {
				workspacePreview.style.backgroundImage = "none";
				document.getElementById( "loadImagePictures" ).innerHTML = "";
				document.getElementById( "loadImageType" )
					.innerHTML = "Invalid File";
				document.getElementById( "loadImagePicturesTitle" )
					.innerHTML = "";
				document.getElementById( "loadImageOk" ).disabled = "disabled";
				return;
			}
			if( data.type === "workspace" ) {
				document.getElementById( "loadImagePopup" ).classList.add( "midsize" );
				document.getElementById( "loadImagePopup" ).classList.remove( "fullsize" );
				workspacePreview.style.backgroundImage = "none";
				workspacePreview.innerHTML = "<div class='important'>" +
					"<p>* Warning: Loading a new workspace will delete your current workspace.</p>" +
					"<p>* Make sure you download a copy of your current workspace " +
					"if you want to keep it.</p></div>";
				document.getElementById( "loadImageType" )
					.innerHTML = "Workspace";
				document.getElementById( "loadImagePictures" )
					.innerHTML = data.pictures.length;
				document.getElementById( "loadImagePicturesTitle" )
					.innerHTML = "Pictures:";
				/*createTempWorkspace( data.pictures, function ( pictures ) {
					let canvas = createSpriteSheet( pictures, 5, false, false );
					if( m_$lastView == null ) {
						m_$lastView = $.screen(
							canvas.width + "x" + canvas.height,
							document.getElementById( "workspacePreview" )
						);
					}
					m_$lastView.drawImage( canvas, 0, 0, 0, 0, 0, layer.alpha );
				} );*/

			} else if( data.type === "layers" ) {
				workspacePreview.innerHTML = "";
				document.getElementById( "loadImageType" )
					.innerHTML = "Image";
				document.getElementById( "loadImagePictures" )
					.innerHTML = data.pictures[ 0 ].length;
				document.getElementById( "loadImagePicturesTitle" )
					.innerHTML = "Layers:";
				for( i = 0; i < data.pictures[ 0 ].length; i++ ) {
					drawViewerLayer( data.pictures[ 0 ][ i ] );
				}
			}
		} );
	}

	/*
	function createTempWorkspace( pictures, final ) {
		let newPictures = [];
		for( let i = 0; i < pictures.length; i++ ) {
			let layer = pictures[ i ];
			newPictures.push( [] );
			for( let j = 0; j < layer.length; j++ ) {
				if( ! layer[ j ].hidden ) {
					newPictures[ i ].push( false );
					addPictureToWorkspace( newPictures, layer[ j ].img, i, j, final );
				}
			}
		}
	}

	function addPictureToWorkspace( pictures, img, index, jndex, final ) {
		loadImage( img, function ( canvas ) {
			pictures[ index ][ jndex ] = canvas;
			for( i = 0; i < pictures.length; i++ ) {
				for( i = 0; i < pictures.length; i++ ) {
					if( pictures[ i ][ j ] === false ) {
						return;
					}
				}
			}
			final( pictures );
		} );
	}
	*/

	function validatePixelFormat( data ) {
		var i, j, layer;

		if(
			! data.type ||
			! $.util.isArray( data.pictures ) ||
			data.pictures.length === 0
		) {
			return false;
		}

		for( i = 0; i < data.pictures.length; i++ ) {
			if( data.pictures[ i ].length === 0 ) {
				return false;
			}
			for( j = 0; j < data.pictures[ i ].length; j++ ) {
				layer = data.pictures[ i ][ j ];
				if(
					! $.util.isInteger( layer.alpha ) ||
					layer.hidden === undefined ||
					typeof layer.img !== "string" ||
					layer.img.indexOf( "data:image/png;base64" ) !== 0
				) {
					return false;
				}
			}
		}
		return true;
	}

	function drawViewerLayer( layer ) {
		loadImage( layer.img, function ( canvas ) {
			if( m_$lastView == null ) {
				m_$lastView = $.screen(
					canvas.width + "x" + canvas.height,
					document.getElementById( "workspacePreview" )
				);
			}
			m_$lastView.drawImage( canvas, 0, 0, 0, 0, 0, layer.alpha );
		}, true );
	}

	function loadPixelFile( file, callback ) {
		var blob;

		blob = new Blob( [ file ], { "type": "application/json" } );
		blob.text().then( function ( text ) {
			var data;

			try {
				data = JSON.parse( text );
			} catch( ex ) {
				data = {};
			}
			callback( data );
		} );
	}

	function loadImageViewer( file ) {
		loadImage( file, function ( canvas ) {
			var $view;

			$view = $.screen(
				canvas.width + "x" + canvas.height,
				document.getElementById( "loadImageViewer" )
			);
			$view.drawImage( canvas, 0, 0 );
			$.inkey( "Control" );
			$view.onmouse( "down", function ( mouse ) {
				if( !m_spriteData || !document.getElementById( "loadImageSpritesheet" ).checked ) {
					return;
				}
				m_spriteData.frames.forEach( function ( frame, index ) {
					let query = "#selAllFrames option[value='" + index + "']";
					let option = document.querySelector( query );
					if( ! $.inkey( "Control" ) ) {
						frame.selected = false;
						option.selected = false;
					}
					if(
						mouse.x >= frame.x && mouse.x <= frame.x + frame.width &&
						mouse.y >= frame.y && mouse.y <= frame.y + frame.height
					) {
						frame.selected = true;
						option.selected = true;
					}
				} );
				selAllFramesChanged();
			} );
			m_$lastView = $view;
			m_lastCanvas = canvas;
		} );
	}

	function drawSpriteSheetGrid( tempSpriteData ) {
		var colors, i, $temp, frame, selFrames;

		if( ! m_$lastView ) {
			return;
		}
		if( !tempSpriteData ) {
			tempSpriteData = m_spriteData;
		}
		m_$lastView.cls();
		m_$lastView.drawImage( m_lastCanvas );
		$temp = $.screen( m_$lastView.width() + "x" + m_$lastView.height(), null, true, true );

		// Draw outer white semi-transparent rectangle
		colors = [ pixel.color1, pixel.color2 ];
		$temp.setPen( "pixel", 1 );
		selFrames = [];
		for( i = 0; i < tempSpriteData.frames.length; i++ ) {
			frame = tempSpriteData.frames[ i ];
			$temp.setColor( colors[ i % 2 ] );
			$temp.rect(
				frame.x, frame.y, frame.width, frame.height, colors[ i % 2 ]
			);
			if( frame.selected ) {
				selFrames.push( i );
			}
		}

		for( i = 0; i < selFrames.length; i++ ) {
			frame = tempSpriteData.frames[ selFrames[ i ] ];
			$temp.setColor( "#00000088" );
			$temp.rect( frame.x, frame.y, frame.width, frame.height );
			$temp.setColor( "#88888888" );
			$temp.rect( frame.x + 1, frame.y + 1, frame.width - 2, frame.height - 2 );
			$temp.setColor( "#FFFFFF88" );
			$temp.rect( frame.x + 2, frame.y + 2, frame.width - 4, frame.height - 4 );
		}

		$temp.render();
		m_$lastView.drawImage( $temp, 0, 0 );
		$temp.removeScreen();
	}

	function removeSpriteSheetGrid() {
		if( m_$lastView ) {
			m_$lastView.cls();
			m_$lastView.drawImage( m_lastCanvas );
		}
	}

	function getInt( id ) {
		let input = document.getElementById( id );
		let val = parseInt( input.value );
		if( isNaN( val ) ) {
			val = 0;
		}
		let min = parseInt( input.min );
		if( !isNaN( min ) ) {
			if( val < min ) {
				val = min;
				input.value = min;
			}
		}
		return val;
	}

	function getLoadImageData() {
		var data;

		data = {
			"file": document.getElementById( "loadImageFile" ).files[ 0 ],
			"spritesheet": document.getElementById( "loadImageSpritesheet" ).checked,
			"width": getInt( "loadImageWidth" ),
			"height": getInt( "loadImageHeight" ),
			"marginX": getInt( "loadImageMarginX" ),
			"marginY": getInt( "loadImageMarginY" )
		};

		return data;
	}

	// Ok Button on New Image
	function newImageOkClicked() {
		var width, height, count, i;

		width = parseInt( document.getElementById( "newImageWidth" ).value );
		height = parseInt( document.getElementById( "newImageHeight" ).value );
		count = parseInt( document.getElementById( "newImageCount" ).value );

		// Validate input
		if( isNaN( width ) || width < 1 ) {
			width = 1;
		}
		if( isNaN( height ) || height < 1 ) {
			height = 1;
		}
		if( isNaN( count ) || count < 1 ) {
			count = 1;
		}

		if( document.getElementById( "newImageWorkspace" ).checked ) {
			pictureScript.deletePicture( "all" );
		}

		for( i = 0; i < count; i++ ) {
			pictureScript.createNewPicture( width, height );
		}

		hideNewImagePopup( document.getElementById( "newImagePopup" ) );
	}

	// New Image Cancelled
	function newImageCancelClicked() {
		hideNewImagePopup( document.getElementById( "newImagePopup" ) );
	}

	// Ok Button on Load Image
	function loadImageOkClicked() {
		var inputData;

		inputData = getLoadImageData();

		if( m_imageTypes.indexOf( inputData.file.type ) > - 1 ) {
			if( inputData.spritesheet && m_spriteData && m_spriteData.frames.length > 0 ) {
				importSpriteSheet(
					inputData.file, inputData.width, inputData.height, inputData.margin
				);
			} else {
				importImage( inputData.file );
			}
		} else {
			loadPixelFile( inputData.file, function ( data ) {
				var i;
				if( ! validatePixelFormat( data ) ) {
					alert( "Invalid data format" );
					return;
				}
				if( data.type === "workspace" ) {
					pictureScript.deletePicture( "all" );
				}
				for( i = 0; i < data.pictures.length; i++ ) {
					createPixelPicture( data.pictures[ i ] );
				}
			} );
		}

		hideNewImagePopup( document.getElementById( "loadImagePopup" ) );
	}

	function createPixelPicture( layers ) {
		var i;

		for( i = 0; i < layers.length; i++ ) {
			createPictureLayer( layers[ i ], i === 0, i === layers.length - 1 );
		}

	}

	function createPictureLayer( layer, isFirst, isLast ) {
		loadImage( layer.img, function ( canvas ) {
			if( isFirst ) {
				pictureScript.createNewPicture( canvas.width, canvas.height );
				layerScript.changeLayerAlpha(
					pixel.activeLayer.id, layer.alpha
				);
				layerScript.setLayerVisibility(
					pixel.activeLayer.id, layer.hidden
				);
				pixel.activeLayer.$screen.canvas().parentElement.parentElement
					.querySelector( "input[type=checkbox]" )
					.checked = ! layer.hidden;
				pixel.activeLayer.$screen.canvas().parentElement.parentElement
					.querySelector( "input[type=range]" )
					.value = layer.alpha;
			} else {
				layerScript.createNewLayer(
					pixel.activePicture, null, layer.alpha, layer.hidden
				);
			}
			pixel.activeLayer.$screen.drawImage( canvas, 0, 0 );
			layerScript.refreshTemp();
			layerScript.drawLayers();
			if( isLast ) {
				// Click on the first picture
				document.querySelectorAll( ".previewItem" )[ 0 ].click();
				document.querySelectorAll( ".layer-item" )[ 0 ].click();
			}
		}, true );
	}

	// Load Image Cancelled
	function loadImageCancelClicked() {
		hideNewImagePopup( document.getElementById( "loadImagePopup" ) );
	}

	function importSpriteSheet( file ) {
		m_spriteData.frames.forEach( function ( frame ) {
			pictureScript.createNewPicture( frame.width, frame.height );
			pixel.activeLayer.$screen.canvas().getContext( "2d" )
				.drawImage(
					m_lastCanvas,
					frame.x, frame.y, frame.width, frame.height,
					0, 0, frame.width, frame.height
				);
			layerScript.refreshTemp();
			layerScript.drawLayers();
		} );
	}

	function importImage( file ) {
		loadImage( file, function ( canvas ) {
			pictureScript.createNewPicture( canvas.width, canvas.height );
			pixel.activeLayer.$screen.drawImage( canvas, 0, 0 );
			layerScript.refreshTemp();
			layerScript.drawLayers();
		} );
	}

	function loadImage( file, callback, isSrc ) {
		var img, canvas, context;

		img = new Image();
		canvas = document.createElement( "canvas" );
		context = canvas.getContext( "2d" );
		if( isSrc ) {
			img.src = file;
		} else {
			img.src = URL.createObjectURL( file );
		}
		m_undoStack = [];
		document.getElementById( "btnUndoFrames" ).disabled = true;
		m_spriteData = {
			"frameCount": 0,
			"frames": []
		};
		updateSelAllFrame();
		img.onload = function() {
			$.loadSpritesheet( img, "spritesheet" );
			canvas.width = img.width;
			canvas.height = img.height;
			context.drawImage( img, 0, 0 );
			callback( canvas );
			if( ! isSrc ) {
				URL.revokeObjectURL( img.src );
			}
		};
	}

	function saveImageTypeChanged() {
		var saveImageType = document.getElementById( "saveImageType" );

		if( saveImageType.value === "spritesheet" ) {
			document.getElementById( "saveSpriteMarginX" )
				.parentElement.parentElement.style.display = "block";
				document.getElementById( "saveSpriteMarginY" )
				.parentElement.parentElement.style.display = "block";
			document.getElementById( "addFlipX" )
				.parentElement.parentElement.style.display = "block";
			document.getElementById( "addFlipY" )
				.parentElement.parentElement.style.display = "block";
		} else {
			document.getElementById( "saveSpriteMarginX" )
				.parentElement.parentElement.style.display = "none";
			document.getElementById( "saveSpriteMarginY" )
				.parentElement.parentElement.style.display = "none";
			document.getElementById( "addFlipX" )
				.parentElement.parentElement.style.display = "none";
			document.getElementById( "addFlipY" )
				.parentElement.parentElement.style.display = "none";
		}
	}

	function saveImageOkClicked() {
		var filename, spriteMarginX, spriteMarginY, addFlipX, addFlipY;

		filename = document.getElementById( "saveFilename" ).value;
		if( filename.length === 0 ) {
			filename = "image.png";
		}

		switch( document.getElementById( "saveImageType" ).value ) {
			case "workspace":
				saveWorkspace( filename );
				break;
			case "spritesheet":
				spriteMarginX = getInt( "saveSpriteMarginX" );
				spriteMarginY = getInt( "saveSpriteMarginY" );
				addFlipX = document.getElementById( "addFlipX" ).checked;
				addFlipY = document.getElementById( "addFlipY" ).checked;
				let canvas = createSpriteSheet( pixel.pictures, spriteMarginX, spriteMarginY, addFlipX, addFlipY );
				saveImage( canvas, filename );
				break;
			case "layers":
				saveLayers( filename );
				break;
			case "image":
				saveImage( pixel.activePicture.$preview.canvas(), filename );
				break;
		}

		hideNewImagePopup( document.getElementById( "saveImagePopup" ) );
	}

	function saveWorkspace( filename ) {
		var data, blob;

		data = {
			"name": filename,
			"type": "workspace",
			"pictures": getWorkspaceData()
		};

		blob = new Blob(
			[ JSON.stringify( data ) ],
			{ "type": "application/json" }
		);

		saveData( blob, filename + ".workspace.pixel" );
	}

	function getWorkspaceData() {
		var pictures, i;

		pictures = [];
		for( i = 0; i < pixel.pictures.length; i++ ) {
			pictures.push( getPictureData( pixel.pictures[ i ] ) );
		}
		return pictures;
	}

	function saveLayers( filename ) {
		var data, blob;

		data = {
			"name": filename,
			"type": "layers",
			"pictures": []
		};

		data.pictures.push( getPictureData( pixel.activePicture ) );

		blob = new Blob(
			[ JSON.stringify( data ) ],
			{ "type": "application/json" }
		);

		saveData( blob, filename + ".image.pixel" );
	}

	function getPictureData( picture ) {
		var layers, i, layerData;

		layers = [];
		for( i = 0; i < picture.orderedLayers.length; i++ ) {
			layerData = {
				"alpha": parseInt( picture.orderedLayers[ i ].alpha ),
				"hidden": !!( picture.orderedLayers[ i ].hidden ),
				"img": picture.orderedLayers[ i ].$screen.canvas().toDataURL()
			};
			layers.push( layerData );
		}

		return layers;
	}

	function createSpriteSheet( pictures, marginX, marginY, addFlipX, addFlipY ) {
		var width, height, i, frames, canvas, context, x, y, picture,
			tempCanvas, tempContext, action;

		// Get the dimensions from the largest picture
		width = 0;
		height = 0;
		for( i = 0; i < pictures.length; i++ ) {
			if( pictures[ i ].width > width ) {
				width = pictures[ i ].width;
			}
			if( pictures[ i ].height > height ) {
				height = pictures[ i ].height;
			}
		}

		frames = pictures.length;

		// Add additonal frames
		if( addFlipX ) {
			frames += pictures.length;
		}
		if( addFlipY ) {
			frames += pictures.length;
		}

		// Create the canvas
		canvas = document.createElement( "canvas" );
		canvas.width = Math.ceil( Math.sqrt( frames ) ) * ( width + marginX ) +
			marginX;
		canvas.height = Math.ceil( Math.sqrt( frames ) ) * ( height + marginY ) +
			marginY;
		context = canvas.getContext( "2d" );

		if( addFlipX || addFlipY ) {
			i = 0;
			tempCanvas = document.createElement( "canvas" );
			tempCanvas.width = width;
			tempCanvas.height = height;
			tempContext = tempCanvas.getContext( "2d" );
		}

		// Draw the sprites
		action = "drawImage";
		i = 0;
		for( y = marginY; y < canvas.height; y += height + marginY ) {
			for( x = marginX; x < canvas.width; x += width + marginX ) {
				picture = pictures[ i ];
				if( action === "drawImage" ) {
					context.drawImage( picture.$preview.canvas(), x, y );
				} else if( action === "flipX" || action === "flipY" ) {
					tempContext.clearRect( 0, 0, width, height );
					tempContext.drawImage(
						picture.$preview.canvas(), 0, 0
					);
					effectsScript.effectsFlip(
						action === "flipX", tempCanvas
					);
					context.drawImage( tempCanvas, x, y );
				}
				i += 1;
				if( i >= pictures.length ) {
					i = 0;
					if( action === "drawImage" ) {
						if( addFlipX ) {
							action = "flipX";
						} else if( addFlipY ) {
							action = "flipY";
						} else {
							action = "none";
						}
					} else if( action === "flipX" ) {
						if( addFlipY ) {
							action = "flipY";
						} else {
							action = "none";
						}
					} else {
						action = "none";
					}
				}
			}
		}

		return canvas;
	}

	function saveImage( canvas, filename ) {
		canvas.toBlob( function ( blob ) {
			saveData( blob, filename + ".png" );
		}, "image/png", 1.0 );
	}

	function saveData( blob, filename ) {
		var a;

		a = document.createElement( "a" );
		a.href = URL.createObjectURL( blob );
		a.download = filename;
		document.body.appendChild( a );
		a.click();
		a.parentElement.removeChild( a );
		URL.revokeObjectURL( a.href );
	}

	function saveImageCancelClicked() {
		hideNewImagePopup( document.getElementById( "saveImagePopup" ) );
	}

	// Hide image popup
	function hideNewImagePopup( popup ) {
		popup.style.display = "none";
		document.getElementById( "modalPopup" ).style.display = "none";

		// Restore the action keys
		pixel.setActionKeys();
	}

	// Copy picture
	function copyPictureButtonClicked() {
		var original = pixel.activePicture;
		pictureScript.createNewPicture( original.width, original.height );
		//pixel.activePicture.$temp.drawImage( original.$temp );
		layerScript.copyLayers( original );
		layerScript.refreshTemp();
		layerScript.drawLayers();
	}

	function saveImageButtonPopupClicked() {

		// Clear the action keys
		pixel.clearActionKeys();
	
		// Show the newImagePopup
		document.getElementById( "saveImagePopup" ).style.display = "block";
		document.getElementById( "modalPopup" ).style.display = "block";

		// Focus on the Ok button
		document.getElementById( "saveImageOk" ).focus();

	}

	// Delete picturew
	function deletePictureButtonClicked() {
		pictureScript.deletePicture( pixel.activePicture.id );
	}

	// Picture Script return API
	return {
		"initialize": initialize
	};

	// End of file encapsulation
} )();
