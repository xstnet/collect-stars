### 绑定键盘按键几种方式

1. 使用 `cursors = this.input.keyboard.createCursorKeys()`, 然后在 `update`中判断 `cursors.left.isDown`的形式
   缺点是只能绑定 `left,up,down,right,space,shift` 这 6 个按键

2. 全局动态绑定
   支持任意键, 支持, `keydown,keyup`等

```js
this.input.keyboard.on("keydown-A", () => {
  console.log(23424);
});
```

3. 好像也是直接绑定,不用判断, 支持`down,up`, 支持所有按键

```js
var spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

spaceBar.on("down", listener);
```

4. addKey 绑定, 需要判断 isDown

```js
const keyB = this.input.keyboard.addKey("B");
if (keyB.isDown) {
  // xxxx
}
```

网上找的按键绑定

```js
const leftArrow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
leftArrow.on("up", () => {
  this.cards.forEach((card) => {
    card.x -= 20;
  });

  const card = this.deal();
  this.cards.push(card);
});
```
