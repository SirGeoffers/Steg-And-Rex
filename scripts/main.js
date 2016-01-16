
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
var KEYCODE_DOWN = 36;
var KEYCODE_W = 87;
var KEYCODE_A = 65;
var KEYCODE_D = 68;
var KEYCODE_S = 0;
var KEYCODE_SQUIGGLE = 192;

// [GRAPHICS]

var mainContainer;
var backContainer;
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

// [PRELOADER]

var loader;
var manifest;
var totalLoaded = 0;

// [GAME]

// Controls
var aDown = false;
var dDown = false;
var wDown = false;
var leftDown = false;
var rightDown = false;
var upDown = false;

// Variables
var dinoSpeed = 400;
var jumpHeight = 1300;
var score = [];

// Called when page is loaded
function init() {

	canvas = document.getElementById("GameStage");
	stage = new createjs.Stage(canvas);

	stage.mouseEventEnabled = true;

	manifest = [
		{src:"dinos4x.png", id: "dinos"},
		{src:"spring_upper_ground_4x.png", id: "springupperground"},
		{src:"spring_main_ground_4x.png", id: "springmainground"},
		{src:"nest4x.png", id:"nest"},
		{src:"egg_rex_4x.png", id:"egg_rex"},
		{src:"egg_steg_4x.png", id:"egg_steg"},
		{src:"sign4x.png", id:"sign"},
		{src:"font2x.png", id:"font2x"}
	];

	loader = new createjs.LoadQueue(false);
	loader.addEventListener("complete", handleComplete);
	loader.loadManifest(manifest, true, "images/");

	document.onkeydown = onKeyDown;
	document.onkeyup = onKeyUp;

}

// Called when stage has been created
function handleComplete() {

	mainContainer = new createjs.Container();
	backContainer = new createjs.Container();
	debugContainer = new createjs.Container();

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
			"steg_idle": [8, 12, "steg_idle", 1.0],
			"steg_run": [24, 31, "steg_run", 1.0],
			"steg_jumpUp": [40, 40, "steg_jumpUp", 0.0],
			"steg_jumpDown": [41, 41, "steg_jumpDown", 0.0],
		}
	});
	steg = new Dinosaur(1000, 400, "steg", 16, -20, dinoSpritesheet);
	rex = new Dinosaur(244, 400, "rex", 16, -20, dinoSpritesheet);
	steg.shape.scaleX = -1;

	dinoList = {steg, rex};

	// Create all the extra stuff (things that don't need attention)
	var nest1 = new Nest(140, 572, loader.getResult("nest"), loader.getResult("egg_rex"));
	var nest2 = new Nest(1068, 572, loader.getResult("nest"), loader.getResult("egg_steg"));
	var sign1 = new Sign(144, 600, nest1, loader.getResult("sign"), fontSpritesheet);
	var sign2 = new Sign(1072, 600, nest2, loader.getResult("sign"), fontSpritesheet);

	for (var e in nest1.eggs) {
		mainContainer.addChild(e.shape);
	}

	nestList = {nest1, nest2};
	signList = {sign1, sign2};

	// Add everything to the stage
	mainContainer.addChild(nest1.shape);
	debugContainer.addChild(nest1.boundShape);

	// Nests
	for (var n in nestList) {
		n = nestList[n];
		backContainer.addChild(n.shape);
		debugContainer.addChild(n.boundShape);
		for (var e in n.eggs) {
			e = n.eggs[e];
			backContainer.addChild(e.shape);
		}
	}

	// Dinos
	for (var d in dinoList) {
		d = dinoList[d];
		mainContainer.addChild(d.shape);
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
	stage.addChild(backContainer);
	stage.addChild(mainContainer);
	stage.addChild(debugContainer);

	// Check for debug mode (~)
	if (!DEBUG) debugContainer.alpha = 0;

	// Ticker
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", tick);

}

// Called a lot all of the time
function tick(event) {

	var deltaS = event.delta / 1000;

	// Update Rex x velocity
	if (aDown && !dDown) {
		rex.xVel = -dinoSpeed;
		rex.shape.scaleX = -1;
	} else if (dDown && !aDown) {
		rex.xVel = dinoSpeed;
		rex.shape.scaleX = 1;
	} else {
		rex.xVel = 0;
	}

	// Update Steg x velocity
	if (leftDown && !rightDown) {
		steg.xVel = -dinoSpeed;
		steg.shape.scaleX = -1;
	} else if (rightDown && !leftDown) {
		steg.xVel = dinoSpeed;
		steg.shape.scaleX = 1;
	} else {
		steg.xVel = 0;
	}

	// Update Rex y velocity
	rex.yVel += GRAVITY;
	if (wDown && rex.jumpReady && !rex.jumping) {
		rex.jumping = true;
		rex.jumpReady = false;
		rex.yVel = -jumpHeight;
	}

	// Update Steg y velocity
	steg.yVel += GRAVITY;
	if (upDown && steg.jumpReady && !steg.jumping) {
		steg.jumping = true;
		steg.jumpReady = false;
		steg.yVel = -jumpHeight;
	}

	// Update dinosaur positions based on input
	for (var d in dinoList) {

		d = dinoList[d];

		// Move in x direction
		d.move(d.xVel * deltaS, 0);

		// Check for collision
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

		// Move in y direction
		d.move(0, d.yVel * deltaS);

		//Check for collision
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

		// Check if falling
		if (d.yVel > 0) {
			d.jumpReady = false;
			d.jumping = true;
		}

		// Update animations
		if (d.jumping) {
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
	if (!rex.hasEgg && rex.collidesWith(nestList["nest2"])) {
		rex.grabEgg(nestList["nest2"]);
	} else if (rex.hasEgg && rex.collidesWith(nestList["nest1"])) {
		rex.placeEgg(nestList["nest1"]);
	}

	if (!steg.hasEgg && steg.collidesWith(nestList["nest1"])) {
		steg.grabEgg(nestList["nest1"]);
	} else if (steg.hasEgg && steg.collidesWith(nestList["nest2"])) {
		steg.placeEgg(nestList["nest2"]);
	}

	// Update scores
	for (var s in signList) {
		s = signList[s];
		s.updateScore();
	}

	// Update changes
	stage.update(event);

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