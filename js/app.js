/* Javascript file managing the game manipulation */

var game;

$(document).ready(function() {

  /**
   *  GAME INIT: Animation showing the game title, then the level title and finally level 1 board
  **/

  // First load the landing page
  $('.game-landing-container > h1').fadeIn(300);

  $('.btn.game-landing-container__menu--black').on('click', function() {
    
    // Load the menu
    $('.game-landing-container').delay(200).hide('slide',{direction:'left'},600);

    // Then, load the first level loading
    $('.level-loading-container').show();
    $('.level-loading-container').delay(2200).animate({ backgroundColor: "#fff"}, 600 );
    $('.levelTarget p').delay(2200).animate({ borderTopColor: "#fff", color: "#fff"}, 600 );
    $('.levelTarget').delay(2200).animate({ borderTopColor: "#fff"}, 600 );

    // And finally, hide it and show the level board
    $('.level-loading-container').delay(8000, function() { 
      $(this).hide(); 
    });
    
    // Create and show the board
    setTimeout( function () {
      /**
       *  GAME INIT: Create a new Game Object
      **/
      game = new Game();
      $('.game-container').show(600);
      game.resize();

    }, 2400);
  });


  /**
   *  Resize the game automatically when the user resizes the view
  **/
  $(window).resize(function() { 

    if ( typeof game !== "undefined" ) {
      game.resize(); 
    }

  });

});