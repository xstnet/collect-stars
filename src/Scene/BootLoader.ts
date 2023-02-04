import GameScene from "./Game";
import BaseScene from "./BaseScene";
import { createLoadingAnimation, removeLoading } from "@/utils/createLoadingAnimation";

class BootLoaderScene extends BaseScene {
  sceneKey = "BootLoader";
  sceneName = "初始化场景";

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", { frameWidth: 32, frameHeight: 48 });
    this.load.audio("collect", "assets/sounds/collect.mp3");
    this.load.audio("bgm", "assets/sounds/bg.mp3");
    this.load.audio("gameOver", "assets/sounds/game_over.mp3");

    createLoadingAnimation(this, 400, 300);

    const dom = document.querySelector("#phaserGame div")!;
    this.load.once("start", () => {
      document.querySelector("h1")?.remove();
    });
    this.load.on("progress", (progress: number) => {
      dom.innerHTML = "加载中..." + progress * 100 + "%";
    });
    this.load.on(Phaser.Loader.Events.COMPLETE, () => {
      dom.innerHTML = "";
      removeLoading();
      console.log("boot load complate");
      // 启动游戏场景
      this.scene.start("Game");
    });
  }
}

export default BootLoaderScene;
