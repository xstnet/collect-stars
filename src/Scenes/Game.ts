import BaseScene, { IBaseSoundState, IBaseTextState } from './BaseScene';

type ISoundState = IBaseSoundState & {
  bgm?: Game.Sound;
  collect?: Game.Sound;
  gameOver?: Game.Sound;
};

type ITextState = IBaseTextState & {
  scoreText?: Game.Text;
  roundText?: Game.Text;
  speedText?: Game.Text;
};

type IState = {
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  bombs?: Phaser.Physics.Arcade.Group;
  stars?: Phaser.Physics.Arcade.Group;
  level: number;
  // 生命数量
  liveNum: number;
  score: number;

  // 游戏结束
  isGameOver: boolean;
  // 星星数量
  startsNum: number;
  // 是否正在触摸屏幕
  isTaping: boolean;
  // 基础速度
  baseSpeed: number;
  // 长按加速跑
  speedFactor: number;
  // 收集星星后给的速度增益
  collectStarAddSpeed: number;
  camera?: Phaser.Cameras.Scene2D.Camera;
  liveGroup?: Phaser.Physics.Arcade.StaticGroup;
};

type RequiredState = {
  state: Required<IState>;
  textState: Required<ITextState>;
  soundState: Required<ISoundState>;
};
class GameScene extends BaseScene {
  sceneName = '游戏场景';
  sceneKey = 'Game';
  soundState: ISoundState = {};
  textState: ITextState = {};
  state: IState = {
    baseSpeed: 160,
    isTaping: false,
    isGameOver: false,
    startsNum: 12,
    score: 0,
    liveNum: 1,
    level: 1,
    speedFactor: 0,
    collectStarAddSpeed: 50,
    liveGroup: undefined
  };

  create() {
    this.state.camera = this.cameras.main;
    // 背景图
    this.add.image(0, 0, 'sky').setOrigin(0, 0);

    // Add Sounds
    this.soundState.collect = this.sound.add('collect');
    this.soundState.gameOver = this.sound.add('gameOver');
    this.soundState.bgm = this.sound.add('bgm');
    const { soundState, textState } = this;

    // 生成跳跃平台
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 584, 'ground').setScale(2, 1).refreshBody();
    platforms.create(80, 220, 'ground').setScale(0.4, 1).refreshBody();
    platforms.create(600, 300, 'ground').setDisplaySize(250, 32).refreshBody();
    platforms.create(400, 440, 'ground').setScale(0.7, 1).refreshBody();
    platforms.create(400, 160, 'ground').setScale(0.37, 1).refreshBody();
    // 使用display width,height, 同样也需要refresh
    // platforms.create(300, 30, "ground").setDisplaySize(1000, 32);

    soundState.bgm!.play({ volume: 0.5, loop: true });

    this.state.player = this.physics.add.sprite(100, 450, 'dude');

    textState.scoreText = this.add.text(16, 16, 'Score: ' + this.state.score, {
      fontSize: '24px',
      color: '#fff'
    });
    textState.roundText = this.add.text(650, 16, 'Round: ' + this.state.level, {
      fontSize: '24px',
      color: '#fff'
    });
    textState.speedText = this.add.text(650, 45, 'Speed: ' + this.calcSpeed(this.state.baseSpeed), {
      fontSize: '16px',
      color: '#fff'
    });

    this.handleTouch();
    this.handleRestart();

    this.state.liveGroup = this.physics.add.staticGroup();

    // 炸弹组
    this.state.bombs = this.physics.add.group();
    // 星星组
    this.state.stars = this.physics.add.group({
      key: 'star',
      repeat: this.state.startsNum - 1,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.state.stars.children.iterate((child: any) => {
      (child as Game.Sprite).setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      //  增加旋转动画, 为每一个星星单独增加速度, 开始时间
      this.time.addEvent({
        delay: Phaser.Math.Between(300, 1000),
        callback: () => {
          const starWidthGradient = [
            24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22,
            24
          ];
          this.time.addEvent({
            delay: Phaser.Math.Between(60, 120),
            loop: true,
            callback: () => {
              const displayWidth = starWidthGradient.shift() as number;
              (child as Game.Sprite).displayWidth = displayWidth;
              starWidthGradient.push(displayWidth);
            }
          });
        }
      });
    });

    // 创建人物时有一个弹跳动画,之后取消
    this.state.player.setBounce(0.2);
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.state.player?.setBounce(0);
      }
    });

    //  与世界边缘碰撞
    this.state.player.setCollideWorldBounds(true);
    this.anims.create({
      key: 'left',
      frameRate: 10,
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frameRate: 10,
      frames: this.anims.generateFrameNumbers('dude', { start: 5 }),
      repeat: -1
    });

    this.physics.add.collider(this.state.player, platforms);
    this.physics.add.collider(this.state.stars, platforms);
    this.physics.add.collider(this.state.bombs, platforms);

    // 碰撞炸弹
    this.physics.add.collider(
      this.state.player,
      this.state.bombs,
      // @ts-ignore
      this.handleHitBomb,
      undefined,
      this
    );
    // 收集星星
    this.physics.add.overlap(
      this.state.player,
      this.state.stars,
      // @ts-ignore
      this.handleCollectStar,
      null,
      this
    );
    this.state.cursors = this.input.keyboard.createCursorKeys();
  }

  update(): void {
    const { textState, state } = this as unknown as RequiredState;
    state.speedFactor += 0.2;

    // UP 禁止多段跳
    if (state.cursors.up.isDown && state.player.body.touching.down) {
      state.player.anims.play('turn', true);
      state.player.setVelocityY(-(this.calcSpeed(350) - state.collectStarAddSpeed));
    }
    // Left
    else if (state.cursors.left.isDown) {
      this.state.player!.setVelocityX(-this.calcSpeed(state.baseSpeed));
      textState.speedText.setText('Speed: ' + this.calcSpeed(state.baseSpeed).toFixed(2));
      state.player.anims.play('left', true);
      // Right
    } else if (state.cursors!.right.isDown) {
      state.player.anims.play('right', true);
      state.player.setVelocityX(this.calcSpeed(state.baseSpeed));
      textState.speedText.setText('Speed: ' + this.calcSpeed(state.baseSpeed).toFixed(2));
      // DOWN
    } else if (state.cursors!.down.isDown) {
      state.player.anims.play('turn', true);
      state.player.setVelocityY(this.calcSpeed(350));
    } else {
      // 正在触摸, 不触发事件
      if (!state.isTaping) {
        state.player!.anims.play('turn', true);
        state.player!.setVelocityX(0);
        state.speedFactor = 0;
        textState.speedText.setText('Speed: ' + this.calcSpeed(state.baseSpeed));
      }
    }
  }

  handleCollectStar(player: Game.Sprite, star: Game.Sprite) {
    const { soundState, textState, state } = this as any as RequiredState;

    star.disableBody(true, true);
    soundState.collect.play();
    state.score += 10;
    textState.scoreText?.setText('Score: ' + state.score);
    state.collectStarAddSpeed += 50;
    console.log('加速!');

    // 加速结束
    this.time.addEvent({
      delay: 8000,
      callback: () => {
        state.collectStarAddSpeed -= 50;
        console.log('加速失效');
      },
      loop: false
    });

    // 收集完了, 开始下一局
    if (state.stars.countActive(true) <= 0) {
      // alert("成功收集完所有星星, 点击开始下一局");
      const bomb = state.bombs.create(Phaser.Math.Between(50, 600), 16, 'bomb') as Game.Sprite;

      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.FloatBetween(-200, 200), 20);

      // 增加一个 live
      state.liveGroup
        .create(30 * state.liveNum, 60, 'dude', 4)
        .setTint(0xffcc00)
        .setScale(0.8);

      state.level++;
      state.liveNum++;
      textState.roundText.setText('Round: ' + state.level);
      state.stars.children.iterate((star) => {
        // @ts-ignore
        star.enableBody(true, star.x, 0, true, true);
      });
    }
  }

  handleHitBomb(player: Game.Sprite, bomb: Game.Sprite) {
    const { soundState, state } = this as unknown as RequiredState;
    this.state.liveNum--;
    if (this.state.liveNum <= 0) {
      this.state.player!.setTint(0xff0000);
      console.log('died');
      soundState.gameOver!.play({ volume: 0.6 });
      this.state.isGameOver = true;
      soundState.bgm?.pause();
      this.add.text(800 / 2 - 100, 600 / 2 - 20, '游戏结束, 点击屏幕重新开始', {
        fontSize: '18px',
        color: '#000'
      });
      this.physics.pause();
    } else {
      // @ts-ignore
      bomb.setPosition(50, 50);
      soundState.gameOver?.play({ volume: 0.6 });
      this.state.player?.clearTint();
      this.state.player?.setPosition(100, 450);
      // 用起来方便
      this.state.liveGroup!.children.entries.pop()?.destroy();
    }
  }

  // 计算人物速度
  calcSpeed(baseSpeed: number): number {
    return baseSpeed + this.state.collectStarAddSpeed + this.state.speedFactor;
  }

  // 重置变量
  resetVars() {
    console.log('重新开始');
    this.state.score = 0;
    this.state.level = 1;
    this.state.liveNum = 1;
    this.soundState.bgm!.destroy();
  }

  handleTouch() {
    const { speedText } = this.textState as RequiredState['textState'];
    // 触摸事件
    if (this.input.manager.touch) {
      let startTouchY = 0,
        endTouchY = 0;

      this.input.on('pointerdown', (pointer: any) => {
        // 重新开始
        if (this.state.isGameOver) {
          this.resetVars();
          this.scene.restart();
          return;
        }
        // 如果没有移动摄像机, 使用pointer中的坐标即可
        // 如果移动了摄像机, 此时pointer中的坐标是相对于摄像机, 必须要转换成真正的世界坐标
        const worldPointer = this.state.camera!.getWorldPoint(pointer.x, pointer.y);

        var touchX = worldPointer.x;
        startTouchY = worldPointer.y;
        this.state.isTaping = true;

        if (touchX > this.state.player!.x) {
          this.state.player!.setVelocityX(this.calcSpeed(this.state.baseSpeed));
          this.state.player!.anims.play('right', true);
          speedText.setText('Speed: ' + this.calcSpeed(this.state.baseSpeed).toFixed(2));
        } else {
          this.state.player!.setVelocityX(-this.calcSpeed(this.state.baseSpeed));
          this.state.player!.anims.play('left', true);
          speedText.setText('Speed: ' + this.calcSpeed(this.state.baseSpeed).toFixed(2));
        }
      });

      this.input.on('pointerup', (pointer: any) => {
        this.state.player?.setVelocityX(0);
        const worldPointer = this.state.camera!.getWorldPoint(pointer.x, pointer.y);
        endTouchY = worldPointer.y;
        // 终点的滑动距离超过精灵的高度, 上跳
        if (startTouchY - endTouchY > this.state.player!.height) {
          if (this.state.player?.body.touching.down) {
            // 身体在地面时才能跳跃, 触摸不好操作,跳高一点
            this.state.player.setVelocityY(-(this.calcSpeed(370) - this.state.collectStarAddSpeed));
          }
        } else if (Math.abs(endTouchY - startTouchY) > this.state.player!.height) {
          //  下降
          this.state.player!.setVelocityY(this.calcSpeed(350));
        }
        this.state.isTaping = false;
      });
    }
  }

  handleRestart() {
    document.body.addEventListener('click', () => {
      if (this.state.isGameOver) {
        this.resetVars();
        this.scene.restart();
      }
    });
  }
}

export default GameScene;
