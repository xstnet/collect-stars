export const defaultGameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  dom: {
    // 在canvas之上添加一个dom, 大小完全=canvas
    createContainer: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: process.env.NODE_ENV === "development",
    },
  },
  parent: "phaserGame",
  // scene: {
  //   preload: preload,
  //   create: create,
  //   update: update,
  // },
};
