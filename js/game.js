/******************************
 *                            * 
 *  OBJECT: Game              *
 *    => Constructor          *
 *                            *
 * ****************************/
function Game() {
  
  // Initialise the Player Object
  this.player = new Player();

  // Initialise the Level Object
  this.level = new Level(this.player);
  
  // this.level.initLevel(this.player);

}


/******************************
 *                            * 
 *  OBJECT: Game              *
 *    => Functions            *
 *                            *
 * ****************************/
/**
 * FUNCTION: Menu start, playing a sound and starting the animation
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: None
**/
Game.prototype.menuStart = function() {

  // Play the Game start sound
  let audioMatch = new Audio('./sounds/sword shine 1.wav');
  audioMatch.play();

  // Load the menu
  $('.game-landing-container').delay(200).hide('slide',{direction:'left'},600);

};


 /**
 * FUNCTION: Call all the required functions to resize the game
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: + Level.setBoardHeaderSize()
 *               + Level.setBoardSize()
**/
Game.prototype.resize = function() {

  this.level.setBoardHeaderSize();
  this.level.setBoardSize();

};
