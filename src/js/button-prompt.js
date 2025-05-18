export class ButtonPrompt {
  constructor(canvas, mapGen, key, x, y) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mapGen = mapGen;

    this.buttonSize = 12;
    this.fontSize = 10; // in pixels
    this.color = 'rgba(72,72,72,0.75)';

    this.showPrompt(key, x, y)
    this.shown = false
  }

  showPrompt(key, x, y) {
    if (this.shown) return
    this.shown = true

    // outline
    this.ctx.strokeStyle = 'rgba(255,255,255,0.75)'
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - this.buttonSize/2, y - this.buttonSize/2, this.buttonSize, this.buttonSize);

    // background
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(x - this.buttonSize/2, y - this.buttonSize/2, this.buttonSize, this.buttonSize);

    // text
    this.ctx.fillStyle = "white";
    this.ctx.font = `${this.fontSize}px 'ending'`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(key, x, y + 1);
  }
}