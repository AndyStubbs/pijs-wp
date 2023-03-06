"use strict";

( function () {
	let g_level = {
		"tileset": "tileset",
		"blockWidth": 16,
		"blockHeight": 24,
		"width": 64,
		"height": 16,
		"map": `
...............................................................
...............................................................
...................................................IIII........
..................................III.....................I....
.....................9AB.......................................
............IIII.....FGH....IIIIII.................IIII........
.........I.................IIIIIII......I...............I......
..I.......................IIIIIIII.............................
01111111111111111111111111111111111111112..02.....0111111111111
34444444444444444444444444444444444444445..35....04444444444444
344444444444444444444444444445..444444445..35...044444444444444
34444444444444444444444444445..............35..0444444444444444
34444444444444444444444444445..0111111111118..04444444444444444
34444444444444444444444444445................044444444444444444
344444444444444444444444444444444444444444444444444444444444444
	`
	};
	let g_camera = {
		"x": 5,
		"y": 0,
		"offsetX": 10,
		"offsetY": 4
	};
	let g_lastTime = 0;
	let g_player = {
		"x": 5,
		"y": 5,
		"nextX": 5,
		"nextY": 5,
		"vx": 0,
		"vy": 0,
		"grounded": false,
		"isMoving": false,
		"c": 5,
		"gravityUp": 20,
		"gravityDown": 30,
		"coyoteTime": 0,
		"coyoteMax": 0.3,
		"maxRunningSpeed": 15,
		"maxWalkingSpeed": 5,
		"maxSpeed": 5,
		"runningAcceleration": 20,
		"walkingAcceleration": 10,
		"acceleration": 10,
		"walkingJump": 5.5,
		"runningJump": 7,
		"jump": 5.5,
		"name": "player",
		"walkingAnimation": [ 0, 1, 2, 3, 4, 5 ],
		"idleAnimation": [ 6, 7, 8, 9, 10, 11, 12, 13 ],
		"jumpAnimation": [ 14, 15 ],
		"fallingAnimation": [ 16, 20 ],
		"flippingAnimation": [ 17, 18, 19 ],
		"landingAnimation": [ 20, 21 ],
		"animation": "idleAnimation",
		"animationDelay": 150,
		"animationDelayRunning": 100,
		"animationDelayWalking": 150,
		"lastAnimationTime": 0,
		"animationFrame": 0,
		"animationOffsetX": -0.25,
		"animationOffsetY": 0,
		"animationFrameOffset": 0
	};

	let g_started = false;
	let g_paused = true;
	let g_pausedMessageShown = false;

	if( !g_fullscreen ) {
		$.setDefaultInputFocus( "showcase" );
		document.querySelector( "#showcase" ).onblur = function () {
			g_paused = true;
			g_pausedMessageShown = false;
		};
		document.querySelector( "#showcase" ).onfocus = function () {
			g_paused = false;
			g_pausedMessageShown = false;
			requestAnimationFrame( run );
		};
		document.querySelector( "#instructions" ).innerHTML = "Instructions: <br />" +
			"Use left/right arrow keys to move<br />Up to jump<br />Hold shift to run";
	} else {
		g_paused = false;
	}
	$.setActionKey( "ArrowUp" );
	$.setActionKey( "ArrowLeft" );
	$.setActionKey( "ArrowDown" );
	$.setActionKey( "ArrowRight" );

	$.loadSpritesheet( g_showcaseLink + "demo.png", "demo", 16, 24, 1 );
	$.loadSpritesheet( g_showcaseLink + "player.png", g_player.name, 16, 24, 1 );
	$.loadSpritesheet( g_showcaseLink + "tileset.png", "tileset", 16, 24, 1 );
	$.loadImage( g_showcaseLink + "clouds.png", "clouds" );
	$.loadImage( g_showcaseLink + "mountains.png", "mountains" );
	$.ready( start );
	function start() {
		if( g_fullscreen ) {
			$.screen( "300x200" );
		} else {
			$.screen( "300x200", "showcase" );
		}
		g_lastTime = performance.now();
		run( g_lastTime );
	}
	
	function run( timestamp ) {
		if( g_paused ) {
	
			if( ! g_started ) {
				$.drawImage( "demo", 0, 0 );
			}

			// Draw a rectangle behind text
			$.setColor( "white" );
			$.rect( 35, 85, 225, 28, "#363636" );
	
			// Print text shadow
			let row = Math.round( $.getRows() / 2 ) - 1;
			$.setPos( 0, row );
			$.setColor( "black" );
			$.print( "Game Paused - Click here to contiue", false, true );
	
			// Print text over
			$.setColor( "white" );
			$.setPos( 0, row );
			let posPx = $.getPosPx();
			$.setPosPx( posPx.x - 1, posPx.y - 1 );
			$.print( "Game Paused - Click here to contiue", false, true );

			return;
		}
		g_started = true;
		let dt = $.util.clamp( ( timestamp - g_lastTime ) / 1000, 0, 0.1 );
		input( dt );
		movePlayer( dt );
		detectCollisions();
		finalizeMovement();
		animate( timestamp );
		$.cls();
		$.setColor( "rgb(34, 32, 52)" );
		$.rect( 0, 0, 300, 200, "rgb(34, 32, 52)" );
		drawBackground();
		drawTiles();
		drawSprite( g_player );
		$.setPos( 0, 0 );
		$.setColor( 9 );
		$.print( g_player.x.toFixed( 2 ) + ", " + g_player.y.toFixed( 2 ) );
		$.print( g_player.coyoteTime.toFixed( 2 ) );
		if( canJump() ) {
			$.print( "Yes" );
		} else {
			$.print( "No" );
		}
		g_lastTime = timestamp;
		requestAnimationFrame( run );
	}
	
	function input( dt ) {
		if( $.inkey( "ArrowLeft") ) {
			g_player.vx -= g_player.acceleration * dt;
			g_player.isMoving = true;
			g_player.animationFrameOffset = 22;
		} else if( $.inkey( "ArrowRight") ) {
			g_player.vx += g_player.acceleration * dt;
			g_player.isMoving = true;
			g_player.animationFrameOffset = 0;
		} else {
			g_player.isMoving = false;
		}
		if( g_player.grounded ) {
			if(  $.inkey( "Shift" ) ) {
				g_player.maxSpeed = g_player.maxRunningSpeed;
				g_player.jump = g_player.runningJump;
				g_player.animationDelay = g_player.animationDelayRunning;
			} else {
				g_player.maxSpeed = g_player.maxWalkingSpeed;
				g_player.jump = g_player.walkingJump;
				g_player.animationDelay = g_player.animationDelayWalking;
			}
		}
		if(
			(
				( g_player.grounded && canJump() ) ||
				 ( g_player.coyoteTime < g_player.coyoteMax && g_player.coyoteTime !== 0 )
			) &&
				$.inkey( "ArrowUp")
		) {
			g_player.vy = -1 * g_player.jump;
		}
	}
	
	function canJump() {
		return getTile( g_player.x, g_player.y - 1 ) === "." &&
			getTile( g_player.x + 1, g_player.y - 1 ) === ".";
	}
	
	function movePlayer( dt ) {
		// Gravity
		let g = 0;
		if( g_player.vy > 0 ) {
			g = g_player.gravityDown;
		} else {
			g = g_player.gravityUp;
		}
		g_player.vy += g * dt;
	
		// Drag
		if( !g_player.isMoving ) {
			g_player.vx += -10 * g_player.vx * dt;
			if( Math.abs( g_player.vx ) < 0.01 ) {
				g_player.vx = 0;
			}
		}
	
		g_player.vx = $.util.clamp( g_player.vx, -g_player.maxSpeed, g_player.maxSpeed );
		g_player.vy = $.util.clamp( g_player.vy, -100, 100 );
		let movementX = $.util.clamp( g_player.vx * dt, -1, 1 );
		let movementY = $.util.clamp( g_player.vy * dt, -1, 1 );
		g_player.nextX = g_player.x + movementX;
		g_player.nextY = g_player.y + movementY;
		if( !g_player.grounded ) {
			g_player.coyoteTime += dt;
		}
		g_camera.x = g_player.x - g_camera.offsetX;
		g_camera.y = g_player.y - g_camera.offsetY;
	}
	
	function detectCollisions() {
		g_player.grounded = false;
		if( g_player.vx > 0 ) {
			// Move Right
			if(
				getTile( g_player.nextX + 1, g_player.y ) !== "." ||
				getTile( g_player.nextX + 1, g_player.y + 0.9 ) !== "."
			) {
				g_player.nextX = Math.floor( g_player.nextX );
				g_player.vx = 0;
			}
		} else {
			// Move Left
			if(
				getTile( g_player.nextX, g_player.y ) !== "." ||
				getTile( g_player.nextX, g_player.y + 0.9 ) !== "."
			) {
				g_player.nextX = Math.floor( g_player.nextX ) + 1;
				g_player.vx = 0;
			}
		}
		if( g_player.vy > 0 ) {
			// Move Down
			if(
				getTile( g_player.nextX, g_player.nextY + 1 ) !== "." ||
				getTile( g_player.nextX + 0.9, g_player.nextY + 1 ) !== "."
			) {
				g_player.nextY = Math.floor( g_player.nextY );
				g_player.vy = 0;
				g_player.grounded = true;
				g_player.coyoteTime = 0;
			}
		} else {
			// Move Up
			if(
				getTile( g_player.nextX, g_player.nextY ) !== "." ||
				getTile( g_player.nextX + 0.9, g_player.nextY ) !== "."
			) {
				g_player.nextY = Math.floor( g_player.nextY ) + 1;
				g_player.vy = 0;
			}
		}
	}
	
	function setAnimation( sprite, state ) {
		if( sprite.animation !== state ) {
			sprite.animation = state;
			let animation = sprite[ sprite.animation ];
			if( sprite.animationFrame >= animation.length ) {
				sprite.animationFrame = 0;
			}
		}
	}
	
	function animate( timestamp ) {
		if( g_player.grounded ) {
			if( g_player.isMoving ) {
				setAnimation( g_player, "walkingAnimation" );
			} else {
				setAnimation( g_player, "idleAnimation" );
			}
		} else {
			if( g_player.vy < 0 ) {
				setAnimation( g_player, "jumpAnimation" );
			} else {
				setAnimation( g_player, "fallingAnimation" );
			}
		}
	
		if( g_player.lastAnimationTime + g_player.animationDelay <= timestamp ) {
			g_player.animationFrame += 1;
			let animation = g_player[ g_player.animation ];
			if( g_player.animationFrame >= animation.length ) {
				g_player.animationFrame = 0;
			}
			g_player.lastAnimationTime = timestamp;
		}
	}
	
	function finalizeMovement() {
		g_player.x = g_player.nextX;
		g_player.y = g_player.nextY;
	}
	
	function drawBackground() {
		let o1x = Math.round( ( g_camera.x * g_level.blockWidth ) * -0.15 ) - 128;
		let o1y = Math.round( ( g_camera.y * g_level.blockHeight ) * -0.15 ) - 32;
		let o2x = Math.round( ( g_camera.x * g_level.blockWidth ) * -0.35 ) - 128;
		let o2y = Math.round( ( g_camera.y * g_level.blockHeight ) * -0.35 );
		$.drawImage( "clouds", o1x, o1y );
		$.drawImage( "clouds", o1x + 256, o1y );
		$.drawImage( "clouds", o1x + 512, o1y );
		$.drawImage( "mountains", o2x, o2y );
		$.drawImage( "mountains", o2x + 256, o2y );
		$.drawImage( "mountains", o2x + 512, o2y );
	}
	
	function drawTiles() {
		for( let i = 0; i < g_level.map.length; i++ ) {
			let y = Math.floor( i / g_level.width );
			let x = i % g_level.width;
			let tile = g_level.map[ i ];
			drawTile( tile, x, y );
		}
	}
	
	function drawTile( tile, x, y ) {
		let c = 0;
		let tx = Math.round( ( x - g_camera.x ) * g_level.blockWidth );
		let ty = Math.round( ( y - g_camera.y ) * g_level.blockHeight );
		let tiles = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let index = tiles.indexOf( tile );
		if( index === -1 ) {
			return;
		}
		$.drawSprite( g_level.tileset, tiles.indexOf( tile ), tx, ty );
	}
	
	function drawSprite( sprite ) {
		let tx = Math.round( ( sprite.x - g_camera.x ) * g_level.blockWidth );
		let ty = Math.round( ( sprite.y - g_camera.y ) * g_level.blockHeight );
		let animation = sprite[ sprite.animation ];
		let offX = sprite.animationOffsetX;
		$.drawSprite( sprite.name, animation[ sprite.animationFrame ] + sprite.animationFrameOffset, tx - offX, ty );
	}
	
	function getTile( x, y ) {
		x = Math.floor( x );
		y = Math.floor( y );
		if( x >= 0 && x <= g_level.width && y >= 0 && y <= g_level.height ) {
			return g_level.map[ y * g_level.width + x ];
		}
	}

}() );
