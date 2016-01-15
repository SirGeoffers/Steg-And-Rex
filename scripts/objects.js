
// [DINOSAUR] (rawr)

// Constructor
function Dinosaur(x, y, type, imageOffsetX, imageOffsetY, spritesheet) {

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

	// Display image
	this.shape = new createjs.Sprite(spritesheet, this.type + "_idle");

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

Dinosaur.prototype.updateShapes = function() {
	this.shape.x = this.x + this.imageOffsetX;
	this.shape.y = this.y + this.imageOffsetY;
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
var eggInfo = [[36, -40, 0], [18, -20, -30], [54, -20, 30], [58, 0, 50], [14, 0, -50], [36, 4, 0]];

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
	for (var i = 0; i < this.numEggs; i++) {
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

	this.x = x;
	this.y = y;
	this.width = 32;
	this.height = 44;

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