var playState = {


	create: function() {
		//var player = game.add.sprite(game.width/250, 170, 'player');
		this.player = game.add.sprite(game.width/2, game.height/2, 'player');
		this.player.anchor.setTo(0.5, 0.5);

		game.physics.arcade.enable(this.player);
		this.player.body.gravity.y = 500;

		this.cursor = game.input.keyboard.createCursorKeys();

		var leftWall = game.add.sprite(0, 0, 'wallV');
		game.physics.arcade.enable(leftWall);
		leftWall.body.immovable = true;

		var rightWall = game.add.sprite(480, 0, 'wallV')
		game.physics.arcade.enable(rightWall);
		rightWall.body.immovable = true;

		this.walls = game.add.group(); //creates a new group
		this.walls.enableBody = true; //add arcade physics to the whole game

		game.add.sprite(0, 0, 'wallV', 0, this.walls);//left wall
		game.add.sprite(480, 0, 'wallV', 0, this.walls);//right wall

		game.add.sprite(0, 0, 'wallH', 0, this.walls);
		game.add.sprite(300, 0, 'wallH', 0, this.walls);
		game.add.sprite(0, 320, 'wallH', 0, this.walls);
		game.add.sprite(300, 320, 'wallH', 0, this.walls);

		game.add.sprite(-100, 160, 'wallH', 0, this.walls);
		game.add.sprite(400, 160, 'wallH', 0, this.walls);

		var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
		middleTop.scale.setTo(1.5, 1);
		var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls);
		middleBottom.scale.setTo(1.5, 1);

		this.walls.setAll('body.immovable', true);

		this.coin = game.add.sprite(60, 140, 'coin');//starting of code for coin
		game.physics.arcade.enable(this.coin);
		this.coin.anchor.setTo(0.5, 0.5);

		this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff'});//calling the score text
		
		game.global.score = 0;

		this.enemies = game.add.group();
		this.enemies.enableBody = true;

		this.enemies.createMultiple(10, 'enemy');

		this.nextEnemy = 0;
		this.nextEnemy2 = 0;


		//game.time.events.loop(2200, this.addEnemy, this);

		this.jumpSound = game.add.audio('jump');
		this.coinSound = game.add.audio('coin');
		this.deadSound = game.add.audio('dead');

		this.player.animations.add('right', [1, 2], 8, true);
		this.player.animations.add('left', [3, 4], 8, true);

		this.emitter = game.add.emitter(0, 0, 15);
		this.emitter.makeParticles('pixel');

		this.emitter.setYSpeed(-150, 150);
		this.emitter.setXSpeed(-150, 150);

		this.emitter.setScale(2, 0, 2, 0, 800);
		this.emitter.gravity = 0;

		game.input.keyboard.addKeyCapture(
		[Phaser.Keyboard.UP, Phaser.Keyboard.DOWN,
		Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]);

		this.wasd = {
		up: game.input.keyboard.addKey(Phaser.Keyboard.W),
		left: game.input.keyboard.addKey(Phaser.Keyboard.A),
		right: game.input.keyboard.addKey(Phaser.Keyboard.D)
};
	},

	addEnemy: function() {
		var enemy = this.enemies.getFirstDead();

		if (!enemy) {
			return;
		}


		enemy.anchor.setTo(0.5, 1);
		enemy.reset(game.width/2, 0);
		enemy.body.gravity.y = 500;
		enemy.body.velocity.x = 100 * game.rnd.pick([-1, 1]);
		enemy.body.bounce.x = 1;
		enemy.checkWorldBounds = true;
		enemy.outOfBoundsKill = true;

		
	},

	addEnemy2: function() {   //for the enemies from below going up
		var enemy = this.enemies.getFirstDead();

		if (!enemy) {
			return;
		}

		enemy.anchor.setTo(0.5, 1);
		enemy.reset(game.width/2, game.height);
		enemy.body.gravity.y = -500;
		enemy.body.velocity.x = 100 * game.rnd.pick([-1, 1]);
		enemy.body.bounce.x = 1;
		enemy.checkWorldBounds = true;
		enemy.outOfBoundsKill = true;
	},

	update: function() {
		game.physics.arcade.collide(this.player, this.walls);//switching these two the opposite way will cause a bug
		//this.movePlayer();//switching these two the opposite way will cause a bug
		

		game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
		game.physics.arcade.collide(this.enemies, this.walls);
		game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);

		if(!this.player.alive) {
			return;
		}
		this.movePlayer();
		if (!this.player.inWorld) {
			this.playerDie();
		}


		if (this.nextEnemy < game.time.now) {
			var start = 9000, end = 9000, score = 100;
			var delay = Math.max(
				start - (start - end) * game.global.score / score, end);
			this.addEnemy();
			this.nextEnemy = game.time.now + delay;
		}

		if (this.nextEnemy2 < game.time.now) {
			var start = 9000, end = 9000, score = 100;
			var delay = Math.max(
				start - (start - end) * game.global.score / score, end);
			this.addEnemy2();
			this.nextEnemy2 = game.time.now + delay;
		}

		if (this.nextEnemy < game.time.now) {
		// Define our variables
			var start = 4000, end = 1000, score = 100;
			// Formula to decrease the delay between enemies over time
			// At first it's 4000ms, then slowly goes to 1000ms
			var delay = Math.max(
			start - (start - end) * game.global.score / score, end);
			// Create a new enemy and update the 'nextEnemy' time
			this.addEnemy();
			this.nextEnemy = game.time.now + delay;
		}

	},

	movePlayer: function() {
	// If the left arrow or the A key is pressed
	if (this.cursor.left.isDown || this.wasd.left.isDown) {
		this.player.body.velocity.x = -200;
		this.player.animations.play('left');
	}
	// If the right arrow or the D key is pressed
	else if (this.cursor.right.isDown || this.wasd.right.isDown) {
		this.player.body.velocity.x = 200;
		this.player.animations.play('right');
	}
	// If nothing is pressed (no changes)
	else {
		this.player.body.velocity.x = 0;
		this.player.animations.stop();
		this.player.frame = 0;
	}
	// If the up arrow or the W key is pressed
	if ((this.cursor.up.isDown || this.wasd.up.isDown)
		&& this.player.body.touching.down) {
		this.jumpSound.play();
		this.player.body.velocity.y = -320;
	}
},

	playerDie: function() {

		this.player.kill();
		this.deadSound.play();

		this.emitter.x = this.player.x;
		this.emitter.y = this.player.y;
		this.emitter.start(true, 800, null, 15);

		//game.camera.flash(0xffffff, 300);//flash colour
		game.camera.shake(0.02, 300);


		//game.state.start('menu');

		game.time.events.add(1000, this.startMenu, this);
	},


	takeCoin: function(player, coin) {
				this.coin.kill();
				game.global.score += 5;
				this.scoreLabel.text = 'score: ' + game.global.score;

				this.updateCoinPosition();
				this.coinSound.play();

				this.coin.scale.setTo(0, 0);
				game.add.tween(this.coin.scale).to({x: 1, y: 1}, 300).start();
				game.add.tween(this.player.scale).to({x: 1.3, y:1.3}, 100).yoyo(true).start();
			},

	updateCoinPosition: function() {
		var coinPosition = [
			{x: 140, y: 60}, {x: 360, y: 60},
			{x: 60, y: 140}, {x: 440, y: 140},
			{x: 130, y: 300}, {x: 370, y: 300}, 
		];

		for (var i = 0; i < coinPosition.length; i++) {
			if (coinPosition[i].x == this.coin.x) {
				coinPosition.splice(i, 1);

			}
	     }

	     var newPosition = game.rnd.pick(coinPosition);
	     this.coin.reset(newPosition.x, newPosition.y);


},

	startMenu: function() {
		game.state.start('menu');
	},

};

//var game = new Phaser.Game(500, 340, Phaser.AUTO, 'gameDiv');
//game.state.add('play', playState);
//game.state.start('play');

