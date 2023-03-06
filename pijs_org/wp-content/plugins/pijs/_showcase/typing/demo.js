( function () {

	var g_speed, g_score, g_pos, g_letters, g_letter, g_volume, g_move, g_paused, g_pausedMessageShown, g_continue;

	g_volume = 0.25;
	g_paused = true;
	g_pausedMessageShown = false;
	g_continue = showIntro;

	if( !g_fullscreen ) {
		$.setDefaultInputFocus( "showcase" );
		document.querySelector( "#showcase" ).onblur = function () {
			g_paused = true;
			g_pausedMessageShown = false;
			$.cancelInput();
			showPauseScreen();
		};
		document.querySelector( "#showcase" ).onfocus = function () {
			g_paused = false;
			g_pausedMessageShown = false;
			if( g_continue ) {
				drawGame();
				g_continue();
			}
		};
	} else {
		g_paused = false;
	}

	$.setActionKey( "Space" );

	$.ready( function () {
		if( g_fullscreen ) {
			$.screen( {
				"aspect": "300x200",
				"isMultiple": true
			} );
		} else {
			$.screen( {
				"aspect": "300x200",
				"isMultiple": true,
				"container": "showcase"
			} );
		}
		showPauseScreen();
	} );

	function showPauseScreen() {
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
	}

	async function showIntro() {
		var midX, midY, answer, first;

		$.cls();
		g_continue = showIntro;

		midX = Math.round($.getCols() / 2);
		midY = Math.round($.getRows() / 2);
		$.setBgColor( "black" );
		$.setColor("red");
		$.setPos(midX - 8, midY - 4);
		$.printTable(
			[[""]],
			[
				// TYPING SKILL //
				"*--------------*",
				"|              |",
				"*--------------*"
			], "double", false
		);
		$.setPos(0, midY - 3);
		$.setColor("white");
		$.print("TYPING SKILL", false, true);
		$.print("\n\n");
		$.print("DO YOU NEED INSTRUCTIONS? ", true, true);
		first = true;
		while(answer !== "Y" && answer !== "N") {
			if(first) {
				answer = ( await $.input("") );
				if( typeof answer === "string" && answer.length > 0 ) {
					answer = answer[0].toUpperCase();
				}
				first = false;
			} else {
				answer = (await $.input("DO YOU NEED INSTRUCTIONS? (Y/N) ")).toUpperCase();
			}
		}
		if(answer === "Y") {
			$.print("\n\n");
			$.print(
				" This is a fast action game. The purpose of this game is to test your typing skill. " +
				"Letters will be passing through a small screen from left to right. The faster " +
				"you eliminate them, the better your score! " +
				"To destroy the letters, you must press the corresponding key. " +
				"The speed of the letters is set by you.\n\n" +
				"0 is the fastest speed.\n" +
				"10 is the slowest speed.\n\n" +
				"A negative value will move the letters two spaces at a time. " +
				"Good luck and beware of the \"invisible character\" (space)."
			);
		}

		setTimeout( startGame, 150 );
	}

	async function startGame() {
		var speed, first;
		$.print("\n");

		first = true;
		$.sound( 400, 0.25, g_volume );
		while( typeof speed !== "number" || speed < -10 || speed > 10 ) {
			if( ! first ) {
				$.print( "Speed must be a number between -10 and 10." );
			}
			speed = await $.input( "SPEED? ", null, true, true, true, "none" );
			first = false;
		}
		if( speed < 0 ) {
			speed = speed *-1;
			g_move = 2;
		} else {
			g_move = 1;
		}
		g_speed = speed;

		g_score = 0;
		g_letters = 30;

		drawGame();
		setDelay();

		g_continue = runGame;
	}

	function drawGame() {
		$.cls();
		$.print("\n\n\n\n");
		$.print("0123456789", false, true);
		$.print("[==========]", false, true);
		$.print("[          ]", false, true);
		$.print("[==========]", false, true);

		printScore();
	}

	function runGame() {

		if( g_paused ) {
			return;
		}

		if( g_letters === 0 ) {
			gameOver();
			return;
		}

		// Move or init letter
		if(g_pos == null) {
			g_pos = {
				"x": Math.round($.getCols() / 2) + 5,
				"y": 7
			};
			//(RND*43+48)
			g_letter = String.fromCharCode(Math.floor(Math.random() * 43) + 48);
			if( g_letter === "=" ) {
				g_letter = " ";
			}
			// A hit
			$.onkey( g_letter, "down", hit );

			// Delay a bit
			setDelay();
			return;
		} else {
			eraseLetter();
			g_pos.x -= g_move;
		}

		// A miss
		if( g_pos.x < Math.round( $.getCols() / 2) - 5 ) {
			$.offkey( g_letter, "down", hit );
			$.sound( 90, 0.5, g_volume, "sawtooth" );
			g_pos = null;
			g_letters -= 1;
			g_score -= 5;
			printScore();
			runGame();
			return;
		}

		// Print Letter
		$.setColor( "white" );
		$.setPos( g_pos.x, g_pos.y );
		$.print( g_letter, true );

		setDelay();
	}

	function hit() {
		// Remove the event listener
		$.offkey( g_letter, "down", hit );

		$.sound( 550, 0.15, g_volume );
		$.sound( 600, 0.10, g_volume, null, 0.15 );
		$.setPos( g_pos.x, g_pos.y );
		g_letter = String.fromCharCode( 219 );
		$.setColor( "red" );
		$.print( g_letter, true );
		g_score += g_pos.x - 20;
		g_pos = null;
		g_letters -= 1;
		printScore();
	}

	function eraseLetter() {
		$.setColor( "black" );
		$.rect( 120, 55, 60, 9, "black" );
	}

	function printScore() {
		$.setColor( "black" );
		$.rect( 30, 80, 180, 16, "black" );
		$.setPos( 20, 10 );
		$.setColor( "white" );
		$.print( "Score: " + g_score );
		$.setPos( 20, 11 );
		$.print( "Count: " + g_letters );
	}

	function setDelay() {
		setTimeout( runGame, ( g_speed * 50 ) + 100 );
	}

	function gameOver() {
		eraseLetter();
		$.setColor( "white" );
		$.setPos( 0, 15 );
		$.print( "Game Over.", false, true );
	}

}() );