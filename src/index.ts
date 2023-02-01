import Phaser from "phaser";
// import First from "./Scene/01";
// import Second from "./Scene/02";

var config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: process.env.NODE_ENV === "development",
    },
  },
  parent: "phaserGame",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  // scene: First,
};

const game = new Phaser.Game(config);

let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let collect: Phaser.Sound.BaseSound;
let gameOver: Phaser.Sound.BaseSound;
let bgm: Phaser.Sound.BaseSound;
let bombs: Phaser.Physics.Arcade.Group;
let stars: Phaser.Physics.Arcade.Group;
let level = 1;
let score = 0;
let scoreText: Phaser.GameObjects.Text;
let roundText: Phaser.GameObjects.Text;
let isGameOver = false;
let startsNum = 12;
let enterKey: Phaser.Input.Keyboard.Key;

function preload(this: Phaser.Scene) {
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/dude.png", { frameWidth: 32, frameHeight: 48 });
  this.load.audio("collect", "assets/sounds/collect.mp3");
  this.load.audio("bgm", "assets/sounds/bg.mp3");
  this.load.audio("gameOver", "assets/sounds/game_over.mp3");
}

function create(this: Phaser.Scene) {
  // 背景图
  this.add.image(0, 0, "sky").setOrigin(0, 0);

  // 生成跳跃平台
  const platforms = this.physics.add.staticGroup();
  platforms.create(400, 584, "ground").setScale(2, 1).refreshBody();
  platforms.create(0, 220, "ground");
  platforms.create(800, 300, "ground");
  platforms.create(400, 440, "ground").setScale(0.7, 1).refreshBody();
  platforms.create(400, 160, "ground").setScale(0.3, 1).refreshBody();

  collect = this.sound.add("collect");
  gameOver = this.sound.add("gameOver");
  bgm = this.sound.add("bgm");
  bgm.play({ volume: 0.5, loop: true });

  scoreText = this.add.text(16, 16, "Score: " + score, { fontSize: "24px", color: "#000" });
  roundText = this.add.text(650, 16, "Round: " + level, { fontSize: "24px", color: "#000" });

  console.dir(this.input, "inout");

  if (this.input.manager.touch) {
    this.input.on("pointerdown", function (pointer: any) {
      var touchX = pointer.x;
      var touchY = pointer.y;
      console.log(3434344, touchX, touchY);

      if (touchX > player.x) {
        player.setVelocityX(160);
        player.anims.play("left", true);
      } else {
        player.setVelocityX(-160);
        player.anims.play("right", true);
      }
    });

    this.input.on("pointerup", function (pointer: any) {
      player.setVelocityX(0);
      var touchX = pointer.x;
      var touchY = pointer.y;
      console.log(23424, touchX, touchY);
    });
  }

  // 炸弹组
  bombs = this.physics.add.group();
  // 星星组
  stars = this.physics.add.group({
    key: "star",
    repeat: startsNum - 1,
    setXY: { x: 12, y: 0, stepX: 70 },
  });
  stars.children.iterate(function (child) {
    (child as Sprite).setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  player = this.physics.add.sprite(100, 450, "dude");

  // 创建人物时有一个弹跳动画,之后取消
  player.setBounce(0.2);
  setTimeout(() => {
    player.setBounce(0);
  }, 1000);
  player.setCollideWorldBounds(true);
  this.anims.create({
    key: "left",
    frameRate: 10,
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frameRate: 10,
    frames: this.anims.generateFrameNumbers("dude", { start: 5 }),
    repeat: -1,
  });

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, (_, bomb) => {
    player.setTint(0xff0000);
    console.log("died");
    gameOver.play({ volume: 0.6 });
    isGameOver = true;
    bgm.pause();

    this.add.text(800 / 2 - 100, 600 / 2 - 20, "游戏结束, 按 Space 重新开始", {
      fontSize: "18px",
      color: "#000",
    });
    this.physics.pause();
  });
  // 收集星星
  this.physics.add.collider(player, stars, (_, star) => {
    // @ts-ignore
    star.disableBody(true, true);
    collect.play();
    score += 10;
    scoreText.setText("Score: " + score);

    // 收集完了, 开始下一局
    if (stars.countActive(true) <= 0) {
      // alert("成功收集完所有星星, 点击开始下一局");
      const bomb = bombs.create(Phaser.Math.Between(50, 600), 16, "bomb") as Sprite;

      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.FloatBetween(-200, 200), 20);

      level++;
      roundText.setText("Round: " + level);
      stars.children.iterate((star) => {
        // @ts-ignore
        star.enableBody(true, star.x, 0, true, true);
      });
    }
  });
  cursors = this.input.keyboard.createCursorKeys();
}

function update(this: Phaser.Scene) {
  // var pointer = this.input.activePointer;
  // if (pointer.isDown) {
  //   var touchX = pointer.x;
  //   var touchY = pointer.y;
  //   console.log(234425555, touchX);

  //   // ...
  // }

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else if (cursors.up.isDown) {
    // 禁止多段跳
    if (!player.body.touching.down) {
      return;
    }
    player.anims.play("turn", true);
    player.setVelocityY(-300);
  } else if (cursors.down.isDown) {
    player.anims.play("turn", true);
    player.setVelocityY(260);
  } else {
    player.anims.play("turn", true);
    player.setVelocityX(0);
  }

  if (isGameOver && cursors.space.isDown) {
    console.log("重新开始");
    score = 0;
    level = 1;
    this.scene.restart();
  }
}
