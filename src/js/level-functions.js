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
    this.announcerSubCard = document.getElementById('announcer-sub')
    this.announcerSubTxt = document.getElementById('announcer-sub-txt')

    this.blackout = document.getElementById('blackout')

    this.interacted = false
    this.interactAction = null

    this.img = new Image()
    this.img.src = './map-assets/room_end/statue_completed.png'
  }

  async start() {
    setTimeout(() => {this.blackout.style.opacity = '0'},400)

    // setup
    await this.mapGen.init();

    this.player.x = this.mapGen.start.x * 40 * 16 + 10 * 16 - this.player.width/2;
    this.player.y = this.mapGen.start.y * 40 * 16 + 10 * 16 - this.player.height/2;
    this.camera.position.x = this.player.x + this.player.width / 2 - this.camera.scaledCanvas.width / 2;
    this.camera.position.y = this.player.y + this.player.height / 2 - this.camera.scaledCanvas.height / 2;

    // unlock player if locked
    this.player.movementLocked = false;

    this.interacted = false
    this.interactAction = null

    setTimeout(() => this.announcer('LAYER ' + this.level + '-' + this.sublevel, 2000), 500);
  }

  announcer(msg, time) { // anims
    this.announcerTxt.textContent = msg;

    this.announcerCard.style.width = '500px';
    setTimeout(() => {
      this.announcerCard.style.width = '0px';
    }, time);
  }

  announcerSub(msg, time) { // anims
    this.announcerSubTxt.textContent = msg;

    this.announcerSubCard.style.width = '1000px';
    setTimeout(() => {
      this.announcerSubCard.style.width = '0px';
    }, time);
  }

  checkInteract() {
    if (this.interacted) return;

    const coords = this.player.getFacingTile(this.mapGen.currentRoom);

    if (!coords) return; // if null return

    if (this.mapGen.currentRoom && this.mapGen.currentRoom.type === 3) {
      const tile = this.mapGen.currentRoom.interactMap[coords.y][coords.x];
      if (tile === 1) { // button prompts are going to have to be manual
        const button = new ButtonPrompt(
          this.canvas,
          this.mapGen,
          'E',
          this.mapGen.currentRoom.x + this.mapGen.currentRoom.mapWidth*16/2,
          this.mapGen.currentRoom.y + this.mapGen.currentRoom.mapHeight*16/2 - 16
        );
        this.interactAction = 'EndStage'
      }
    }
  }

  interact(e) {
    switch (e.code) {
      case 'KeyE':
        if (!this.interacted) {
          this.interacted = true; // change back to false after interaction is done

          if (this.interactAction === 'EndStage') {
            this.player.movementLocked = true;

            this.announcerSub('The statue\'s bloody red eyes stare back at you...', 3000);

            setTimeout(() => {this.blackout.style.opacity = '1'},4000)
            setTimeout(() => {this.intermission()},4500)
          }
        }
        break
    }
  }

  intermission() {
    // put upgrades here

    this.sublevel++
    if (this.sublevel > 3) {
      this.level++
      this.sublevel = 1
    }

    this.start()
  }

  update() {
    if (this.interacted && this.interactAction === 'EndStage') this.showEndStatue();
  }

  showEndStatue() {
    this.ctx.drawImage(
      this.img,
      this.mapGen.currentRoom.x + 9 * 16,
      this.mapGen.currentRoom.y + 6 * 16,
    );
  }
}