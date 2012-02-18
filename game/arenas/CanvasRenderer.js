function CanvasRenderer(canvas) {
    Renderer.prototype.constructor.call(this); // call super consturctor
    this.canvas  = canvas;
    this.context = canvas.getContext("2d");
}
CanvasRenderer.prototype = new Renderer(); // inherit

CanvasRenderer.prototype.clear = function() {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
	this.context.clearRect(0, 0, gameWidth, gameHeight);
}

CanvasRenderer.prototype.drawLine = function(vertices) {
    this.context.beginPath();
    if (vertices.length >= 1) {
    
        vertices[0] = vertices[0].toScreenSpace(this);
	    this.context.moveTo(vertices[0].x, vertices[0].y);
	    
	    for (var i = 1; i < polygon.length; i++) {
	        vertices[i] = vertices[i].toScreenSpace(this);
		    this.context.lineTo(vertices[i].x, vertices[i].y);
	    }
    }
	this.context.closePath();
}

CanvasRenderer.prototype.drawImage = function(destOffset, destSize, srcOffset, srcSize) {
    if (this.boundTexture) {
        destOffset = destOffset.toScreenSpace(this);
        destSize   = destSize.toScreenSpace(this);
//        srcOffset  = srcOffset.toScreenSpace(this);
//        srcSize    = srcSize.toScreenSpace(this);
        this.context.drawImage(this.boundTexture, srcOffset.x, srcOffset.y,
            srcSize.x, srcSize.y, destOffset.x, destOffset.y, destSize.x, destSize.y);
    }
}


CanvasRenderer.prototype.setColor = function(color) {
    this.context.strokeStyle = "#739141";
}

CanvasRenderer.prototype.setLineWidth = function(lineWidth) {
    this.context.lineWidth = screenSpace(lineWidth) * width;
}

CanvasRenderer.prototype.save = function() {
    this.context.save();
}

CanvasRenderer.prototype.restore = function() {
    this.context.restore();
}

CanvasRenderer.prototype.resizeCanvas = function(size, isWidth) {
	if (isWidth) {
		this.gameWidth  = size;
		this.gameHeight = this.gameWidth / this.aspectRatio;
	} else {
		this.gameHeight = size;
		this.gameWidth  = this.gameHeight * this.aspectRatio;
	}
	this.unitsPerColumn = this.unitsPerRow / this.gameWidth * this.gameHeight;
	this.pixelsPerUnit  = this.gameWidth / this.unitsPerRow;
	
	$(this.canvas).css({
		"width": gameWidth + "px",
		"height": gameHeight + "px",
		"margin": (gameHeight / -2) + "px 0px 0px " + (gameWidth / -2) + "px",
	});
	$(this.canvas)[0].getContext("2d").canvas.width  = this.gameWidth;
	$(this.canvas)[0].getContext("2d").canvas.height = this.gameHeight;
}
