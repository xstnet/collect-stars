let bars: Phaser.GameObjects.Rectangle[] = [];
let tweens: Phaser.Tweens.Tween[] = [];
let timer: Phaser.Time.TimerEvent | undefined = undefined;

// 网上找的,以后可能会用到, 存起来
export const createLoadingAnimation = (scene: Phaser.Scene, x = 400, y = 300) => {
  const radius = 64;
  const height = radius * 0.5;
  const width = 10;

  // the center of the loading animation
  const cx = x;
  const cy = y;

  // start at top
  let angle = -90;

  // create 12 bars each rotated and offset from the center
  for (let i = 0; i < 12; ++i) {
    const { x, y } = Phaser.Math.RotateAround(
      { x: cx, y: cy - (radius - height * 0.5) },
      cx,
      cy,
      Phaser.Math.DEG_TO_RAD * angle
    );

    // create each bar with position, rotation, and alpha
    const bar = scene.add.rectangle(x, y, width, height, 0xffffff, 1).setAngle(angle).setAlpha(0.2);

    bars.push(bar);

    // increment by 30 degrees for next bar
    angle += 30;
  }
  let index = 0;

  // save created tweens for reuse

  // create a looping TimerEvent
  timer = scene.time.addEvent({
    delay: 70,
    loop: true,
    callback: () => {
      console.log("loading timer");

      // if we already have a tween then reuse it
      if (index < tweens.length) {
        const tween = tweens[index];
        tween.restart();
      } else {
        // make a new tween for the current bar
        const bar = bars[index];
        const tween = scene.tweens.add({
          targets: bar,
          alpha: 0.2,
          duration: 400,
          onStart: () => {
            bar.alpha = 1;
          },
        });

        tweens.push(tween);
      }

      // increment and wrap around
      ++index;

      if (index >= bars.length) {
        index = 0;
      }
    },
  });
};

export const removeLoading = () => {
  bars.forEach((bar) => {
    bar?.destroy();
  });
  console.log("tweens", tweens);

  tweens.forEach((tween) => {
    tween?.remove();
  });
  bars = [];
  tweens = [];
  timer?.destroy();
  timer = undefined;
};
