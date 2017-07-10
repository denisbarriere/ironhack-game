/* Javascript file managing the game manipulation */

var game;

$(document).ready(function() {
$('.game-container').show(); // FOR TESTING TO REMOVE
  
  /**
   *  GAME INIT: Animation showing the game title, then the level title and finally level 1 board
  **/
  // At first, hide everything
  // $('.game-container').hide();

  // // First load the loader
  // $('.game-loading-container > h1').fadeIn(300);

  // // Then, load the menu
  // $('.game-loading-container').delay(1200).hide('slide',{direction:'left'},400);
  
  // // Finally, load the first level
  // $('.level-loading-container').delay(3000).animate({ backgroundColor: "#fff"}, 400 );
  // $('.levelTarget p').delay(3000).animate({ borderTopColor: "#fff", color: "#fff"}, 400 );
  // $('.levelTarget').delay(3000).animate({ borderTopColor: "#fff"}, 400 );

  // //$('.level-loading-container').delay(8000).hide();
  // $('.game-container').delay(3400).fadeIn(400);
  
  /**
   *  GAME INIT: Create a new Game Object
  **/
  game = new Game();

  /**
   *  Resize the game automatically when the user resizes the view
  **/
  $(window).resize(function() { game.resize(); });

  });