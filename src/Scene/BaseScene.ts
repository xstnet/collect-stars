// 所有场景的父类

export type IState = Record<string, any>;

export type IBaseSoundState = Record<string, Game.Sound>;
export type IBaseTextState = Record<string, Game.Text>;

interface IScene {
  destory: () => void;
}
class BaseScene extends Phaser.Scene implements IScene {
  // 场景名, 给程序员看的
  sceneName = "";

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
    console.log(`添加场景`, this.sceneName, this);
  }

  // 如果覆盖了init方法, 必须手动调用一次父类的init
  init() {
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.destory, this);
    console.log("加载场景", this.sceneName, this);
  }

  // 收尾操作, 如
  // 事件销毁
  destory() {
    console.log("场景销毁", this.sceneName, this);
  }
}

export default BaseScene;
