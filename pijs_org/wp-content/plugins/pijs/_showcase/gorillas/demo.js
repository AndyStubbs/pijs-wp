const WIDTH = 640;
const HEIGHT = 350;
let gorilla1 = {
	"name": "Donkey Kong",
	"x": 48,
	"y": 50,
	"leftArmUp": false,
	"rightArmUp": false,
	"hand": "right",
	"pos": {"row": 1, "col": 1},
	"score": 0,
	"lastAngle": null,
	"lastVelocity": null
};
let gorilla2 = {
	"name": "King Kong",
	"x": 592,
	"y": 50,
	"leftArmUp": false,
	"rightArmUp": false,
	"hand": "left",
	"pos": {"row": 1, "col": 60},
	"score": 0,
	"lastAngle": null,
	"lastVelocity": null
};
let activeGorilla = null;
let lastBanana = null;
let wind = 0;
let numGames = 3;
let useSound = false;

// Setup our colors
let colors = [
	"#0000a8",	// Background Color - Blue - 0
	"#0000a8",	// Blue					   - 1
	"#fcfc00",	// Yellow 1				   - 2
	"#fcfc54",	// Yellow 2				   - 3
	"#FFFFFF",	// White				   - 4
	"#00a8a8",  // Cyan					   - 5
	"#a8a8a8",	// Gray					   - 6
	"#fca854",	// Tan					   - 7
	"#545454",	// Dark Gray			   - 8
	"#a80000",	// Red					   - 9
	"#a8a8a8",	// Gray					   - 10
];
$.setDefaultPal(colors);

// Initialize our screen
let $screen1 = $.screen({ "aspect": WIDTH + "x" + HEIGHT, "isMultiple": true, willReadFrequently: true });
let $screen2 = $.screen({ "aspect": WIDTH + "x" + HEIGHT, "isMultiple": true, willReadFrequently: true });

$screen1.setContainerBgColor("black");
$screen1.setBgColor(1);
$screen1.setFont(3);
$.setScreen($screen2);
$.setFont(3);
$.setBgColor("rgba(0,0,0,0)");
soundCheck();

async function soundCheck() {
	$screen1.setColor(4);
	$screen1.setPos(29, 11);
	let soundStatus = await $screen1.input("Do you want sound? (y/n): ");
	useSound = soundStatus.toLowerCase().startsWith("y");
	intro();
}

// Intro screen
function intro() {
	$screen1.cls();
	$screen1.print("\n\n\n\n");
	$screen1.print("Pi.js Gorillas\n\n", false, true);
	$screen1.print("Your mission is to hit your opponent with the exploding", false, true);
	$screen1.print("banana by varying the angle and power of your throw, taking", false, true);
	$screen1.print("int account wind speed, gravity, and the city skyline.", false, true);
	$screen1.print("The wind speed is shown by a directonal arrow at the bottom", false, true);
	$screen1.print("of the playing field, its length relative to its strength.", false, true);
	$screen1.print("\n\n\n\n");
	$screen1.print("Press any key to continue", false, true);

	if(useSound) {
		$.play("square V60T160O3L8CDEDCDL4ECC");
	}

	$.onkey("any", "down", function (){
		getPlayers();
	}, true);
}

async function getPlayers() {
	$screen1.cls();
	$screen1.setPos(10, 10);
	gorilla1.name = await $screen1.input("Name of Player 1 (Default = 'Donkey Kong'): ");
	if(gorilla1.name === "") {
		gorilla1.name = "Donkey Kong";
	} else if(gorilla1.name.length > 13) {
		gorilla1.name = gorilla1.name.substring(0, 13);
	}
	$screen1.setPos(10, 12);
	gorilla2.name = await $screen1.input("Name of Player 2 (Default = 'King Kong'): ");
	if(gorilla2.name === "") {
		gorilla2.name = "King Kong";
	} else if(gorilla2.name.length > 13) {
		gorilla2.name = gorilla2.name.substring(0, 13);
	}
	$screen1.setPos(10, 14);
	numGames = await $screen1.input("Enter number of games (Default = 3): ");
	if(isNaN(numGames) || numGames < 1) {
		numGames = 3;
	}
	$screen1.cls();
	startGame(true);
}

function drawScene() {
	$.cls();

	// Draw our scene
	const BUILDING_COLORS = [6, 5, 9];
	const BUILDING_SIZE = 32;
	const MAX_BUILDING_HEIGHT = 250;
	const MIN_BUILDING_HEIGHT = 100;
	const WINDOW_COLORS = [3, 8, 3, 3];

	$.setContainerBgColor("black");
	let buildingHeight = Math.floor(Math.random() * 150) + 100;
	for(let x = 0; x < WIDTH; x += BUILDING_SIZE) {

		// Compute building height
		buildingHeight += Math.floor(Math.random() * 100) - 50;
		if(buildingHeight > MAX_BUILDING_HEIGHT) {
			buildingHeight = MAX_BUILDING_HEIGHT;
		} else if(buildingHeight < MIN_BUILDING_HEIGHT) {
			buildingHeight = MIN_BUILDING_HEIGHT;
		}
		// Compute building color
		let color = BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)];

		// Draw building
		$.setColor(1);
		$.rect(x, HEIGHT - buildingHeight, BUILDING_SIZE, HEIGHT + 2, color);

		// Draw windows
		const WINDOW_HEIGHT = 5;
		const WINDOW_WIDTH = 4;
		const NUM_WINDOWS = 3;
		for(y = HEIGHT - buildingHeight + 3; y < HEIGHT; y += WINDOW_HEIGHT * 2) {
			for(i = 0; i < NUM_WINDOWS; i++) {
				// Compute window color
				color = WINDOW_COLORS[Math.floor(Math.random() * WINDOW_COLORS.length)];

				// Draw windows for the row
				$.setColor(color);
				$.rect(x + (i * (WINDOW_WIDTH * 2.5)) + 4, y, WINDOW_WIDTH, WINDOW_HEIGHT, color);
			}
		}
	}
	$.render();
	$.cls(0, HEIGHT - 10, WIDTH, HEIGHT);
	$.setColor(9);
	$.pset(Math.round(WIDTH / 2), HEIGHT - 5);
	if(wind > 0) {
		$.draw("R" + wind + "H3 F3 G3");
	} else {
		$.draw("L" + (wind * -1) + "E3 G3 F3");
	}
	
	$.render();
	$.setColor(4);
	$.setPos(Math.round($.getCols() / 2) - 4, $.getRows() - 3);
	let px = $.getPosPx();
	$.cls(px.x - 2, px.y - 1, 76, 15);
	$.print(gorilla1.score + ">Score<" + gorilla2.score);
}

function drawSun(isSurprise) {
	// Draw Rays
	$.setColor(2);
	let radius = 15;
	for(let a = 0; a <= 360; a += 22.5) {
		x = Math.cos((Math.PI / 180) * a) * radius + 320;
		y = Math.sin((Math.PI / 180) * a) * radius + 20;
		$.line(320, 20, x, y);
	}
	
	// Draw Sun
	$.circle(320, 20, 10, 2);
	
	// Draw Face
	$.setColor(1);
	$.circle(317, 18, 2, 1);
	$.circle(323, 18, 2, 1);
	if(isSurprise) {
		$.circle(320, 24, 3, 1);
	} else {
		$.arc(320, 22, 4, 40, 140);
	}
}

function drawGorilla(gorilla) {
	let x = gorilla.x;
	let y = gorilla.y;
	$.render();
	$.cls(x - 16, y - 17, 30, 34);
	//$.rect(x - 16, y - 17, 30, 34, "red");
	$.setColor(7)
	$.pset(x, y);

	// Draw bottom half
	$.draw("L2 R4 L2 U L R2 L U D3 L5 R10 D6 L11 U6 BF1 P7 L D4");

	// Draw Legs
	$.draw("L D2 L2 D2 L D5 R D R5 U L U5 R U R U BG3 P7 BE3 R4 D R D R D6 L R5 U R U 4 L U2 L2 U BL P7 U7 R");
	
	// Draw Upper Torso
	$.draw("E R1 U7 L16 D7 R3 E1 R2 E2 U2 R2 D2 F2 R2 BU P7");
	
	// Draw Head
	$.draw( "L2 U6 E U2 E U2 L U2 L8 F R6 F D L8 U2 G D2 R2 D R3 U2 BD2 R3 U R D L8 D2 F BR P7");
	
	// Draw Left Arm
	let x2 = x + 3;
	let y2 = y - 1;	
	if(gorilla.leftArmUp) {
		y2 = y - 11;
	}	
	$.arc(x2, y2, 7, 290, 70);
	$.arc(x2 + 4, y2, 7, 270, 90);	
	$.paint(x2 + 7, y2, 7);
	
	// Draw Right Arm
	x2 = x - 9;
	y2 = y - 1;	
	if(gorilla.rightArmUp) {
		y2 = y - 11;
	}	
	$.arc(x2, y2, 7, 90, 270);
	$.arc(x2 + 4, y2, 7, 125, 235);	
	$.paint(x2 - 5, y2, 7);
}

function createBanana() {
	let data1 = [
		[ 0, 3, 3, 0, 0, 0, 0 ],
		[ 0, 3, 3, 3, 0, 0, 0 ],
		[ 0, 0, 3, 3, 3, 0, 0 ],
		[ 0, 0, 3, 3, 3, 0, 0 ],
		[ 0, 0, 3, 3, 3, 0, 0 ],
		[ 0, 3, 3, 3, 0, 0, 0 ],
		[ 0, 3, 3, 0, 0, 0, 0 ],
	];
	let data2 = [
		[ 0, 0, 0, 0, 0, 0, 0 ],
		[ 3, 3, 0, 0, 0, 3, 3 ],
		[ 3, 3, 3, 3, 3, 3, 3 ],
		[ 0, 3, 3, 3, 3, 3, 0 ],
		[ 0, 0, 3, 3, 3, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0 ],
	];
	let data3 = [
		[ 0, 0, 0, 0, 3, 3, 0 ],
		[ 0, 0, 0, 3, 3, 3, 0 ],
		[ 0, 0, 3, 3, 3, 0, 0 ],
		[ 0, 0, 3, 3, 3, 0, 0 ],
		[ 0, 0, 3, 3, 3, 0, 0 ],
		[ 0, 0, 0, 3, 3, 3, 0 ],
		[ 0, 0, 0, 0, 3, 3, 0 ],
	];
	let data4 = [
		[ 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 0, 0, 0, 0, 0 ],
		[ 0, 0, 3, 3, 3, 0, 0 ],
		[ 0, 3, 3, 3, 3, 3, 0 ],
		[ 3, 3, 3, 3, 3, 3, 3 ],
		[ 3, 3, 0, 0, 0, 3, 3 ],
		[ 0, 0, 0, 0, 0, 0, 0 ],
	];
	let banana = {
		"data": [ data1, data2, data3, data4 ],
		"x": 0,
		"y": 0,
		"frame": 0
	};
	return banana;
}

function drawBanana(banana) {
	if(lastBanana) {
		$.cls(lastBanana.x, lastBanana.y, 7, 7);
	}
	$.put(banana.data[banana.frame % 4], banana.x, banana.y);
	lastBanana = {
		"x": banana.x,
		"y": banana.y
	};
}

function startGame(isFirst) {
	gorilla1.y = 50;
	gorilla1.lastAngle = null;
	gorilla1.lastVelocity = null;
	gorilla2.y = 50;
	gorilla2.lastAngle = null;
	gorilla2.lastVelocity = null;
	wind = Math.floor(Math.random() * 100) - 50;
	drawScene();
	gorilla1.y = findBuildingHeight(gorilla1.x, gorilla1.y);
	gorilla2.y = findBuildingHeight(gorilla2.x, gorilla2.y);
	beginTurn(isFirst);
}

function findBuildingHeight(x, y) {
	let c = 0;
	let ty = y;
	let data = $.get(x, y, x, HEIGHT);
	for( let i = 0; i < data.length; i++ ){
		c = data[i][0];
		if(c !== 0) {
			return y + i - 16;
		}
	}
	return -1;
}

function beginTurn(isFirst) {
	gorilla1.leftArmUp = false;
	gorilla1.rightArmUp = false;
	gorilla2.leftArmUp = false;
	gorilla2.rightArmUp = false;
	if(isFirst) {
		activeGorilla = gorilla1;
	} else if(activeGorilla === gorilla1) {
		activeGorilla = gorilla2;
	} else {
		activeGorilla = gorilla1;
	}
	updateScene();
}

function updateScene() {
	$screen1.render();
	$screen1.cls(0, 0, WIDTH, 50);
	drawGorilla(gorilla1);
	drawGorilla(gorilla2);
	drawSun();
	$screen1.setColor( 4 );
	$screen1.setPos(0, 0);
	$screen1.print(" " + gorilla1.name, true);
	$screen1.setPos($.getCols() - 14, 0);
	$screen1.print(gorilla2.name, true);
	$screen1.setInputCursor("_");
	getPlayerInput(activeGorilla, activeGorilla.pos);
}

async function getPlayerInput(gorilla, pos) {
	let angle = 181;
	$screen1.setPos(pos);
	let posPx = $screen1.getPosPx();
	while( angle > 180) {
		$screen1.setColor(4);
		let prompt = "Angle: ";
		if(gorilla.lastAngle) {
			prompt = "Angle(" + gorilla.lastAngle + "): ";
		}
		$screen1.setPos(pos);
		angle = await $screen1.input(prompt, null, true, true, false);
		if( angle > 180 ) {
			$screen1.cls(0, posPx.y, WIDTH, 50);
		}
	}
	gorilla.lastAngle = angle;
	let velocity = 200;
	while(velocity > 199) {
		let prompt = "Velocity: ";
		if(gorilla.lastVelocity) {
			prompt = "Velocity(" + gorilla.lastVelocity + "): ";
		}
		$screen1.setPos(pos.col, pos.row + 1);
		velocity = await $screen1.input(prompt, null, true, true, false);
		if( velocity > 199 ) {
			$screen1.cls(0, posPx.y, WIDTH, 50);
			$screen1.setColor(4);
			$screen1.setPos(pos);
			$screen1.print("Angle: " + angle);
		}
	}
	gorilla.lastVelocity = velocity;
	throwBanana(gorilla, angle, velocity);
}

function throwBanana(gorilla, angle, velocity) {
	let banana = createBanana();
	lastBanana = null;
	if(gorilla.hand === "right") {
		banana.x = gorilla.x - 16;
		banana.y = gorilla.y - 22;
		banana.vx = Math.cos(Math.PI / 180 * -angle) * (velocity / 650);
		banana.vy = Math.sin(Math.PI / 180 * -angle) * (velocity / 650);
		gorilla.rightArmUp = true;
	} else {
		angle -= 180;
		banana.x = gorilla.x + 12;
		banana.y = gorilla.y - 28;
		banana.vx = Math.cos(Math.PI / 180 * angle) * (velocity / 650);
		banana.vy = Math.sin(Math.PI / 180 * angle) * (velocity / 650);
		gorilla.leftArmUp = true;
	}
	//$.sound(
    //	392, 0.25, 0.35, "sawtooth", 0, 0.25, 0
  	//);
	if(useSound) {
		$.play("square O3T255C8D8");
	}
	setTimeout(function () {
		drawGorilla(gorilla);
		animateBanana(banana, gorilla);
	}, 100);
}

function animateBanana(banana, gorilla) {
	let t = new Date().getTime();
	let startTime = t;
	let tick = 0;
	let surprise = false;
	let armDown = false;
	let interval = setInterval(function () {
		let nt = new Date().getTime();
		let dt = (nt - t);
		if(dt > 100) {
			dt = 100;
		}
		if(!armDown && nt - startTime > 1000) {
			gorilla.leftArmUp = false;
			gorilla.rightArmUp = false;
			drawGorilla(gorilla);
			armDown = true;
		}
		t = nt;
		banana.vy += 0.00005 * dt;
		banana.vx += (wind * 0.0000003) * dt;
		banana.x += banana.vx * dt;
		banana.y += banana.vy * dt;

		if(banana.y > HEIGHT + 10 || banana.x > WIDTH + 10 || banana.x < -10 ) {
			clearInterval(interval);
			beginTurn();
			return;
		}

		// Detect collision
		let hit = false;
		let hitGorilla = false;
		let data = $.get(banana.x, banana.y, banana.x + 6, banana.y + 6);
		for(let i = 0; i < data.length; i++) {
			for(let j = 0; j < data[i].length; j++) {
				if(banana.data[banana.frame][i][j] !== 0) {
					if(data[i][j] === 7) {
						// Hit a gorilla
						hit = true;
						hitGorilla = true;
					} else if(data[i][j] === 2) {
						// Hit the sun
						surprise = true;
					} else if(data[i][j] > 4) {
						// Hit a building
						hit = true;
					}
				}
			}
		}
		drawSun(surprise);
		if(hit) {
			clearInterval(interval);
			animateExplosion(hitGorilla, banana);
		}
		drawBanana(banana);
		tick = ( tick + 1 ) % 2;
		if(tick === 1) {
			banana.frame = ( banana.frame + 1 ) % 4;
		}
	}, 30);
}

function animateExplosion(hitGorilla, banana) {
	let size = 1;
	let lastSize = 0;
	let maxSize = 12;
	let ds = 1;
	let x = banana.x + 2;
	let y = banana.y + 4;
	let gorilla;
	if(hitGorilla) {
		maxSize *= 4;
		ds *= 4;
		if(banana.x > WIDTH / 2) {
			gorilla1.score += 1;
			gorilla = gorilla1;
		} else {
			gorilla2.score += 1;
			gorilla = gorilla2;
		}
	}
	playExplosion(hitGorilla);
	setTimeout(function () {
		let interval = setInterval(function () {
			$.setColor(0);
			for(let i = 0; i < lastSize; i++) {
				$.circle(x, y, i);
				$.circle(x + 1, y, i);
			}
			$.setColor(9);
			for(let i = 0; i < size; i++) {
				$.circle(x, y, i);
				$.circle(x + 1, y, i);
			}
			lastSize = size;
			size += ds;
			if(size >= maxSize) {
				ds *= -1;
			}
			if(size <= 0) {
				clearInterval(interval);
				if(hitGorilla) {
					setTimeout(function () {
						animateDance(gorilla);
					}, 500);
				} else {
					beginTurn();
				}
			}
			//$.render();
		}, 15);
	}, 100);
}

function playExplosion(isBig) {
	if(!useSound) {
		return;
	}
	if(isBig) {
		$.play("SQUARE T100 O3 V40 L16 EFGEFDC");
	} else {
		$.play("SQUARE T100 O2 V40 L32 EFGEFDC");
	}
}

function animateDance(gorilla) {
	let ticks = 6;
	let interval = setInterval(function () {
		playExplosion();
		setTimeout(function () {
			if(gorilla.leftArmUp) {
				gorilla.leftArmUp = false;
				gorilla.rightArmUp = true;
			} else {
				gorilla.leftArmUp = true;
				gorilla.rightArmUp = false;
			}
			drawGorilla(gorilla);
		}, 100);
		ticks -= 1;
		if(ticks <= 0) {
			clearInterval(interval);
			setTimeout(endTurn, 500);
		}
	}, 500);
}

function endTurn() {
	if(gorilla1.score + gorilla2.score >= numGames) {
		endGame();
	} else {
		startGame();
	}
}

function endGame() {
	let winner = gorilla1;
	if(gorilla2.score > gorilla1.score) {
		winner = gorilla2;
	} else if(gorilla1.score === gorilla2.score) {
		winner = null;
	}
	$screen1.cls();
	$screen2.cls();
	$screen1.print("\n\n\n");
	$screen1.print("GAME OVER!\n", false, true);
	$screen1.print(" And the winner is ....", false, true);
	$screen1.print("");
	if(useSound) {
		$.play(
			"SQUARE T120 O1 L16 B9 N0 B A A N0 B N0 B A A A N0 B9 N0 B A A N0 B " +
			"O2 L16 E-9 N0 E-D-D-N0E-N0E-N0E-N0E-D-D-D-N0E-N-E-9N0E-D-D-N0E-" +
			"O2 L16 B9 N0 B A A N0 G- N0 G- N0 G- E E E N0 O1 B9 N0 B A A N0 B "
		);
	}
	setTimeout(function () {
		if(winner === null) {
			$screen1.print("It's a tie!\n\n\n\n", false, true);
			gorilla1.x = 305;
			gorilla1.y = 155;
			gorilla1.leftArmUp = true;
			gorilla1.rightArmUp = false;
			gorilla2.x = 335;
			gorilla2.y = 155;
			gorilla2.leftArmUp = false;
			gorilla2.rightArmUp = true;
			drawGorilla(gorilla1);
			drawGorilla(gorilla2);
			gorilla1.leftArmUp = false;
			gorilla1.rightArmUp = false;
			gorilla2.leftArmUp = false;
			gorilla2.rightArmUp = false;
			for(let i = 0; i < 12; i++) {
				setTimeout(function () {
					if(i === 7) {
						gorilla1.leftArmUp = !gorilla1.leftArmUp;
						gorilla2.rightArmUp = !gorilla2.rightArmUp;
					}
					if(i >= 7 && useSound) {
						$.play( "SQUARE T160 O2 L32 EFGEFDC" );
					}
					setTimeout(function () {
						gorilla1.leftArmUp = !gorilla1.leftArmUp;
						gorilla1.rightArmUp = !gorilla1.rightArmUp;
						gorilla2.leftArmUp = !gorilla2.leftArmUp;
						gorilla2.rightArmUp = !gorilla2.rightArmUp;
						drawGorilla(gorilla1);
						drawGorilla(gorilla2);
					}, 100);
				}, 1650 + i * 500);	
			}
		} else {
			$screen1.print(winner.name + "\n\n\n\n", false, true);
			gorilla1.x = 320;
			gorilla1.y = 155;
			gorilla1.leftArmUp = true;
			gorilla1.rightArmUp = true;
			drawGorilla(gorilla1);
			for(let i = 0; i < 12; i++) {
				setTimeout(function () {
					if(i === 7) {
						gorilla1.leftArmUp = !gorilla1.leftArmUp;
					}
					if(i >= 7 && useSound) {
						$.play( "SQUARE T160 O2 L32 EFGEFDC" );
					}
					setTimeout(function () {
						gorilla1.leftArmUp = !gorilla1.leftArmUp;
						gorilla1.rightArmUp = !gorilla1.rightArmUp;
						drawGorilla(gorilla1);
					}, 100);
				}, 1650 + i * 500);	
			}
		}
		$screen1.print("Score", false, true);
		$screen1.print("-".padEnd(17, "-"), false, true);
		$screen1.print(gorilla1.name.padEnd(13, " ") + String(gorilla1.score).padStart(4), false, true);
		$screen1.print(gorilla2.name.padEnd(13, " ") + String(gorilla2.score).padStart(4), false, true);
	}, 3000);
}