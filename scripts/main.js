
var DEBUG = false;

var canvas;
var stage;

// [CONSTANTS]

var GRAVITY = 40;

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
var KEYCODE_SQUIGGLE = 192

// [GRAPHICS]

var mainContainer;
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
var dinoSpeed = 300;
var jumpHeight = 600;

function init() {

	canvas = document.getElementById("GameStage");
	stage = new createjs.Stage(canvas);

	stage.mouseEventEnabled = true;

	manifest = [
		{src:"dinos4x.png", id: "dinos"},
		{src:"spring_upper_ground_4x.png", id: "springupperground"},
		{src:"spring_main_ground_4x.png", id: "springmainground"}
	];

	loader = new createjs.LoadQueue(false);
	loader.addEventListener("complete", handleComplete);
	loader.loadManifest(manifest, true, "images/");

	document.onkeydown = onKeyDown;
	document.onkeyup = onKeyUp;

}

function handleComplete() {

	mainContainer = new createjs.Container();
	debugContainer = new createjs.Container();

	// Create ground
	var ground;

	ground = new Ground(440, 400, 400, 40, 0, -16, loader.getResult("springupperground"));
	groundList.push(ground);

	ground = new Ground(56, 600, 1168, 40, 0, -16, loader.getResult("springmainground"));
	groundList.push(ground);

	// Create players
	var spritesheet = new createjs.SpriteSheet({
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
	steg = new Dinosaur(940, 100, "steg", 16, -20, spritesheet);
	rex = new Dinosaur(640, 100, "rex", 16, -20, spritesheet);

	dinoList = {steg, rex};

	// Add everything to the stage
	mainContainer.addChild(steg.shape);
	debugContainer.addChild(steg.boundShape);

	mainContainer.addChild(rex.shape);
	debugContainer.addChild(rex.boundShape);

	for (var i = 0; i < groundList.length; i++) {
		var g = groundList[i];
		mainContainer.addChild(g.shape);
		debugContainer.addChild(g.boundShape);
	}

	stage.addChild(mainContainer);
	stage.addChild(debugContainer);

	if (!DEBUG) debugContainer.alpha = 0;

	// Ticker
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", tick);

}

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
				}
				d.yVel = 0;
				d.moveTo(d.x, g.y - d.height)

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

	stage.update(event);

}

function toggleDebug() {

	DEBUG = !DEBUG;
	if (DEBUG) {
		debugContainer.alpha = 1;
	} else {
		debugContainer.alpha = 0;
	}

}

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