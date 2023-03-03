( function () {

	var g_dir, g_width, g_height, g_jewelsSprite, g_jewels, g_lastCursor,
		g_lineMsg, $screen1, $screen2, g_alpha, g_score, g_lives,
		g_sounds, g_enemies, g_soundsCreated, g_isRunning, g_highScores,
		g_gameInterval, g_levelId, g_startLives, g_thiefWidth, g_thiefHeight,
		g_levels, g_time, g_lastTime, g_extraLifeScore, g_thief, g_bombs,
		g_bombInterval, g_sizzleAudio, g_bombAudio, g_bombCount, g_maxBombs,
		g_digits;

	document.getElementById( "showcase" ).style.marginTop = "100px";
	//console.log( "Starting Sneaky Thief - " + ( new Date() ).getTime() );
	g_time = 0;
	g_lastTime = 0;
	g_levelId = 0;
	g_startLives = 3;
	g_extraLifeScore = 1000;
	g_width = 600;
	g_height = 400;
	g_thiefWidth = 5;
	g_thiefHeight = 12;
	g_bombCount = 0;
	g_maxBombs = 15;
	g_thief = {
		"x": 0,
		"y": 0,
		"width": 5,
		"height": 12,
		"frame": 0,
		"pixelsTraveled": 0,
		"trails": [],
		"lastFrame": ( new Date() ).getTime(),
		"noHit": false,
		"offsetX": 0,
		"offsetY": 0
	};
	$.loadSpritesheet( g_showcaseLink + "pirate.png", "pirate", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "parrot.png", "parrot", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "shark.png", "shark", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "jewels.png", "jewels", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "pirate-sword.png", "pirate-sword", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "dog.png", "dog", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "bat.png", "bat", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "spider.png", "spider", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "snake.png", "snake", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "snake-green.png", "snake-green", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "bomb.png", "bomb", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "clouds.png", "clouds", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "digits.png", "digits", 12, 12, 1 );
	$.loadSpritesheet( g_showcaseLink + "scorpian.png", "scorpian", 32, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "cat2.png", "cat", 34, 32, 1 );
	$.loadSpritesheet( g_showcaseLink + "monkey.png", "monkey", 32, 32, 1 );

	g_digits = [];
	g_jewels = [];
	g_enemies = [];
	g_bombs = [];
	g_alpha = 255;
	g_score = 0;
	g_lives = g_startLives;
	g_sounds = {};
	g_soundsCreated = false;
	g_isRunning = false;
	g_highScores = [
		[ "Sneaky Pirate - Highscores" ],
		[ "#", "Name", "Score", "Level" ],
		[ 1, "Henry Morgan", 4200, 6 ],
		[ 2, "William Kidd", 2000, 5 ],
		[ 3, "Francis Drake", 1200, 4 ],
		[ 4, "Edward Teach", 1000, 4 ],
		[ 5, "Mary Read", 600, 3 ],
		[ 6, "Thomas Tew", 500, 3 ],
		[ 7, "Henry Every", 250, 2 ],
		[ 8, "Howell Davis", 200, 2 ],
		[ 9, "Captain Hook", 50, 1 ],
		[ 10, "Smee", 35, 1 ],
	];
	g_levels = [
		{
			"name": "Parrot Bay",
			"image": "bgParrotBay",
			"jewelGridFactor": 5,
			"enemyGridFactor": 3,
			"jewels": [ {
					"create": createCoinJewel,
					"count": 8
				}, {
					"create": createDiamondJewel,
					"count": 2
				}
			],
			"enemies": [ { "create": createParrotEnemy, "count": 7 } ],
			"bombs": 0,
		}, {
			"name": "Shallow Ocean",
			"image": "bgShallowOcean",
			"jewelGridFactor": 5,
			"enemyGridFactor": 3,
			"jewels": [ {
					"create": createCoinJewel,
					"count": 8
				}, {
					"create": createDiamondJewel,
					"count": 5
				}
			],
			"enemies": [ { "create": createSharkEnemy, "count": 7 } ],
			"bombs": 0,
		}, {
			"name": "Pirate City",
			"image": "bgPirateCity",
			"jewelGridFactor": 6,
			"enemyGridFactor": 3,
			"jewels": [ {
					"create": createCoinJewel,
					"count": 5
				}, {
					"create": createDiamondJewel,
					"count": 3
				}, {
					"create": createRubyJewel,
					"count": 3
				}
			],
			"enemies": [
				{ "create": createPirateSwordEnemy, "count": 4 },
				{ "create": createParrotEnemy, "count": 3 },
				{ "create": createDogEnemy, "count": 1 }
			]
		}, {
			"name": "Skull Cavern",
			"image": "bgSkullCavern",
			"jewelGridFactor": 6,
			"enemyGridFactor": 4,
			"jewels": [ {
					"create": createCoinJewel,
					"count": 5
				}, {
					"create": createDiamondJewel,
					"count": 3
				}, {
					"create": createRubyJewel,
					"count": 3
				}, {
					"create": createTreasureJewel,
					"count": 1
				}
			],
			"enemies": [
				{ "create": createBatEnemy, "count": 6 },
				{ "create": createSpiderEnemy, "count": 3 }
			],
			"bombs": 2,
		}, {
			"name": "High Desert Plain",
			"image": "bgHighPlainsDesert",
			"jewelGridFactor": 6,
			"enemyGridFactor": 4,
			"jewels": [ {
					"create": createCoinJewel,
					"count": 5
				}, {
					"create": createDiamondJewel,
					"count": 5
				}, {
					"create": createRubyJewel,
					"count": 5
				}, {
					"create": createTreasureJewel,
					"count": 3
				}
			],
			"enemies": [
				{ "create": createSnakeEnemy, "count": 4 },
				{ "create": createScorpianEnemy, "count": 4 },
				{ "create": createSnakeGreenEnemy, "count": 1 }
			],
			"bombs": 3
		}, {
			"name": "The Wild Jungle",
			"image": "bgJungle",
			"jewelGridFactor": 6,
			"enemyGridFactor": 4,
			"jewels": [ {
					"create": createCoinJewel,
					"count": 2
				}, {
					"create": createDiamondJewel,
					"count": 7
				}, {
					"create": createRubyJewel,
					"count": 5
				}, {
					"create": createTreasureJewel,
					"count": 5
				}
			],
			"enemies": [
				{ "create": createScorpianEnemy, "count": 4 },
				{ "create": createMonkeyEnemy, "count": 3 },
				{ "create": createParrotEnemy, "count": 2 },
				{ "create": createPantherEnemy, "count": 1 }
			],
			"bombs": 3
		}
	];

	$.ready( setupGame );

	function createTreasureJewel( x, y ) {
		var frames = [ 0, 1, 2, 3, 2, 1 ];

		return {
			"x": x,
			"y": y,
			"dx": 0,
			"dy": 0,
			"index": Math.floor( Math.random() * frames.length ),
			"frames": frames,
			"lastFrame": ( new Date() ).getTime() +
				Math.floor( Math.random() * 100 ),
			"animationSpeed": Math.floor( Math.random() * 300 ) + 200,
			"score": 50,
			"sprite": "jewels",
			"reverseFrame": 0,
			"width": 9,
			"height": 10,
			"offsetX": 0,
			"offsetY": 0
		};
	}

	function createDiamondJewel( x, y ) {
		var frames = [ 4, 5, 6, 7, 6, 5 ];

		return {
			"x": x,
			"y": y,
			"dx": 0,
			"dy": 0,
			"index": Math.floor( Math.random() * frames.length ),
			"frames": frames,
			"lastFrame": ( new Date() ).getTime() +
				Math.floor( Math.random() * 100 ),
			"animationSpeed": Math.floor( Math.random() * 300 ) + 200,
			"score": 10,
			"sprite": "jewels",
			"reverseFrame": 0,
			"width": 5,
			"height": 5,
			"offsetX": 0,
			"offsetY": 0
		};
	}

	function createCoinJewel( x, y ) {
		var frames = [ 8, 9, 10, 11, 10, 9 ];

		return {
			"x": x,
			"y": y,
			"dx": 0,
			"dy": 0,
			"index": Math.floor( Math.random() * frames.length ),
			"frames": frames,
			"lastFrame": ( new Date() ).getTime() +
				Math.floor( Math.random() * 100 ),
			"animationSpeed": Math.floor( Math.random() * 300 ) + 200,
			"score": 5,
			"sprite": "jewels",
			"reverseFrame": 0,
			"width": 4,
			"height": 4,
			"offsetX": 0,
			"offsetY": 0
		};
	}

	function createRubyJewel( x, y ) {
		var frames = [ 12, 13, 14, 15, 14, 13 ];

		return {
			"x": x,
			"y": y,
			"dx": 0,
			"dy": 0,
			"index": Math.floor( Math.random() * frames.length ),
			"frames": frames,
			"lastFrame": ( new Date() ).getTime() +
				Math.floor( Math.random() * 100 ),
			"animationSpeed": Math.floor( Math.random() * 300 ) + 200,
			"score": 25,
			"sprite": "jewels",
			"reverseFrame": 0,
			"width": 5,
			"height": 5,
			"offsetX": 0,
			"offsetY": 0
		};
	}

	function createBomb( x, y ) {
		var frames, timeStart, frameSets;

		timeStart = ( new Date() ).getTime();
		$.playAudioPool( g_sizzleAudio, 0.5, 0 );
		frameSets = [
			[ 0, 1, 2 ],
			[ 3, 4, 5 ],
			[ 6, 7, 8 ],
			[ 9, 10, 11 ]
		];
		frames = frameSets[ 0 ];
		return {
			"x": x,
			"y": y,
			"dx": 0,
			"dy": 0,
			"index": Math.floor( Math.random() * frames.length ),
			"frames": frames,
			"frameSets": frameSets,
			"lastFrame": ( new Date() ).getTime() +
				Math.floor( Math.random() * 100 ),
			"animationSpeed": Math.round( 50 ) + 50,
			"sprite": "bomb",
			"score": 30,
			"width": 8,
			"height": 8,
			"offsetX": -4,
			"offsetY": -1,
			"isChase": false,
			"speed": 0,
			"timeEnd": timeStart + Math.floor( Math.random() * 1000 ) + 2000,
			"timeStart": timeStart
		};
	}

	function updateBombs() {
		var i, t, timeLeft, timeFrameSet;

		t = ( new Date() ).getTime();
		for( i = g_bombs.length - 1; i >= 0; i-- ) {
			timeLeft = g_bombs[ i ].timeEnd - t;
			timeFrameSet = 3 - Math.floor(
				( timeLeft / ( g_bombs[ i ].timeEnd - g_bombs[ i ].timeStart ) ) *
				4
			);
			//console.log( timeFrameSet );
			if( timeFrameSet < 0 ) {
				timeFrameSet = 0;
			}
			if( timeLeft < 0 ) {
				createSmokeEnemy( g_bombs[ i ].x, g_bombs[ i ].y );
				$.playAudioPool( g_bombAudio );
				g_bombs.splice( i, 1 );
			} else {
				g_bombs[ i ].frames = g_bombs[ i ].frameSets[ timeFrameSet ];
			}
		}
	}

	function createParrotEnemy( x, y ) {
		return createEnemy( "parrot", [ 0, 1, 2, 1 ], x, y, 0.75, 5, 6 );
	}

	function createSharkEnemy( x, y ) {
		return createEnemy( "shark", [ 0, 1 ], x, y, 1.0, 12, 6 );
	}

	function createPirateSwordEnemy( x, y ) {
		return createEnemy(
			"pirate-sword", [ 0, 1, 2, 3, 4, 5, 6, 7 ], x, y, 0.5, 5, 12
		);
	}

	function createDogEnemy( x, y ) {
		return createEnemy(
			"dog", [ 0, 1 ], x, y, 0.75, 9, 5, true
		);
	}

	function createBatEnemy( x, y ) {
		return createEnemy(
			"bat", [ 0, 1 ], x, y, 1.25, 6, 4, false
		);
	}

	function createSpiderEnemy( x, y ) {
		return createEnemy(
			"spider", [ 0, 1 ], x, y, 0.5, 5, 5, false
		);
	}

	function createScorpianEnemy( x, y ) {
		return createEnemy(
			"scorpian", [ 0, 1 ], x, y, 0.5, 12, 7, false
		);
	}

	function createSnakeEnemy( x, y ) {
		return createEnemy(
			"snake", [ 0, 1 ], x, y, 0.75, 12, 8, false
		);
	}

	function createMonkeyEnemy( x, y ) {
		return createEnemy(
			"monkey", [ 0, 1 ], x, y, 0.75, 11, 7, false
		);
	}

	function createSnakeGreenEnemy( x, y ) {
		return createEnemy(
			"snake-green", [ 0, 1 ], x, y, 1.0, 12, 8, true
		);
	}

	function createPantherEnemy( x, y ) {
		return createEnemy(
			"cat", [ 0, 1, 2, 3, 4 ], x, y, 1.15, 14, 5, true, 150
		);
	}

	function createSmokeEnemy( x, y ) {
		var a, frames, dx, dy;

		frames = [ 0, 1, 2, 3 ];
		for( a = 0; a < Math.PI * 2; a += Math.PI / 8 ) {
			dx = Math.cos( a ) * 2;
			dy = Math.sin( a ) * 2;
			x += dx;
			y += dy;
			g_enemies.push( {
				"x": x,
				"y": y,
				"dx": dx,
				"dy": dy,
				"index": Math.floor( Math.random() * frames.length ),
				"frames": frames,
				"lastFrame": ( new Date() ).getTime() +
					Math.floor( Math.random() * 100 ),
				"animationSpeed": Math.round( 50 ) + 50,
				"sprite": "clouds",
				"reverseFrame": 0,
				"width": 8,
				"height": 7,
				"isChase": false,
				"speed": Math.sqrt( dx * dx + dy * dy ),
				"bounce": false,
				"offsetX": 0,
				"offsetY": 0
			} );
		}
	}

	function createEnemy(
		sprite, frames, x, y, speedFactor, width, height, isChase, animationSpeed
	) {
		var speed, speedX, speedY, dx, dy, i, maxFrame;

		speedX = Math.random() * ( speedFactor / 2 ) + speedFactor;
		speedY = Math.random() * ( speedFactor / 2 ) + speedFactor;
		speed = Math.sqrt( speedX * speedX + speedY * speedY );

		if( animationSpeed == null ) {
			animationSpeed = Math.round( speed * 50 ) + 50;
		}

		if( Math.random() > 0.5 ) {
			dx = speedX * -1;
		} else {
			dx = speedX;
		}

		if( Math.random() > 0.5 ) {
			dy = speedY * -1;
		} else {
			dy = speedY;
		}

		maxFrame = 0;
		for( i = 0; i < frames.length; i++ ) {
			if( maxFrame < frames[ i ] ) {
				maxFrame = frames[ i ];
			}
		}

		return {
			"x": x,
			"y": y,
			"dx": dx,
			"dy": dy,
			"index": Math.floor( Math.random() * frames.length ),
			"frames": frames,
			"lastFrame": ( new Date() ).getTime() +
				Math.floor( Math.random() * 100 ),
			"animationSpeed": Math.round( speed * 50 ) + 50,
			"sprite": sprite,
			"reverseFrame": maxFrame + 1,
			"width": width,
			"height": height,
			"isChase": isChase,
			"speed": speed,
			"bounce": true,
			"offsetX": 0,
			"offsetY": 0
		};
	}

	function setupGame() {
		var i, size, isMultiple;

		$.setDefaultInputFocus( "showcase" );
		$.setActionKey( "Space" );

		//console.log( "Setting Up Game" );

		isMultiple = true;
		size = document.getElementById( "showcase" ).getBoundingClientRect();
		if( size.width < 1200 ) {
			isMultiple = false;
		}

		$screen1 = $.screen(
			g_width + "x" + g_height, "showcase", false, true, null, isMultiple
		);

		// $.setFont( 4 );
		// $.setColor( 15 );
		// $.setPos( 1, 1 );
		// $screen1.print( "Life" );
		// return;

		$screen2 = $.screen(
			g_width + "x" + g_height, "showcase", false, true, null, isMultiple
		);
		resizeImg();
		window.addEventListener( "resize", resizeImg );
		toggleTransition();
		$screen1.setBgColor( "rgba(0,0,0,0.15)" );
		$screen2.setBgColor( 0 );
		$.setScreen( $screen1 );
		$.setFont( 4 );
		$screen2.setFont( 4 );
		g_lineMsg = "";
		for( i = 0; i < $.getCols(); i++ ) {
			g_lineMsg += String.fromCharCode( 219 );
		}

		showPauseScreen( showIntro, startGame );
	}

	function toggleTransition() {
		$screen1.canvas().style.transitionDuration = "1.5s";
		setTimeout( function () {
			$screen1.canvas().style.transitionDuration = "0s";
		}, 1500 );
	}

	function resizeImg() {
		toggleTransition();
		var showcase = document.querySelector( "#showcase" );
		showcase.style.position = "relative";
		document.querySelectorAll( ".pirate-images img" ).forEach( function ( img ) {
			img.style.position = "absolute";
			img.style.imageRendering = "pixelated";
			img.style.left = "0px";
			img.style.top = "0px";
			img.style.width = $screen1.canvas().style.width;
			img.style.height = $screen1.canvas().style.height;
			img.style.marginLeft = $screen1.canvas().style.marginLeft;
			img.style.marginTop = $screen1.canvas().style.marginTop;
			showcase.prepend( img );
		} );
		document.getElementById( "bgShip" ).style.display = "block";
	}

	function showIntro() {
		$.setPos( 0 , 0 );
		$.setColor( 15 );
		$.setPos( 0, 9 );
		$.print( "Sneaky Pirate", false, true );
		$.print();
		$.print( "By", false, true );
		$.print();
		$.print( "Andy Stubbs", false, true );
		$.print();
	}

	function showPauseScreen( showMessage, continueCommand ) {
		var c, d, blinkInterval;

		//console.log( "Show Pause Screen" );

		$screen1.cls();
		$screen2.cls();
		showMessage();
		c = 0;
		d = 1;
		blinkInterval = setInterval( function () {
			$.setColor( "rgba(255, 255, 255," + ( c / 10 ).toFixed( 4 ) + ")" );
			//$.setColor( c );
			$.setPos( 0, 21 );
			$.print( "Click screen to continue", false, true );
			c += d;
			if( c > 10 || c < 0 ) {
				d *= -1;
			}
		}, 85 );
		$screen2.onpress( "down", function ( cursor ) {
			toggleTransition();
			$screen1.setBgColor( "rgba(0,0,0,0.65)" );
			if( ! g_soundsCreated ) {
				initSounds();
			}
			clearInterval( blinkInterval );
			//g_lastCursor = cursor;
			g_lastCursor = $screen2.inpress();
			continueCommand();
		}, true );
	}

	function startGame() {
		var level, interval, startTime, duration;

		$.play( g_sounds[ "intro" ] );
		duration = 1500;
		level = g_levels[ g_levelId ];
		initJewels( level );
		initEnemies( level );
		g_bombs = [];
		g_digits = [];
		g_bombCount = 0;

		$screen1.cls();
		$screen2.cls();

		$screen2.setPos( 0, 11 );
		$screen2.setColor( 15 );
		$screen2.print(
			"Level " + ( g_levelId + 1 ) + " - " + g_levels[ g_levelId ].name ,
			false, true
		);
		$screen1.setBgColor( "rgba(0,0,0,1)" );
		setTimeout( function () {
			toggleTransition();
			$screen1.setBgColor( "rgba(0,0,0,0.15)" );
			startTime = ( new Date() ).getTime();

			// Toggle background image
			document.querySelectorAll( "img" ).forEach( function ( img ) {
				img.style.display = "none";
			} );
			document.getElementById( g_levels[ g_levelId ].image )
				.style.display = "block";

			interval = setInterval( function () {
				var half, t, dt, c;
		
				half = duration / 2;
				t = ( new Date() ).getTime();
				dt = t - startTime;
				if( dt > half ) {
					c = $.util.clamp(
						255 - Math.round( ( dt - half ) / half * 255 ), 0, 255
					);
				} else {
					c = 255;
				}
				$screen2.setColor(
					"rgba(255,255,255," + ( c / 255 ).toFixed( 4 ) + ")"
				);
				$screen2.setPos( 0, 11 );
				$screen2.print(
					"Level " + ( g_levelId + 1 ) + " - " + g_levels[ g_levelId ].name,
					false, true
				);
				if( dt > duration ) {
					clearInterval( interval );
					resumeGame();
				}
			}, 10 );
		}, 1500 );
	}

	function resumeGame() {
		$screen1.canvas().style.cursor = "none";
		$screen2.canvas().style.cursor = "none";
		toggleTransition();
		$screen1.setBgColor( "rgba(0,0,0,0.15)" );
		g_isRunning = true;
		g_dir = "right";
		g_thief.frame = 0;
		g_thief.pixelsTraveled = 0;
		g_thief.noHit = true;
		setTimeout( function () {
			g_thief.noHit = false;
		}, 500 );
		//$screen2.onmouse( "move", update );
		requestAnimationFrame( animation );
		drawScore();
		g_time = 0;
		g_lastTime = ( new Date() ).getTime();
		g_lastCursor = $screen2.inpress();
		g_thief.x = g_lastCursor.x;
		g_thief.y = g_lastCursor.y;
		g_gameInterval = setInterval( function () {
			//update( g_lastCursor );
			update( $screen2.inpress() );
		}, 15 );

		// Every second add bombs
		g_bombInterval = setInterval( function () {
			var pos;
			if(
				g_levels[ g_levelId ].bombs &&
				Math.random() * 10 < g_levels[ g_levelId ].bombs &&
				g_bombCount < g_maxBombs
			) {
				g_bombCount += 1;
				pos = getRandomCoordinates( 40, g_bombs );
				g_bombs.push( createBomb( pos.x, pos.y ) );
			}
		}, 1000 );
	}

	function pauseGame() {
		$screen1.canvas().style.cursor = "auto";
		toggleTransition();
		$screen1.setBgColor( "rgba(0,0,0,0.85)" );
		$screen2.canvas().style.cursor = "auto";
		//$screen2.offmouse( "move", update );
		clearInterval( g_gameInterval );
		clearInterval( g_bombInterval );
		g_isRunning = false;
	}

	function initSounds() {
		g_sizzleAudio = $.createAudioPool( g_showcaseLink + "sizzle.mp3", 3 );
		g_bombAudio = $.createAudioPool( g_showcaseLink + "bomb.wav", 3 );
		g_sounds[ "intro" ] = "V35MSe8f#4f#8f#8g8a8b4.a4.g4.f#4";
		g_sounds[ "hurt" ] = "< sawtooth V35 T140 G4, < sawtooth V25 T140 P16 G4";
		g_sounds[ "collect" ] ="V50 T255 A8 C12 D16";
		g_sounds[ "collect-bomb" ] = "sawtooth V50 T255 A8 C12 D16";
		g_sounds[ "extra-life" ] = "V50 T250 C4 C#8 D4 D#8 E4 F8 F#4 < A8 A#4 B8"
		g_sounds[ "gameover" ] = "[[0,0.4,0.4,1,1,1,0.3,0.7,0.6,0.5,0.9,0.8],[0,0,0,0,0,0,0,0,0," +
			"0,0,0]]V100MNT100L4O1AL8A.L16AL4AL8>C.L16<BL8B.L16AL8A.L16AL2AL4";
		g_sounds[ "win" ] = "L16O2CDEFGAB>CDEFGAB>L4C";
		g_soundsCreated = true;
	}

	function initJewels( level ) {
		g_jewels = [];
		initObjects( g_jewels, level.jewels );
	}

	function initEnemies( level ) {
		var itemSize, i;

		itemSize = 30;

		g_enemies = [];
		initObjects( g_enemies, level.enemies );
	}

	function initObjects( container, items ) {
		var i, j, item, pos, j, notClear;
		for( i = 0; i < items.length; i++ ) {
			item = items[ i ];
			notClear = false;
			for( j = 0; j < item.count; j++ ) {
				pos = getRandomCoordinates( 40, container );
				container.push( item.create( pos.x, pos.y ) );
			}
		}
	}

	function getRandomCoordinates( radius, container ) {
		var x, y, i, notClear, radius, dx, dy, d;

		do {
			x = Math.floor( Math.random() * ( g_width - 64 ) ) + 32;
			y = Math.floor( Math.random() * ( g_height - 64 ) ) + 32;
			notClear = false;
			for( i = 0; i < container.length; i++ ) {
				dx = x - container[ i ].x;
				dy = y - container[ i ].y;
				d = Math.sqrt( dx * dx + dy * dy );
				if( d < radius ) {
					notClear = true;
					break;
				}
			}
		} while( notClear );

		return {
			"x": x,
			"y": y
		};
	}

	function update( cursor ) {
		if( g_isRunning ) {
			updateThief( cursor );
			detectCollisions( g_bombs, collectBomb, g_thief );
			detectCollisions( g_enemies, playerHit, g_thief );
			if( detectWallCollision( cursor, 5, 30 ) ) {
				playerHit();
			}
			if( g_isRunning ) {
				detectCollisions( g_jewels, collectJewel, g_thief );
			}
			draw();
			g_lastCursor = cursor;
			drawTime();
		}
	}

	function detectWallCollision( item, width, height ) {
		return (
			item.x - width <= 0 ||
			item.y - height <= 0 ||
			item.x + width >= g_width ||
			item.y + height >= g_height
		);
	}

	function detectCollisions( items, callback, check ) {
		var i, item;
		for( i = items.length - 1; i >= 0; i-- ) {
			item = items[ i ];
			if(
				item.x + item.offsetX + item.width > check.x - check.width &&
				item.x + item.offsetX - item.width < check.x + check.width &&
				item.y + item.offsetY + item.height > check.y - check.height &&
				item.y + item.offsetY - item.height < check.y + check.height
			) {
				callback( i );
			}
		}
	}

	function detectCollision( item1, item2 ) {
		return (
			item1.x + item1.width > item2.x - item2.width &&
			item1.x - item1.width < item2.x + item2.width &&
			item1.y + item1.height > item2.y - item2.height &&
			item1.y - item1.height < item2.y + item2.height
		);
	}

	function collectJewel( index ) {
		var isExtraLife;

		isExtraLife = addScore( g_jewels[ index ] );

		g_jewels.splice( index, 1 );
		drawScore();
		if( g_jewels.length === 0 ) {
			nextLevel();
		} else {
			if( isExtraLife ) {
				$.play( g_sounds[ "extra-life" ] );
			} else {
				//console.log( "Play Collect" );
				$.play( g_sounds[ "collect" ] );
			}
		}
	}

	function addDigits( val, x, y, addTime ) {
		var i, index, dict, duration;

		duration = 350;
		dict = {
			"+": 10,
			"L": 11,
			"i": 12,
			"f": 13,
			"e": 14
		};

		if( addTime != null && ! isNaN( addTime ) ) {
			duration += addTime;
		}

		x = x - Math.floor( val.length / 2 );
		for( i = 0; i < val.length; i++ ) {
			if( val[ i ] === " " ) {
				x += 8;
				continue;
			}
			if( dict[ val[ i ] ] ) {
				index = dict[ val[ i ] ];
			} else {
				index = parseInt( val[ i ] );
			}
			g_digits.push( {
				"index": index,
				"x": x,
				"y": y,
				"alpha": 255,
				"endTime": ( new Date() ).getTime() + duration,
				"duration": duration
			} );
			if(
				val[ i ] === "+" ||
				val[ i ] === "i" ||
				val[ i ] === "1" ||
				val[ i ] === "f"
			) {
				x += 8;
			} else {
				x += 10;
			}
		}
	}

	function collectBomb( index ) {
		var isExtraLife;

		isExtraLife = addScore( g_bombs[ index ] );

		if( isExtraLife ) {
			$.play( g_sounds[ "extra-life" ] );
		} else {
			$.play( g_sounds[ "collect-bomb" ] );
		}

		g_bombs.splice( index, 1 );
		drawScore();
		if( g_bombs.length === 0 ) {
			$.stopAudioPool( g_sizzleAudio );
		}
	}

	function addScore( item ) {
		var count;

		count = calcExtraLife( g_score, g_score + item.score );
		if( count > 0 ) {
			g_lives += count;
			addDigits( "+1 Life", item.x, item.y - 7, 250 );
			addDigits( "+" + item.score, item.x, item.y + 7 );
		} else {
			addDigits( "+" + item.score, item.x, item.y );
		}

		g_score += item.score;
		

		return count > 0;
	}

	function playerHit() {
		if( ! g_thief.noHit ) {
			g_thief.noHit = true;
			setTimeout( function () {
				g_thief.noHit = false;
			}, 1500 );
			g_lives -= 1;
			drawScore();
			if( g_lives < 0 ) {
				$.play( g_sounds[ "gameover" ] );
				gameOver();
			} else {
				$.play( g_sounds[ "hurt" ] );
			}
		}
	}

	function updateThief( cursor ) {
		var dx, dy, d, steps, frame, i, x, y, trail, duration;

		dx = g_thief.x - cursor.x;
		dy = g_thief.y - cursor.y;
		d = Math.sqrt( dx * dx + dy * dy );

		g_thief.pixelsTraveled += d;
		if( g_thief.pixelsTraveled > 10 ) {
			g_thief.frame += 1;
			if( g_thief.frame > 7 ) {
				g_thief.frame = 0;
			}
			g_thief.pixelsTraveled = 0;
		}

		if( dx > 0 && g_dir === "right" ) {
			g_dir = "left";
		} else if( dx < 0 && g_dir === "left" ) {
			g_dir = "right";
		}

		// Add trails
		if( g_dir === "left" ) {
			frame = g_thief.frame + 8;
		} else {
			frame = g_thief.frame;
		}
		steps = Math.floor( d / 3 );
		if( steps > 1 ) {
			duration = 50;
			//console.log( d, dx, dy );
			dx = dx / steps;
			dy = dy / steps;
			x = g_thief.x;
			y = g_thief.y;
			for( i = 0; i < steps; i += 1 ) {
				x -= dx;
				y -= dy;
				trail = {
					"x": Math.floor( x ),
					"y": Math.floor( y ),
					"frame": frame,
					"alpha": 10,
					"duration": duration,
					"endTime": ( new Date() ).getTime() + duration,
					"width": g_thief.width,
					"height": g_thief.height
				};
				g_thief.trails.push( trail );
				detectCollisions( g_enemies, playerHit, trail );
			}
		}

		// g_thief.trails.push( {
		// 	"x": cursor.x,
		// 	"y": cursor.y,
		// 	"frame": frame,
		// 	"alpha": 10
		// } );

		// if( g_thief.trails.length > 25 ) {
		// 	g_thief.trails.splice( 0, g_thief.trails.length - 25 );
		// }

		g_thief.x = cursor.x;
		g_thief.y = cursor.y;
	}

	function draw() {
		$.cls();
		drawJewels();
		drawObjects( g_jewels );
		drawObjects( g_bombs );
		drawThief();
		drawObjects( g_enemies );
		drawDigits();
		$.render();
	}

	function drawTime() {
		var t, dt, msg, x, y, width, height, context;
		t = ( new Date() ).getTime();
		dt = t - g_lastTime;
		g_time += dt;
		msg = $.util.padL( Math.floor( g_time / 1000 ), 3, "0" );
		x = g_width / 2 - 50;
		y = g_height - 16;
		width = 100;
		height = 16;
		context = $screen2.canvas().getContext( "2d" );
		context.fillStyle = "#AA0000";
		context.fillRect( x, y, width, height );
		$screen2.setPos( 0, 24 );
		$screen2.print( msg, false, true );
		g_lastTime = t;
	}

	function drawScore() {
		$screen2.cls();
		$screen2.setColor( 15 );
		$screen2.setColor( 4 );
		$screen2.print( g_lineMsg );
		$screen2.setPos( 0, 0 );
		$screen2.setColor( 15 );
		$screen2.print(
			"Sneaky Pirate - Level " + ( g_levelId + 1 ) + " - " +
			g_levels[ g_levelId ].name , false, true
		);
		$screen2.setPos( 0, 26 );
		$screen2.setColor( 4 );
		$screen2.print( g_lineMsg );
		$screen2.setColor( 15 );
		$screen2.setPos( 1, 26 );
		$screen2.print( "Score: " + g_score );
		$screen2.setPos( $.getCols() - 9, 26 );
		$screen2.print( "Lives: " + g_lives );
		$screen2.render();
		drawTime();
	}

	function drawThief() {
		var frame, i, t;

		t = ( new Date() ).getTime();

		if( g_dir === "left" ) {
			frame = g_thief.frame + 8;
		} else {
			frame = g_thief.frame;
		}
		for( i = g_thief.trails.length - 1; i >= 0; i -= 1 ) {
			g_thief.trails[ i ].alpha = 10 - Math.floor( easeOutSine(
				( t - g_thief.trails[ i ].endTime ) / g_thief.trails[ i ].duration
			) * 10 );
			$.drawSprite(
				"pirate", g_thief.trails[ i ].frame,
				g_thief.trails[ i ].x, g_thief.trails[ i ].y, 0, 0.5, 0.5,
				g_thief.trails[ i ].alpha
			);
			g_thief.trails[ i ].alpha -= 1;
			if(
				t - g_thief.trails[ i ].endTime >= g_thief.trails[ i ].duration
			) {
				g_thief.trails.splice( i, 1 );
			}
		}

		if( g_thief.noHit ) {
			g_alpha = ( t % 3 * 128 - 10 );
		} else {
			g_alpha = 255;
		}
		$.drawSprite(
			"pirate", frame, g_thief.x, g_thief.y, 0,
			0.5, 0.5, g_alpha
		);

		// if( t - g_thief.lastFrame > 30 ) {
		// 	g_thief.trails.splice( 0, 1 );
		// 	g_thief.lastFrame = t;
		// }
	}

	function easeOutSine( pct ) {
		return Math.sin( ( pct * Math.PI ) / 2 );
	}

	function rect( x, y, width, height ) {
		var context = $.canvas().getContext( "2d" );
		context.beginPath();
		context.strokeStyle = "white";
		context.rect( x, y, width, height );
		context.stroke();
		context.closePath();
	}

	function drawJewels() {
		var i;
		for( i = 0; i < g_jewels.length; i++ ) {
			$.drawSprite(
				"jewels", g_jewels[ i ].frames[ g_jewels[ i ].index ],
				g_jewels[ i ].x, g_jewels[ i ].y, 0, 0.5, 0.5
			);
		}
	}

	function drawObjects( container ) {
		var i, item, frame;
		for( i = 0; i < container.length; i++ ) {
			item = container[ i ];
			frame = item.frames[ item.index ];
			if( item.dx < 0 ) {
				frame += item.reverseFrame;
			}
			$.drawSprite(
				item.sprite, frame, Math.floor( item.x ), Math.floor( item.y ),
				0, 0.5, 0.5
			);

			// rect(
			// 	Math.floor( item.x ) + item.offsetX - item.width,
			// 	Math.floor( item.y ) + item.offsetY - item.height,
			// 	item.width * 2,
			// 	item.height * 2
			// );

		}
	}

	function drawDigits() {
		var i, item, t;

		t = ( new Date() ).getTime();
		for( i = g_digits.length - 1; i >= 0; i-- ) {
			item = g_digits[ i ];
			item.alpha = 255 - Math.floor(
				easeOutSine( ( t - item.endTime ) / item.duration ) * 255
			);
			$.drawSprite(
				"digits", item.index, Math.floor( item.x ), Math.floor( item.y ),
				0, 0.5, 0.5, item.alpha
			);
			if( ( t - item.endTime ) >= item.duration ) {
				g_digits.splice( i, 1 );
			}
		}
	}

	function animation() {
		if( g_isRunning ) {
			animateObjects( g_jewels );
			animateObjects( g_enemies );
			animateObjects( g_bombs );
			draw();
			updateBombs();
			requestAnimationFrame( animation );
		}
	}

	function animateObjects( container ) {
		var i, item, t, dt, angle, bounced;

		t = ( new Date() ).getTime();
		for( i = container.length - 1; i >= 0; i-- ) {
			item = container[ i ];
			dt = t - item.lastFrame;
			if( dt > item.animationSpeed ) {
				item.index += 1;
				if( item.index >= item.frames.length ) {
					item.index = 0;
				}
				item.lastFrame = t;
			}
			if( item.isChase ) {
				angle = Math.atan2(
					g_thief.y - item.y, g_thief.x - item.x
				);
				item.dx = Math.cos( angle ) * item.speed;
				item.dy = Math.sin( angle ) * item.speed;
			}
			item.x += item.dx;
			item.y += item.dy;
			bounced = false;
			if( item.x < item.width || item.x > g_width - item.width ) {
				item.dx *= -1;
				if( ! item.bounce ) {
					bounced = true;
				}
			}
			if(
				item.y < item.height + 16 || item.y > g_height - item.height - 16
			) {
				item.dy *= -1;
				if( ! item.bounce ) {
					bounced = true;
				}
			}
			if( bounced ) {
				container.splice( i, 1 );
			}
		}
	}

	function nextLevel() {
		g_isRunning = false;
		setTimeout( function () {
			$.play( g_sounds[ "win" ] );
			if( g_levelId + 1 >= g_levels.length ) {
				pauseGame();
				showPauseScreen( nextLevelMessage, gameOver );
			} else {
				pauseGame();
				showPauseScreen( nextLevelMessage, startGame );
			}
		}, 100 );
	}

	function nextLevelMessage() {
		var msgTime, bonus, multiplier, maxBonus, msgs, count, isGameOver, bonus2,
			i, maxLength;

		msgs = [];

		g_levelId += 1;

		// Calculate the bonus multiplier
		multiplier = g_levelId * 3;

		// Check if game over and if not then increment the level
		if( g_levelId >= g_levels.length ) {
			isGameOver = true;
		}

		// Set the font data
		$.setColor( 15 );
		$.setPos( 0, 9 );

		// Format the time
		msgTime = ( g_time / 1000 ).toFixed( 2 );

		// Calculate the speed bonus
		maxBonus = 150 * g_levelId;
		bonus = Math.round( maxBonus - ( g_time / 1000 ) * multiplier );
		if( bonus < 0 ) {
			bonus = 0;
		}

		// Print the level complete message
		if( isGameOver ) {
			$.print( "You Win", false, true );
		} else {
			$.print( "Level Complete", false, true );
		}
		$.print();

		// Push the messages
		msgs.push( "Time: " + msgTime + "s" );
		msgs.push( "Speed Bonus: " + bonus );

		// Detect extra life
		count = calcExtraLife( g_score, g_score + bonus );
		if( count > 0 ) {
			g_lives += count;
			if( count > 1 ) {
				msgs.push( "+" + count + " Extra lives!" );
			} else {
				msgs.push( "+" + count + " Extra life!" );
			}
		}

		// Push the number of lives
		msgs.push( "Lives: " + g_lives );

		if( isGameOver ) {
			bonus2 = g_lives * 250;
			msgs.push( "Lives Bonus: " + bonus2 );
			msgs.push(
				"Score: " + g_score + " + " + bonus + " + " + bonus2 + " = " +
					( g_score + bonus + bonus2 )
			);
			
		} else {
			bonus2 = 0;
			msgs.push(
				"Score: " + g_score + " + " + bonus + " = " + ( g_score + bonus )
			);
		}

		// Find the longest message
		maxLength = 0;
		for( i = 0; i < msgs.length; i++ ) {
			if( msgs[ i ].length > maxLength ) {
				maxLength = msgs[ i ].length;
			}
		}

		// Print the messages
		for( i = 0; i < msgs.length; i++ ) {
			if( i === msgs.length - 1 ) {
				$.setColor( 12 );
			} else if( msgs[ i ].indexOf( "Extra" ) > -1 ) {
				$.setColor( 14 );
			} else {
				$.setColor( 15 );
			}
			$.print( $.util.padR( msgs[ i ], maxLength, " " ), false, true );
		}

		g_score += bonus + bonus2;
	}

	function calcExtraLife( before, after ) {
		var count = 0;

		if(
			Math.floor( after / g_extraLifeScore ) >
			Math.floor( before / g_extraLifeScore )
		) {
			count = Math.floor( after / g_extraLifeScore ) -
				Math.floor( before / g_extraLifeScore );
		}
		return count;
	}

	function gameOver() {
		g_isRunning = false;
		setTimeout( function () {
			pauseGame();
			gameOverScreen();
		}, 100 );
	}

	function gameOverScreen() {
		var c, d, scores, i, scoreIndex, rect, title, blinkInterval, levelMsg;

		function restartGame( cursor ) {
			g_levelId = 0;
			g_lastCursor = cursor;
			clearInterval( blinkInterval );
			g_score = 0;
			g_lives = g_startLives;
			startGame();
		}

		$screen1.cls();
		$screen2.cls();
		scores = g_highScores.slice();

		scoreIndex = -1;

		// Find your score
		for( i = 0; i < scores.length; i++ ) {
			if( scoreIndex > -1 ) {
				scores[ i ][ 0 ] += 1;
			} else if( g_score > scores[ i ][ 2 ] ) {
				if( g_levelId >= g_levels.length ) {
					levelMsg = "Win";
				} else {
					levelMsg = ( g_levelId + 1 );
				}

				scores.splice( i, 0, [ i - 1, "You", g_score, levelMsg ] );
				scoreIndex = i;
			}
		}

		if( scoreIndex > 0 ) {
			title = "Sneaky Pirate - Highscores - Enter Name";
		} else {
			title = "Sneaky Pirate - Highscores - Click to continue";
			$screen2.onpress( "down", restartGame, true );
		}

		scores[ 0 ] = title;

		// Print body
		$.setColor( 7 );
		$.setPos( 0, 4 );
		$.printTable( scores.slice( 2, 12 ), [
			"*----*---------------------------------------------------*-------*-------*",
			"|    |                                                   |       |       |",
			"*----*---------------------------------------------------*-------*-------*",
			"|    |                                                   |       |       |",
			"*----*---------------------------------------------------*-------*-------*",
			"|    |                                                   |       |       |",
			"*----*---------------------------------------------------*-------*-------*",
			"|    |                                                   |       |       |",
			"*----*---------------------------------------------------*-------*-------*",
			"|    |                                                   |       |       |",
			"*----*---------------------------------------------------*-------*-------*",
			"|    |                                                   |       |       |",
			"*----*---------------------------------------------------*-------*-------*",
			"|    |                                                   |       |       |",
			"*----*---------------------------------------------------*-------*-------*",
			"|    |                                                   |       |       |",
			"*----*---------------------------------------------------*-------*-------*",
			"|    |                                                   |       |       |",
			"*----*---------------------------------------------------*-------*-------*",
			"|    |                                                   |       |       |",
			"*----*---------------------------------------------------*-------*-------*",
		], "double" );

		// Print header
		$.setColor( 15 );
		$.setPos( 0, 0 );
		$.printTable( scores.slice( 0, 2 ), [
			"*------------------------------------------------------------------------*",
			"|                                                                        |",
			"*----*---------------------------------------------------*-------*-------*",
			"|    |                                                   |       |       |",
			"*----*---------------------------------------------------*-------*-------*"
		], "double" );

		// Setup blinking title
		c = 0;
		d = 1;
		blinkInterval = setInterval( function () {
			var pos;
			pos = $.getPos();
			$.setColor( 0 );
			$.rect( 8, 8, 568, 24, 0 );
			$.setColor( "rgba(255, 255, 255," + ( c / 10 ).toFixed( 4 ) + ")" );
			//$.setColor( c );
			$.setPos( 0, 1 );
			$.print( title, false, true );
			c += d;
			if( c > 10 || c < 0 ) {
				d *= -1;
			}
			$.setColor( 15 );
			$.setPos( pos.col, pos.row );
		}, 55 );

		// Check your high score
		if( scoreIndex > 0 ) {

			// Print your score
			$.setColor( 15 );
			$.setPos( 0, scoreIndex * 2 );
			$.printTable( scores.slice( scoreIndex, scoreIndex + 1 ), [
				"*----*---------------------------------------------------*-------*-------*",
				"|    |                                                   |       |       |",
				"*----*---------------------------------------------------*-------*-------*"
			], "double" );

			// Print box
			$.setColor( 1 );
			rect = $.getPosPx();
			$.rect( rect.x + 47, rect.y - 40, 411, 29, 1 );

			// Input Name
			$.setColor( 15 );
			$.setPos( 6, scoreIndex * 2 + 1 );
			$.input( "Enter name: ", function ( name ) {

				title = "Sneaky Pirate - Highscores - Click to continue";
				$screen2.onmouse( "down", restartGame, true );
				scores[ scoreIndex ][ 1 ] = name;

				g_highScores = scores.slice( 0, 12 );

				// Print box
				$.setColor( 0 );
				$.rect( rect.x + 47, rect.y - 40, 411, 29, 0 );

				// Print your score
				$.setColor( 15 );
				$.setPos( 0, scoreIndex * 2 );
				$.printTable( scores.slice( scoreIndex, scoreIndex + 1 ), [
					"*----*---------------------------------------------------*-------*-------*",
					"|    |                                                   |       |       |",
					"*----*---------------------------------------------------*-------*-------*"
				], "double" );

			} );

		}
	}

}() );
