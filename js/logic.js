/* Javascript file handling the game logic */

/*
 * OBJECT: PLAYER
 */
function Player() {
  this.activeTiles = []; // list of all the tiles the player created
  this.currentTile; // Last tile created by the player
  this.nextTile; // Next tile the player want to create
  this.direction; // Direction requested by the user on keypress / swipe
  this.levelScore = 0; // Number of points made by the player in the current level
  this.score = 0; // Overall player score across levels
  this.nbLevelMoves = 0; // Number of tiles moved by the player in the level
  this.nbMoves = 0; // Overall number of tiles moved by the player
}

/*
 * PLAYER OBJECT FUNCTIONS
 */
/*
 *
 * 
 * 
 */
Player.prototype.move = function (level) {
  
  // First things first, set .alreadyCheck and .matched to false for all activeTiles elements
  this.clearActiveMatches();

  // Tells if a user can move or not
  var isStuck = false;

  switch(this.direction) {
    case 'left':
      // Get the next position and color
      this.nextTile = { row: this.currentTile.row, column: this.currentTile.column - 1, color: level.nextColorsQueue[0], current: false };
      break;

    case 'right':
      // Get the next position and color
      this.nextTile = { row: this.currentTile.row, column: this.currentTile.column + 1, color: level.nextColorsQueue[0], current: false };
      break;

    case 'up':
      // Get the next position and color
      this.nextTile = { row: this.currentTile.row - 1,column: this.currentTile.column, color: level.nextColorsQueue[0], current: false };
      break;

    case 'down':
      // Get the next position and color
      this.nextTile = { row: this.currentTile.row + 1,column: this.currentTile.column, color: level.nextColorsQueue[0], current: false };
      break;
    default: 
      console.log("[log] Player.prototype.move: '" + this.direction + "' direction is not defined");
  }

  // If the next tile is not active and not out of the board
  if ( this.isNextTileFree(this.nextTile) && this.isNextTileInBoard(this.nextTile, level) ) {

    // Inscrease move counters
    this.nbLevelMoves += 1;
    this.nbMoves += 1;

    // The move is correct
    // Save the move
    var currentValidMove = {
      row: this.nextTile.row,
      column: this.nextTile.column,
      color: this.nextTile.color,
      current: true
    };

    // Set the new current tile
    this.currentTile = currentValidMove;

    // Remove current from previous tile
    this.activeTiles[this.activeTiles.length - 1].current = false;

    // Add this new tile to the activeTiles array
    this.activeTiles.push(currentValidMove);
    
    // Update the next colors array
    level.nextColorsQueue.shift();
    if ( level.nextColorsQueue.length < 3 ) {
      // If not enough colors are remaining, then push the inital set of colors back 
      var levelParams = eval("level"+level.number+"Params");
      for (var index = 0; index < levelParams.nextColorsQueue.length; index += 1) {
        level.nextColorsQueue.push(levelParams.nextColorsQueue[index]);
      }
    }
    
    // If the next position makes 3 tiles of the same color
    var nbMatches = this.getNbMatches(level);
    
    if ( nbMatches >= 3 ) {
    
      // Clear all previous matches
      this.clearMatches();

      // Update the player score. It will be updated next time the level is drawn
      this.levelScore += nbMatches;

      if ( this.levelScore >= level.success ) {
        // The player won the level!
        level.win(this);
      }
    } else {
      // Set .alreadyCheck and .matched to false for all activeTiles elements
      this.clearActiveMatches();
    }

    // Finally, if the user cannot move anymore, then end the level
    if ( !this.isFreeTileAround(this.currentTile, level) ) {      
      level.lost(this);
    } 
  } else if ( this.isFreeTileAround(this.currentTile, level) ) {
    console.log("You can't move to this position");
  } else {
    // No free tiles around => Game Over
    console.log("Do we ever get here?")
    level.lost(this);

  }
}


/* 
 * FUNCTION: Removes all the matched tiles, except the current tile, from the 'Player.activeTiles' array
 * PARAMETERS: None
 * RETURNS: Undefined
 */
Player.prototype.clearMatches = function() {
  for (var index = this.activeTiles.length -1; index >= 0; index -= 1) {    
    if ( this.activeTiles[index].matched && !this.activeTiles[index].current ) {
      this.activeTiles.splice(index, 1);
    }
  }
};


// Function used to check if the next tile is free to move
Player.prototype.isNextTileFree = function (nextPos) {
  // Look in the active tiles to see if the next position is matching and return the opposite (if match, the tile is NOT free)
  return !this.activeTiles.some(function (element) { 
    return element.row == nextPos.row && element.column == nextPos.column;
  }.bind(this));
};


// Function used to check if the next tile is out of the board
Player.prototype.isNextTileInBoard = function (nextPos, level) {
  if (  nextPos.row < 0 || 
        nextPos.row > level.height - 1 ||
        nextPos.column < 0 ||
        nextPos.column > level.width - 1
  ) { 
    return false;
  } else { 
    return true;
  }
};


// Check if there is any free cell around the current position
Player.prototype.isFreeTileAround = function (pos, level) {
  
  // Set the values of the cells around
  var upTile    = { row: pos.row - 1, column: pos.column     };
  var rightTile = { row: pos.row    , column: pos.column + 1 };
  var downTile  = { row: pos.row + 1, column: pos.column     };
  var leftTile  = { row: pos.row    , column: pos.column - 1 };

  if (  (this.isNextTileFree(upTile) && this.isNextTileInBoard(upTile, level)) ||
        (this.isNextTileFree(rightTile) && this.isNextTileInBoard(rightTile, level)) ||
        (this.isNextTileFree(downTile) && this.isNextTileInBoard(downTile, level)) ||
        (this.isNextTileFree(leftTile) && this.isNextTileInBoard(leftTile, level))
  ) { 
    return true;
  }
  
  console.log("You are stuck mate :'(");
  // If we are here, it means that there is no free cell around
  return false;
}

// Tells if a tile is active
Player.prototype.isActive = function(tile) {
  // Returns true if tile is found in the active array
  return this.activeTiles.some(function (element) { 
    return element.row == tile.row && element.column == tile.column;
  }.bind(this));
};


// Tells if a tile is active
Player.prototype.isSameColor = function(tile1Index, tile2Index) {
  if ( tile1Index === -1 || tile2Index === -1 ) {
    return false;
  } 
  
  // if the color matches, return the tile2 index
  if ( this.activeTiles[tile1Index].color === this.activeTiles[tile2Index].color ) {
    return tile2Index;
  } else {
    return false;
  }
};


// Function returning the tile index from the 'activeTiles' array
Player.prototype.getActiveTileIndex = function(tilePosition) {
  var indexToReturn = this.activeTiles.find(function(element) {
     return element.row === tilePosition.row && element.column === tilePosition.column
  });
   return this.activeTiles.indexOf(indexToReturn);
};


/* FUNCTION: Checks if a tile is touching another one with the same color, either up, right, down or left
 * PARAMETERS: Object including the reference tile
 * RETURNS: [Array] of objects. Each object if defined as following:
 * { tile1: <first tile compared>,
 *   tile2: <second tile compared>,
 *   touch: <true: if the two tiles are touching and of the same color, else false>
 * }
 */
Player.prototype.touchWithColor = function(tileToCheck) {

  // Set the values of the cells around
  var upTile    = { row: tileToCheck.row - 1, column: tileToCheck.column     };
  var rightTile = { row: tileToCheck.row    , column: tileToCheck.column + 1 };
  var downTile  = { row: tileToCheck.row + 1, column: tileToCheck.column     };
  var leftTile  = { row: tileToCheck.row    , column: tileToCheck.column - 1 };
  
  // Get tiles index from the 'activeTiles' array
  var tileToCheckIndex = this.getActiveTileIndex(tileToCheck);
  var upTileIndex = this.getActiveTileIndex(upTile);
  var rightTileIndex = this.getActiveTileIndex(rightTile);
  var downTileIndex = this.getActiveTileIndex(downTile);
  var leftTileIndex = this.getActiveTileIndex(leftTile);
   
  // This array inclues objects storing the test results clockwise (0: result of test up, 1: result of test right, 2: result of test down, 3: result of test left)  
  var objToReturn = [];

  // Variables store the return values of the 'Player.isSameColor' function in the four directions, clockwise (up, right, down, left)
  var isUpTileSameColor = this.isSameColor(tileToCheckIndex, upTileIndex);
  var isRightTileSameColor = this.isSameColor(tileToCheckIndex, rightTileIndex);
  var isDownTileSameColor = this.isSameColor(tileToCheckIndex, downTileIndex);
  var isLeftTileSameColor = this.isSameColor(tileToCheckIndex, leftTileIndex);
  
  // Checks if two tiles are touching and have the same color 
  if ( this.isActive(upTile) && isUpTileSameColor !== false ) { objToReturn.push(isUpTileSameColor); }  // UP
  if ( this.isActive(rightTile) && isRightTileSameColor !== false ) { objToReturn.push(isRightTileSameColor); }  // RIGHT
  if ( this.isActive(downTile) && isDownTileSameColor !== false ) { objToReturn.push(isDownTileSameColor); }  // DOWN
  if ( this.isActive(leftTile) && isLeftTileSameColor !== false ) { objToReturn.push(isLeftTileSameColor); } // LEFT  

  // Mark the tileToCheck as alreadyChecked
  this.activeTiles[tileToCheckIndex].alreadyChecked = true;

  if ( objToReturn.length > 0 ) {
    // Mark the tileToCheck as matched
    this.activeTiles[tileToCheckIndex].matched = true;
  }

  // Return the array of matching indexes
  return objToReturn;
};


/*
 * 
*/
Player.prototype.findAllMatches = function (tileToCheck) {
  // Test for touching tiles with the same color
  var isTouchingWithSameColor = this.touchWithColor(tileToCheck);
  
  if ( isTouchingWithSameColor.length > 0 ) {
    // For each touching tiles with the same color      
    isTouchingWithSameColor.forEach(function (element) {
      // if the tile has not been checked already
      if( !this.activeTiles[element].alreadyChecked ) {
        // Mark the tile as matched
        this.activeTiles[element].matched;

        // Check the tile and all following tiles that are touching and have the same color
        this.findAllMatches(this.activeTiles[element]);
      }
    }.bind(this));
  } 
}

/*
 * FUNCTION which reset all .alreadyChecked and .matched keys to false
 * 
*/
Player.prototype.clearActiveMatches = function() {
  for (var index = 0; index < this.activeTiles.length; index += 1) {
    this.activeTiles[index].alreadyChecked = false;
    this.activeTiles[index].matched = false;
  }
};


Player.prototype.countMatches = function() {
  var counter = 0;
  for (var index = 0; index < this.activeTiles.length; index += 1) {
    if ( this.activeTiles[index].matched ) {
      counter += 1;
    }
  }
  return counter;
};

/*
 * Check if 3 or more tiles of the same color are touching
*/
Player.prototype.getNbMatches = function(level) {

  // Recursively check all touching tiles to find the ones with the same color
  this.findAllMatches(this.activeTiles[this.activeTiles.length - 1]);
  
  // Count the number of tiles with the same color as the current one
  var count = this.countMatches();
  
  // Return the number of matches
  return count;
} 


/*
 * LEVEL
 */
function Level(level) {
  this.number = level.number;
  this.width = level.width;
  this.height = level.height;
  this.initState = level.initState;
  this.board = [];
  this.nextColorsQueue = [];
  this.success = level.success;

  // Initialise the nextColorsQueue
  for (var index = 0; index < level.nextColorsQueue.length; index += 1) {
    this.nextColorsQueue.push(level.nextColorsQueue[index]);
  }
}

/*
 * LEVEL FUNCTIONS
 */
// Function used to initialise the level
Level.prototype.initBoard = function(player) { 
  var currentIteration;

  /* Create the board */
  for (var row = 0; row < this.height; row +=1 ) {
    for (var column = 0; column < this.width; column +=1 ) {
      $('.board').append($('<div>')
        .addClass('cell')
        .attr('data-row', row)
        .attr('data-col', column)
      );

      // Build the board object
      this.board.push([row, column]);
    }
  }

  // For each tile in the initialState array:
  // Push it to the activeTiles array, in order to draw
  // Set the currentTile
  for (var index = 0 ; index < this.initState.length; index += 1) {
    currentIteration = {
        row: this.initState[index].row,
        column: this.initState[index].column,
        color: this.initState[index].color,
        current: false
    };
    // If the current item is the current one, set it in the activeTiles array
    if ( this.initState[index].current ) {
      currentIteration.current = true;
      player.currentTile = currentIteration;
    }

    // Push the item to the activeTiles array
    player.activeTiles.push(currentIteration);
  } 

  // Draw the player information (active / current tiles, score and next queue)
  this.drawPlayer(player);

  // Assign keyboard key events to the game
  this.assignControlsToKeys(player);
}


// Bind arrow keys with move actions
Level.prototype.assignControlsToKeys = function(player) {
  $('body').on('keydown', function(e) {
    if( e.keyCode === 38 ||
        e.keyCode === 40 ||
        e.keyCode === 37 ||
        e.keyCode === 39 ||
        e.keyCode === 80
    ) {
      switch (e.keyCode) {
        case 38: // arrow up
          player.direction = 'up';
          break;
        case 40: // arrow down
          player.direction = 'down';
          break;
        case 37: // arrow left
          player.direction = 'left';
          break;
        case 39: // arrow right
          player.direction = 'right';
          break;
        case 80: // p pause
          break;
      }
      this.update(player);
    }
  }.bind(this));
};


// Function used to clear the board
Level.prototype.clearLevel = function() {
  // Reset the Level Object
  this.board = [];
  this.nextColorsQueue = [];

  // Reset the colorQueue to its initial value
  var levelParams = eval("level"+this.number+"Params");
  for (var index = 0; index < levelParams.nextColorsQueue.length; index += 1) {
    this.nextColorsQueue.push(levelParams.nextColorsQueue[index]);
  }
  
  // Clear the board on the screen
  $('.board > .cell').remove();
}


// Clear the player from the board
Level.prototype.clearPlayer = function(player, clearAllPlayerData) {
  if (clearAllPlayerData) {
    // Reset the player object (related to the level)
    player.activeTiles = [];
    player.currentTile = {};
    player.nextTile = {};
    player.direction = 'None';
    player.levelScore = 0;
    player.nbLevelMoves = 0;

    // Clear lost div
    $('.lost').remove();
  }

  // Clear each active tile on the board (based on color)
  availableColor.forEach(function(color) {
    $('.board > .' + color).removeClass(color);
  });

  // Clear current div
  $('.current').remove();

  // Clear the next colors
  $('.color-list li').removeAttr('class');
  $('.color-list li').addClass('preview-cell');
};


// Draw player
Level.prototype.drawPlayer = function(player) {

  // Draw each active tile
  for (var index = 0 ; index < player.activeTiles.length; index += 1) {
      
      // Find the cell to update on the board
      var selector = '[data-row=' + player.activeTiles[index].row + ']' +
                    '[data-col=' + player.activeTiles[index].column + ']';
      // Init the color on the board
      $(selector).addClass(player.activeTiles[index].color);
      
      // Set the current cell ( the cell with the o icon which is the first one the user can use )
      if ( player.activeTiles[index].current ) {
        $(selector).append($('<div>').addClass('current'));
      }

  }

  // Set the player current score
  $('.level-goal__progress').text(player.levelScore);
   // Set the target scope for the level
  $('.level-goal__target').text(this.success);

  // Init the first next three colors from the color-list
  this.updateColorList();

};


// Update display
Level.prototype.update = function(player) {
  player.move(this);  
  this.clearPlayer(player);
  this.drawPlayer(player);
}


// Function used to update the next 3 colors available on the level screen
Level.prototype.updateColorList = function() {
  // Loop over the first three elements on the array and display them
  for (var index = 0; index < 3; index += 1) {
      $('.color-list li:nth-child(' + (index + 1) + ')').addClass(this.nextColorsQueue[index]);
  }
};


// Function that resets the level
Level.prototype.resetLevel = function(player) {
  this.clearPlayer(player, true);
  this.clearLevel();
  // Remove the key event lister
  $('body').off("keydown");
  
  this.initBoard(player);
}


// Function that ends the level
Level.prototype.endLevel = function(player) {
  timeoutId = setTimeout(function() { 
    alert("OK, see you around.")
  }, 200);

  // Remove the key event lister
  $('body').off("keydown");
}


// Function handling when a user lost the level
Level.prototype.lost = function(player) {
  // A little delay is required to delete the current icon
  setTimeout(function() { $('.current').remove(); }, 10 );
 
  // Change the current icon to the lost on
  var selector = '[data-row=' + player.currentTile.row + ']' +
                 '[data-col=' + player.currentTile.column + ']';

  // Draw the lost icon on the current cell
  $(selector).append($('<div>').addClass('lost'));
  $('.lost').html("&#9587;");
  
  // Ask the user what they want to do after a few seconds
  var timeoutId = setTimeout(function() {
    var userChoice = confirm("Too bad, you just lost! Wanna retry?");
    // If the user wants to retry, reset everything
    if ( userChoice ) {
      console.log("Cool, let's roll!");
      this.resetLevel(player);

    } else {
      this.endLevel();
    }
  }.bind(this), 400);
}


// Function handling when a user win the level
Level.prototype.win = function(player) {
  // A little delay is required to delete the current icon
  setTimeout(function() { $('.current').remove(); }, 10 );
 
  // Change the current icon to the lost on
  var selector = '[data-row=' + player.currentTile.row + ']' +
                 '[data-col=' + player.currentTile.column + ']';

  // Draw the lost icon on the current cell
  $(selector).append($('<div>').addClass('won'));
  $('.won').html("&#9532;");
  
  // Ask the user what they want to do after a few seconds
  var timeoutId = setTimeout(function() {
    var userChoice = confirm("Wow, you rock! Wanna replay this level?");
    // If the user wants to retry, reset everything
    if ( userChoice ) {
      console.log("Cool, let's roll!");
      this.resetLevel(player);

    } else {
      this.endLevel();
    }
  }.bind(this), 400);
}


/* 
 * GAME
 */
// Constructor
function Game() {
  
  var gameObject = this;

  // Initialise the Player
  this.player = new Player();

  // Initialise Level 1 Board
  this.level = new Level(level1Params);
  this.level.initBoard(this.player);

}

/*
 * GAME FUNCTIONS
 */
