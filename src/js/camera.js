export class Camera {
  constructor(canvas, ctx, player) {
    this.canvas = canvas
    this.ctx = ctx

    this.player = player

    this.zoomFactor = 3
    this.scaledCanvas = {
      width: canvas.width / this.zoomFactor,
      height: canvas.height / this.zoomFactor
    }

    this.camFocus = false
    this.camFocusTargetX
    this.camFocusTargetY
    this.yCamOffset = 70

    this.camera = {
      position: {
        x: canvas.width/2,
        y: canvas.height/2
      },
    }
  }

  updateCamBox() {
    const targetX = this.player.x + this.player.width/2 - this.scaledCanvas.width/2
    const targetY = this.player.y + this.player.height/2 - this.scaledCanvas.height/2

    // smoothly interpolate the camera position towards the target position
    const smoothness = 0.1 // adjust to control smoothness of the panning
    this.camera.position.x += (targetX - this.camera.position.x) * smoothness;
    this.camera.position.y += (targetY - this.camera.position.y) * smoothness;
  }

  begin() {
    this.ctx.save()

    this.ctx.scale(this.zoomFactor, this.zoomFactor)
    this.ctx.translate(-this.camera.position.x, -this.camera.position.y)
  }

  end() {
    this.ctx.restore()
  }
}