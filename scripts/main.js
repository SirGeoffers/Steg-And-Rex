
var DEBUG = false;

var canvas;
var stage;

// [CONSTANTS]

var GRAVITY = 70;

var KEYCODE_ENTER = 13;
var KEYCODE_SPACE = 32;
var KEYCODE_UP = 38;
var KEYCODE_LEFT = 37;
var KEYCODE_RIGHT = 39;
var KEYCODE_DOWN = 40;
var KEYCODE_W = 87;
var KEYCODE_A = 65;
var KEYCODE_D = 68;
var KEYCODE_S = 83;
var KEYCODE_SQUIGGLE = 192;

var State = {
	Menu: 0,
	Game: 1
};
var currentState = 0;

// [GRAPHICS]

var backContainer;

var menuContainer;

var gameContainer;
var mainContainer;
var secondaryContainer;
var debugContainer;

var bgImg;

// Menu
var titleImg;
var startButtonImg;

// Game
var steg;
var rex;
var dinoList = [];
var groundList = [];
var nestList = [];
var signList = [];
var timer;
var backgroundList = [];

// [PRELOADER]

var loader;
var manifest;
var totalLoaded = 0;

// [GAME]

// Controls
var aDown = false;
var dDown = false;
var wDown = false;
var sDown = false;
var leftDown = false;
var rightDown = false;
var upDown = false;
var downDown = false;

// Variables
var dinoSpeed = 400;
var attackSpeed = 1000;
var jumpHeight = 1300;

// Called when page is loaded
function init() {

	canvas = document.getElementById("GameStage");
	stage = new createjs.Stage(canvas);

	stage.mouseEventEnabled = true;

	manifest = [
		{src:"title_image_8x.png", id: "title_image"},
		{src:"menu_board_4x.png", id:"menu_board"},
		{src:"menu_buttons_6x.png", id:"menu_buttons"},

		{src:"dinos4x.png", id: "dinos"},
		{src:"spring_upper_ground_4x.png", id: "springupperground"},
		{src:"spring_main_ground_4x.png", id: "springmainground"},
		{src:"nest4x.png", id:"nest"},
		{src:"egg_rex_4x.png", id:"egg_rex"},
		{src:"egg_steg_4x.png", id:"egg_steg"},
		{src:"egg_sack_rex_4x.png", id:"egg_sack_rex"},
		{src:"egg_sack_steg_4x.png", id:"egg_sack_steg"},
		{src:"ball_rex_4x.png", id:"ball_rex"},
		{src:"ball_steg_4x.png", id:"ball_steg"},
		{src:"sign4x.png", id:"sign"},
		{src:"font2x.png", id:"font2x"},
		{src:"font4x.png", id:"font4x"},
		{src:"time_board_4x.png", id:"timer_board"},

		{src:"background_front_4x.png", id:"background_front"},
		{src:"background_back_4x.png", id:"background_back"}
	];

	loader = new createjs.LoadQueue(false);
	loader.addEventListener("complete", handleComplete);
	loader.loadManifest(manifest, true, "images/");

	document.onkeydown = onKeyDown;
	document.onkeyup = onKeyUp;

}

// Called when stage has been created
function handleComplete() {

	// Create containers
	backContainer = new createjs.Container();
	menuContainer = new createjs.Container();
	gameContainer = new createjs.Container();
	mainContainer = new createjs.Container();
	secondaryContainer = new createjs.Container();
	debugContainer = new createjs.Container();

	// Populate containers
	initMenu();
	initGame();

	// Add everything to stage
	stage.addChild(backContainer);
	stage.addChild(gameContainer);
	stage.addChild(menuContainer);

	// Move game out of view
	gameContainer.y = 720;

	// Check for debug mode (~)
	if (!DEBUG) debugContainer.alpha = 0;

	// Ticker
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", tick);

}

function initMenu() {

	// Create title
	var title = new createjs.Bitmap(loader.getResult("title_image"));
	title.regX = 192;
	title.x = 640;
	title.y = 0;

	// Create menu board
	var menuBoard = new createjs.Bitmap(loader.getResult("menu_board"));
	menuBoard.regX = 200;
	menuBoard.x = 640;
	menuBoard.y = 352;

	// Create menu buttons
	var menuButtonSpritesheet = new createjs.SpriteSheet({
		framerate: 10,
		"images": [loader.getResult("menu_buttons")],
		"frames": {"regX": 165, "height": 48, "count": 6, "regyY": 0, "width": 330},
		"animations": {
			"play_off": [0, 0, "play_off", 0.0],
			"play_on": [1, 1, "play_on", 0.0],
			"options_off": [2, 2, "options_off", 0.0],
			"options_on": [3, 3, "options_on", 0.0],
			"exit_off": [4, 4, "exit_off", 0.0],
			"exit_on": [5, 5, "exit_on", 0.0]
		}
	});

	var menuButtonContainer = new createjs.Container();
	var playButton = new MenuButton(0, 0, "play", menuButtonSpritesheet);
	var optionsButton = new MenuButton(0, 56, "options", menuButtonSpritesheet);
	var exitButton = new MenuButton(0, 112, "exit", menuButtonSpritesheet);

	playButton.select();

	menuButtonContainer.x = 640;
	menuButtonContainer.y = 400;
	menuButtonContainer.addChild(playButton.shape);
	menuButtonContainer.addChild(optionsButton.shape);
	menuButtonContainer.addChild(exitButton.shape);

	// Add everything to container
	menuContainer.addChild(title);
	menuContainer.addChild(menuBoard);
	menuContainer.addChild(menuButtonContainer);

}

function initGame() {

	// Create ground
	var ground;

	ground = new Ground(440, 400, 400, 40, 0, -16, loader.getResult("springupperground"));
	groundList.push(ground);

	ground = new Ground(56, 600, 1168, 40, 0, -16, loader.getResult("springmainground"));
	groundList.push(ground);

	// Font setup
	var fontSpritesheet = new createjs.SpriteSheet({
		framerate: 10,
		"images": [loader.getResult("font2x")],
		"frames": {"regX": 24, "height": 30, "count": 11, "regyY": 0, "width": 26}
	});

	var fontSpritesheet4x = new createjs.SpriteSheet({
		framerate: 10,
		"images": [loader.getResult("font4x")],
		"frames": {"regX": 0, "height": 60, "count": 11, "regyY": 0, "width": 52}
	});

	// Create players
	var dinoSpritesheet = new createjs.SpriteSheet({
		framerate: 15,
		"images": [loader.getResult("dinos")],
		"frames": {"regX": 24, "height": 64, "count": 48, "regyY": 0, "width": 64},
		"animations": {
			"rex_idle": [0, 4, "rex_idle", 1.0],
			"rex_run": [16, 23, "rex_run", 1.0],
			"rex_jumpUp": [32, 32, "rex_jumpUp", 0.0],
			"rex_jumpDown": [33, 33, "rex_jumpDown", 0.0],
			"rex_stunned": [39, 39, "rex_stunned", 0.0],
			"steg_idle": [8, 12, "steg_idle", 1.0],
			"steg_run": [24, 31, "steg_run", 1.0],
			"steg_jumpUp": [40, 40, "steg_jumpUp", 0.0],
			"steg_jumpDown": [41, 41, "steg_jumpDown", 0.0],
			"steg_stunned": [47, 47, "steg_stunned", 0.0]
		}
	});
	steg = new Dinosaur(1000, 400, "steg", 16, -20, dinoSpritesheet, loader.getResult("egg_sack_steg"), loader.getResult("ball_steg"));
	rex = new Dinosaur(244, 400, "rex", 16, -20, dinoSpritesheet, loader.getResult("egg_sack_rex"), loader.getResult("ball_rex"));
	steg.mainContainer.scaleX = -1;

	dinoList = {steg, rex};

	// Create all the extra stuff (things that don't need attention)
	var nest1 = new Nest(140, 572, loader.getResult("nest"), loader.getResult("egg_rex"));
	var nest2 = new Nest(1068, 572, loader.getResult("nest"), loader.getResult("egg_steg"));
	var sign1 = new Sign(144, 600, nest1, loader.getResult("sign"), fontSpritesheet);
	var sign2 = new Sign(1072, 600, nest2, loader.getResult("sign"), fontSpritesheet);

	for (var e in nest1.eggs) {
		mainContainer.addChild(e.shape);
	}

	nestList["rex"] = nest1;
	nestList["steg"] = nest2;
	signList = {sign1, sign2};

	timerBoard = new TimerBoard(640, 28, 90, loader.getResult("timer_board"), fontSpritesheet4x);

	var backgroundBack1 = new Background(0, 0, 1, loader.getResult("background_back"));
	var backgroundBack2 = new Background(-1280, 0, 1, loader.getResult("background_back"));
	var backgroundFront1 = new Background(0, 0, 2, loader.getResult("background_front"));
	var backgroundFront2 = new Background(-1280, 0, 2, loader.getResult("background_front"));
	backgroundList = {backgroundBack1, backgroundBack2, backgroundFront1, backgroundFront2};

	// Add everything to the containers

	// Background
	for (var b in backgroundList) {
		b = backgroundList[b];
		backContainer.addChild(b.shape);
	}

	// Timer
	secondaryContainer.addChild(timerBoard.timerContainer);

	// Nests
	for (var n in nestList) {
		n = nestList[n];
		secondaryContainer.addChild(n.shape);
		debugContainer.addChild(n.boundShape);
		for (var e in n.eggs) {
			e = n.eggs[e];
			secondaryContainer.addChild(e.shape);
		}
	}

	// Dinos
	for (var d in dinoList) {
		d = dinoList[d];
		mainContainer.addChild(d.mainContainer);
		debugContainer.addChild(d.boundShape);
	}

	// Ground pieces
	for (var g in groundList) {
		g = groundList[g];
		mainContainer.addChild(g.shape);
		debugContainer.addChild(g.boundShape);
	}

	// Signs
	for (var s in signList) {
		s = signList[s];
		mainContainer.addChild(s.shape);
		mainContainer.addChild(s.scoreShape);
	}

	// Image containers
	gameContainer.addChild(secondaryContainer);
	gameContainer.addChild(mainContainer);
	gameContainer.addChild(debugContainer);

}

function changeState(state) {

	switch (state) {
		case State["Menu"]:
			break;
		case State["Game"]:
			break;
		default:
			break;
	}

}

// Called a lot all of the time
function tick(event) {

	// Do stuff based on current state
	switch (currentState) {
		case State["Menu"]:
			onMenu(event);
			break;
		case State["Game"]:
			onGame(event);
			break;
		default:
			break;
	}

	// Move background
	for (var b in backgroundList) {
		b = backgroundList[b];
		b.move();
	}

	// Update changes
	stage.update(event);

}

// Called when in menu
function onMenu(event) {

	if (rightDown) {
		currentState = State["Game"];
		menuContainer.y = -720;
		gameContainer.y = 0;
	}

}

// Called when in game
function onGame(event) {

	var deltaS = event.delta / 1000;

	// Check for attack command
	if (!rex.stunned) {
		if (sDown && rex.canAttack) {
			rex.attack();
		}
	}
	
	if (!steg.stunned) {
		if (downDown && steg.canAttack) {
			steg.attack();
		}
	}

	if (!rex.attacking) {

		// Update Rex x velocity
		if (!rex.stunned) {
			if (aDown && !dDown) {
				rex.xVel = -dinoSpeed;
				rex.mainContainer.scaleX = -1;
			} else if (dDown && !aDown) {
				rex.xVel = dinoSpeed;
				rex.mainContainer.scaleX = 1;
			} else {
				rex.xVel = 0;
			}
		}
		

		// Update Rex y velocity
		rex.yVel += GRAVITY;
		if (wDown && rex.jumpReady && !rex.jumping && !rex.stunned) {
			rex.jumping = true;
			rex.jumpReady = false;
			rex.yVel = -jumpHeight;
		}

	}

	if (!steg.attacking) {

		// Update Steg x velocity
		if (!steg.stunned) {
			if (leftDown && !rightDown) {
				steg.xVel = -dinoSpeed;
				steg.mainContainer.scaleX = -1;
			} else if (rightDown && !leftDown) {
				steg.xVel = dinoSpeed;
				steg.mainContainer.scaleX = 1;
			} else {
				steg.xVel = 0;
			}
		}
		

		// Update Steg y velocity
		steg.yVel += GRAVITY;
		if (upDown && steg.jumpReady && !steg.jumping && !steg.stunned) {
			steg.jumping = true;
			steg.jumpReady = false;
			steg.yVel = -jumpHeight;
		}

	}

	// Update dinosaur positions based on input
	for (var d in dinoList) {

		d = dinoList[d];

		if (!d.canAttack) {
			d.attackTimer -= deltaS;
			if (d.attackTimer < -1) {
				d.canAttack = true;
			}
		}

		if (d.stunned) {
			d.stunTimer -= deltaS;
			if (d.stunTimer < 0) {
				d.stunned = false;
				d.invulnerable = true;
				d.invulnerableTimer = 0;
			}
			if (!d.jumping) {
				d.xVel = 0;
			}
		}

		if (d.invulnerable) {
			d.invulnerableTimer += deltaS;
			d.shape.alpha = Math.sin(d.invulnerableTimer * 20) * 0.4 + 0.5;
			if (d.invulnerableTimer > 2) {
				d.invulnerable = false;
				d.shape.alpha = 1.0;
			}
		}

		if (d.attacking) {

			d.ball.rotation += 30;
			d.xVel = attackSpeed * d.mainContainer.scaleX;
			d.yVel = 0;

			if (d.attackTimer < 0) {
				d.stopAttacking();
				d.xVel = 0;
				d.yVel = 0;
			}

		}

		// Hide / Reveal Egg (current carrying?)
		if (d.hasEgg) {
			d.showSack();
		} else {
			d.hideSack();
		}

		// Move in x direction
		d.move(d.xVel * deltaS, 0);

		// Prevent dino from moving off sides
		if (d.x < 8) {
			d.x = 8;
			d.xVel = 0;
		} else if (d.x > 1240) {
			d.x = 1240;
			d.xVel = 0;
		}

		// Check for collision with ground in x direction
		for (var i = 0; i < groundList.length; i++) {

			var g = groundList[i];

			if (d.collidesWith(g)) {

				if (d.xVel > 0) {
					d.moveTo(g.x - d.width, d.y)
				} else {
					d.moveTo(g.x + g.width, d.y)
				}
				d.xVel = 0;

				break;

			}

		}

		// Limit y velocity
		if (d.yVel > 1500) {
			d.yVel = 1500;
		}

		// Move in y direction
		d.move(0, d.yVel * deltaS);

		// Loop if fell below screen
		if (d.y > 750) {
			d.y = 0;
		}

		//Check for collision with ground in y direction
		for (var i = 0; i < groundList.length; i++) {

			var g = groundList[i];

			if (d.collidesWith(g)) {

				if (d.yVel > 0) {
					d.jumping = false;
					d.jumpReady = true;
					d.moveTo(d.x, g.y - d.height)
				} else {
					d.moveTo(d.x, g.y + d.height)
				}
				d.yVel = 0;

				break;

			}

		}

		// Check for collision with attacking dinos
		for (var otherD in dinoList) {
			otherD = dinoList[otherD];
			if (otherD.type != d.type) {
				if (d.collidesWith(otherD) && d.attacking && !otherD.attacking && !otherD.invulnerable) {
					otherD.stun();
					if (otherD.hasEgg) {
						otherD.hasEgg = false;
						nestList[d.type].addEgg();
					}
				}
			}
		}

		// Check if falling
		if (d.yVel > 0) {
			d.jumpReady = false;
			d.jumping = true;
		}

		// Update animations
		if (d.stunned) {
			d.shape.gotoAndPlay(d.type + "_stunned");
		} else if (d.jumping) {
			if (d.yVel < 0) {
				d.shape.gotoAndPlay(d.type + "_jumpUp");
			} else {
				d.shape.gotoAndPlay(d.type + "_jumpDown");
			}
		} else if (d.xVel == 0 && d.shape.currentAnimation != d.type + "_idle") {
			d.shape.gotoAndPlay(d.type + "_idle");
		} else if (d.xVel != 0 && d.shape.currentAnimation != d.type + "_run") {
			d.shape.gotoAndPlay(d.type + "_run");
		}

	}

	// Check for nest collisions
	if (!rex.hasEgg && rex.collidesWith(nestList["steg"]) && nestList["steg"].numEggs > 0) {
		rex.grabEgg(nestList["steg"]);
	} else if (rex.hasEgg && rex.collidesWith(nestList["rex"])) {
		rex.placeEgg(nestList["rex"]);
	}

	if (!steg.hasEgg && steg.collidesWith(nestList["rex"]) && nestList["rex"].numEggs > 0) {
		steg.grabEgg(nestList["rex"]);
	} else if (steg.hasEgg && steg.collidesWith(nestList["steg"])) {
		steg.placeEgg(nestList["steg"]);
	}

	// Update scores
	for (var s in signList) {
		s = signList[s];
		s.updateScore();
	}

	// Update timer
	timerBoard.tick(deltaS);

}

// Toggles debug mode (shows hitboxes and other info)
function toggleDebug() {

	DEBUG = !DEBUG;
	if (DEBUG) {
		debugContainer.alpha = 1;
	} else {
		debugContainer.alpha = 0;
	}

}

// Called when a key is pressed
function onKeyDown(event) {
	
	switch(event.keyCode) {

		case KEYCODE_A:
			aDown = true;
			break;
		case KEYCODE_D:
			dDown = true;
			break;
		case KEYCODE_W:
			wDown = true;
			break;
		case KEYCODE_S:
			sDown = true;
			break;
		case KEYCODE_LEFT:
			leftDown = true;
			break;
		case KEYCODE_RIGHT:
			rightDown = true;
			break;
		case KEYCODE_UP:
			upDown = true;
			break;
		case KEYCODE_DOWN:
			downDown = true;
			break;
		case KEYCODE_SQUIGGLE:
			toggleDebug();
			break;

	}

}

// Called when a key is released
function onKeyUp(event) {

	switch(event.keyCode) {

		case KEYCODE_A:
			aDown = false;
			break;
		case KEYCODE_D:
			dDown = false;
			break;
		case KEYCODE_W:
			wDown = false;
			break;
		case KEYCODE_S:
			sDown = false;
			break;
		case KEYCODE_LEFT:
			leftDown = false;
			break;
		case KEYCODE_RIGHT:
			rightDown = false;
			break;
		case KEYCODE_UP:
			upDown = false;
			break;
		case KEYCODE_DOWN:
			downDown = false;
			break;

	}

}