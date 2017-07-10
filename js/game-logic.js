/* Javascript file handling the game logic */

/******************************
 *                            * 
 *  OBJECT: Player            *
 *    => Constructor          *
 *                            *
 * ****************************/
function Player() {

  this.activeCells = []; // list of all the cells the player created
  this.currentCell; // Last cell created by the player
  this.nextCell; // Next cell the player want to create
  this.direction; // Direction requested by the user on keypress / swipe
  this.levelScore = 0; // Number of points made by the player in the current level
  this.score = 0; // Overall player score across levels
  this.nbLevelMoves = 0; // Number of cells moved by the player in the level
  this.nbMoves = 0; // Overall number of cells moved by the player
  this.cannotMove = false; // Used to avoid slide animation getting displayed when the Player want to move to a cell that is either already active or out of the board

}


/******************************
 *                            * 
 *  OBJECT: Player            *
 *    => Functions            *
 *                            *
 * ****************************/
/**
 * FUNCTION: Find the next cell row and column based on the current position and direction.
 *           This is the cell where the players wants to go
 * PARAMETERS: Level Object
 * RETURNS: undefined
 * DEPENDENCIES: None
**/
Player.prototype.setNextCell = function (level) {
  
  // Depending on the direction, find which is the next cell, where the player wants to move to
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

};


/**
 * FUNCTION: Process the Player's move request
 *           Based on the context, either move to the next cell or not
 * PARAMETERS: 1. Level Object
 * RETURNS: undefined
 * DEPENDENCIES: + Player.clearActiveMatches()
 *               + Player.setNextCell(Level)
 *               + Player.isCellFree(Cell object: { row: <>, column: <> })
 *               + Player.isCellInBoard(Cell object: { row: <>, column: <> }, Level)
 *               + Level.updatNextColorQueue()
 *               + Player.showBubble(messageString, infoBubbleNumber, Level)
 *               + Player.getNbMatches(Level)
 *               + Player.clearMatches()
 *               + Level.win(Player)
 *               + Level.lost(Player)
 *               + Player.clearActiveMatches()
 *               + Player.isFreeCellAround(Cell object: { row: <>, column: <> }, Level)
**/
Player.prototype.move = function (level) {
  
  // First things first, set .alreadyCheck and .matched to false for all activeCells elements
  this.clearActiveMatches();

  // Tells if a user can move or not
  let isStuck = false;

  // Define the next cell, based on direction
  this.setNextCell(level);

  // If the next cell is not active (aka the player already moved to this cell)
  // and the cell not out of the board
  if ( this.isCellFree(this.nextCell) && this.isCellInBoard(this.nextCell, level) ) {

    // Inscrease the move counters
    this.nbLevelMoves += 1;
    this.nbMoves += 1;

    // The move request is valid, so we should save it
    let currentValidMove = {
      row: this.nextCell.row,
      column: this.nextCell.column,
      color: this.nextCell.color,
      current: true
    };

    // Set the new current cell
    this.currentCell = currentValidMove;

    // Remove the current flaf from previous cell (the previous current)
    this.activeCells[this.activeCells.length - 1].current = false;

    // Add this new cell to the activeCells array
    this.activeCells.push(currentValidMove);
    
    // Update the next colors array
    level.updatNextColorQueue();
       
    // Display the information bubbles in level 1
    if (this.nbMoves === 1 && level.number === 1) { this.showBubble("You can only move to an empty space.", 2, level); } 
    if (this.nbMoves === 2 && level.number === 1) { this.showBubble("Don't get locked in!", 3, level); }
    if (this.nbMoves === 3 && level.number === 1) { this.showBubble("This shows the next color.", 4, level); }
    if (this.nbMoves === 4 && level.number === 1) { this.showBubble("Match 3 or more squares of the same color!", 5, level); }
    if (this.nbMoves === 5 && level.number === 1) { this.showBubble(); }

    // Calculate the number of cells of the same color (the new current cell color) are touching
    let nbMatches = this.getNbMatches(level);
    
    // If the next position makes 3 cells of the same color touching,
    // it means we have a color match
    if ( nbMatches >= 3 ) {
    
      // Clear all previous matches
      this.clearMatches();

      // Update the player score. It will be updated on the screen, the next time the level will be drawn
      this.levelScore += nbMatches;

      // Play the match sound
      let audioMatch = new Audio('./sounds/366102__original-sound__confirmation-upward.wav');
      audioMatch.play();

      // If the Player score if greater or equal to the level goal,
      // it means that the Player won the level, 
      if ( this.levelScore >= level.success ) {

        // The player won the level!
        level.win(this);
      
      }

    // Else, we have less than 3 matches,
    } else {
      
      // So we need to clear the matches flags for the next move
      // by setting the .alreadyCheck and .matched flags to false for all activeCells elements
      this.clearActiveMatches();

    }

    // Finally, if the user cannot move anymore, 
    // It means that the Player is stuck, so he/she lost the level. So we need to end the level
    if ( !this.isFreeCellAround(this.currentCell, level) ) {   

      level.lost(this);
    
    } 
  
  // If the next cell is either active or out of the board, 
  // Then we need to check if there is a free cell around
  } else if ( this.isFreeCellAround(this.currentCell, level) ) {
    
    // If yes (there is a free cell around), it means that the user is not stuck
    // But the cell they request is not a valid move (either active or out of the board)
    // In that case, we raise a flag (used to avoid displaying move animation in the draw function)
    // and not move the current cell
    console.log("You can't move to this position");
    this.cannotMove = true;
  
  } else {

    // If we are here, it means that there is no cell around, so the game is over
    // This is just a safety, because there is no case identified so far where we would be in this case
    console.log("Do we ever get here?")
    level.lost(this);

  }

};


/** 
 * FUNCTION: Removes all the matched cells from the 'Player.activeCells' array,
 *           except the current cell
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: None
**/
Player.prototype.clearMatches = function() {

  // Loop over the whole activeCells array
  for (let index = this.activeCells.length -1; index >= 0; index -= 1) { 
    
    // if the matched flag is present and the cell is not the current one   
    if ( this.activeCells[index].matched && !this.activeCells[index].current ) {

      // Then, remove the cell from the activeCells array
      this.activeCells.splice(index, 1);
    
    }
  }

};


/**
 * FUNCTION: Checks if a cell is available
 * PARAMETERS: 1. Cell object: { row: <>, column: <> }
 * RETURNS: + TRUE if the cell to check does not exists in the activeCells array
 *          + FALSE if the cell to check is found in the activeCells array
 * DEPENDENCIES: 
**/
Player.prototype.isCellFree = function (cell) {
  
  // Look in the active cells array, 
  // if the next position is matching an active cell
  // The some() function will return true
  // So we return the opposite: TRUE if no match or FALSE if matches
  return !this.activeCells.some( function (element) { 
    return element.row == cell.row && element.column == cell.column;
  }.bind(this));

};


/**
 * FUNCTION: Checks if a cell is out of the board
 * PARAMETERS: 1. Cell object: { row: <>, column: <> }
 *             2. Level Object
 * RETURNS: + TRUE if the cell to check is within the board
 *          + FALSE if the cell to check is outside of the board 
 * DEPENDENCIES: None
**/
Player.prototype.isCellInBoard = function (cell, level) {
  
  // If the cell is out of the board
  if (  cell.row < 0 || 
        cell.row > level.height - 1 ||
        cell.column < 0 ||
        cell.column > level.width - 1
  ) { 
    // Return FALSE
    return false;

  // Else, return TRUE
  } else { 
    return true;
  }

};


/**
 * FUNCTION: Checks if there is any cell around the current cell
 * PARAMETERS: 1. Cell object: { row: <>, column: <> }
 *             2. Level Object
 * RETURNS: + TRUE if there is at least one cell around available (up, right, down or left)
 * DEPENDENCIES: + Player.isCellFree(Cell object: { row: <>, column: <> })
 *               + Player.isCellInBoard(Cell object: { row: <>, column: <> }, Level Object)
**/
Player.prototype.isFreeCellAround = function (cell, level) {
  
  // Set the values of the cells around
  let upCell    = { row: cell.row - 1, column: cell.column     };
  let rightCell = { row: cell.row    , column: cell.column + 1 };
  let downCell  = { row: cell.row + 1, column: cell.column     };
  let leftCell  = { row: cell.row    , column: cell.column - 1 };

  // Return TRUE if, at least, one cell around (up, right, down or left) is free
  if (  (this.isCellFree(upCell) && this.isCellInBoard(upCell, level)) ||
        (this.isCellFree(rightCell) && this.isCellInBoard(rightCell, level)) ||
        (this.isCellFree(downCell) && this.isCellInBoard(downCell, level)) ||
        (this.isCellFree(leftCell) && this.isCellInBoard(leftCell, level))
  ) { 
    return true;
  }
  
  // Else, it means that the Player can not move to any direction. The Player is stuck
  console.log("You are stuck mate :'(");

  // In that case, return FALSE
  return false;

};


/**
 * FUNCTION: Checks if a cell is active (belongs to the activeCells array)
 * PARAMETERS: 1. Cell object: { row: <>, column: <> }
 * RETURNS: + TRUE if the cell is found in the "activeCells" array
 *          + FALSE if the cell is not found in the "activeCells" array
 * DEPENDENCIES: None
**/
Player.prototype.isActive = function(cell) {

  // Returns TRUE if cell is found in the active array,
  // Else FALSE
  return this.activeCells.some(function (element) { 
    return element.row == cell.row && element.column == cell.column;
  }.bind(this));

};


/**
* FUNCTION: Checks if two cells have the same color (based on the "activeCells" array)
 * PARAMETERS: 1. First cell index (index of a cell in the "activeCells" array)
 *             2. Second cell index (index of a cell in the "activeCells" array)
 * RETURNS: + cell2Index if the two cells have the same color
 *          + FALSE if the two cells have a different color or if one of the index is -1
 * DEPENDENCIES: None
**/
Player.prototype.isSameColor = function(cell1Index, cell2Index) {

  // Return FALSE if one of the index is -1
  // The index can be -1 when a cell was not found in the "activeCells" array by the Player.getActiveCellIndex earlier in the code flow
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


/**
 * FUNCTION: Returns the index of a cell from the "activeCells" array
 * PARAMETERS: 1. Cell object: { row: <>, column: <> }
 * RETURNS: + Index of the first occurance of the cell, found in the "activeCells" array
 *          + -1 if the cell was not found in the "activeCells" array
 * DEPENDENCIES: None
**/
Player.prototype.getActiveCellIndex = function(cell) {

  // Find the first cell matching the row and column from the "activeCells" array
  let indexToReturn = this.activeCells.find(function(element) {
     return element.row === cell.row && element.column === cell.column
  });

  // Return the index of the cell found,
  // Or return -1 if the cell was not found
  return this.activeCells.indexOf(indexToReturn);

};


/**
 * FUNCTION: Checks if a cell is touching another one with the same color (either up, right, down or left)
 * PARAMETERS: 1. Active Cell Object: { row: <>, column: <>, color: <>, current: <> }
 *                The cell to check
 * RETURNS: + [Array] of objects.
 *            Each object has the following structure:
 *              { cell1: <first cell compared>,
 *                cell2: <second cell compared>,
 *                touch: <true: if the two cells are touching and of the same color, else false>
 *              }
 * DEPENDENCIES: + Player.getActiveCellIndex(Cell Object: { row: <>, column: <> })
 *               + Player.isSameColor(cell1Index, cell2Index)
 *               + Player.isActive(Cell Object: { row: <>, column: <> })
**/
Player.prototype.touchWithColor = function(cell) {

  // Set the values of the cells around
  let upCell    = { row: cell.row - 1, column: cell.column     };
  let rightCell = { row: cell.row    , column: cell.column + 1 };
  let downCell  = { row: cell.row + 1, column: cell.column     };
  let leftCell  = { row: cell.row    , column: cell.column - 1 };
  
  // Get cells index from the "activeCells" array
  let cellIndex = this.getActiveCellIndex(cell);
  let upCellIndex = this.getActiveCellIndex(upCell);
  let rightCellIndex = this.getActiveCellIndex(rightCell);
  let downCellIndex = this.getActiveCellIndex(downCell);
  let leftCellIndex = this.getActiveCellIndex(leftCell);
   
  // This array inclues objects storing the test results clockwise (0: result of test up, 1: result of test right, 2: result of test down, 3: result of test left)  
  let objToReturn = [];

  // Variables store the return values of the 'Player.isSameColor' function in the four directions, clockwise (up, right, down, left)
  let isUpCellSameColor = this.isSameColor(cellIndex, upCellIndex);
  let isRightCellSameColor = this.isSameColor(cellIndex, rightCellIndex);
  let isDownCellSameColor = this.isSameColor(cellIndex, downCellIndex);
  let isLeftCellSameColor = this.isSameColor(cellIndex, leftCellIndex);
  
  // Checks if two cells are touching and have the same color 
  if ( this.isActive(upCell) && isUpCellSameColor !== false ) { objToReturn.push(isUpCellSameColor); }  // UP
  if ( this.isActive(rightCell) && isRightCellSameColor !== false ) { objToReturn.push(isRightCellSameColor); }  // RIGHT
  if ( this.isActive(downCell) && isDownCellSameColor !== false ) { objToReturn.push(isDownCellSameColor); }  // DOWN
  if ( this.isActive(leftCell) && isLeftCellSameColor !== false ) { objToReturn.push(isLeftCellSameColor); } // LEFT  

  // Mark the cell as alreadyChecked
  this.activeCells[cellIndex].alreadyChecked = true;

  if ( objToReturn.length > 0 ) {
    // Mark the cell as matched
    this.activeCells[cellIndex].matched = true;
  }

  // Return the array of matching indexes
  return objToReturn;

};


/**
 * FUNCTION: Finds recursively the cells that are touching in any direction with the same color and flag them as ".matched" (TRUE)
 * PARAMETERS: 1. Active Cell Object: { row: <>, column: <>, color: <>, current: <> }
 *                The cell to chck
 * RETURNS: undefined
 * DEPENDENDIES: + Player.touchWithColor(Active Cell Object: { row: <>, column: <>, color: <>, current: <> })
**/
Player.prototype.findAllMatches = function (cell) {
  
  // Test for touching cells with the same color
  let isTouchingWithSameColor = this.touchWithColor(cell);
  
  // If cells are touching with the same color 
  if ( isTouchingWithSameColor.length > 0 ) {
    
    // For each cell touching with the same color      
    isTouchingWithSameColor.forEach(function (element) {

      // if the cell has not been checked already
      if( !this.activeCells[element].alreadyChecked ) {

        // Mark the cell as matched
        this.activeCells[element].matched;

        // Recursively check the cell and all following cells that are touching and have the same color
        this.findAllMatches(this.activeCells[element]);
      }
    }.bind(this));
  } 

};


/**
 * FUNCTION: Resets all the .alreadyChecked and .matched flags to FALSE,
 *           for each cell of the "activeCells" array
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: None
**/
Player.prototype.clearActiveMatches = function() {

  // Loop over the "activeCells" array
  for (let index = 0; index < this.activeCells.length; index += 1) {

    // Reset the .alreadyChecked and .matched flags to FALSE
    this.activeCells[index].alreadyChecked = false;
    this.activeCells[index].matched = false;
  
  }

};


/**
 * FUNCTION: Count the number of the number of cells with the "matched" flag set to TRUE, from the "activeCells" array
 * PARAMETERS: None
 * RETURNS: + The number of matches in the "activeCells" array
 * DEPENDENCIES: None
**/
Player.prototype.countMatches = function() {
 
  let counter = 0;
  // Loop over the "activeCells" array 
  for (let index = 0; index < this.activeCells.length; index += 1) {
    // If the matched flag is set to TRUE, increase the counter
    if ( this.activeCells[index].matched ) {
      counter += 1;
    }
  }

  // Return the counter
  return counter;

};


/**
 * FUNCTION: Checks if 3 or more cells of the same color are touching
 * PARAMETERS: 1. Level Object
 * RETURNS: + The number of mathches found
 * DEPENDENCIES: + Player.findAllMatches(Active Cell Object: { row: <>, column: <>, color: <>, current: <> })
 *               + Player.countMatches()
**/
Player.prototype.getNbMatches = function(level) {

  // Recursively check all touching cells to find the ones with the same color
  this.findAllMatches(this.activeCells[this.activeCells.length - 1]);
  
  // Count the number of cells with the same color as the current one
  let count = this.countMatches();
  
  // Return the number of matches
  return count;

};


/**
 * FUNCTION: Removes the current information bubble and display the next one (i.e. in level 1)
 * PARAMETERS: If none, the function will only clear the last information bubble.
 *             Else, the function takes 3 parameters:
 *              1. message: The message to display
 *              2. infoNumber: The number of the message to display
 *              3. reference to the Player object
 * RETURNS: undefined
 * DEPENDENCIES: None
**/
Player.prototype.showBubble = function(message, infoNumber, level) {
 
  // Remove the previous bubble
  $('.info').remove();
         
  // If the function is called with no parameters, then the function only cleans the last bubble 
  if (arguments.length > 0) {

    // First convert the infoNumber to target the proper CSS class
    let infoOrder = "";
    let headerPosition = false; // Variable used to flag the info bubbles to be displayed in the header
    let selector; // Variable used to select a cell on the board

    if ( infoNumber === 2 ) { infoOrder = "second"; } 
    if ( infoNumber === 3 ) { infoOrder = "third"; }
    if ( infoNumber === 4 ) { infoOrder = "fourth"; headerPosition = true; }
    if ( infoNumber === 5 ) { infoOrder = "fifth"; }     

    // And display the second one
    if ( !headerPosition ) {
      selector = '[data-row=' + this.currentCell.row + ']' +
                 '[data-col=' + this.currentCell.column + ']';

    // If headerPosition flag is true, then position the info bubble based on the header, not the current cell
    } else {
      selector = '[data-row=0]' +
                 '[data-col=0]';
    }

    // Then display the second bubble
    $(selector).append($('<div>').addClass('info ' + infoOrder + '-info'));
    $('.info').text(message);
    $('.info').fadeIn(400);
    
    // Position the bubble based on the move direction
    let columnSide = Math.ceil(level.width / 2);
     
    if ( this.currentCell.column >= columnSide && !headerPosition ) {
      $('.info').addClass('right');
    } else { 
      $('.info').addClass('left');
    }

    // Add the proper border color based on the cell color
    switch(this.currentCell.color) {
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
        console.log("Unexpected cell color: ", this.currentCell.color);
    };
  }

};



/******************************
 *                            * 
 *  OBJECT: Level             *
 *    => Constructor          *
 *                            *
 * ****************************/
function Level(level) {

  this.number = level.number; // e.g. 1 for level1
  this.width = level.width; // Number of columns
  this.height = level.height; // Number of rows
  this.initState = level.initState; // Initial state of the board. e.g. position of the first cell (the current cell)
  this.nextColorsQueue = []; // Array storing the next 3 cells coming up
  this.success = level.success; // Success value. e.g the number of matches to do to win the level

  // Initialise the nextColorsQueue (the next 3 colors displayed above the board)
  for (let index = 0; index < level.nextColorsQueue.length; index += 1) {
    this.nextColorsQueue.push(level.nextColorsQueue[index]);
  }

}


/******************************
 *                            * 
 *  OBJECT: Level             *
 *    => Functions            *
 *                            *
 * ****************************/
/**
 * FUNCTION: Calculate the dimension of the board header
 *           It basically adapts the header elements size to the screen size
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: None
 **/
Level.prototype.setBoardHeaderSize = function() {
  
  // Next 3 colors
  console.log("here");

  // Level goal
  

  // ? CTA

};


/**
 * FUNCTION: Calculate the dimension of the board and cells based on level params
 *           It basically adapts the board size to the screen size
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: None
 **/
Level.prototype.setBoardSize = function() {

  // get the viewport dimensions
  let viewportWidth = $(window).width();
  let viewportHeight = $(window).height();

  // get the board dimensions
  let boardWidth = $('.board').width();
  let boardHeight = viewportHeight * ( 76.41 / 100 );
 
  // Calculate the ratio
  let boardRatio = this.width / this.height;

  // Calculate the board width based on the height and the board ratio
  boardWidth = boardHeight * boardRatio;
  
  /* If the width is larger than the viewport width, then 
      1. Adpat the width to the viewport width
      2. Have the height based on the width and ratio
   */
   if ( boardWidth > viewportWidth ) { 
     boardWidth = $('.game-container').width() -10;
     $('.board').width(boardWidth + 'px');

     // Calculate the new ratio
     boardRatio = this.height / this.width;

     // Calculate the new board width according to the new ratio
     boardHeight = boardWidth * boardRatio;

     // Set the board height
      $('.board').height(boardHeight + 'px');

   } else {
      // Set the board width
      $('.board').width(boardWidth + 'px');
   }

  // Calculate CSS left property to center the board
  let boardLeftCSSProperty = ( ( 
    ( viewportWidth - boardWidth ) /* Get the width space remaining on the screen */
    / 2 ) /* Devide the remaining by two to know how much to have left and right of the board */
    / viewportWidth ) * 100 ; /* Finally, convert this to a percentage */

  // Set the left property
  $('.board').css('left', boardLeftCSSProperty + '%');

  // Calculate the size of the cells
  let cellWidth = boardWidth / this.width; 
  let cellHeight = boardHeight / this.height; 

  // Set the cell size
  $('.cell').width(cellWidth + 'px'); 
  $('.cell').height(cellHeight + 'px'); 

};


/*
 * FUNCTION: Initialise a new level
 * PARAMETERS: 1. Player object
 * RETURNS: undefined
 * DEPENDENCIES: + Level.setBoardSize()
 *               + Level.setBoardHeaderSize()
 *               + Level.drawPlayer(Player)
 *               + Level.assignControlsToKeys(Player)
 */
Level.prototype.initLevel = function(player) { 
  
  /* BUILD THE BOARD */
  let currentIteration;

  // Create the HTML board, cell by cell, based on the level properties
  for (let row = 0; row < this.height; row +=1 ) {
    for (let column = 0; column < this.width; column +=1 ) {
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
  for (let index = 0 ; index < this.initState.length; index += 1) {
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
        let selector = '[data-row=' + player.currentCell.row + ']' +
                       '[data-col=' + player.currentCell.column + ']';
        
        $(selector).append($('<div>').addClass('info left first-info'));
        $('.info.left.first-info').text('Swipe any direction to move!');
        $('.info.left.first-info').fadeIn(400);
      }
    }

    // Push the item to the activeCells array
    player.activeCells.push(currentIteration);
  } 

  // Set the board header size on the page
  this.setBoardHeaderSize();

  // Set the board and cell size on the page
  this.setBoardSize();

  // Draw the player information (active / current cells, score and next queue)
  this.drawPlayer(player);

  // Assign keyboard key events to the game
  this.assignControlsToKeys(player);

};


/**
 * FUNCTION: Set the direction of the move based on the key or swipe direction
 *           and update the level accordingly
 * PARAMETERS: 1. Action (either a keyCode or a swipe direction)
 *             2. Player Object
 * RETURNS: undefined
 * DEPENDENCIES: + Level.update(Player)
**/
Level.prototype.updatNextColorQueue = function() {

  // Update the next colors array
  this.nextColorsQueue.shift();

  // If not enough colors are remaining, then push the inital set of colors back  
  if ( this.nextColorsQueue.length < 3 ) {
      
    let levelProperties = eval("level"+this.number+"Properties");
    for (let index = 0; index < levelProperties.nextColorsQueue.length; index += 1) {
      this.nextColorsQueue.push(levelProperties.nextColorsQueue[index]);
    }
  }

};


/**
 * FUNCTION: Set the direction of the move based on the key or swipe direction
 *           and update the level accordingly
 * PARAMETERS: 1. Action (either a keyCode or a swipe direction)
 *             2. Player Object
 * RETURNS: undefined
 * DEPENDENCIES: + Level.update(Player)
**/
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
 * FUNCTION: Binds arrow keys and swipe moves to actions
 * PARAMETERS: 1. Player Object
 * RETURNS: undefined
 * DEPENDENCIES: + Level.matchUserInputToGameActions(action, Player)
 */
Level.prototype.assignControlsToKeys = function(player) {
  
  // Add an event listener to enable users to play with the keyboard
  $('body').on('keydown', function(e) {
    
    // Get the key pressed
    let action = e.keyCode;

    if( e.keyCode === 38 ||
        e.keyCode === 40 ||
        e.keyCode === 37 ||
        e.keyCode === 39 ||
        e.keyCode === 80
    ) {
      // Perform game action based on the key direction
      this.matchUserInputToGameActions(action, player);

    }
  }.bind(this));

  // Add an event listerner to enable users to play with swipes
  $('body').on('swipe', function(e, touch) {

    // Get the swipe direction
    let action = touch.direction;

    // Perform game action based on the swipe direction
    this.matchUserInputToGameActions(action, player);
     
  }.bind(this));

};


/**
 * FUNCTION: Clear the board on the page and clean level data at level reset
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: None
**/
Level.prototype.clearLevel = function() {
  
  // Reset the Level Object
  this.nextColorsQueue = [];

  // Reset the colorQueue to its initial value
  let levelProperties = eval("level"+this.number+"Properties");

  for (let index = 0; index < levelProperties.nextColorsQueue.length; index += 1) {
    this.nextColorsQueue.push(levelProperties.nextColorsQueue[index]);
  }
  
  // Clear the board on the screen
  $('.board > .cell').remove();

};


/**
 * FUNCTION: Clear the player information on the page 
 * PARAMETERS: 1. Player Object: to clear
 *             2. Boolean: Used as a flag to know if we are reseting the level (true)
 *                or just refreshing the page (no second param)
 * RETURNS: undefined
 * DEPENDENCIES: None
**/
Level.prototype.clearPlayer = function(player, clearAllPlayerData) {

  // If the second paramater is true, then we are reseting the level, so clear ALL player data
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


/**
 * FUNCTION: Draw all the player moves (steps) since the level started
 * PARAMETERS: 1. Player Object: Used to retrieve the player information (position, direction...)
 * RETURNS: undefined
 * DEPENDENCIES: + Level.updateColorList()
**/
Level.prototype.drawPlayer = function(player) {

  // For each active cell, draw the cell on the page
  for (let index = 0 ; index < player.activeCells.length; index += 1) {
      
      // Find the cell to update on the board
      let selector = '[data-row=' + player.activeCells[index].row + ']' +
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
            let audioMove = new Audio('./sounds/branch_break.mp3');
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


/**
 * FUNCTION: Update the next 3 colors in the level header
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: None
**/
Level.prototype.updateColorList = function() {
 
  // Loop over the first three elements of the array and display them in the page
  for (let index = 0; index < 3; index += 1) {
      $('.color-list li:nth-child(' + (index + 1) + ')').addClass(this.nextColorsQueue[index]);
  }

};


/**
 * FUNCTION: 
 * PARAMETERS: 1. Player Object: Used for cleaning and drawing the player again on the page 
 * RETURNS: undefined
 * DEPENDENCIES: + Player.move(Level)
 *               + Level.clearPlayer(Player)
 *               + Level.drawPlayer(Player)
**/
Level.prototype.update = function(player) {
  
  // Process player move request
  player.move(this);  

  // Clear the player moves on the board  
  this.clearPlayer(player);

  // Draw the player moves (now, including the new elements from the move request)
  this.drawPlayer(player);

};


/**
 * FUNCTION: Lost Level. This function is called when a user got stuck in a level
 * PARAMETERS: 1. Player Object: Used to retrieve the position of the current cell
 * RETURNS: undefined
 * DEPENDENCIES: + Level.resetLevel(Player)
 *               + Level.endLevel()
**/
Level.prototype.lost = function(player) {
  
  // First, prevent users from moving more
  $('body').off('keydown');
  
  // Delete the 'o' icon after a little delay
  setTimeout(function() { $('.current').remove(); }, 10 );
 
  // Change the current cell icon from 'o' 'x'
  let selector = '[data-row=' + player.currentCell.row + ']' +
                 '[data-col=' + player.currentCell.column + ']';
  $(selector).append($('<div>').addClass('lost'));
  $('.lost').html("&#9587;");
  
  // Ask what the user wants to do now (after a small delay)
  let timeoutId = setTimeout(function() {

    let userChoice = confirm("Too bad, you just lost! Wanna retry?");

    // OK: RETRY, then reset the game
    if ( userChoice ) {
      console.log("Cool, let's roll!");
      this.resetLevel(player);

    // KO: END the game
    } else {
      this.endLevel();
    }
  }.bind(this), 400);

};


/**
 * FUNCTION: Win Level. This function is called when a user completed the level target
 * PARAMETERS: 1. Player Object: Used to retrieve the position of the current cell
 * RETURNS: undefined
 * DEPENDENCIES: + Level.resetLevel(Player)
 *               + Level.endLevel()
**/
Level.prototype.win = function(player) {

  // First, prevent users from moving more
  $('body').off('keydown');

  // Delete the 'o' icon after a little delay
  setTimeout(function() { $('.current').remove(); }, 10 );
 
  // Change the current cell icon from 'o' '+'
  let selector = '[data-row=' + player.currentCell.row + ']' +
                 '[data-col=' + player.currentCell.column + ']';
  $(selector).append($('<div>').addClass('won'));
  $('.won').html("&#9532;");
  
  // Change the current cell background with animation
  $(selector).animate({ backgroundColor: "#000"}, 100 );
  
  // Ask what the user wants to do now (after a small delay)
  let timeoutId = setTimeout(function() {

    let userChoice = confirm("Wow, you rock! Wanna replay this level?");
    
    // OK: RETRY, then reset the game
    if ( userChoice ) {
      console.log("Cool, let's roll!");
      this.resetLevel(player);

    // KO: END the game
    } else {
      this.endLevel();
    }
  }.bind(this), 400);

};


/**
 * FUNCTION: Resets a level
 * PARAMETERS: 1. Player Object: Used to reset the player in the level
 * RETURNS: undefined
 * DEPENDENCIES: + Level.clearPlayer(Player, Boolean)
 *               + Level.clearLevel()
 *               + Level.initLevel(Player)
**/
Level.prototype.resetLevel = function(player) {
  
  // Remove the player from the level
  this.clearPlayer(player, true);

  // Remove all the level elements and clean all level data
  this.clearLevel();

  // Re-initialise the level  
  this.initLevel(player);

};


/**
 * FUNCTION: Ends the game
 * PARAMETERS: 1. Player Object: Used to delete the player in the level
 * RETURNS: undefined
 * DEPENDENCIES: None
**/
Level.prototype.endLevel = function(player) {
  
  // Display good bye message 
  timeoutId = setTimeout(function() { 
    alert("OK, see you around.")
  }, 200);

};


/******************************
 *                            * 
 *  OBJECT: Game              *
 *    => Constructor          *
 *                            *
 * ****************************/
function Game() {
  
  // Initialise the Player Object
  this.player = new Player();

  // Initialise the Level Object to the first level for a start
  this.level = new Level(level1Properties);
  this.level.initLevel(this.player);

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