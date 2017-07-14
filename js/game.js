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
