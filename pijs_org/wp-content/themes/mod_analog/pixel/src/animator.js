/*
animator.js
*/

"use strict";

// Controls Script Container
var animatorScript = ( function () {

	var m_animatorCanvas, m_animatorFrames, m_animatorFramesContainer, m_frames,
		m_index, m_paused, m_delay, m_count, m_bounce, m_dir, m_frameMargin;

	m_paused = true;
	m_delay = 15;
	m_dir = 1;
	m_index = 0;
	m_frames = [];
	m_frameMargin = 6;

	function initialize() {
		document.getElementById( "animatorButton" )
			.addEventListener( "click", openAnimator );
		document.getElementById( "animatorPlay" )
			.addEventListener( "click", animatorPlay );
		document.getElementById( "animatorInsertFrame" )
			.addEventListener( "click", animatorInsertFrame );
		document.getElementById( "animatorDeleteFrame" )
			.addEventListener( "click", animatorDeleteFrame );
		document.getElementById( "animatorResetFrames" )
			.addEventListener( "click", animatorResetFrames );
		document.getElementById( "animatorClose" )
			.addEventListener( "click", animatorClose );
		document.getElementById( "animatorPickFrameCancel" )
			.addEventListener( "click", animatorPickFrameClose );
		document.getElementById( "animatorDelay" )
			.addEventListener( "input", function () {
				m_delay = this.value;
			} );
		document.getElementById( "animatorBounce" )
			.addEventListener( "change", function () {
				m_bounce = this.checked;
				if( ! m_bounce ) {
					m_dir = 1;
				}
			} );
		document.getElementById( "animatorMoveFrameLeft" )
			.addEventListener( "click", animatorMoveFrameLeft );
		document.getElementById( "animatorMoveFrameRight" )
			.addEventListener( "click", animatorMoveFrameRight );
		window.addEventListener( "resize", resizeAnimator );
		m_animatorCanvas = document.getElementById( "animatorCanvas" );
		m_animatorFrames = document.getElementById( "animatorFrames" );
		m_animatorFramesContainer = document.getElementById(
			"animatorFramesContainer"
		);
		document.getElementById( "animatorSizeSelect" )
			.addEventListener( "change", animatorSizeSelect );
	}

	function animatorSizeSelect() {
		setAnimatorCanvasSize();
		if( m_frames.length > 0 ) {
			m_frames[ m_index ].click();
		}
	}

	function resizeAnimator() {
		updateFrames();
		setAnimatorCanvasSize();
		if( m_frames.length > 0 ) {
			m_frames[ m_index ].click();
		}
	}

	function openAnimator() {

		// Show the animator popup
		document.getElementById( "animatorPopup" ).style.display = "block";
		document.getElementById( "modalPopup" ).style.display = "block";

		updateFrames();
		updateButtons();
		setAnimatorCanvasSize();
		if( m_frames.length > 0 ) {
			if( m_index >= m_frames.length ) {
				m_index = m_frames.length - 1;
			}
			m_frames[ m_index ].click();
		}
	}

	function updateFrames() {
		var i, frame, context, picture, preview, height, totalWidth;
		height = getHeight();
		totalWidth = 0;
		for( i = m_frames.length - 1; i >= 0; i-- ) {
			frame = m_frames[ i ];
			setFrameSize( frame, height );
			totalWidth += frame.offsetWidth + m_frameMargin;
			picture = pixel.pictures[ parseInt( frame.dataset.pictureId ) ];
			if( ! picture ) {
				frame.parentElement.removeChild( frame );
				m_frames.splice( i, 1 );
				continue;
			}
			context = frame.getContext( "2d" );
			context.clearRect( 0, 0, frame.width, frame.height );
			preview = picture.$preview.canvas();
			context.drawImage( preview, 0, 0 );
		}
		m_animatorFrames.style.width = totalWidth + "px";
		if( m_index >= m_frames.length ) {
			m_index = m_frames.length - 1;
		}
	}

	function animatorPlay() {
		if( m_paused ) {
			document.getElementById( "animatorPlay" ).value = "Pause";
			m_count = 0;
			m_dir = 1;
			m_paused = false;
			requestAnimationFrame( animate );
		} else {
			document.getElementById( "animatorPlay" ).value = "Play";
			m_paused = true;
		}
		updateButtons();
	}

	function animate() {
		m_count += 1;
		if( m_count >= m_delay ) {
			m_frames[ m_index ].click();
			m_index += m_dir;
			m_count = 0;
			if( m_index >= m_frames.length || m_index < 0 ) {
				if( m_bounce ) {
					m_dir *= -1;
					m_index += m_dir;
				} else {
					m_index = 0;
				}
			}
		}
		if( ! m_paused ) {
			requestAnimationFrame( animate );
		}
	}

	function animatorInsertFrame() {
		var animatorPickFrame, animatorSelectFrame;

		animatorPickFrame = document.getElementById( "animatorPickFrame" );
		animatorPickFrame.style.display = "block";
		animatorSelectFrame = document.getElementById( "animatorSelectFrame" );
		animatorSelectFrame.innerHTML = "";
		buildFrames( animatorSelectFrame, insertFrame, 100 );
	}

	function insertFrame() {
		var nodes, referenceNode;
		nodes = m_animatorFrames.querySelectorAll( "canvas" );
		if( nodes.length > m_index ) {
			referenceNode = nodes[ m_index ];
		}
		buildFrame(
			this,
			parseInt( this.dataset.pictureId ),
			m_index,
			selectFrame,
			getHeight(),
			m_animatorFrames,
			referenceNode
		);
		animatorPickFrameClose();
		reorderFrames();
		if( m_index + 1 < m_frames.length ) {
			m_frames[ m_index + 1 ].click();
		} else {
			m_frames[ m_index ].click();
		}
	}

	function reorderFrames() {
		var i, width;

		m_frames = m_animatorFrames.querySelectorAll( "canvas" );
		m_frames = Array.prototype.slice.call( m_frames, 0 );
		width = 0;
		for( i = 0; i < m_frames.length; i++ ) {
			m_frames[ i ].dataset.frame = i;
			width += m_frames[ i ].offsetWidth + m_frameMargin;
		}
		m_animatorFrames.style.width = width + "px";
		setAnimatorCanvasSize();
		updateButtons();
	}

	function animatorDeleteFrame() {
		if( m_frames.length > m_index ) {
			m_animatorFrames.removeChild( m_frames[ m_index ] );
		}
		reorderFrames();
		if( m_frames.length > m_index ) {
			m_frames[ m_index ].click();
		} else if( m_frames.length > m_index - 1 ) {
			m_frames[ m_index - 1 ].click();
		}
	}

	function updateButtons() {
		if( ! m_paused ) {
			document.getElementById( "animatorInsertFrame" ).disabled = true;
			document.getElementById( "animatorDeleteFrame" ).disabled = true;
			document.getElementById( "animatorMoveFrameLeft" ).disabled = true;
			document.getElementById( "animatorMoveFrameRight" ).disabled = true;
			document.getElementById( "animatorResetFrames" ).disabled = true;
			return;
		} else {
			document.getElementById( "animatorInsertFrame" ).disabled = false;
			document.getElementById( "animatorDeleteFrame" ).disabled = false;
			document.getElementById( "animatorMoveFrameLeft" ).disabled = false;
			document.getElementById( "animatorMoveFrameRight" )
				.disabled = false;
			document.getElementById( "animatorResetFrames" ).disabled = false;
		}
		if( m_frames.length > 0 ) {
			// <input type="button" value="Play" id="animatorPlay" class="button button-long" />
			// <input type="button" value="Insert Frame" id="animatorInsertFrame" class="button button-long" />
			// <input type="button" value="Delete Frame" id="animatorDeleteFrame" class="button button-long" />
			// <input type="button" value="Reset Frames" id="animatorResetFrames" class="button button-long" />
			// <input type="button" value="&lt;&lt;" id="animatorMoveFrameLeft" class="button button-long" />
			// <input type="button" value="&gt;&gt;" id="animatorMoveFrameRight" class="button button-long" />
			// <input type="button" value="Close" id="animatorClose" class="button button-long" />
			document.getElementById( "animatorPlay" ).disabled = false;
			document.getElementById( "animatorDeleteFrame" ).disabled = false;
			if( m_index > 0 ) {
				document.getElementById( "animatorMoveFrameLeft" )
					.disabled = false;
			} else {
				document.getElementById( "animatorMoveFrameLeft" )
					.disabled = true;
			}
			if( m_index < m_frames.length - 1 ) {
				document.getElementById( "animatorMoveFrameRight" )
					.disabled = false;
			} else {
				document.getElementById( "animatorMoveFrameRight" )
					.disabled = true;
			}
		} else {
			document.getElementById( "animatorPlay" ).disabled = true;
			document.getElementById( "animatorDeleteFrame" ).disabled = true;
			document.getElementById( "animatorMoveFrameLeft" )
				.disabled = true;
			document.getElementById( "animatorMoveFrameRight" )
				.disabled = true;
		}
	}

	function getHeight() {
		var scrollBarHeight;

		scrollBarHeight = m_animatorFrames.offsetHeight -
			m_animatorFrames.clientHeight;

		return m_animatorFrames.offsetHeight - scrollBarHeight - m_frameMargin;
	}

	function animatorResetFrames() {
		var width;

		m_animatorFrames.innerHTML = "";
		width = buildFrames(
			m_animatorFrames,
			selectFrame,
			getHeight()
		);
		m_animatorFrames.style.width = width + "px";
		setAnimatorCanvasSize();
		m_animatorFrames.querySelector( "canvas" ).click();
		updateButtons();
	}

	function buildFrames( container, clickEvent, height ) {
		var i, picture, width;

		width = 0;
		for( i = 0; i < pixel.pictures.length; i++ ) {
			picture = pixel.pictures[ i ];

			width += buildFrame(
				picture.$preview.canvas(), i, i, clickEvent, height, container
			);
		}

		m_frames = document.getElementById( "animatorFrames" )
			.querySelectorAll( "canvas" );
		m_frames = Array.prototype.slice.call( m_frames, 0 );
		return width;
	}

	function buildFrame(
		image, pictureId, frame, clickEvent, height, container, referenceNode
	) {
		var canvas, context, ratio;

		canvas = document.createElement( "canvas" );
		canvas.className = optionsTool.getBackground();
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.dataset.frame = frame;
		canvas.dataset.pictureId = pictureId;
		ratio = canvas.height / canvas.width;
		canvas.style.height = height + "px";
		canvas.style.width = ( height * ratio ) + "px";
		context = canvas.getContext( "2d" );
		context.drawImage( image, 0 , 0 );
		if( referenceNode ) {
			container.insertBefore( canvas, referenceNode.nextSibling );
		} else {
			container.appendChild( canvas );
		}
		canvas.addEventListener( "click", clickEvent );

		return ( height * ratio ) + m_frameMargin;
	}

	function setFrameSize( canvas, height ) {
		var ratio;

		ratio = canvas.height / canvas.width;
		canvas.style.height = height + "px";
		canvas.style.width = ( height * ratio ) + "px";
	}

	function setAnimatorCanvasSize() {
		var factorX, factorY, factor, width, height, maxWidth, maxHeight,
			animatorWindow, finalWidth, finalHeight, id, size;

		if( pixel.pictures.length === 0 ) {
			return;
		}
		animatorWindow = document.getElementById( "animatorWindow" );
		if( m_frames.length === 0 ) {
			m_animatorCanvas.style.display = "none";
			return;
		}
		m_animatorCanvas.style.display = "inline";
		id = parseInt( m_frames[ 0 ].dataset.pictureId );
		size = parseInt(
			document.getElementById( "animatorSizeSelect" ).value
		) / 100;
		maxWidth = animatorWindow.offsetWidth;
		maxHeight = animatorWindow.offsetHeight;
		width = pixel.pictures[ id ].width;
		height = pixel.pictures[ id ].height;
		if( size === 0 ) {
			factorX = 1;
			factorY = 1;
		} else {
			factorX = Math.floor( ( maxWidth * size ) / width );
			factorY = Math.floor( ( maxHeight * size ) / height );
		}
		if( factorX > factorY ) {
			factor = factorY;
		} else {
			factor = factorX;
		}
		if( factor < 1 ) {
			factor = 1;
		}
		finalWidth = Math.round( width * factor );
		finalHeight = Math.round( height * factor );
		m_animatorCanvas.style.width = finalWidth + "px";
		m_animatorCanvas.style.height = finalHeight + "px";
		m_animatorCanvas.style.marginLeft = ( maxWidth - finalWidth ) / 2 + "px";
		m_animatorCanvas.style.marginTop = ( maxHeight - finalHeight ) / 2 + "px";
		m_animatorCanvas.width = width;
		m_animatorCanvas.height = height;
	}

	function selectFrame() {
		var context;

		pixel.selectItem(
			this, "selected-tool", "#animatorFrames .selected-tool"
		);
		context = m_animatorCanvas.getContext( "2d" );
		context.clearRect(
			0, 0, m_animatorCanvas.width, m_animatorCanvas.height
		);
		context.drawImage( this, 0, 0 );

		if( this.offsetLeft > m_animatorFramesContainer.offsetWidth ) {
			m_animatorFramesContainer.scrollLeft = this.offsetLeft;
		} else if( this.offsetLeft  < m_animatorFramesContainer.scrollLeft ) {
			m_animatorFramesContainer.scrollLeft = this.offsetLeft;
		}

		m_index = parseInt( this.dataset.frame );
		if( m_paused ) {
			updateButtons();
		}
	}

	function animatorClose() {
		document.getElementById( "animatorPopup" ).style.display = "none";
		document.getElementById( "modalPopup" ).style.display = "none";
		m_paused = true;
		document.getElementById( "animatorPlay" ).value = "Play";
	}

	function animatorPickFrameClose() {
		document.getElementById( "animatorPickFrame" ).style.display = "none";
	}

	function animatorMoveFrameLeft() {
		var frame, parent;

		frame = m_frames[ m_index ];
		parent = frame.parentElement;
		parent.insertBefore( frame, frame.previousSibling );
		reorderFrames();
		frame.click();
	}

	function animatorMoveFrameRight() {
		var frame, parent;

		frame = m_frames[ m_index ];
		parent = frame.parentElement;
		parent.insertBefore( frame, frame.nextSibling.nextSibling );
		reorderFrames();
		frame.click();
	}

	// Picture Script return API
	return {
		"initialize": initialize,
		"openAnimator": openAnimator,
		"closeAnimator": animatorClose
	};

	// End of file encapsulation
} )();
