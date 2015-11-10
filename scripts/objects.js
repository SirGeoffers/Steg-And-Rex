
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

	// Display image
	this.shape = new createjs.Sprite(spritesheet, this.type + "_idle");

	// Debug rect
	this.boundShape = new createjs.Shape();
	this.boundShape.graphics.beginFill("#ff00ff").drawRect(0, 0, this.width, this.height);
	this.boundShape.alpha = 0.5;

	this.moveTo(x, y);

}

// Additional functionality

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