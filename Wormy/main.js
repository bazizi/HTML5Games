var tickSound = new Audio("http://cgi.sfu.ca/~bazizi/cgi-bin/Wormy/Tick.mp3");
var knockSound = new Audio("http://cgi.sfu.ca/~bazizi/cgi-bin/Wormy/knock.mp3");
var errorSound = new Audio("http://cgi.sfu.ca/~bazizi/cgi-bin/Wormy/Error.mp3");

window.onload = function() {
	//var sounds
	tickSound.volume = 0.3;

	window.onkeydown = function(e) {
		var key = e.keyCode ? e.keyCode : e.which;
		e.preventDefault();
	}
	//console.clear();
	console.log("- window loaded");
	var canvas = document.getElementById("gameCanvas");
	var nodes = [];
	for (var i = 0; i < 3; i++) {
		if (i == 0)
			nodes.push(new Node(null));
		else
			nodes.push(new Node(nodes[i - 1]));
	}
	var worm = new Worm(nodes);
	var game = new Game(canvas, worm, null);
	game.setBonus(new Bonus(game));
	game.start(game);

};

function Game(canvas, worm, bonus) {
	console.log("- game created");
	this.canvas = canvas;
	this.canvas2D = this.canvas.getContext("2d");
	this.FPS = 7;
	this.paused = 0;
	this.worm = worm;
	this.bonus = bonus;

	this.score = 0;
	this.highScore = (getCookie("highScore") == "") ? 0 : getCookie("highScore");

	this.updateIntervalID = 0;
	this.drawIntervalID = 0;

	this.gridWidth = this.worm.nodes[0].width;
	this.gridHeight = this.worm.nodes[0].height;

	this.canvas2D.lineWidth = 0.2;

	//update function
	this.update = function() {
		this.worm.update(this.canvas);
		//this.log(this.worm.head.x, this.worm.head.y);
		if (this.isCollision(this.worm.nodes[0], this.bonus)) {
			knockSound.currentTime = 0;
			knockSound.play();
			this.score++;
			if (this.score > this.highScore) {
				this.highScore = this.score;
			}
			this.bonus.update(this);
			this.worm.push(new Node(this.worm.nodes[this.worm.nodes.length - 1]));
		}

		for (var i = 1; i < this.worm.nodes.length; i++) {
			if (this.isCollision(this.worm.nodes[0], this.worm.nodes[i])) {
				console.log("- You lost");
				this.worm.reset();
				this.score = 0;
			}
		}
	};

	//draw function
	this.draw = function() {
		//play sounds
		tickSound.currentTime = 0;
		tickSound.play();

		//draw everything
		this.canvas2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.canvas2D.fillText("Use arrow keys/mouse click to move, press enter/return to pause", 5, 10);
		this.canvas2D.fillText("Developed by Behnam Azizi", this.canvas.width - 140, this.canvas.height - 10);
		this.canvas2D.fillText("Score:" + this.score, 10, this.canvas.height - 10);
		this.canvas2D.fillText("Highest Score:" + this.highScore, 60, this.canvas.height - 10);
		this.drawGrids();
		this.worm.draw(this.canvas2D);
		this.bonus.draw(this.canvas2D);

	};

	this.log = function(x, y) {
		console.log("[" + x + ", " + y + "]");
	}

	this.drawGrids = function() {
		for (var i = 0; i < this.canvas.width; i += this.gridWidth) {
			for (var j = this.gridHeight; j < this.canvas.height - this.gridHeight; j += this.gridHeight) {
				this.canvas2D.strokeRect(i, j, this.gridWidth, this.gridHeight);
			}
		}

	};

	//starts game
	this.start = function(game) {
		console.log("- game started");
		console.log("- FPS is " + this.FPS);

		this.handleKeys(game);

		setInterval(function() {
			if (!game.paused) {
				game.update();
			}
		}, 1000 / this.FPS);

		setInterval(function() {
			if (!game.paused) {
				game.draw();
			}
		}, 1000 / this.FPS);

	};

	this.pause = function() {
		this.paused = 1 - this.paused;
		if (this.paused) {
			console.log("- Game paused");
		} else {
			console.log("- Game resumed");

		}
	};

	this.isCollision = function(object1, object2) {
		if ((object1.x + object1.width > object2.x && object1.x < object2.x + object2.width) && (object1.y + object1.height > object2.y && object1.y < object2.y + object2.height)) {
			return true;
		} else {
			return false;
		}
	};

	//Setters
	this.setBonus = function(b) {
		this.bonus = b;
	}

	this.handleKeys = function(game) {

		game.canvas.addEventListener("mousedown", function(event) {
			var mouseX = game.canvas.getBoundingClientRect().left;
			var mouseY = game.canvas.getBoundingClientRect().top;
			console.log("Mouse: [" + mouseX + ", " + mouseY + "]");
			console.log("Wormy: [" + game.worm.head.x + ", " + game.worm.head.y + "]");
			//If worm is moving up or down
			if (game.worm.head.dy != 0) {
				if (event.pageX - game.canvas.getBoundingClientRect().left > game.worm.head.x && true) {
					console.log("moveRight")
					game.worm.head.setDirection(game.worm.head.width, 0);
				} else {
					console.log("moveLeft")
					game.worm.head.setDirection(-game.worm.head.width, 0);

				}
			}//If worm is moving left or right
			else {
				if (event.pageY - game.canvas.getBoundingClientRect().top > game.worm.head.y) {
					game.worm.head.setDirection(0, game.worm.head.height);
				} else {
					game.worm.head.setDirection(0, -game.worm.head.height);

				}

			}
		}, false);

		KeyboardJS.on('up', function() {
			if(game.worm.head.dy == 0)
				game.worm.head.setDirection(0, -game.worm.head.height);
		});

		KeyboardJS.on('down', function() {
			if(game.worm.head.dy == 0)
				game.worm.head.setDirection(0, game.worm.head.height);

		});

		KeyboardJS.on('left', function() {
			if(game.worm.head.dx == 0)	
				game.worm.head.setDirection(-game.worm.head.width, 0);

		});

		KeyboardJS.on('right', function() {
			if(game.worm.head.dx == 0)	
				game.worm.head.setDirection(game.worm.head.width, 0);

		});

		KeyboardJS.on('enter', function() {
			game.pause();
		});

		console.log("- Key Handlers added");

	};

}

function Node(nextNode) {

	this.nextNode = nextNode;

	this.width = 20;
	this.height = 20;

	this.x = 100;
	this.y = 100;

	this.prevX = this.x;
	this.prevY = this.y - this.height;

	//if this is not a head node
	if (nextNode != null) {
		this.x = nextNode.prevX;
		this.y = nextNode.prevY;
	}
	this.dx = 0;
	this.dy = this.width;

	//functions
	//update function
	this.update = function(canvas, isHead) {
		this.prevX = this.x;
		this.prevY = this.y;

		//If the node to be updated is the head of the linnkedList
		if (isHead) {
			//move it independently
			this.x += this.dx;
			this.y += this.dy;

		}//if the node to be update is not the head of the linkedList
		else {
			//moved it to the previous posision of its nextNode
			this.x = this.nextNode.prevX;
			this.y = this.nextNode.prevY;
		}

		if (this.x <= 0)
			this.x = 0;
		else if (this.x >= canvas.width)
			this.x = canvas.width - this.width;

		if (this.y <= this.height)
			this.y = this.height;
		else if (this.y >= canvas.height - this.height)
			this.y = canvas.height - 2 * this.height;

	};

	//draw function
	this.draw = function(canvas2D) {
		if (this.nextNode == null) {
			canvas2D.fillStyle = "DarkGreen";
		} else {
			canvas2D.fillStyle = "green";
		}
		canvas2D.fillRect(this.x, this.y, this.width, this.height);
	};

	//getters
	this.getX = function() {
		return this.x;
	};

	this.getY = function() {
		return this.y;
	};

	//setDirection
	this.setDirection = function(dx, dy) {
		this.dx = dx;
		this.dy = dy;
	};
}

function Worm(nodes) {
	this.head = nodes[0];
	this.nodes = nodes;

	this.update = function(canvas) {

		for (var i = 0; i < this.nodes.length; i++) {
			//if the node is the head of the linkedList
			if (i == 0)
				nodes[i].update(canvas, true);
			//if the node is not the head of hte linkedList
			else
				nodes[i].update(canvas, false);
		}
	};

	this.draw = function(canvas2D) {
		this.nodes.forEach(function(node) {
			//console.log(node);
			node.draw(canvas2D);
		});

	};

	this.reset = function() {
		errorSound.currentTime = 0;
		errorSound.play();
		var l = this.nodes.length;
		for (var i = 0; i < l - 3; i++) {
			this.nodes.pop();
		}
	};

	this.push = function(node) {
		this.nodes.push(node);
	};
}

function Bonus(game) {
	this.x = Math.floor(Math.random() * game.canvas.width / game.gridWidth) * game.gridWidth;
	this.y = Math.floor(Math.random() * game.canvas.height / game.gridHeight) * game.gridHeight;
	this.width = game.gridWidth;
	this.height = game.gridHeight;
	console.log("- Bonus added at location: [" + this.x, ", " + this.y + "]");

	this.draw = function(canvas2D) {
		canvas2D.fillStyle = "red";
		canvas2D.fillRect(this.x, this.y, this.width, this.height);
		canvas2D.fillStyle = "black";

	};

	this.update = function(game) {
		this.x = Math.floor(Math.random() * game.canvas.width / game.gridWidth) * game.gridWidth;
		do {
			this.y = Math.floor(Math.random() * game.canvas.height / game.gridHeight) * game.gridHeight;
		} while(this.y >= game.canvas.height - 2*game.gridHeight || this.y <= 2*game.gridHeight);
	};

}

//Cookie manipulators
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) == 0)
			return c.substring(name.length, c.length);
	}
	return "";
}

