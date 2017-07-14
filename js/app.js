/* Javascript file managing the game manipulation */

var game;

$(document).ready(function() {
  /**
   *  GAME INIT: Create a new Game Object
  **/
  game = new Game();

  
  /**
   *  GAME INIT: Animation showing the game title, then the level title and finally level 1 board
  **/

  // First load the landing page
  $('.game-landing-container > h1').fadeIn(300);

  $('.btn.game-landing-container__menu--black').on('click', function() {

    // Play the Game start sound
    let audioMatch = new Audio('./sounds/sword shine 1.wav');
    audioMatch.play();

    // Load the menu
    $('.game-landing-container').delay(200).hide('slide',{direction:'left'},600);

    // Load the level 1
    game.level.load(levelProperties.level1);
      
  });


  /** 
   *  Prevent pinch and double tap in iOS10
  **/
  // Prevent pinch
  document.addEventListener('touchmove', function (event) {
    if (event.scale !== 1) { event.preventDefault(); }
  }, false);

  // Prevent double tap
  var lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    let now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);


  /**
   *  Resize the game automatically when the user resizes the view
  **/
  $(window).resize(function() { 

    if ( typeof game !== "undefined" ) {
      game.resize(); 
    }

  });

});