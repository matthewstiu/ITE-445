var mainState = {
	
	preload: function() {
		game.load.image("player", 'assets/player.png');
		game.load.image('wallV', 'assets/wallVertical.png');
		game.load.image('wallH', 'assets/wallHorizontal.png');
		game.load.image('coin', 'assets/coin.png');
		game.load.image('enemy', 'assets/enemy.png');
	},


	create: function() {
		game.stage.backgroundColor = '#2b95ff';
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.renderer.renderSession.roundPixels = true;
		var player = game.add.sprite(game.width/250, 170, 'player');
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

		this.scoreLabel = game.add.text(30, 30, 'score: 0', {font: '18px Arial', fill: '#ffffff'});//calling the score text
		this.score = 0;

		this.enemies = game.add.group();
		this.enemies.enableBody = true;

		this.enemies.createMultiple(10, "enemy");

		this.nextEnemy = 0;
		this.nextEnemy2 = 0;


		game.time.events.loop(2200, this.addEnemy, this);
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
		this.movePlayer();//switching these two the opposite way will cause a bug
		if(!this.player.inWorld) {
			this.playerDie();

			}

		game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
		game.physics.arcade.collide(this.enemies, this.walls);
		game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);

		if (this.nextEnemy < game.time.now) {
			var start = 9000, end = 9000, score = 100;
			var delay = Math.max(
				start - (start - end) * this.score / score, end);
			this.addEnemy();
			this.nextEnemy = game.time.now + delay;
		}

		if (this.nextEnemy2 < game.time.now) {
			var start = 9000, end = 9000, score = 100;
			var delay = Math.max(
				start - (start - end) * this.score / score, end);
			this.addEnemy2();
			this.nextEnemy2 = game.time.now + delay;
		}

	},

	movePlayer: function() {
		if (this.cursor.left.isDown) {
			this.player.body.velocity.x = -200;
		}

		else if (this.cursor.right.isDown) {
			this.player.body.velocity.x = 200;
		}

		else {
			this.player.body.velocity.x = 0;
		}

		if (this.cursor.up.isDown && this.player.body.touching.down) {
			this.player.body.velocity.y = -320;
		}

	},

	playerDie: function() {
		game.state.start("main");

	},

	takeCoin: function() {
				this.coin.kill();
				this.score += 5;
				this.scoreLabel.text = 'score: ' + this.score;

				this.updateCoinPosition();
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
};

var game = new Phaser.Game(500, 340, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');
