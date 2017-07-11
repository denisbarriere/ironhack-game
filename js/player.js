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
 * FUNCTION: 
 * PARAMETERS: 1. Level Object
 * RETURNS: undefined
 * DEPENDENCIES: + Player.move(Level)
 *               + Player.clearPlayer()
 *               + Player.drawPlayer(Level)
**/
Player.prototype.update = function(level) {
  
  // Process player move request
  this.move(level);  

  // Clear the player moves on the board  
  this.clearPlayer();

  // Draw the player moves (now, including the new elements from the move request)
  this.drawPlayer(level);

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

      level.loose(this);
    
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
    level.loose(this);

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
 * FUNCTION: Checks if a cell is available
 * PARAMETERS: 1. Cell object: { row: <>, column: <> }
 * RETURNS: + TRUE if the cell to check does not exists in the activeCells array
 *          + FALSE if the cell to check is found in the activeCells array
 * DEPENDENCIES: None
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
 * FUNCTION: Clear the player information on the page 
 * PARAMETERS: 1. Boolean: Used as a flag to know if we are reseting the level (true)
 *                or just refreshing the page (no second param)
 * RETURNS: undefined
 * DEPENDENCIES: None
**/
Player.prototype.clearPlayer = function(clearAllPlayerData) {

  // If the second paramater is true, then we are reseting the level, so clear ALL player data
  if (clearAllPlayerData) {
    // Reset the player object (related to the level)
    this.activeCells = [];
    this.currentCell = {};
    this.nextCell = {};
    this.direction = 'None';
    this.levelScore = 0;
    this.nbLevelMoves = 0;

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
 * PARAMETERS: 1. Level Object
 * RETURNS: undefined
 * DEPENDENCIES: + Level.updateColorList()
**/
Player.prototype.drawPlayer = function(level) {

  // For each active cell, draw the cell on the page
  for (let index = 0 ; index < this.activeCells.length; index += 1) {
      
      // Find the cell to update on the board
      let selector = '[data-row=' + this.activeCells[index].row + ']' +
                     '[data-col=' + this.activeCells[index].column + ']';
      // Init the color on the board
      $(selector).addClass(this.activeCells[index].color);

      // Set the current cell ( the cell with the o icon which is the first one the user can use )
      if ( this.activeCells[index].current ) {
        $(selector).append($('<div>').addClass('current'));
        
        // Add animation effet to display the current cell
        // If the player is next to a cell or a border and going to this direction, don't show animation
        if( !this.cannotMove ) {
          
          // if ( this.direction === "up"  ) { $(selector).fadeIn('slide',{direction:'down'},1000); } 
          // if ( this.direction === 'right' ) { $(selector).fadeIn('slide',{direction:'left'},1000); }
          // if ( this.direction === 'down' ) { $(selector).fadeIn('slide',{direction:'up'},1000); }
          // if ( this.direction === 'left' ) { $(selector).fadeIn('slide',{direction:'right'},1000); }
        
          // Fade in for the first cell displayed
          if ( this.direction === undefined) { $(selector).fadeIn(200); } else {
           
            // Play the move sound
            let audioMove = new Audio('./sounds/branch_break.mp3');
            audioMove.play();
          }

          // In any case, the o icon get displayed with a fadeIn
          $('.current').hide().fadeIn(600);
        }
      }
  }

  // Set the player current score
  $('.level-goal__progress').text(this.levelScore);
   // Set the target scope for the level
  $('.level-goal__target').text(level.success);

  // Init the first next three colors from the color-list
  level.updateColorList();

  // Reset this flag
  this.cannotMove = false;

};
