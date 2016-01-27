
// [DINOSAUR] (rawr)

// Constructor
function Dinosaur(x, y, type, imageOffsetX, imageOffsetY, spritesheet, sackImage, ballImage) {

	this.type = type;

	this.x = x;
	this.y = y;

	this.imageOffsetX = imageOffsetX;
	this.imageOffsetY = imageOffsetY;

	this.width = 36;
	this.height = 44;

	this.xVel = 0;
	this.yVel = 0;

	this.jumping = true;
	this.jumpReady = false;
	this.hasEgg = false;

	this.attacking = false;
	this.canAttack = true;
	this.attackTimer = 0;

	this.stunned = false;
	this.stunTimer = 0;
	this.invulnerable = false;
	this.invulnerableTimer = 0;

	// Display image
	this.mainContainer = new createjs.Container();

	this.dinoContainer = new createjs.Container();
	this.shape = new createjs.Sprite(spritesheet, this.type + "_idle");
	this.sack = new createjs.Bitmap(sackImage);
	this.sack.x = -28;
	this.sack.y = -8;
	this.dinoContainer.addChild(this.sack);
	this.dinoContainer.addChild(this.shape);

	this.ball = new createjs.Bitmap(ballImage);
	this.ball.regX = 32;
	this.ball.regY = 32;
	this.ball.x = 0;
	this.ball.y = 32;
	this.ball.alpha = 0.0;

	this.mainContainer.addChild(this.dinoContainer);
	this.mainContainer.addChild(this.ball);

	// Debug rect
	this.boundShape = new createjs.Shape();
	this.boundShape.graphics.beginFill("#ff00ff").drawRect(0, 0, this.width, this.height);
	this.boundShape.alpha = 0.5;

	this.moveTo(x, y);

}

Dinosaur.prototype.move = function(dx, dy) {
	this.x += dx;
	this.y += dy;
	this.updateShapes();
}

Dinosaur.prototype.moveTo = function(x, y) {
	this.x = x;
	this.y = y;
	this.updateShapes();
}

Dinosaur.prototype.grabEgg = function(nest) {
	this.hasEgg = true;
	nest.removeEgg();
}

Dinosaur.prototype.placeEgg = function(nest) {
	this.hasEgg = false;
	nest.addEgg();
}

Dinosaur.prototype.showSack = function() {
	this.sack.alpha = 1.0;
}

Dinosaur.prototype.hideSack = function() {
	this.sack.alpha = 0.0;
}

Dinosaur.prototype.attack = function() {
	this.attacking = true;
	this.canAttack = false;
	this.attackTimer = 0.2;
	this.ball.rotation = 0;
	this.ball.alpha = 1;
	this.dinoContainer.alpha = 0;
}

Dinosaur.prototype.stopAttacking = function() {
	this.attacking = false;
	this.ball.alpha = 0;
	this.dinoContainer.alpha = 1;
}

Dinosaur.prototype.stun = function() {
	this.stunned = true;
	this.stunTimer = 1.5;	
}

Dinosaur.prototype.updateShapes = function() {
	this.mainContainer.x = this.x + this.imageOffsetX;
	this.mainContainer.y = this.y + this.imageOffsetY;
	this.boundShape.x = this.x;
	this.boundShape.y = this.y;
}

Dinosaur.prototype.collidesWith = function(o) {
	if (this.boundShape.x < o.boundShape.x + o.width &&
		this.boundShape.x + this.width > o.boundShape.x &&
		this.boundShape.y < o.boundShape.y + o.height &&
		this.boundShape.y + this.height > o.boundShape.y) {
		return true;
	}
	return false;
}


// [GROUND TILE]

// Constructor
function Ground(x, y, width, height, imageOffsetX, imageOffsetY, image) {

	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.imageOffsetX = imageOffsetX;
	this.imageOffsetY = imageOffsetY;

	// Display image
	this.shape = new createjs.Bitmap(image);
	this.shape.x = x + imageOffsetX;
	this.shape.y = y + imageOffsetY;

	// Debug rect
	this.boundShape = new createjs.Shape();
	this.boundShape.graphics.beginFill("#00ff00").drawRect(0, 0, width, height);
	this.boundShape.alpha = 0.5;
	this.boundShape.x = x;
	this.boundShape.y = y;

}


// [NEST]
var MAX_EGGS = 6;
var eggInfo = [[46, -25, 20], [26, -25, -20], [16, 0, -20], [56, 0, 20], [28, 0, -10], [44, 0, 10]];

// Constructor
function Nest(x, y, image, eggImage) {

	this.x = x;
	this.y = y;
	this.width = 72;
	this.height = 36;

	this.imageOffsetX = 0;
	this.imageOffsetY = 0;

	this.numEggs = 3;
	this.eggs = [];
	for (var i = 0; i < MAX_EGGS; i++) {
		this.eggs.push(new Egg(this.x + eggInfo[i][0], this.y - 12 + eggInfo[i][1], eggImage, eggInfo[i][2]));
	}
	for (var i = 0; i < MAX_EGGS - this.numEggs; i++) {
		this.eggs[i].hide();
	}

	// Display image
	this.shape = new createjs.Bitmap(image);
	this.shape.x = x + this.imageOffsetX;
	this.shape.y = y + this.imageOffsetY;

	// Debug rect
	this.boundShape = new createjs.Shape();
	this.boundShape.graphics.beginFill("#0000ff").drawRect(0, 0, this.width, this.height);
	this.boundShape.alpha = 0.5;
	this.boundShape.x = x;
	this.boundShape.y = y;

}

Nest.prototype.addEgg = function() {
	if (this.numEggs < MAX_EGGS) {
		this.eggs[MAX_EGGS-this.numEggs-1].reveal();
		this.numEggs++;
	}
}

Nest.prototype.removeEgg = function() {
	if (this.numEggs > 0) {
		this.eggs[MAX_EGGS-this.numEggs].hide();
		this.numEggs--;
	}
}


// [EGG]

// Constructor
function Egg(x, y, image, rotation) {

	this.imageOffsetX = 0;
	this.imageOffsetY = 0;

	// Display image
	this.shape = new createjs.Bitmap(image);
	this.shape.x = x + this.imageOffsetX;
	this.shape.y = y + this.imageOffsetY;
	this.shape.regX = 16;
	this.shape.regY = 22;
	this.shape.rotation = rotation;

}

Egg.prototype.reveal = function() {
	this.shape.alpha = 1.0;
}

Egg.prototype.hide = function() {
	this.shape.alpha = 0.0;
}


// [SIGN]

// Constructor
function Sign(x, y, nest, image, fontSpritesheet) {

	this.nest = nest;

	// Display image
	this.shape = new createjs.Bitmap(image);
	this.shape.x = x;
	this.shape.y = y;

	this.scoreShape = new createjs.Sprite(fontSpritesheet);
	this.scoreShape.x = x + 44;
	this.scoreShape.y = y + 20;
	this.updateScore();

}

Sign.prototype.updateScore = function() {
	this.scoreShape.gotoAndStop(this.nest.numEggs);
}


// [TIMER]

// Constructor
function TimerBoard(x, y, initialTime, image, fontSpritesheet) {

	this.time = initialTime;
	this.delta = 0;

	this.shape = new createjs.Bitmap(image);
	this.shape.x = x;
	this.shape.y = y;
	this.shape.regX = 160;

	// Setup for timer numbers and colon
	var colon = new createjs.Sprite(fontSpritesheet);
	colon.gotoAndStop(10);
	colon.x = x - 56;
	colon.y = 64;

	this.minuteSprite = new createjs.Sprite(fontSpritesheet);
	this.minuteSprite.gotoAndStop(0);
	this.minuteSprite.x = x - 116;
	this.minuteSprite.y = 64;

	this.tensSprite = new createjs.Sprite(fontSpritesheet);
	this.tensSprite.gotoAndStop(0);
	this.tensSprite.x = x + 4;
	this.tensSprite.y = 64;

	this.onesSprite = new createjs.Sprite(fontSpritesheet);
	this.onesSprite.gotoAndStop(0);
	this.onesSprite.x = x + 64;
	this.onesSprite.y = 64;

	// Add everything to a container for ease of use
	this.timerContainer = new createjs.Container();
	this.timerContainer.addChild(this.shape);
	this.timerContainer.addChild(colon);
	this.timerContainer.addChild(this.minuteSprite);
	this.timerContainer.addChild(this.tensSprite);
	this.timerContainer.addChild(this.onesSprite);

	this.updateBoard();

}

TimerBoard.prototype.tick = function(delta) {
	this.delta += delta;
	if (this.delta > 1) {
		this.delta--;
		this.time--;
		this.updateBoard();
	}
}

TimerBoard.prototype.updateBoard = function() {

	if (this.time <= 0) {
		this.minuteSprite.gotoAndStop(0);
		this.tensSprite.gotoAndStop(0);
		this.onesSprite.gotoAndStop(0);
	}

	var minutes = Math.floor(this.time / 60);
	var tens = Math.floor((this.time - (minutes * 60)) / 10);
	var ones = this.time % 10;
	
	this.minuteSprite.gotoAndStop(minutes);
	this.tensSprite.gotoAndStop(tens);
	this.onesSprite.gotoAndStop(ones);

}


// [BACKGROUND]

// Constructor
function Background(x, y, speed, image) {

	this.speed = speed;

	this.shape = new createjs.Bitmap(image);
	this.shape.x = x;
	this.shape.y = y;

}

Background.prototype.move = function() {
	if (this.shape.x > 1280) {
		this.shape.x = -1280 + this.speed;
	}
	this.shape.x += this.speed;
}