import GameScene from "./Game";
import BaseScene from "./BaseScene";

class BootLoaderScene extends BaseScene {
  sceneKey = "BootLoader";

  preload() {
    console.log("preload", this.scene.key);
  }
  create() {
    console.log("create");
    this.state.cursor = this.input.keyboard.addKey("right");
    this.state.cursor.on("down", () => {
      this.scene.start("game");
    });
  }

  update(time: number, delta: number): void {
    console.log("update1111");
  }
}

export default BootLoaderScene;
