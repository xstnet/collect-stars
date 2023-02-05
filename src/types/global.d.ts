declare global {
  //设置全局属性
  interface Window {
    //window对象属性
    abc: any; //加入对象
  }

  namespace Game {
    type Sprite = Phaser.Physics.Arcade.Sprite;
    type Image = Phaser.Physics.Arcade.Image;
    type Sound = Phaser.Sound.BaseSound;
    type Text = Phaser.GameObjects.Text;
  }
}

// 必须要导出,不然无效
export {};
