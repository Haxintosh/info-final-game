export const audio = {
  click: new Audio("./audio/click.mp3"),
  boom: new Audio("./audio/boom-end.mp3"),
  pickup: new Audio("./audio/pickup.mp3"),
  intro: new Audio("./audio/intro.mp3"),
  level: new Audio("./audio/level.mp3"),
  attack: new Audio("./audio/attack.mp3"),
  battle: new Audio("./audio/battle.mp3"),
  clear: new Audio("./audio/clear.mp3"),
  hurt: new Audio("./audio/hurt.mp3"),
  dash: new Audio("./audio/dash.mp3"),

  enemy: 0.7,
  impact: 0.1,

  steps: {
    step1: new Audio("./audio/step-1.mp3"),
    step2: new Audio("./audio/step-2.mp3"),
    step3: new Audio("./audio/step-3.mp3"),
    step4: new Audio("./audio/step-4.mp3"),
    step5: new Audio("./audio/step-5.mp3"),
  },
};

export const music = {
  ambience: new Audio("./audio/music/Ambience.mp3"),
  devestation: new Audio("./audio/music/Devestation.mp3"),
  menu: new Audio("./audio/music/Menu.mp3"),
  redemption: new Audio("./audio/music/Redemption.mp3"),
  hunted: new Audio("./audio/music/Hunted.mp3"),
  boss: new Audio("./audio/music/Boss.mp3"),
};

export function setAudioVolume(obj, volume) {
  for (const key in obj) {
    const value = obj[key];

    if (value instanceof Audio) {
      value.volume = volume;
    } else if (typeof value === "number") {
      obj[key] = volume; // Update numeric default volume values
    } else if (typeof value === "object" && value !== null) {
      setAudioVolume(value, volume); // Recurse into nested objects
    }
  }
}
