export class Shard {
  constructor(x, y, player, shardsArray, shards) {
    this.x = x;
    this.y = y;
    this.targetX = x
    this.targetY = y

    this.lerpFactor = 0.1
    this.lerping = true

    this.player = player;

    this.sprite = new Image();
    this.sprite.src = './shard.png';

    this.shardsArray = shardsArray
    shardsArray.push(this);

    this.shards = shards

    this.display = document.getElementById('shard-txt')
    // this.display2 = document.getElementById('shard-txt-alt')

    this.spawn()
  }

  spawn() {
    this.targetX = this.x + Math.random()*64 - 32;
    this.targetY = this.y + Math.random()*64 - 32;
  }

  lerp() {
    if (!this.lerping) return
    this.x += (this.targetX - this.x) * this.lerpFactor;
    this.y += (this.targetY - this.y) * this.lerpFactor;
  }

  checkPlayerDist() {
    const dist = Math.sqrt((this.player.x + this.player.width/2 - this.x)**2 + (this.player.y + this.player.height/2 - this.y)**2);

    if (dist <= 32) {
      this.lerping = false

      const dx = this.player.x + this.player.width/2 - this.x;
      const dy = this.player.y + this.player.height/2 - this.y;
      const angle = Math.atan2(dy, dx);

      const speed = 4;
      this.x += Math.cos(angle) * speed;
      this.y += Math.sin(angle) * speed;
    }
    if (dist <= 5) { // destroy
      // this.shardsArray.splice(this, 1);
      const index = this.shardsArray.indexOf(this);
      if (index !== -1) {
        this.shardsArray.splice(index, 1);
      }
      this.shards.count++;

      // update displays
      this.display.textContent = this.shards.count
      // this.display2.textContent = this.shards.count
    }
  }

  draw(ctx) {
    if (this.sprite.naturalWidth === 0) return
    ctx.drawImage(
      this.sprite,
      this.x - this.sprite.width/2,
      this.y - this.sprite.height/2,
    )
  }

  update(ctx) {
    this.lerp()
    this.checkPlayerDist()
    this.draw(ctx)
  }
}