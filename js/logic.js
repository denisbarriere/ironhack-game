/* Javascript file handling the game logic */

/*
 * OBJECT: PLAYER
 */
function Player() {
  this.activeCells = []; // list of all the cells the player created
  this.currentCell; // Last cell created by the player
  this.nextCell; // Next cell the player want to create
  this.direction; // Direction requested by the user on keypress / swipe
  this.levelScore = 0; // Number of points made by the player in the current level
  this.score = 0; // Overall player score across levels
  this.nbLevelMoves = 0; // Number of cells moved by the player in the level
  this.nbMoves = 0; // Overall number of cells moved by the player
  this.cannotMove = false; // Used to avoid slide animation when on a border or against a cell
}


/*
 * PLAYER OBJECT FUNCTIONS
 */

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
Player.prototype.move = function (level) {
  
  // First things first, set .alreadyCheck and .matched to false for all activeCells elements
  this.clearActiveMatches();

  // Tells if a user can move or not
  var isStuck = false;

  switch(this.direction) {
    case 'left':
      // Get the next position and color
      this.nextCell = { row: this.currentCell.row, column: this.currentCell.column - 1, color: level.nextColorsQueue[0], current: false };
      break;

    case 'right':
      // Get the next position and color
      this.nextCell = { row: this.currentCell.row, column: this.currentCell.column + 1, color: level.nextColorsQueue[0], current: false };
      break;

    case 'up':
      // Get the next position and color
      this.nextCell = { row: this.currentCell.row - 1,column: this.currentCell.column, color: level.nextColorsQueue[0], current: false };
      break;

    case 'down':
      // Get the next position and color
      this.nextCell = { row: this.currentCell.row + 1,column: this.currentCell.column, color: level.nextColorsQueue[0], current: false };
      break;
    default: 
      console.log("[log] Player.prototype.move: '" + this.direction + "' direction is not defined");
  }

  // If the next cell is not active and not out of the board
  if ( this.isnextCellFree(this.nextCell) && this.isnextCellInBoard(this.nextCell, level) ) {

    // Inscrease move counters
    this.nbLevelMoves += 1;
    this.nbMoves += 1;

    // The move is correct
    // Save the move
    var currentValidMove = {
      row: this.nextCell.row,
      column: this.nextCell.column,
      color: this.nextCell.color,
      current: true
    };

    // Set the new current cell
    this.currentCell = currentValidMove;

    // Remove current from previous cell
    this.activeCells[this.activeCells.length - 1].current = false;

    // Add this new cell to the activeCells array
    this.activeCells.push(currentValidMove);
    
    // Update the next colors array
    level.nextColorsQueue.shift();
    if ( level.nextColorsQueue.length < 3 ) {
      // If not enough colors are remaining, then push the inital set of colors back 
      var levelProperties = eval("level"+level.number+"Properties");
      for (var index = 0; index < levelProperties.nextColorsQueue.length; index += 1) {
        level.nextColorsQueue.push(levelProperties.nextColorsQueue[index]);
      }
    }
    
    // Display the information bubbles
    if (this.nbMoves === 1 && level.number === 1) { level.showBubble("You can only move to an empty space.", 2, this); } 
    if (this.nbMoves === 2 && level.number === 1) { level.showBubble("Don't get locked in!", 3, this); }
    if (this.nbMoves === 3 && level.number === 1) { level.showBubble("This shows the next color.", 4, this); }
    if (this.nbMoves === 4 && level.number === 1) { level.showBubble("Match 3 or more squares of the same color!", 5, this); }
    if (this.nbMoves === 5 && level.number === 1) { level.showBubble(); }

    // If the next position makes 3 cells of the same color
    var nbMatches = this.getNbMatches(level);
    
    if ( nbMatches >= 3 ) {
    
      // Clear all previous matches
      this.clearMatches();

      // Update the player score. It will be updated next time the level is drawn
      this.levelScore += nbMatches;

      // Play the match sound
      var audioMatch = new Audio('./sounds/366102__original-sound__confirmation-upward.wav');
      audioMatch.play();

      if ( this.levelScore >= level.success ) {
        // The player won the level!
        level.win(this);
      }
    } else {
      // Set .alreadyCheck and .matched to false for all activeCells elements
      this.clearActiveMatches();
    }

    // Finally, if the user cannot move anymore, then end the level
    if ( !this.isFreeCellAround(this.currentCell, level) ) {      
      level.lost(this);
    } 
  } else if ( this.isFreeCellAround(this.currentCell, level) ) {
    console.log("You can't move to this position");
    this.cannotMove = true;
  } else {
    // No free cells around => Game Over
    console.log("Do we ever get here?")
    level.lost(this);

  }
}


/* 
 * FUNCTION: Removes all the matched cells, except the current cell, from the 'Player.activeCells' array
 * PARAMETERS: None
 * RETURNS: Undefined
 */
Player.prototype.clearMatches = function() {
  for (var index = this.activeCells.length -1; index >= 0; index -= 1) {    
    if ( this.activeCells[index].matched && !this.activeCells[index].current ) {
      this.activeCells.splice(index, 1);
    }
  }
};

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Function used to check if the next cell is free to move
Player.prototype.isnextCellFree = function (nextPos) {
  // Look in the active cells to see if the next position is matching and return the opposite (if match, the cell is NOT free)
  return !this.activeCells.some(function (element) { 
    return element.row == nextPos.row && element.column == nextPos.column;
  }.bind(this));
};

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Function used to check if the next cell is out of the board
Player.prototype.isnextCellInBoard = function (nextPos, level) {
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

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Check if there is any free cell around the current position
Player.prototype.isFreeCellAround = function (pos, level) {
  
  // Set the values of the cells around
  var upCell    = { row: pos.row - 1, column: pos.column     };
  var rightCell = { row: pos.row    , column: pos.column + 1 };
  var downCell  = { row: pos.row + 1, column: pos.column     };
  var leftCell  = { row: pos.row    , column: pos.column - 1 };

  if (  (this.isnextCellFree(upCell) && this.isnextCellInBoard(upCell, level)) ||
        (this.isnextCellFree(rightCell) && this.isnextCellInBoard(rightCell, level)) ||
        (this.isnextCellFree(downCell) && this.isnextCellInBoard(downCell, level)) ||
        (this.isnextCellFree(leftCell) && this.isnextCellInBoard(leftCell, level))
  ) { 
    return true;
  }
  
  console.log("You are stuck mate :'(");
  // If we are here, it means that there is no free cell around
  return false;
}
/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Tells if a cell is active
Player.prototype.isActive = function(cell) {
  // Returns true if cell is found in the active array
  return this.activeCells.some(function (element) { 
    return element.row == cell.row && element.column == cell.column;
  }.bind(this));
};

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Tells if a cell is active
Player.prototype.isSameColor = function(cell1Index, cell2Index) {
  if ( cell1Index === -1 || cell2Index === -1 ) {
    return false;
  } 
  
  // if the color matches, return the cell2 index
  if ( this.activeCells[cell1Index].color === this.activeCells[cell2Index].color ) {
    return cell2Index;
  } else {
    return false;
  }
};

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Function returning the cell index from the 'activeCells' array
Player.prototype.getActiveCellIndex = function(cellPosition) {
  var indexToReturn = this.activeCells.find(function(element) {
     return element.row === cellPosition.row && element.column === cellPosition.column
  });
   return this.activeCells.indexOf(indexToReturn);
};

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
/* FUNCTION: Checks if a cell is touching another one with the same color, either up, right, down or left
 * PARAMETERS: Object including the reference cell
 * RETURNS: [Array] of objects. Each object if defined as following:
 * { cell1: <first cell compared>,
 *   cell2: <second cell compared>,
 *   touch: <true: if the two cells are touching and of the same color, else false>
 * }
 */
Player.prototype.touchWithColor = function(cellToCheck) {

  // Set the values of the cells around
  var upCell    = { row: cellToCheck.row - 1, column: cellToCheck.column     };
  var rightCell = { row: cellToCheck.row    , column: cellToCheck.column + 1 };
  var downCell  = { row: cellToCheck.row + 1, column: cellToCheck.column     };
  var leftCell  = { row: cellToCheck.row    , column: cellToCheck.column - 1 };
  
  // Get cells index from the 'activeCells' array
  var cellToCheckIndex = this.getActiveCellIndex(cellToCheck);
  var upCellIndex = this.getActiveCellIndex(upCell);
  var rightCellIndex = this.getActiveCellIndex(rightCell);
  var downCellIndex = this.getActiveCellIndex(downCell);
  var leftCellIndex = this.getActiveCellIndex(leftCell);
   
  // This array inclues objects storing the test results clockwise (0: result of test up, 1: result of test right, 2: result of test down, 3: result of test left)  
  var objToReturn = [];

  // Variables store the return values of the 'Player.isSameColor' function in the four directions, clockwise (up, right, down, left)
  var isUpCellSameColor = this.isSameColor(cellToCheckIndex, upCellIndex);
  var isRightCellSameColor = this.isSameColor(cellToCheckIndex, rightCellIndex);
  var isDownCellSameColor = this.isSameColor(cellToCheckIndex, downCellIndex);
  var isLeftCellSameColor = this.isSameColor(cellToCheckIndex, leftCellIndex);
  
  // Checks if two cells are touching and have the same color 
  if ( this.isActive(upCell) && isUpCellSameColor !== false ) { objToReturn.push(isUpCellSameColor); }  // UP
  if ( this.isActive(rightCell) && isRightCellSameColor !== false ) { objToReturn.push(isRightCellSameColor); }  // RIGHT
  if ( this.isActive(downCell) && isDownCellSameColor !== false ) { objToReturn.push(isDownCellSameColor); }  // DOWN
  if ( this.isActive(leftCell) && isLeftCellSameColor !== false ) { objToReturn.push(isLeftCellSameColor); } // LEFT  

  // Mark the cellToCheck as alreadyChecked
  this.activeCells[cellToCheckIndex].alreadyChecked = true;

  if ( objToReturn.length > 0 ) {
    // Mark the cellToCheck as matched
    this.activeCells[cellToCheckIndex].matched = true;
  }

  // Return the array of matching indexes
  return objToReturn;
};


/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
Player.prototype.findAllMatches = function (cellToCheck) {
  // Test for touching cells with the same color
  var isTouchingWithSameColor = this.touchWithColor(cellToCheck);
  
  if ( isTouchingWithSameColor.length > 0 ) {
    // For each touching cells with the same color      
    isTouchingWithSameColor.forEach(function (element) {
      // if the cell has not been checked already
      if( !this.activeCells[element].alreadyChecked ) {
        // Mark the cell as matched
        this.activeCells[element].matched;

        // Check the cell and all following cells that are touching and have the same color
        this.findAllMatches(this.activeCells[element]);
      }
    }.bind(this));
  } 
}
/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
/*
 * FUNCTION which reset all .alreadyChecked and .matched keys to false
 * 
*/
Player.prototype.clearActiveMatches = function() {
  for (var index = 0; index < this.activeCells.length; index += 1) {
    this.activeCells[index].alreadyChecked = false;
    this.activeCells[index].matched = false;
  }
};

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
Player.prototype.countMatches = function() {
  var counter = 0;
  for (var index = 0; index < this.activeCells.length; index += 1) {
    if ( this.activeCells[index].matched ) {
      counter += 1;
    }
  }
  return counter;
};

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
/*
 * Check if 3 or more cells of the same color are touching
*/
Player.prototype.getNbMatches = function(level) {

  // Recursively check all touching cells to find the ones with the same color
  this.findAllMatches(this.activeCells[this.activeCells.length - 1]);
  
  // Count the number of cells with the same color as the current one
  var count = this.countMatches();
  
  // Return the number of matches
  return count;
} 


/*
 * OBJECT: LEVEL
 */
function Level(level) {
  this.number = level.number; // e.g. 1 for level1
  this.width = level.width; // Number of columns
  this.height = level.height; // Number of rows
  this.initState = level.initState; // Initial state of the board. e.g. position of the first cell (the current cell)
  this.nextColorsQueue = []; // Array storing the next 3 cells coming up
  this.success = level.success; // Success value. e.g the number of matches to do to win the level

  // Initialise the nextColorsQueue (the next 3 colors displayed above the board)
  for (var index = 0; index < level.nextColorsQueue.length; index += 1) {
    this.nextColorsQueue.push(level.nextColorsQueue[index]);
  }
}


/*
 * LEVEL OBJECT FUNCTIONS
 * Manage all the data and function required to handle the board
 */

/*
 * FUNCTION: Initialise a new level
 * PARAMETERS: Player object
 * RETURNS: Undefined
 */
Level.prototype.initLevel = function(player) { 
  var currentIteration;

  // Create the HTML board, cell by cell, based on the level properties
  for (var row = 0; row < this.height; row +=1 ) {
    for (var column = 0; column < this.width; column +=1 ) {
      $('.board').append($('<div>')
        .addClass('cell')
        .attr('data-row', row)
        .attr('data-col', column)
      );
    }
  }

  // For each cell in the initialState array:
  // Push it to the activeCells array, in order to draw
  // Set the currentCell
  for (var index = 0 ; index < this.initState.length; index += 1) {
    currentIteration = {
        row: this.initState[index].row,
        column: this.initState[index].column,
        color: this.initState[index].color,
        current: false
    };
    // If the current item is the current one, set it in the activeCells array
    if ( this.initState[index].current ) {
      currentIteration.current = true;
      player.currentCell = currentIteration;
    
      // Add the information bubble, at level init, only at level 1
      if (this.number === 1 ) {
        var selector = '[data-row=' + player.currentCell.row + ']' +
                       '[data-col=' + player.currentCell.column + ']';
        
        $(selector).append($('<div>').addClass('info left first-info'));
        $('.info.left.first-info').text('Swipe any direction to move!');
        $('.info.left.first-info').fadeIn(400);
      }
    }

    // Push the item to the activeCells array
    player.activeCells.push(currentIteration);
  } 

  // Draw the player information (active / current cells, score and next queue)
  this.drawPlayer(player);

  // Assign keyboard key events to the game
  this.assignControlsToKeys(player);

}


Level.prototype.matchUserInputToGameActions = function(action, player) {
  switch (action) {
    case 38: // arrow up
    case 'up': // swipe up
      player.direction = 'up';
      break;
    case 39: // arrow right
    case 'right': // swipe right
      player.direction = 'right';
      break;
    case 40: // arrow down
    case 'down': // swipe down
      player.direction = 'down';
      break;
    case 37: // arrow left
    case 'left': // swipe left
      player.direction = 'left';
      break;
  }
  this.update(player);
};

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Bind arrow keys with move actions
Level.prototype.assignControlsToKeys = function(player) {
  
  // Add an event listener to enable users to play with the keyboard
  $('body').on('keydown', function(e) {
    // Get the key pressed
    var action = e.keyCode;
    if( e.keyCode === 38 ||
        e.keyCode === 40 ||
        e.keyCode === 37 ||
        e.keyCode === 39 ||
        e.keyCode === 80
    ) {
      // Perform game action based on the swipe direction
      this.matchUserInputToGameActions(action, player);
    }
  }.bind(this));

  // Add an event listerner to enable users to play with swipes
  $('body').on('swipe', function(e, touch) {
    // Get the swipe direction
    var action = touch.direction;
    // Perform game action based on the swipe direction
    this.matchUserInputToGameActions(action, player);
     
  }.bind(this));
};


/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Function used to clear the board
Level.prototype.clearLevel = function() {
  // Reset the Level Object
  this.nextColorsQueue = [];

  // Reset the colorQueue to its initial value
  var levelProperties = eval("level"+this.number+"Properties");
  for (var index = 0; index < levelProperties.nextColorsQueue.length; index += 1) {
    this.nextColorsQueue.push(levelProperties.nextColorsQueue[index]);
  }
  
  // Clear the board on the screen
  $('.board > .cell').remove();
}

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Clear the player from the board
Level.prototype.clearPlayer = function(player, clearAllPlayerData) {
  if (clearAllPlayerData) {
    // Reset the player object (related to the level)
    player.activeCells = [];
    player.currentCell = {};
    player.nextCell = {};
    player.direction = 'None';
    player.levelScore = 0;
    player.nbLevelMoves = 0;

    // Clear lost div
    $('.lost').remove();
  }

  // Clear each active cell on the board (based on color)
  availableColor.forEach(function(color) {
    $('.board > .' + color).removeClass(color);
  });

  // Clear current div
  $('.current').remove();

  // Clear the next colors
  $('.color-list li').removeAttr('class');
  $('.color-list li').addClass('preview-cell');
};

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Draw player
Level.prototype.drawPlayer = function(player) {

  // Draw each active cell
  for (var index = 0 ; index < player.activeCells.length; index += 1) {
      
      // Find the cell to update on the board
      var selector = '[data-row=' + player.activeCells[index].row + ']' +
                    '[data-col=' + player.activeCells[index].column + ']';
      // Init the color on the board
      $(selector).addClass(player.activeCells[index].color);

      // Set the current cell ( the cell with the o icon which is the first one the user can use )
      if ( player.activeCells[index].current ) {
        $(selector).append($('<div>').addClass('current'));
        
        // Add animation effet to display the current cell
        // If the player is next to a cell or a border and going to this direction, don't show animation
        if( !player.cannotMove ) {
          $(selector).hide();
          if ( player.direction === "up"  ) { $(selector).show('slide',{direction:'down'},100); } 
          if ( player.direction === 'right' ) { $(selector).show('slide',{direction:'left'},100); }
          if ( player.direction === 'down' ) { $(selector).show('slide',{direction:'up'},100); }
          if ( player.direction === 'left' ) { $(selector).show('slide',{direction:'right'},100); }
        
          // Fade in for the first cell displayed
          if ( player.direction === undefined) { $(selector).fadeIn(200); } else {
            // Play the move sound
            var audioMove = new Audio('./sounds/branch_break.mp3');
            audioMove.play();
          }

          // In any case, the o icon get displayed with a fadeIn
          $('.current').hide().fadeIn(200);
        }
      }
  }

  // Set the player current score
  $('.level-goal__progress').text(player.levelScore);
   // Set the target scope for the level
  $('.level-goal__target').text(this.success);

  // Init the first next three colors from the color-list
  this.updateColorList();

  // Reset this flag
  player.cannotMove = false;

};

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Update display
Level.prototype.update = function(player) {
  
  player.move(this);  
  this.clearPlayer(player);
  // ion.sound.play("branch_break"); // play sound
  this.drawPlayer(player);
}

/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
*/
// Function used to update the next 3 colors available on the level screen
Level.prototype.updateColorList = function() {
  // Loop over the first three elements on the array and display them
  for (var index = 0; index < 3; index += 1) {
      $('.color-list li:nth-child(' + (index + 1) + ')').addClass(this.nextColorsQueue[index]);
  }
};


/*
 * FUNCTION: Removes the current bubble and display the next one
 * PARAMETERS: If none, the function will only clear the last information bubble. Else, the function takes 3 parameteres:
 *  1. message: The message to display
 *  2. infoNumber: The number of the message to display
 *  3. reference to the Player object
*/
Level.prototype.showBubble = function(message, infoNumber, player) {
  // Remove the previous bubble
  $('.info').remove();
         
  // If the function is called with no parameters, then the function only cleans the last bubble 
  if (arguments.length > 0) {
    // First convert the infoNumber to target the proper CSS class
    var infoOrder = "";
    if ( infoNumber === 2 ) { infoOrder = "second"; } 
    if ( infoNumber === 3 ) { infoOrder = "third"; }
    if ( infoNumber === 4 ) { infoOrder = "fourth"; var headerPosition = true; }
    if ( infoNumber === 5 ) { infoOrder = "fifth"; }     

    // And display the second one
    if ( !headerPosition ) {
      var selector = '[data-row=' + player.currentCell.row + ']' +
                      '[data-col=' + player.currentCell.column + ']';
    } else { // If headerPosition flag is true, then position the info bubble based on the header, not the current cell
      var selector = '[data-row=0]' +
                     '[data-col=0]';
    }
    // Then display the second bubble
    $(selector).append($('<div>').addClass('info ' + infoOrder + '-info'));
    $('.info').text(message);
    $('.info').fadeIn(400);
    
    // Position the bubble based on the move direction
    var columnSide = Math.ceil(this.width / 2);
     
    if ( player.currentCell.column >= columnSide && !headerPosition ) {
      $('.info').addClass('right');
    } else { 
      $('.info').addClass('left');
    }

    // Add the proper border color based on the cell color
    switch(player.currentCell.color) {
      case 'blue':
        $('.info').toggleClass('blue');
        break;
      case 'red':
        $('.info').toggleClass('red');
        break;
      case 'grey':
        $('.info').toggleClass('grey');
        break;
      default: 
        console.log("Unexpected cell color: ", player.currentCell.color);
    };
  }
}; 


/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Function that resets the level
Level.prototype.resetLevel = function(player) {
  this.clearPlayer(player, true);
  this.clearLevel();
  // Remove the key event lister
  $('body').off("keydown");
  
  this.initLevel(player);
}


/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Function that ends the level
Level.prototype.endLevel = function(player) {
  timeoutId = setTimeout(function() { 
    alert("OK, see you around.")
  }, 200);

  // Remove the key event lister
  $('body').off("keydown");
}


/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Function handling when a user lost the level
Level.prototype.lost = function(player) {
  // A little delay is required to delete the current icon
  setTimeout(function() { $('.current').remove(); }, 10 );
 
  // Change the current icon to the lost on
  var selector = '[data-row=' + player.currentCell.row + ']' +
                 '[data-col=' + player.currentCell.column + ']';

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


/*
 * FUNCTION: 
 * PARAMETERS: 
 * RETURNS: 
 */
// Function handling when a user win the level
Level.prototype.win = function(player) {
  // A little delay is required to delete the current icon
  setTimeout(function() { $('.current').remove(); }, 10 );
 
  // Change the current icon to the lost on
  var selector = '[data-row=' + player.currentCell.row + ']' +
                 '[data-col=' + player.currentCell.column + ']';

  $(selector).animate({ backgroundColor: "#000"}, 100 );
  
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
 * OBJECT: GAME
 * Initiate the game main objects
 */

// Constructor
function Game() {
  
  // Initialise the Player Object
  this.player = new Player();

  // Initialise the Level Object, based on level 1 properties
  this.level = new Level(level1Properties);
  this.level.initLevel(this.player);

}

/*
 * GAME FUNCTIONS
 */
