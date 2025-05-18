import { ButtonPrompt } from "./button-prompt.js";

export class LevelFunctions {
  constructor(canvas, mapGen, player, camera) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.mapGen = mapGen;
    this.player = player;
    this.camera = camera

    this.level = 1
    this.sublevel = 1

    this.announcerCard = document.getElementById('announcer')
    this.announcerTxt = document.getElementById('announcer-txt')
  }

  async start() {
    // setup
    await this.mapGen.init();
    this.player.x = this.mapGen.start.x * 40 * 16 + 10 * 16 - this.player.width/2;
    this.player.y = this.mapGen.start.y * 40 * 16 + 10 * 16 - this.player.height/2;
    this.camera.position.x = this.player.x + this.player.width / 2 - this.camera.scaledCanvas.width / 2;
    this.camera.position.y = this.player.y + this.player.height / 2 - this.camera.scaledCanvas.height / 2;

    // unlock player if locked
    this.player.movementLocked = false;

    setTimeout(() => this.announcer('LEVEL ' + this.level + '-' + this.sublevel), 500);
  }

  announcer(msg) { // anims
    this.announcerTxt.textContent = msg;

    this.announcerCard.style.width = '500px';
    setTimeout(() => {
      this.announcerCard.style.width = '0px';
    }, 2000);
  }

  checkInteract() {
    const coords = this.player.getFacingTile(this.mapGen.currentRoom)

    if (!coords) return // if null return

    if (this.mapGen.currentRoom && this.mapGen.currentRoom.type === 3) {
      const tile = this.mapGen.currentRoom.interactMap[coords.y][coords.x]
      if (tile === 1) { // button prompts are going to have to be manual
        const button = new ButtonPrompt(this.canvas, this.mapGen, 'E', this.mapGen.currentRoom.x + this.mapGen.currentRoom.mapWidth*16/2, this.mapGen.currentRoom.y + this.mapGen.currentRoom.mapHeight*16/2 - 16)
      }
    }
  }
}