/**
 * Place your JS-code here.
 */
$(document).ready(function(){
	'use strict';
	
	/**
	 * This is the user config part. 
	 * Follow the instructions to modify the game.
	 *
	 * All color values could be in either html aproved color names like black, white, green etc. or in hex rgb values like #000, #FFF, #0F0
	 */

	 //This is the list of colors and also the difficulty of the enemies. leave the first string alone. all others are the color and corresponding hp of the enemies, from left to right starting with 1hp and increasing with 1hp
	 var colors	= new Array('Leave me like this','#AEA', '#5E5', '#99F', '#55F','#FC0','#F20', '#AAA','#000');

	 //This is the name of the canvas you use. Default is "game"
	 var canvasName = "game";

	 //This is the amount of enemies on each row. If you increase it the size of the enemies will shrink and the opposite if you decrease it.
	 var nrOfEnemies = 15;

	 //This is the starting cooldown of the weapon in milliseconds((1/1000)s), higher value = longer shotcooldown.
	 var cooldownSpeed = 1000;

	 //This is the percentage chance of spawning an upgrade on enemy death in percentages(default is 20%).
	 var upgradeSpawnPercentage = 20;

	 //This is the Color of the game frame(the place where the score gets printed and the game over screen) default is black.
	 var frameColor = "#000";

	/**
	 * End of user config.
	 * This is where the real game details begin.
	 */

	//sets global constants
	var UP = 38;
	var DOWN = 40;
	var LEFT = 37;
	var RIGHT = 39;
	var SPACE = 32;
	var MYKEYS = [UP,DOWN,LEFT,RIGHT,SPACE];

	//sets global variables
	var canvas = document.getElementById(canvasName);
	var ctx    = canvas.getContext("2d");
	var pauseImg = new Image();
	pauseImg.src = 'http://bobbzorzen.se/playground/canvas/img/pause.png';
	var pause  = new Rectangle(canvas.width-35, canvas.height-35, 32, 32,"", pauseImg);
	var canvasBox;
	var player;
	var keys;
	var img;
	var tiles;
	var shots;
	var shotsVy;
	var enemies;
	var enemyWidth;
	var enemyHeight;
	var enemyMaxHealth;
	var cooldownTimer;
	var shotDmg;
	var enemyVx;
	var score;
	var wave;
	var upgrades;
	var texts;
	var offset;
	var offsetTimer;
	var offsetTimerId;
	var death;
	var paused;


	//cleanArray is a function to clean up empty values in an Array
	function cleanArray(actual){
		var newArray = new Array();
		for(var i = 0; i<actual.length; i++){
			if (actual[i]){
				newArray.push(actual[i]);
			}
		}
		return newArray;
	}

	function spawnEnemies() {
		for(var i = 0; i<3; i++) {
			for(var j = 0; j<nrOfEnemies; j++) {
				var health = Math.ceil(Math.random()*enemyMaxHealth);
				var color = new Color(colors[health]);
				var enemy = new Rectangle(((canvasBox.x+1)+(j*(enemyWidth+10))),i*20+canvasBox.y+20,enemyWidth,enemyHeight,color);
				enemy.health = health;
				enemy.updateColor = function () {
					var myColor = new Color(colors[this.health])
					this.color = myColor;
				};
				enemies.push(enemy);
			}
		}
	}



	function newWave() {
		offset = 20;
		wave++;
		enemyVx = (enemyVx < 0) ? enemyVx-0.3 : enemyVx+0.3;
		enemyMaxHealth = (enemyMaxHealth == colors.length-1) ? colors.length-1 : enemyMaxHealth+1;
		spawnEnemies();
	}

	function spawnUpgrade(x,y) {
		console.log("spawnUpgrade");
		var temp = Math.random();
		if(temp > ((100-upgradeSpawnPercentage)/100)) {
			console.log("temp: "+ temp.toString());
			var upgrade = new Rectangle(x-7.5,y,15,15,new Color("orange"));
			var randomNr = Math.ceil(Math.random()*3);
			upgrade.upgradeType = randomNr;
			upgrade.Vy = 5;
			upgrades.push(upgrade);
		}
	}

	//init function, initializes all variables, basicly resets game to start point.
	function init() {
		canvasBox 		= {x:40, y:40, width:canvas.width-80, height:canvas.height-80};
		img 			= new Image();
		img.src 		= 'http://bobbzorzen.se/playground/canvas/img/ship.png';
		player 			= new Rectangle((canvas.width/2), (canvasBox.height+canvasBox.y-32-16), 32, 32, "", img);
		player.vx 		= 5;
		keys 			= [];
		shots 			= new Array();
		shotsVy 		= 10;
		shotDmg 		= 1;
		enemyVx 		= -1;
		enemyWidth 		= (canvasBox.width-(((nrOfEnemies)*10)+60))/nrOfEnemies; 
		enemyHeight 	= 10;
		enemyMaxHealth 	= 1;
		enemies 		= new Array();
		spawnEnemies();
		cooldownTimer 	= -1;
		score 			= 0;
		wave 			= 1;
		upgrades 		= new Array();
		texts 			= new Array();
		offset 			= 20;
		offsetTimer 	= 10000;
		offsetTimerId 	= -1;
		death 			= false;
		paused 			= false;
		console.log("init");
	}

	//update function, handles game logic
	function update() {
		//move player
		if(keys[LEFT])  {player.x -= player.vx;}
		if(keys[RIGHT]) {player.x += player.vx;}

		//ensure player stays on map
		if(player.x < canvasBox.x) {player.x = canvasBox.x;}
		if(player.x > canvasBox.width+(player.width/2)-6) {player.x = canvasBox.width+(player.width/2)-6;}

		//fire the bullet if space is pressed and cooldown timer is not running
		if(keys[SPACE] && cooldownTimer == -1) {
			var shot = new Rectangle((player.x+(player.width/2-3)),player.y,2+(3*shotDmg),2+(3*shotDmg),new Color(0,0,0,1));
			shot.dmg = shotDmg;
			shots.push(shot);
			cooldownTimer = setTimeout(function() {
				clearTimeout(cooldownTimer);
				cooldownTimer = -1;
			},cooldownSpeed);
		}
		
		//check colisions of bullets and enemies
		for(var i = 0; i<shots.length; i++) {
			//move shots
			shots[i].y -= shotsVy;
			for(var j = 0; j<enemies.length; j++) {
				if(shots[i].Intersects(enemies[j])) {
					enemies[j].health -= shots[i].dmg;
					enemies[j].updateColor();
					if(enemies[j].health <= 0) {
						spawnUpgrade(enemies[j].x+(enemyWidth/2),enemies[j].y+(enemyHeight/2));
						enemies[j] = undefined;
						score++;
					}
					shots[i] = undefined;
					break;
				}
			}
			if(shots[i] == undefined || shots[i].y < 0) {
				shots[i] = undefined;
			}
			enemies = cleanArray(enemies);
		}
		//clean up shots array
		shots = cleanArray(shots);

		//check wall colision
		for(var i = 0; i<enemies.length;i++) {
			if(enemies[i].x <= canvasBox.x || enemies[i].x+enemies[i].width >= canvasBox.width+canvasBox.x) {
				enemyVx *= -1;
				break;
			}
		}
		
		//move enemies
		for(var i = 0; i<enemies.length;i++) {
			enemies[i].x -= enemyVx;
		}

		//remove texts
		for(var i = 0; i<texts.length;i++) {
			if(texts[i].intervalId == -1) {
				texts[i] = undefined;
			}
		}
		texts = cleanArray(texts);

		//move upgrades and check collisions
		for(var i = 0; i<upgrades.length; i++) {

			//move upgrade
			upgrades[i].y += upgrades[i].Vy;

			//check collision
			if(upgrades[i].Intersects(player)) {
				upgrades[i].upgradeType = upgrades[i].upgradeType==4 ? 1:upgrades[i].upgradeType;

				//if 1 uppgrade movementSpeed
				if(upgrades[i].upgradeType == 1) {
					if(player.vx < 10) {
						var temp = new Text("Ship speed +0.5",upgrades[i].x,upgrades[i].y);
						temp.StartFade();
						texts.push(temp);
						player.vx += 0.2;
					}
					else {
						var temp = new Text("Score +5",upgrades[i].x,upgrades[i].y);
						temp.StartFade();
						texts.push(temp);
						score +=5;
					}
				}
				//if 2 uppgrade bulletSpeed
				if(upgrades[i].upgradeType == 2) {
					if(shotsVy < 15) {
						var temp = new Text("Shot speed +1",upgrades[i].x,upgrades[i].y);
						temp.StartFade();
						texts.push(temp);
						shotsVy++;
					} 
					else {
						if(shotDmg < 3) {
							var temp = new Text("Shot dmg +1",upgrades[i].x,upgrades[i].y);
							temp.StartFade();
							texts.push(temp);
							shotDmg++;
						}
						else {
							var temp = new Text("Score +5",upgrades[i].x,upgrades[i].y);
							temp.StartFade();
							texts.push(temp);
							score +=5;
						}
					}
				}
				//if 3 uppgrade firing speed
				if(upgrades[i].upgradeType == 3) {
					if(cooldownSpeed > 200) {
						var temp = new Text("Shot cooldown -0.5",upgrades[i].x,upgrades[i].y);
						temp.StartFade();
						texts.push(temp);
						cooldownSpeed -= 50;
					}
					else {
						var temp = new Text("Score +5",upgrades[i].x,upgrades[i].y);
						temp.StartFade();
						texts.push(temp);
						score +=5;
					}
				}
				upgrades[i] = undefined;
				upgrades = cleanArray(upgrades);
				break;
			}
			if(upgrades[i].y > canvasBox.height+canvasBox.y-upgrades[i].height) {
				upgrades[i] = undefined;
				upgrades = cleanArray(upgrades);
				break;
			}
		}

		//start new wave
		if(enemies.length == 0) {
			newWave();
		}

		//Sets the offset timer
		if(offsetTimerId == -1) {
			offsetTimerId = setTimeout(function(){
				offsetTimer *= 0.95;
				for(var i = 0; i<enemies.length; i++) {
					enemies[i].y += offset;
				}
				clearTimeout(offsetTimerId);
				offsetTimerId = -1;
			}, offsetTimer);
		}

		//Checks if loss has occured
		for(var i = 0; i<enemies.length; i++) {
			if(enemies[i].Intersects(player) || ((enemies[i].y+enemies[i].height) >= (canvasBox.y+canvasBox.height))) {
				death = true;
				break;
			}
		}
	}

	//render function, handles canvas drawing
	function render() {
		//clear screan and draw frame
		ctx.fillStyle = frameColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.clearRect(canvasBox.x, canvasBox.y, canvasBox.width, canvasBox.height);
		pause.Draw(ctx);

		//draw upgrades
		for(var i = 0; i<upgrades.length; i++) {
			upgrades[i].Draw(ctx);
		}

		//draw bullets
		for(var i = 0; i<shots.length; i++) {
			shots[i].Draw(ctx);
		}
		
		//draw enemies
		for(var i = 0; i<enemies.length; i++) {
			enemies[i].Draw(ctx);
		}

		//draw texts
		for(var i = 0; i<texts.length; i++) {
			texts[i].Draw(ctx);
		}

		//draw player
		//ctx.drawImage(img, 0, 0, 32, 32, player.x, player.y, player.width, player.height);
		player.Draw(ctx);
		
		//reset text alignment
		ctx.textAlign = 'left';

		//draw score
		ctx.fillStyle = "white";
		ctx.font = "10px sans-serif";
		ctx.fillText("Score: "+score, 10, 15);
		
		//draw current wave
		ctx.fillStyle = "white";
		ctx.font = "10px sans-serif";
		ctx.fillText("Current wave: "+wave, 10, 30);
		
		//draw upgrades
		ctx.fillStyle = "white";
		ctx.font = "10px sans-serif";
		ctx.fillText("Shot dmg: "+shotDmg, canvas.width-100, 15);
		ctx.fillStyle = "white";
		ctx.font = "10px sans-serif";
		ctx.fillText("Shot cooldown: "+cooldownSpeed/1000, canvas.width-100, 30);
		ctx.fillStyle = "white";
		ctx.font = "10px sans-serif";
		ctx.fillText("Shot speed: "+shotsVy, canvas.width-200, 15);
		ctx.fillStyle = "white";
		ctx.font = "10px sans-serif";
		ctx.fillText("Ship speed: "+player.vx, canvas.width-200, 30);

		//render win/loss screen.
		if(death) {
			//clear screan and draw frame
			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			//draw Restart text
			ctx.fillStyle = "white";
			ctx.font = "15px sans-serif";
			ctx.textAlign = 'center';
			ctx.fillText("Your score: " + score, canvas.width/2, canvas.height/2-100);
			
			//draw Restart text
			var x = canvas.width / 2;
			var y = canvas.height / 2;

			ctx.font = '30pt Calibri';
			ctx.textAlign = 'center';
			ctx.fillStyle = 'white';
			ctx.fillText('Click to restart!', x, y);
			ctx.textAlign = 'left';
		}

		
	}
	
	//keyDown function, handles keyDown events
	function keyDown(e) {
		keys[e.keyCode] = true;
		if(MYKEYS.indexOf(e.keyCode) != -1) {e.preventDefault();}

		
	}

	//keyUp function, handles keyDown events
	function keyUp(e) {
		keys[e.keyCode] = false;
		if(MYKEYS.indexOf(e.keyCode) != -1) {e.preventDefault();}
	}

	//sets eventlistners
	window.addEventListener("keydown", keyDown);
	window.addEventListener("keyup", keyUp);
	canvas.addEventListener("mousedown", function(e){
		var clickedX = e.pageX - this.offsetLeft;
    	var clickedY = e.pageY - this.offsetTop;
		if(pause.Contains(clickedX,clickedY)) {
			paused = !paused;
		}
		if(death)
			init();
	});


	//Main game loop
	function game() {
		if(!death && !paused) {
			update();
			render();
		}
		requestAnimationFrame(game);
	}

	//Start game
	init();
	requestAnimationFrame(game);

	console.log('Everything is ready.');
});