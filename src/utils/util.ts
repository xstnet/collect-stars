// 计算精灵相对于Camera的位置
export const getRelativePositionToCamera = (
  gameObject: Phaser.GameObjects.Sprite,
  camera: Phaser.Cameras.Scene2D.Camera
): { x: number; y: number } => {
  return {
    x: (gameObject.x - camera.worldView.x) * camera.zoom,
    y: (gameObject.y - camera.worldView.y) * camera.zoom,
  };
};
