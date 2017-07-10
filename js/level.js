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
  
  // Get the width and height of the game-header block
  let gameHeaderWidth = $('.game-header').width();
  let gameHeaderHeight = $('.game-header').height();
  
  /* Next 3 colors */
  // Get the width and height of the next-colors block
  let nextColorwidth = $('.next-colors').width();
  let nextColorHeight = $('.next-colors').height();

  /* Level goal */
  // Get the level-goal block width and height
  let levelGoalwidth = $('.level-goal').width();
  let levelGoalHeight = $('.level-goal').height();

  // Calculate the top and left positions to center it vertically and horizontally
  let levelGoalTop = ( gameHeaderHeight - levelGoalHeight ) / 2;
  let levelGoalLeft = ( ( gameHeaderWidth - levelGoalwidth ) + ( nextColorwidth / 2 ) ) / 2; 
 
  // Set the computed top and left properties
  $('.level-goal').css('top', levelGoalTop);
  $('.level-goal').css('left', levelGoalLeft);

  // ? CTA

};


/**
 * FUNCTION: Calculate the dimension of the board and cells based on level params
 *           It basically adapts the board size to the screen size
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: + Level.setOIconPosition()
 *               + Level.setPlusIconPosition()
 *               + Level.setXIconPosition()
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

  // Finally Calculate the position of the o, the + and x icons displayed in the current cell
  this.setOIconPosition();
  this.setPlusIconPosition();
  this.setXIconPosition();

};


/*
 * FUNCTION: Position the o icon in the current cell
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: None
 */
Level.prototype.setOIconPosition = function() { 

  // position retrieve the o width and height
  let currentOWidth = $('.current').width();
  let currentOheight = $('.current').height();

  // get the width and height of a cell
  let cellWidth = $('.cell').width();
  let cellheight = $('.cell').height();

  // Postion the icon
  let currentOTop = ( cellheight - currentOheight ) / 2;
  let currentOLeft = ( cellWidth - currentOWidth ) / 2;

  // Set the position in the cell
  $('.current').css('top',currentOTop);
  $('.current').css('left',currentOLeft);

};


/*
 * FUNCTION: Position the + icon in the current cell
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: None
 */
Level.prototype.setPlusIconPosition = function() { 

  // position retrieve the + width and height
  let currentPlusWidth = $('.won').width();
  let currentPlusheight = $('.won').height();

  // get the width and height of a cell
  let cellWidth = $('.cell').width();
  let cellheight = $('.cell').height();

  // Postion the icon
  let currentPlusTop = ( cellheight - currentPlusheight ) / 2;
  let currentPlusLeft = ( cellWidth - currentPlusWidth ) / 2;

  // Set the position in the cell
  $('.won').css('top',currentPlusTop);
  $('.won').css('left',currentPlusLeft);

};


/*
 * FUNCTION: Position the x icon in the current cell
 * PARAMETERS: None
 * RETURNS: undefined
 * DEPENDENCIES: None
 */
Level.prototype.setXIconPosition = function() { 

  // position retrieve the x width and height
  let currentXWidth = $('.lost').width();
  let currentXheight = $('.lost').height();

  // get the width and height of a cell
  let cellWidth = $('.cell').width();
  let cellheight = $('.cell').height();

  // Postion the icon
  let currentXTop = ( cellheight - currentXheight ) / 2;
  let currentXLeft = ( cellWidth - currentXWidth ) / 2;

  // Set the position in the cell
  $('.lost').css('top',currentXTop);
  $('.lost').css('left',currentXLeft);

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
 * DEPENDENCIES: + Level.setXIconPosition()
 *               + Level.resetLevel(Player)
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
  
  // Position the x icon according the size of a cell
  this.setXIconPosition();

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
 * DEPENDENCIES: + Level.setPlusIconPosition()
 *               + Level.resetLevel(Player)
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
  
  // Position the + icon according the size of a cell
  this.setPlusIconPosition();

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