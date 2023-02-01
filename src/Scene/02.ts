class Second extends Phaser.Scene {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

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
    console.log("update2");
  }
}

export default Second;
