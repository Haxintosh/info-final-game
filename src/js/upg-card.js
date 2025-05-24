import { text } from './text.js'

export class UpgCard {
  constructor(levelFunctions) {
    // this.img = new Image()
    // this.img.src = imgPath
    this.levelFunctions = levelFunctions

    this.choosing = false
    this.upgradesArray = [text.basic.dmg, text.basic.speed, text.basic.heal] // push new upgrades here

    this.upgrades = document.getElementById('upgrade-container')
  }

  showCards() {
    this.choosing = true

    this.upgrades.style.opacity = '1'
    this.upgrades.style.top = '50%'

    for (let i = 0; i < 3; i++) {
      const rng = Math.floor(Math.random()*this.upgradesArray.length)
      const upg = this.upgradesArray[rng];
      console.log(this.upgrades.length, rng, upg)

      document.getElementById(`upg-title-${i + 1}`).textContent = upg.title;
      document.getElementById(`upg-subtitle-${i + 1}`).textContent = upg.subtitle;
      document.getElementById(`upg-desc-${i + 1}`).textContent = upg.description;
      document.getElementById(`shard-txt-cost-${i + 1}`).textContent = upg.cost;
      document.getElementById(`upg-img-${i + 1}`).src = upg.src;
      document.getElementById(`upg-img-${i + 1}`).alt = upg.title;
    }
  }

  buy(card) {
    if (!this.choosing) return
    this.choosing = false

    if (card === 4) {
      this.upgrades.style.opacity = '0'
      this.upgrades.style.top = '60%'

      this.levelFunctions.start()
    }
  }
}