import Phaser from 'phaser';
import BootLoaderScene from './Scenes/BootLoader';
import GameScene from './Scenes/Game';
import { defaultGameConfig } from './configs/game';

if (process.env.NODE_ENV === 'production') {
  console.clear();
}

const game = new Phaser.Game(defaultGameConfig);

game.scene.add('BootLoader', BootLoaderScene);
game.scene.add('Game', GameScene);
game.scene.start('BootLoader');
