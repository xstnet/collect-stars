import BaseScene from "./BaseScene";

class GameScene extends BaseScene {
  sceneName = "游戏场景";
  init() {
    console.log("init2");
  }
  preload() {
    console.log("preload2");
  }
  create() {
    console.log("create2");
  }

  update(time: number, delta: number): void {
    console.log("update2222");
  }
}

export default GameScene;
