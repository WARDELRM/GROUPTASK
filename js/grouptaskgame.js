window.onload = function() {

  var game = new Phaser.Game (800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

  var map;
  var layer;
  var player;
  var moveKeys;

  function preload() {
    game.load.spritesheet('wizard', 'assets/sprites/spritesheets/thewizard.png', 64, 64);
    game.load.tilemap('testarena', 'assets/tilemaps/maps/testarenatiles.json', null, Phaser.Tilemap.TILED_JSON);
    //game.load.tilemap('arena', 'assets/tilemaps/maps/arenatiles.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/deserttiles.png');
    game.load.image('testweapon', 'assets/sprites/testweapon.png')
    game.load.audio('music', 'assets/audio/music/The Elder Scrolls V Skyrim - Battle Music [REMASTERED].mp3');

  }

  function create() {

    //Enable the Phaser ARCADE physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    map = game.add.tilemap('testarena');
    map.addTilesetImage('Desert', 'tiles');
    layer = map.createLayer('Ground')
    layer.resizeWorld();

    music = game.add.audio('music');
      music.play('', 0, 1, true);
      music.volume = 1;

    player = game.add.sprite(game.world.centerY, game.world.centerX, 'wizard');
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    game.camera.follow(player);
    player.anchor.setTo(0.5,0.5);
    player.animations.add('left', [118, 119, 120, 121, 122, 123, 124, 125], 10, true);
    player.animations.add('right', [144, 145, 146, 147, 148, 149, 150, 151], 10, true);
    player.animations.add('up', [105, 106, 107, 108, 109, 110, 111, 112], 10, true);
    player.animations.add('down', [131, 132, 133, 134, 135, 136, 137, 138], 10, true);
    player.animations.add('spellcast', [27, 28, 29, 30, 31, 32], 10, true);

    weapon = game.add.weapon(5, 'testweapon');
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletSpeed = 300;
    weapon.fireRate = 500;
    weapon.bullerRotateToVelocity = true;
    weapon.trackSprite(player);

    moveKeys = game.input.keyboard.addKeys(
      {
        'up': Phaser.KeyCode.W,
        'down': Phaser.KeyCode.S,
        'left': Phaser.KeyCode.A,
        'right': Phaser.KeyCode.D
      }
    );
  }

  function update() {
    //TODO: Have the shoot animation play all the way through
    /*
    if(player.animations.name == 'spellcast'){
      if(player.animations.isPlaying){
        console.log(player.animations.name);
      }
    }
    */

    //Collision events
    //game.physics.arcade.overlap(player fireballs hitting a specific enemy type)

    if(moveKeys.left.isDown) {
      player.x -= 4;
      player.animations.play('left');
      }
      else if (moveKeys.right.isDown) {
      player.x += 4;
      player.animations.play('right');
      }
      else if (moveKeys.up.isDown) {
      player.y -= 4;
      player.animations.play('up');
      }
      else if (moveKeys.down.isDown) {
      player.y += 4;
      player.animations.play('down');
      }
      else if (game.input.mousePointer.isDown) {
      //player.animations.play('spellcast');
      spellCast();
      myAngle = game.physics.arcade.angleToPointer(player);
      myAngle *= (180/Math.PI); //convert from radian to degrees
      weapon.fireAngle = myAngle;
      weapon.fire();
      } else {
      player.animations.stop();
      player.frame = 130;
      }




  }

  function spellCast() {
    player.animations.play('spellcast');
  }




};
