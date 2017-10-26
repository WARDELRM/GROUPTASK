window.onload = function() {

  var game = new Phaser.Game (800, 600, Phaser.AUTO, 'gameDiv');/*, { preload: preload, create: create, update: update, render: render });*/

  game.state.add('grouptaskgame', playState);

  game.state.start(playstate);

};
