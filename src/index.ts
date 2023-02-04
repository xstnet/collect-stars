import { relative } from "path";
import Phaser from "phaser";
import { createLoadingAnimation, removeLoading } from "./utils/createLoadingAnimation";
import { getRelativePositionToCamera } from "./utils/util";
import BootLoaderScene from "./Scene/BootLoader";
import GameScene from "./Scene/Game";
import { defaultGameConfig } from "./config/game";

// console.clear();

const gameConfig = { ...defaultGameConfig };

const game = new Phaser.Game(gameConfig);

game.scene.add("BootLoader", BootLoaderScene);
game.scene.add("Game", GameScene);
game.scene.start("BootLoader");

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
let speedText: Phaser.GameObjects.Text;
// 游戏结束
let isGameOver = false;
// 星星数量
let startsNum = 12;
// 是否正在触摸屏幕
let isTaping = false;
// 基础速度
let baseSpeed = 160;
// 长按加速跑
let speedFactor = 0;
// 收集星星后给的速度增益
let collectStarAddSpeed = 0;
let camera: Phaser.Cameras.Scene2D.Camera;
const clientWidth = document.documentElement.clientWidth;
const clientHeight = document.documentElement.clientHeight;
const worldWidth = Number(game.config.width);
const worldHeight = Number(game.config.height);
