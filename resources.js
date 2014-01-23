//Color "class" to help with canvas drawings.
Color = function(r, g, b, a)
{
	if(typeof(r) == "string") {
		this.string = r;
	} else {
		this.string = undefined;
		this.r = 255;
		this.g = 255;
		this.b = 255;
		this.a = 1;
		
		if (r != null) {
			this.r = r;
		}
		if (g != null) {
			this.g = g;
		}
		if (b != null) {
			this.b = b;
		}
		if (a != null) {
			this.a = a;
		}
	}
	this.ToStandard = function(noAlpha) {
		if(this.string != undefined) {
			return this.string;
		}
		if (noAlpha == null || !noAlpha) {
			return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
		}
		else {
			return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
		}
	};
};

//Rectangle class for eazier square handling in canvas.
Rectangle = function(x, y, w, h, color, img) {
	if (x == null || y == null || w == null || h == null) {
		var errorMsg = "The following are not provided:";
		if (x == null) {
			errorMsg += " 'x' ";
		}
		if (y == null) {
			errorMsg += " 'y' ";
		}
		if (w == null) {
			errorMsg += " 'width' ";
		}
		if (h == null) {
			errorMsg += " 'height' ";
		}
		
		console.log(errorMsg);
		throw new Error(errorMsg);
	}

	this.x 		= x;
	this.y 		= y;
	this.width 	= w;
	this.height = h;
	this.color 	= color;
	this.img 	= img;

	//Function to check collision
	this.Intersects = function(rect) {
			var offset = 0;
			if (rect.radius != null)
					offset = rect.radius;
			
			if (this.Contains(rect.x - offset, rect.y - offset) || this.Contains(rect.x + rect.width - offset, rect.y - offset) ||
				this.Contains(rect.x - offset, rect.y + rect.height - offset) || this.Contains(rect.x + rect.width - offset, rect.y + rect.height - offset)) {
				return true;
			}
			else if (rect.Contains(this.x - offset, this.y - offset) || rect.Contains(this.x + this.width - offset, this.y - offset) ||
				rect.Contains(this.x - offset, this.y + this.height - offset) || rect.Contains(this.x + this.width - offset, this.y + this.height - offset)) {
				return true;
			}
			return false;
	};

	//Helper function for collision detection. Checks if point exists within current rectangle.
	this.Contains = function(x, y) {
		if (x >= this.x && x <= this.x + this.width &&
			y >= this.y && y <= this.y + this.height) {
			return true;
		}
		else {
			return false;
		}
	};

	//Function to draw rectangle to screen.
	this.Draw = function(ctx) {
		if(this.img != undefined) {
			//draw player
			ctx.drawImage(this.img, 0, 0, 32, 32, this.x, this.y, this.width, this.height);
		}
		else {
			ctx.fillStyle = this.color.ToStandard();
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	}
}

//"class" for texts
Text = function(value,x,y) {
	this.x = x;
	this.y = y;
	this.alignStyle = "left";
	this.intervalId = -1;
	this.value = value;
	this.alpha = 1.0;

	this.Draw = function(ctx) {
		ctx.fillStyle = "rgba(255, 140, 0, " + this.alpha + ")";
        ctx.font = "italic 15px Arial";
        ctx.textAlign = this.alignStyle;
        ctx.fillText(this.value, this.x, this.y);
        ctx.textAlign = 'left';
	};

	this.StartFade = function() {
		var self = this;
		self.intervalId = setInterval(function() {
			self.alpha -= 0.05;
			if(self.alpha <= 0.1) {
				clearInterval(self.intervalId);
				self.intervalId = -1;
				self.value = "";
			}
		},50);
	}
}
