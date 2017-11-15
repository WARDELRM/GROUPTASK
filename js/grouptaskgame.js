window.onload = function() {

  var game = new Phaser.Game (800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

  var map;
  var layer;
  var player;
  var orc;
  var skeleton;
  var skeletonNextShot = 0;
  var moveKeys;
  var playerHealth = 100;
  var healthtext;
  var orcWave = 5;
  var lives = 10;
  var skeletonWave = 1;
  //var rounds = 0;
  //var enemies = skeletonWave + orcWave;
  var potionchance = 100;
  var potioncheck = false;
  var Hpotion;

  function preload() {
    game.load.spritesheet('wizard', 'assets/sprites/spritesheets/thewizard.png', 64, 64);
    game.load.spritesheet('orc', 'assets/sprites/spritesheets/orc.png', 64, 64);
    game.load.spritesheet('skeleton', 'assets/sprites/spritesheets/skeleton.png', 64, 64);
    game.load.tilemap('arena', 'assets/tilemaps/maps/arena2.0.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/deserttiles.png');
    game.load.image('fireball', 'assets/sprites/objects/Fireball V 0.1.png');
    game.load.image('arrow', 'assets/sprites/objects/arrow.png');
    game.load.image('Hpotion', 'assets/sprites/objects/potion sprite.png');
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
    player.body.ideWorldBounds = true;
    player.enableBody = true;
    game.camera.follow(player);
    player.anchor.setTo(0.5,0.5);
    player.animations.add('left', [118, 119, 120, 121, 122, 123, 124, 125], 10, true);
    player.animations.add('right', [144, 145, 146, 147, 148, 149, 150, 151], 10, true);
    player.animations.add('up', [105, 106, 107, 108, 109, 110, 111, 112], 10, true);
    player.animations.add('down', [131, 132, 133, 134, 135, 136, 137, 138], 10, true);
    player.animations.add('spellcast', [27, 28, 29, 30, 31, 32], 10, true);

    weapon = game.add.weapon(5, 'fireball');
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletSpeed = 300;
    weapon.fireRate = 500;
    weapon.bulletRotateToVelocity = true;
    weapon.trackSprite(player);

    orcs = game.add.group();
    game.physics.arcade.enable(orcs);
    orcs.enableBody = true;
    spawnOrcWave(orcWave);

    skeletons = game.add.group();
    skeletons.enableBody = true;
    spawnSkeletonWave(skeletonWave);

    skeletonArrows = game.add.group();
    skeletonArrows.enableBody = true;

    moveKeys = game.input.keyboard.addKeys(
      {
        'up': Phaser.KeyCode.W,
        'down': Phaser.KeyCode.S,
        'left': Phaser.KeyCode.A,
        'right': Phaser.KeyCode.D
      }
    );

    healthText = game.add.text(50,40,'Lives: '+ lives, {fill: 'red'});
    healthText.fixedToCamera = true;

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
    game.physics.arcade.overlap(player, Hpotion, potionKill);
    game.physics.arcade.overlap(weapon.bullets, orcs, orcDamage);
    game.physics.arcade.overlap(orcs, orcs);
    game.physics.arcade.overlap(player, orcs, orcContact);
    game.physics.arcade.collide(player, skeletons, skeletonContact);
    game.physics.arcade.overlap(weapon.bullets, skeletons, skeletonKill);



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
    if (orc.x - 32 > player.x + 32 || orc.x + 32 < player.x - 32 || orc.y - 32 > player.y + 32 || orc.y + 32 < player.y - 32) {
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
      orcs.forEach(function(orc){
        orcAttackPLayer();
      }, this);
    }
  }, this);

  skeletons.forEach(function(skeleton){
    if (skeleton.x > player.x + 200 || skeleton.x < player.x - 200 || skeleton.y > player.y + 200 || skeleton.y < player.y - 200) {
      if (skeleton.x > player.x + 200) {
        skeleton.x -= 3;
        skeleton.animations.play('left');
      } else if (skeleton.x < player.x - 200) {
        skeleton.x += 3;
        skeleton.animations.play('right');
      } else {
        if (skeleton.y > player.y) {
          skeleton.animations.play('up');
        } else {
          skeleton.animations.play('down');
        }
      }
      if (skeleton.y > player.y + 200) {
        skeleton.y -= 3;
      } else if (skeleton.y < player.y - 200) {
        skeleton.y += 3;
      }
    } else {
      skeletonAttack();
    }
  }, this);


//if (enemies < 1) {
//rounds += 1

//}

  }

  function orcDamage(weapon, orc) {
    weapon.kill();
    orc.kill();
    orcs.remove(orc);
  }

function skeletonKill(weapon, skeleton) {
weapon.kill();
skeleton.kill();
skeletons.remove(skeleton);
potionCreate();
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
      orc.animations.add('left', [217, 218, 219, 220, 221, 222, 223, 224], 10, true);
      orc.animations.add('right', [265, 266, 267, 268, 269, 270, 271, 272], 10, true);
      orc.animations.add('up', [193, 194, 195, 196, 197, 198, 199, 200], 10, true);
      orc.animations.add('down', [241, 242, 243, 244, 245, 246, 247, 248], 10, true);
      orc.animations.add('attackUp', [529, 532, 535, 538, 541, 544], 10, true);
      orc.animations.add('attackDown', [673, 676, 679, 682, 685, 688], 10, true);
      orc.animations.add('attackLeft', [601, 604, 607, 610, 613, 616], 10, true);
      orc.animations.add('attackRight', [745, 748, 751, 754, 757, 760], 10, true);
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
      skeleton.animations.add('shootLeft', [224, 225, 226, 227, 228, 229, 230, 231, 232, 233], 10, true);
      skeleton.animations.add('shootRight', [250, 251, 252, 253, 254, 255, 256, 257, 258, 259], 10, true);
    }
  }

  function orcContact(player, orc) {
    console.log("orc contact");

    if (orc.x > player.x) {
      orc.animations.play('attackLeft');
      lives -= 1;
      healthText.text = 'lives: ' + lives;
      if (lives < 1) {
        gameOver();
      }
    } else if (orc.x < player.x) {
      orc.animations.play('attackRight');
      lives -= 1;
      healthText.text = 'lives: ' + lives;
      if (lives < 1) {
        gameOver();
      }
    }
  }

  function skeletonAttack() {
    console.log("skeleton attack");

    skeletons.forEach(function(skeleton){
      if (skeleton.x > player.x) {
        if(game.time.now > skeletonNextShot){
          skeleton.animations.play('shootLeft');
          skeletonShoot();
          skeletonNextShot = game.time.now + 1000;
        }
      } else if (skeleton.x < player.x) {
        if(game.time.now > skeletonNextShot){
          skeleton.animations.play('shootRight');
          skeletonShoot();
          skeletonNextShot = game.time.now + 1000;
        }
      }
    }, this);
  }

  function skeletonShoot() {
    Arrow = skeletonArrows.create(skeleton.x, skeleton.y, 'arrow');
    Arrow.rotation = game.physics.arcade.moveToObject(Arrow, player, 200);
  }

  function gameOver() {
    //game.paused = true;
    console.log("RIP");
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

  function potionCreate() {
    if (game.rnd.integerInRange(0, 100) < potionchance) {
      //TODO: line of code to add potion sprite
      //<<<<<<< HEAD
      Hpotion = game.add.sprite(game.world.randomX, game.world.randomY, "Hpotion");
      //=======
game.physics.arcade.enable(Hpotion);
Hpotion.enableBody = true;
      //>>>>>>> c813e003a06692763cd2b03a2218d90c46fe2095
    }
  }

  function potionKill(player, Hpotion) {
    console.log("got potion");
    Hpotion.kill();
    lives += 1;
    healthText.text = 'lives: ' + lives;
  }

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
    //orc.animations.play('attackLeft');
  }





};
