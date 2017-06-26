/* Javascript file handling the game logic */

/*
 * PLAYER
 */
function Player() {
  this.direction;
  this.activeTiles = [];
  this.currentTile;
  this.nextTile;
}

/*
 * PLAYER FUNCTIONS
 */
Player.prototype.move = function (direction, level) {

  switch(direction) {
    case 'left':
      console.log("Move left");
      // Get the next position and color
      this.nextTile = { row: level.row, column: level.column - 1 };
      break;

    case 'right':
      console.log("Move right");
      // Get the next position and color
      this.nextTile = { row: this.currentTile.row, column: this.currentTile.column + 1, color: level.colorQueue[0] };
      break;
  
    case 'up':
      console.log("Move up");
      // Get the next position and color
      this.nextTile = { row: level.row - 1,column: level.column };
      break;

    case 'down':
      console.log("Move down");
      // Get the next position and color
      this.nextTile = { row: level.row + 1,column: level.column };
      break;
  }

  // If the next tile is not active and not out of the board
  if ( this.isNextCellFree(this.nextTile) && this.isNextCellInBoard(this.nextTile) ) {
    console.log("Next position is available");

    // If the next position makes 3 tiles of the same color
    if (this.isMatch()) {

    } else {
      // Draw new tile
      this.drawNextTile();
    }
    level.updateNextTile();
  }
}


// Function used to check if the next tile is free to move
Player.prototype.isNextCellFree = function (nextPosition) {
  
  // Look in the active tiles to see if the next position is matching and return the opposite (if match, the tile is NOT free)
  return !this.activeTiles.some(function (element) { 
    return element.row == nextPosition.row && element.column == nextPosition.column;
  });
};


// Function used to check if the next tile is out of the board
Player.prototype.isNextCellInBoard = function (nextPosition) {
  return !(nextPosition.row === undefined || nextPosition.column === undefined );
};


Player.prototype.isMatch = function() {
  return false;
};


Player.prototype.drawNextTile = function() {
  
  console.log(this);
  
  var selector = '[data-row=' + this.nextTile.row + ']' +
                 '[data-col=' + this.nextTile.column + ']';
  // Init the color on the board
  $(selector).addClass(this.nextTile.color);

  // // Add new tile to the active tiles
  this.activeTiles.push(this.nextTile);

  // Clean previous current position on board
  $('.current').remove();

  // // Set as new current position on the board
  $(selector).append($('<div>').addClass('current'));

  // Set as new current position
  // this.currentTile.row = this.nextTile.row;
  // this.currentTile.column = this.nextTile.column;
  // this.currentTile.color = this.nextTile.color;

for (var j= 0; j < this.activeTiles.length; j++) {
      console.log("Iteration " + j)
       console.log(this.activeTiles[j].row, this.activeTiles[j].column, this.activeTiles[j].color);
    }

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
  this.colorQueue = level.colorQueue;
  this.success = level.success;
}

/*
 * LEVEL FUNCTIONS
 */
// Function used to initialise the game
Level.prototype.initBoard = function(player) { 
  // used to bind internal functions
  var that = this;
  var currentIteration;

  /* Create the board */
  for (var row = 0; row < this.height; row +=1 ) {
    for (var column = 0; column < this.width; column +=1 ) {
      $('.board').append($('<div>')
        .addClass('cell')
        .attr('data-row', row)
        .attr('data-col', column)
      );

      // Build the bord object
      this.board.push({row: row, column: column});
    }
  }

  // Draw the level initial state on the board
  for (var index = 0 ; index < this.initState.length; index += 1) {
    // Find the cell to update on the board
    var selector = '[data-row=' + this.initState[index].row + ']' +
                   '[data-col=' + this.initState[index].column + ']';
    // Init the color on the board
    $(selector).addClass(this.initState[index].color);
    
    currentIteration = {
        row: this.initState[index].row,
        column: this.initState[index].column,
        color: this.initState[index].color
    };
    
    // Set the current cell ( the cell with the o icon which is the first one the user can use )
    if ( this.initState[index].current ) {
      player.currentTile = currentIteration;
      $(selector).append($('<div>').addClass('current'));
    }

    // Set as active tile
    player.activeTiles.push(currentIteration);
  }

  // Init the level goal
  $('.level-goal__progress').text(0);
  $('.level-goal__target').text(this.success);

  // Init the first next three colors from the color-list
  that.updateColorList();
}


// Function used to update the next 3 colors available on the level screen
Level.prototype.updateColorList = function() {
  // Loop over the first three elements on the array and display them
  for (var index = 0; index < 3; index += 1) {
      $('.color-list li:nth-child(' + (index +1) + ')').addClass(this.colorQueue[index]);
  }
};


// Function to update the tile queue
Level.prototype.updateNextTile = function() {
  // used to bind internal functions
  var that = this;

  // Update next items in coloQueue
  this.colorQueue.shift();
  
  // If colorQueue is empty, reset to the inital state
  if (this.colorQueue.length === 3) {
    for (var index = 0; index < level1Params.colorQueue.length; index += 1) {
      //this.colorQueue.push(level1Params.colorQueue[index]);
      console.log("End of queue"); // TODO: fix the level1Params.colorQueue issue
    }
  }

  // Update the color list on the level screen
  that.updateColorList();
};


/* 
 * GAME
 */
// Constructor
function Game() {
  // Initialise the Player
  this.player = new Player();

  // Initialise Level 1 Board
  this.level = new Level(level1Params);
  this.level.initBoard(this.player);

  // Assign keyboard key events to the game
  this.assignControlsToKeys();

}

/*
 * GAME FUNCTIONS
 */
// Bind arrow keys with move actions
Game.prototype.assignControlsToKeys = function() {
  $('body').on('keydown', function(e) {
    switch (e.keyCode) {
      case 38: // arrow up
        this.player.move('up', this.level);
        break;
      case 40: // arrow down
        this.player.move('down', this.level);
        break;
      case 37: // arrow left
        this.player.move('left', this.level);
        break;
      case 39: // arrow right
        this.player.move('right', this.level);
        break;
      case 80: // p pause
        break;
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
};


// Draw player
Game.prototype.drawnPlayer = function() {

};


// Update display
Game.prototype.update = function() {
  this.player.move();
  this.clearPlayer();
  this.drawnPlayer();
}