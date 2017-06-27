/* Javascript file handling the game logic */

/*
 * PLAYER
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
 * PLAYER FUNCTIONS
 */
Player.prototype.move = function (level) {
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
  }

  // If the next tile is not active and not out of the board
  if ( this.isNextTileFree(this.nextTile) && this.isNextTileInBoard(this.nextTile, level) ) {

    // Inscrease move counters
    this.nbLevelMoves += 1;
    this.nbMoves += 1;

    // If the next position makes 3 tiles of the same color
    if (this.isMatch()) {

    } else { 
      // If the user cannot move anymore, then move the tile and end game
      if ( !this.isFreeTileAround(this.nextTile, level) ) {
        isStuck = true;
      }

      // The move is correct
      // Save the move
      var currenrValidMove = {
        row: this.nextTile.row,
        column: this.nextTile.column,
        color: this.nextTile.color,
        current: true
      };

      // Set the new current tile
      this.currentTile = currenrValidMove;

      // Remove current from previous tile
      this.activeTiles[this.activeTiles.length - 1].current = false;

      // Add this new tile to the activeTiles array
      this.activeTiles.push(currenrValidMove);
      
      // Update the next colors array
      level.nextColorsQueue.shift();
      if ( level.nextColorsQueue.length < 3 ) {
        // If not enough colors are remaining, then push the inital set of colors back 
        var levelParams = eval("level"+level.number+"Params");
        for (var index = 0; index < levelParams.nextColorsQueue.length; index += 1) {
          level.nextColorsQueue.push(levelParams.nextColorsQueue[index]);
        }
      }

      // End game if stuck
      if ( isStuck ) {
        // No free tiles around => Game Over
        console.log("booo");
        level.lost(this);
      }
    }  
  } else if ( this.isFreeTileAround(this.currentTile, level) ) {
    console.log("Next position is either not free or out of bound");
  } else {
    // No free tiles around => Game Over
    console.log("Do we ever get here?")
    level.lost(this);

  }
}


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

// Function that returns true if the tile in param is free AND in the board
Player.prototype.isTileAroundInBoard = function(pos, level) { 
  
  // Set the values of the cells around
  var upTile    = { row: pos.row - 1, column: pos.column     };
  var rightTile = { row: pos.row    , column: pos.column + 1 };
  var downTile  = { row: pos.row + 1, column: pos.column     };
  var leftTile  = { row: pos.row    , column: pos.column - 1 };
  
  return (this.isNextTileFree(upTile) && this.isNextTileInBoard(upTile, level)) ||
         (this.isNextTileFree(rightTile) && this.isNextTileInBoard(rightTile, level)) ||
         (this.isNextTileFree(downTile) && this.isNextTileInBoard(downTile, level)) ||
         (this.isNextTileFree(leftTile) && this.isNextTileInBoard(leftTile, level))
}


// Check if there is any free cell around the current position
Player.prototype.isFreeTileAround = function (pos, level) {
  


  // Check if there are free tiles around based on the direction
  switch(this.direction) {
    case 'left':
      // Need to check up, right and down
      if ( this.isTileAroundInBoard(pos, level) ) { 
        return true;
      }
      break;

    case 'right':
      // Need to check down, left and up
      // No need to check left because this is where we are coming from
      if ( this.isTileAroundInBoard(pos, level) ) { 
        return true;
      }
      break;

    case 'up':
      // Need to check right, down and left
      // No need to check down because this is where we are coming from
      if ( this.isTileAroundInBoard(pos, level) ) { 
        return true;
      }
      break;

    case 'down':
      if ( this.isTileAroundInBoard(pos, level) ) { 
        return true;
      }
      break;
  }
  console.log("You are stuck mate :'(");
  // If we are here, it means that there is no free cell around
  return false;
}


// Check if 3 or more tiles of the same color are touching
Player.prototype.isMatch = function() {
  //console.log(this.activeTiles);
  return false;

// // Function that returns true if the tile in param is free AND in the board
// Player.prototype.isTileAroundInBoard = function(upTile, rightTile, downTile, leftTile, level) { 
//   return (this.isNextTileFree(upTile) && this.isNextTileInBoard(upTile, level)) ||
//          (this.isNextTileFree(rightTile) && this.isNextTileInBoard(rightTile, level)) ||
//          (this.isNextTileFree(downTile) && this.isNextTileInBoard(downTile, level)) ||
//          (this.isNextTileFree(leftTile) && this.isNextTileInBoard(leftTile, level))
// }



};



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
// Function used to update the next 3 colors available on the level screen
Level.prototype.updateColorList = function() {
  // Loop over the first three elements on the array and display them
  for (var index = 0; index < 3; index += 1) {
      $('.color-list li:nth-child(' + (index + 1) + ')').addClass(this.nextColorsQueue[index]);
  }
};


// Function handling when a user lost the level
Level.prototype.lost = function(player) {
  console.log("You lost! Do you want to retry?");
  setTimeout(function() {$('.current').remove(); }, 10);

  var selector = '[data-row=' + player.currentTile.row + ']' +
                 '[data-col=' + player.currentTile.column + ']';

  // Draw the lost icon on the current cell
  $(selector).append($('<div>').addClass('lost'));
  $('.lost').html("&#9587;");
}

/* 
 * GAME
 */
// Constructor
function Game() {
  // Initialise the Player
  this.player = new Player();

  // Initialise Level 1 Board
  this.level = new Level(level1Params);
  this.initBoard(this.level, this.player);

  // Assign keyboard key events to the game
  this.assignControlsToKeys();

}

/*
 * GAME FUNCTIONS
 */
// Function used to initialise the game
Game.prototype.initBoard = function(level, player) { 
  var currentIteration;

  /* Create the board */
  for (var row = 0; row < level.height; row +=1 ) {
    for (var column = 0; column < level.width; column +=1 ) {
      $('.board').append($('<div>')
        .addClass('cell')
        .attr('data-row', row)
        .attr('data-col', column)
      );

      // Build the board object
      level.board.push([row, column]);
    }
  }

  // For each tile in the initialState array:
  // Push it to the activeTiles array, in order to draw
  // Set the currentTile
  for (var index = 0 ; index < level.initState.length; index += 1) {
    currentIteration = {
        row: level.initState[index].row,
        column: level.initState[index].column,
        color: level.initState[index].color,
        current: false
    };
    // If the current item is the current one, set it in the activeTiles array
    if ( level.initState[index].current ) {
      currentIteration.current = true;
      player.currentTile = currentIteration;
    }

    // Push the item to the activeTiles array
    player.activeTiles.push(currentIteration);
  } 

  // Draw the player information (active / current tiles, score and next queue)
  this.drawPlayer(this.level, this.player);
  
}


// Bind arrow keys with move actions
Game.prototype.assignControlsToKeys = function() {
  $('body').on('keydown', function(e) {
    if( e.keyCode === 38 ||
        e.keyCode === 40 ||
        e.keyCode === 37 ||
        e.keyCode === 39 ||
        e.keyCode === 80
    ) {
      switch (e.keyCode) {
        case 38: // arrow up
          this.player.direction = 'up';
          break;
        case 40: // arrow down
          this.player.direction = 'down';
          break;
        case 37: // arrow left
          this.player.direction = 'left';
          break;
        case 39: // arrow right
          this.player.direction = 'right';
          break;
        case 80: // p pause
          break;
      }
      this.update();
    }
  }.bind(this));
};


// Clear the game
Game.prototype.clearPlayer = function() {
  // Clear each active tile (based on color)
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
Game.prototype.drawPlayer = function(level, player) {

  var that = level; // To keep the context when calling the updateColorList function

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
  $('.level-goal__target').text(level.success);

  // Init the first next three colors from the color-list
  that.updateColorList();

};


// Update display
Game.prototype.update = function() {
  this.player.move(this.level);
  this.clearPlayer();
  this.drawPlayer(this.level, this.player);
}