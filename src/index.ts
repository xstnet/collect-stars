import { relative } from "path";
import Phaser from "phaser";
import { getRelativePositionToCamera } from "./utils/util";
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
// gameOver bgm
let gameOver: Phaser.Sound.BaseSound;
let bgm: Phaser.Sound.BaseSound;
let bombs: Phaser.Physics.Arcade.Group;
let stars: Phaser.Physics.Arcade.Group;
let level = 1;
// 生命数量
let liveNum = 1;
let score = 0;
let scoreText: Phaser.GameObjects.Text;
let roundText: Phaser.GameObjects.Text;
// 游戏结束
let isGameOver = false;
// 星星数量
let startsNum = 12;
// 是否正在触摸屏幕
let isTaping = false;
// 长按加速跑
let speedFactor = 0;
let camera: Phaser.Cameras.Scene2D.Camera;
const clientWidth = document.documentElement.clientWidth;
const clientHeight = document.documentElement.clientHeight;
const worldWidth = Number(game.config.width);
const worldHeight = Number(game.config.height);

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
  camera = this.cameras.main;

  // 背景图
  const bg = this.add.image(0, 0, "sky").setOrigin(0, 0);
  console.log("bbbb", bg.displayWidth, bg.width);

  // 生成跳跃平台
  const platforms = this.physics.add.staticGroup();
  platforms.create(400, 584, "ground").setScale(2, 1).refreshBody();
  platforms.create(80, 220, "ground").setScale(0.4, 1).refreshBody();
  platforms.create(800, 300, "ground");
  platforms.create(400, 440, "ground").setScale(0.7, 1).refreshBody();
  platforms.create(400, 160, "ground").setScale(0.37, 1).refreshBody();

  collect = this.sound.add("collect");
  gameOver = this.sound.add("gameOver");
  bgm = this.sound.add("bgm");
  bgm.play({ volume: 0.5, loop: true });

  scoreText = this.add.text(16, 16, "Score: " + score, { fontSize: "24px", color: "#fff" });
  roundText = this.add.text(650, 16, "Round: " + level, { fontSize: "24px", color: "#fff" });

  document.body.addEventListener("click", () => {
    if (isGameOver) {
      resetVars();
      this.scene.restart();
    }
  });

  let startTouchY = 0,
    endTouchY = 0;
  // 触摸事件
  if (this.input.manager.touch) {
    this.input.on("pointerdown", (pointer: any) => {
      // 重新开始
      if (isGameOver) {
        resetVars();
        this.scene.restart();
        return;
      }
      // 如果没有移动摄像机, 使用pointer中的坐标即可
      // 如果移动了摄像机, 此时pointer中的坐标是相对于摄像机, 必须要转换成真正的世界坐标
      const worldPointer = camera.getWorldPoint(pointer.x, pointer.y);

      var touchX = worldPointer.x;
      startTouchY = worldPointer.y;
      isTaping = true;

      if (touchX > player.x) {
        player.setVelocityX(160 + speedFactor);
        player.anims.play("right", true);
      } else {
        player.setVelocityX(-(160 + speedFactor));
        player.anims.play("left", true);
      }
    });

    this.input.on("pointerup", function (pointer: any) {
      player.setVelocityX(0);
      const worldPointer = camera.getWorldPoint(pointer.x, pointer.y);
      endTouchY = worldPointer.y;
      // 终点的滑动距离超过精灵的高度, 上跳
      if (startTouchY - endTouchY > player.height) {
        if (player.body.touching.down) {
          // 身体在地面时才能跳跃
          player.setVelocityY(-330);
        }
      } else if (Math.abs(endTouchY - startTouchY) > player.height) {
        //  下降
        player.setVelocityY(350);
      }
      isTaping = false;
    });
  }

  const liveGroup = this.physics.add.staticGroup();

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

  // camera.setFollowOffset(100, 100);
  // camera.setBounds(0, 0, Number(this.game.config.width), Number(this.game.config.height));

  // 镜头跟随速度
  const followSpeedX = 0.5;
  let followSpeedY = 0.3;
  // 屏幕宽度小于世界宽度时才需要滚动
  if (clientWidth < worldWidth) {
    camera.startFollow(player, true, followSpeedX, followSpeedY, -300, 242);
  }
  // camera.setLerp(1, 0);

  // camera.setDeadzone(800, 600);
  camera.on("followupdate", (_: any, player: Sprite) => {
    // 竖向不需要
    followSpeedY = 0;
    const relativePosition = getRelativePositionToCamera(player, camera);

    // 向右移动到世界边缘停止镜头跟随判断
    // 适配于小屏幕, 如果精灵的世界X坐标 + (屏幕的宽度 - 精灵相对于镜头的X坐标) > 游戏世界的宽度, 则停止水平方向的镜头跟随, 防止出现黑边
    // todo: 不知道有没有更好的方法, 先就这样吧
    if (player.x + (clientWidth - relativePosition.x) >= worldWidth) {
      // 如果相对坐标小于100, 说明向左走了, 需要镜头跟随, 反之不跟随
      if (relativePosition.x >= 100) {
        if (camera.lerp.x !== 0) {
          camera.setLerp(0, followSpeedY);
        }
      } else {
        if (camera.lerp.x === 0) {
          camera.setLerp(followSpeedX, followSpeedY);
        }
      }
    } else if (player.x < 100) {
      if (camera.lerp.x !== 0) {
        camera.setLerp(0, followSpeedY);
      }
    } else {
      if (camera.lerp.x === 0) {
        camera.setLerp(followSpeedX, followSpeedY);
      }
    }
  });

  // 创建人物时有一个弹跳动画,之后取消
  player.setBounce(0.2);
  setTimeout(() => {
    player.setBounce(0);
    camera.setLerp(0.5, 0);
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

  // 碰撞炸弹
  this.physics.add.collider(player, bombs, (_, bomb) => {
    liveNum--;
    if (liveNum <= 0) {
      player.setTint(0xff0000);
      console.log("died");
      gameOver.play({ volume: 0.6 });
      isGameOver = true;
      bgm.pause();
      this.add.text(800 / 2 - 100, 600 / 2 - 20, "游戏结束, 点击屏幕 重新开始", {
        fontSize: "18px",
        color: "#000",
      });
      this.physics.pause();
    } else {
      player.setTint(0xff0000);
      // @ts-ignore
      bomb.setPosition(50, 50);
      player.clearTint();
      player.setPosition(100, 450);
      // 用起来方便
      liveGroup.children.entries.pop()?.destroy();
    }
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

      liveGroup
        .create(30 * (liveNum - 1), 60, "dude", 4)
        .setTint(0xffcc00)
        .setScale(0.8);

      level++;
      liveNum++;
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
  speedFactor += 2;
  if (cursors.left.isDown) {
    player.setVelocityX(-(160 + speedFactor));

    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160 + speedFactor);
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
    player.setVelocityY(350);
  } else {
    // 正在触摸, 不触发事件
    if (!isTaping) {
      player.anims.play("turn", true);
      player.setVelocityX(0);
      speedFactor = 0;
    }
  }

  if (isGameOver && cursors.space.isDown) {
    resetVars();
    this.scene.restart();
  }
}

function resetVars() {
  console.log("重新开始");
  score = 0;
  level = 1;
  liveNum = 1;
}
