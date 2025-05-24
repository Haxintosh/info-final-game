import { text } from './text.js'

export class UpgCard {
  constructor(levelFunctions, player) {
    // this.img = new Image()
    // this.img.src = imgPath
    this.levelFunctions = levelFunctions
    this.player = player

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

      if (upg.cost > this.levelFunctions.shards.count) {
        document.getElementById(`shard-txt-cost-${i + 1}`).style.color = 'rgb(255,186,186)';
      } else {
        document.getElementById(`shard-txt-cost-${i + 1}`).style.color = '#ffffff';
      }
    }
  }

  buy(card) {
    if (!this.choosing) return;

    if (card === 4) {
      this.choosing = false;
      this.upgrades.style.opacity = '0';
      this.upgrades.style.top = '60%';

      this.levelFunctions.start();
    }
    else if (parseInt(document.getElementById(`shard-txt-cost-${card}`).textContent) <= this.levelFunctions.shards.count && document.getElementById(`shard-txt-cost-${card}`).textContent !== text.bought) {
      this.levelFunctions.shards.count -= parseInt(document.getElementById(`shard-txt-cost-${card}`).textContent)

      document.getElementById('shard-txt').textContent = this.levelFunctions.shards.count
      // document.getElementById('shard-txt-alt').textContent = this.levelFunctions.shards.count

      document.getElementById(`shard-txt-cost-${card}`).textContent = text.bought;
      document.getElementById(`shard-txt-cost-${card}`).style.color = 'rgb(255,186,186)';
    }

    if (card !== 4) {
      const title = document.getElementById(`upg-title-${card}`).textContent
      if (title === text.basic.dmg.title) {
        this.dmgUpg(text.basic.dmg.value) // to change multiplier value go to text.js
      }
      if (title === text.basic.speed.title) {
        this.speedUpg(text.basic.speed.value)
      }
      if (title === text.basic.heal.title) {
        this.healUpg(text.basic.heal.value)
      }
    }
  }

  dmgUpg(value) {
    // add to multiplier
    this.levelFunctions.upgrades.dmgMulti += value
  }

  speedUpg(value) {
    this.levelFunctions.upgrades.speedMulti += value
  }

  healUpg(value) {
    if (this.player.hp >= this.player.maxHp) return
    this.player.hp++

    const hearts = document.querySelectorAll(".heart");

    for (let i = 0; i <= hearts.length; i++) {
      const heart = hearts[i];
      if (heart.src.includes("/heart-dead.png")) {
        heart.src = "./heart.png";
        break; // stops after healing one heart
      }
    }
  }
}