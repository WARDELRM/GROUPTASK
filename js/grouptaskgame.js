window.onload = function() {

  var game = new Phaser.Game (800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

  var map;
  var layer;
  var player;
  var orc;
  var skeleton;
  var moveKeys;
  var playerHealth = 100;
  var orcWave = 5;
  var skeletonWave = 2;
  var orcAttack = false;
  //var rounds = 0;
  //var enemies = skeletonWave + orcWave;

  function preload() {
    game.load.spritesheet('wizard', 'assets/sprites/spritesheets/thewizard.png', 64, 64);
    game.load.spritesheet('orc', 'assets/sprites/spritesheets/orc.png', 64, 64);
    game.load.spritesheet('skeleton', 'assets/sprites/spritesheets/skeleton.png', 64, 64);
    game.load.tilemap('arena', 'assets/tilemaps/maps/arena2.0.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/deserttiles.png');
    game.load.image('testweapon', 'assets/sprites/testweapon.png');
    game.load.audio('music', 'assets/audio/music/The Elder Scrolls V Skyrim - Battle Music [REMASTERED].mp3');
    game.load.audio('testfireball', 'assets/audio/sounds/testfireball.mp3');

  }

  function create() {

    //Enable the Phaser ARCADE physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    map = game.add.tilemap('arena');
    map.addTilesetImage('arenatiles', 'tiles');
    layer = map.createLayer('Ground')
    layer.resizeWorld();

    music = game.add.audio('music');
      music.play('', 0, 1, true);
      music.volume = 0.1;

    player = game.add.sprite(game.world.centerY, game.world.centerX, 'wizard');
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    player.enableBody = true;
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

    orcs = game.add.group();
    game.physics.arcade.enable(orcs);
    orcs.enableBody = true;
    spawnOrcWave(orcWave);

    skeletons = game.add.group();
    skeletons.enableBody = true;
    spawnSkeletonWave(skeletonWave);

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

    orcAttack = false;

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
    game.physics.arcade.overlap(orcs, orcs);
    game.physics.arcade.overlap(player, orcs, orcContact);
    game.physics.arcade.collide(player, skeletons, skeletonContact);


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

      orcs.forEach(function(orc) {
    if (orcAttack == false) {
      if (orc.x > player.x + 1) {
        orc.x -= 2;
        orc.animations.play('left');
      } else if (orc.x < player.x - 1) {
        orc.x += 2;
        orc.animations.play('right');
      } else {
        if (orc.y > player.y) {
          orc.animations.play('up');
        } else {
          orc.animations.play('down');
        }
      }
      if (orc.y > player.y + 1) {
        orc.y -= 2;
      } else if (orc.y < player.y - 1) {
        orc.y += 2;
      }
    } else {
      orcAttackPLayer();
    }
    }, this);

      if (skeleton.x > player.x + 200) {
        skeleton.x -= 3;
        skeleton.animations.play('left');
        if (skeleton.x < player.x + 201 && player.x < skeleton.x) {
          skeleton.animations.stop();
          skeleton.frame = 117;
        }
      } else if (skeleton.x < player.x - 200) {
        skeleton.x += 3;
        skeleton.animations.play('right');
        if (skeleton.x > player.x - 201 && player.x > skeleton.x) {
          skeleton.animations.stop();
          skeleton.frame = 143;
        }
      } else {
        if (skeleton.y > player.y) {
          skeleton.animations.play('up');
          /*if (skeleton.y < player.y + 201 && player.y < skeleton.y) {
            skeleton.animations.stop();
            skeleton.frame = 104;
          }*/
        } else {
          skeleton.animations.play('down');
          /*if (skeleton.y > player.y - 201 && player.y > skeleton.y) {
            skeleton.animations.stop();
            skeleton.frame = 130;
          }*/
        }
      }
      if (skeleton.y > player.y + 200) {
        skeleton.y -= 3;
      } else if (skeleton.y < player.y - 200) {
        skeleton.y += 3;
      }

      /*if (skeleton.x > player.x - 201 && player.x > skeleton.x) {
        skeleton.animations.stop();
        skeleton.frame = 143;
      } else if (skeleton.x < player.x + 201 && player.x < skeleton.x) {
        skeleton.animations.stop();
        skeleton.frame = 117;
      } else if (skeleton.y < player.y + 201 && player.y < skeleton.y) {
        skeleton.animations.stop();
        skeleton.frame = 104;
      } else if (skeleton.y > player.y - 201 && player.y > skeleton.y) {
        skeleton.animations.stop();
        skeleton.frame = 130;
      }*/
//if (enemies < 1) {
//rounds += 1

//}

  }

  function spellCast() {
    player.animations.play('spellcast');
    /*fireballSound = game.add.audio('testfireball');
    fireballSound.play();
    fireballSound.volume = 0.5;*/
  }

  function spawnOrcWave(numSpawn) {
    for (var i = 0; i < numSpawn; i++)
    {
      orc = orcs.create(player.x + Math.random() * 905 + 805, game.world.centerY, 'orc');
      orc.anchor.setTo(0.5,0.5);
      game.physics.arcade.enable(orc);
      //orc.enableBody = true;
      orc.animations.add('left', [217, 218, 219, 220, 221, 222, 223, 224], 10, true);
      orc.animations.add('right', [265, 266, 267, 268, 269, 270, 271, 272], 10, true);
      orc.animations.add('up', [193, 194, 195, 196, 197, 198, 199, 200], 10, true);
      orc.animations.add('down', [241, 242, 243, 244, 245, 246, 247, 248], 10, true);
      orc.animations.add('attackLeft', [248], 1, true);
    }
  }

  function spawnSkeletonWave(numSpawn) {
    for (var i = 0; i < numSpawn; i++)
    {
      skeleton = skeletons.create(player.x - Math.random() * 905 - 805, game.world.centerY, 'skeleton');
      skeleton.anchor.setTo(0.5,0.5);
      skeleton.animations.add('left', [118, 119, 120, 121, 122, 123, 124, 125], 10, true);
      skeleton.animations.add('right', [144, 145, 146, 147, 148, 149, 150, 151], 10, true);
      skeleton.animations.add('up', [105, 106, 107, 108, 109, 110, 111, 112], 10, true);
      skeleton.animations.add('down', [131, 132, 133, 134, 135, 136, 137, 138], 10, true);
    }
  }

  function orcContact(player, orc) {
    console.log("orc contact");
    //orc.animations.stop();
    /*while (orc.x > player.y) {
      orcAttack = true;
    }
    if (orc.x > player.y) {
      orc.animations.play('attackLeft');
    }*/

    orcAttack = true;
  }

  function skeletonContact() {
    console.log("skeleton contact");
  }
//function orcDeath(fireball, orc) {

  //fireball.kill();
  //orc.kill();
//enemies -= 1;
//orcs.remove(orc);

//}


  function render() {
    game.debug.body(player);
    orcs.forEach(function(temp){
      game.debug.body(temp);
    }, this);
    skeletons.forEach(function(temp2){
      game.debug.body(temp2);
    }, this);
  }

  function orcAttackPLayer() {

  }


};
