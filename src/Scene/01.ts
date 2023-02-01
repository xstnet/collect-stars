class First extends Phaser.Scene {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  init() {
    console.log("init");
  }
  preload() {
    console.log("preload");
  }
  create() {
    console.log("create");
  }

  update(time: number, delta: number): void {
    console.log("update");
  }
}

export default First;
