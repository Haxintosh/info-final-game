export class Camera {
  constructor(canvas, ctx, player) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.player = player;

    const baseWidth = window.innerWidth;
    const baseHeight = window.innerHeight;

    const scaleX = baseWidth / canvas.width;
    const scaleY = baseHeight / canvas.height;
    this.zoomFactor = (scaleX + scaleY) / 0.2;

    this.scaledCanvas = {
      width: canvas.width / this.zoomFactor,
      height: canvas.height / this.zoomFactor,
    };

    this.camFocus = false;
    this.camFocusTargetX;
    this.camFocusTargetY;
    this.yCamOffset = 70;

    this.position = {
      x: canvas.width / 2,
      y: canvas.height / 2,
    };
  }

  updateCamBox() {
    this.ctx.imageSmoothingEnabled = false;
    const targetX =
      this.player.x + this.player.width / 2 - this.scaledCanvas.width / 2;
    const targetY =
      this.player.y + this.player.height / 2 - this.scaledCanvas.height / 2;

    // smoothly interpolate the camera position towards the target position
    const smoothness = 0.2; // adjust to control smoothness of the panning
    this.position.x += (targetX - this.position.x) * smoothness;
    this.position.y += (targetY - this.position.y) * smoothness;
  }

  begin() {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.save();

    this.ctx.scale(this.zoomFactor, this.zoomFactor);
    this.ctx.translate(-this.position.x, -this.position.y);
  }

  end() {
    this.ctx.restore();
  }
}
