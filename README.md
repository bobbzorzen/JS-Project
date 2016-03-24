The Invasion of Blockatron
==================

####How to play!####

The invasion of Blockatron is a top-down shooter game which has taken inspiration from spaceinvaders and the classic breakout game.
The goal of the game is to kill as many blockatrons as you can before they overpower you and take you down. You controll a human spaceship outside the atmosphere of blockatronia, the blockatron homeworld. Your ship is equipped with a highpowered railgun which you can fire using space. When a blockatron is destroyed there is a chance that it will drop one of the following upgrades:

Bullet speed
Ship speed
Weapon cooldown reduction
Weapon damage
Once you've destroyed an entire wave of enemies a new one will spawn. The enemies in this new wave will be stronger and faster.
####Technical info####

The game was written as a project in a javascript course at Blekinge Institute of Technology. It is written completely in javascript and uses the html5 canvas element for drawing the animations. This game is designed to be lightweight and eazily customizeable. It uses the built-in rectangle drawing method in the canvas for drawing almost everything. You can customize the following:

Enemy difficulty
Enemy color
Frame color
Number of enemies
Starting weapon cooldown
Upgrade spawning percentage
####Install/Config info####

For the default installation, download the game from here and start the template.html file. Done.

For aditional configuration you can open the game.js file in any texteditor and edit the assigned variables as mentioned above. They can be found between lines 14 and 30.

For more experienced users you can make your own site by simply at the bottom of the body tag(after your canvas) include the resources.js file and then the game.js file and create a canvas with an id and width/height attributes somewhere on the page and adding that id in the canvasName variable on line 18 in game.js. The game is dependent on jQuery, so make sure it's included before the game scripts.