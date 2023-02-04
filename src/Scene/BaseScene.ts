// 所有场景的父类

export type IState = Record<string, any>;

interface IScene<T> {
  destory: () => void;
}
class BaseScene<S extends IState = IState> extends Phaser.Scene implements IScene<S> {
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
