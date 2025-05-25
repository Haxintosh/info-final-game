// for ease of translation
export let textEN = {
  title: "Whispers Below",
  layer: "LAYER ",
  endStatue: "The statue's bloody red eyes stare back at you...",
  endStatue2: "You stare back at the statue without a hint of fear.",
  roomClear: "Room Clear",
  bought: "Bought",
  well: "This well seems suspicious...",
  chestUseless: "You find nothing of interest.",
  chestUsefulHeart: "You find some healing supplies.",
  chestUsefulShard: "You find some shards.",

  // end
  endTitleVictory: "Redemption",
  endTxtVictory:
    "The statue lies in all its glory, its curse broken, its shadows scattered. The crypt exhales its final breath, and so do you. Not in death, but in deliverance. <br><br>",
  endTxtVictory2:
    "The weight of your sins lifts as the silence returns. You emerged not as the priest you once were, but as the soul who faced the abyss and did not flinch.",
  endSubtitleVictory:
    'You are <span style="color: indianred"> redeemed</span>.',
  endTitleDefeat: "Damnation",
  endTxtDefeat:
    "The crypt grows quiet again, not from peace, but from its hunger sated. Your body joins the bones of those who dared before you, another hollow vessel claimed by the Blight. <br><br>",
  endTxtDefeat2:
    "The dungeon endures, its whispers twisting deeper into the earth, awaiting another foolish soul to promise redemption with blood they cannot spare",
  endSubtitleDefeat:
    'You were <span style="color: #9a5ccd"> not enough</span>.',
  rooms: "Layers: ",
  fullClear: "Fully Cleared",
  enemiesDefeated: "Enemies Defeated: ",
  shardsCollected: "Shards Collected: ",
  endBack: "Back to Main Menu",

  // basic upgrades
  basic: {
    dmg: {
      title: "Attack Damage",
      subtitle: "Basic Upgrade",
      description: "+ 10% damage to enemies",
      cost: "10",
      src: "./icons/7/Skillicon7_14.png",
      value: 0.1,
    },
    speed: {
      title: "Attack Speed",
      subtitle: "Basic Upgrade",
      description: "+ 5% attack speed",
      cost: "10",
      src: "./icons/7/Skillicon7_05.png",
      value: 0.05,
    },
    heal: {
      title: "Heal",
      subtitle: "Basic Upgrade",
      description: "Heal 1 heart",
      cost: "20",
      src: "./icons/7/Skillicon7_11.png",
      value: 1,
    },
  },
};

// pour faciliter la traduction
export let text = {
  title: "Murmures d’En Bas",
  layer: "NIVEAU ",
  endStatue: "Les yeux rouge sang de la statue te fixent...",
  endStatue2: "Tu soutiens le regard de la statue sans la moindre peur.",
  roomClear: "Chambre Complété",
  bought: "Acheté",
  well: "Ce puits semble suspect...",
  chestUseless: "Tu ne trouves rien d’intéressant.",
  chestUsefulHeart: "Tu trouves de quoi te soigner.",
  chestUsefulShard: "Tu trouves quelques fragments.",

  // fin
  endTitleVictory: "Rédemption",
  endTxtVictory:
    "La statue repose dans toute sa splendeur, sa malédiction levée, ses ombres dissipées. La crypte expire son dernier souffle, et toi aussi. Non dans la mort, mais dans la délivrance. <br><br>",
  endTxtVictory2:
    "Le poids de tes péchés s’allège alors que le silence revient. Tu n’es plus le prêtre que tu étais, mais l’âme qui a affronté l’abime sans vaciller.",
  endSubtitleVictory: 'Tu es <span style="color: indianred"> rédimé</span>.',
  endTitleDefeat: "Damnation",
  endTxtDefeat:
    "La crypte se tait à nouveau, non par paix, mais parce que sa faim est apaisée. Ton corps rejoint les ossements de ceux qui ont osé avant toi, un autre réceptacle vidé par le crypte. <br><br>",
  endTxtDefeat2:
    "Le donjon perdure, ses murmures s’enfonçant plus profondément dans la terre, attendant une autre âme assez folle pour promettre la rédemption avec un sang qu’elle ne peut offrir.",
  endSubtitleDefeat:
    'Tu <span style="color: #9a5ccd"> n’étais pas à la hauteur</span>.',
  rooms: "Niveaux : ",
  fullClear: "Entièrement Complété",
  enemiesDefeated: "Ennemis Vaincus : ",
  shardsCollected: "Fragments Collectés : ",
  endBack: "Retour au Menu Principal",

  // améliorations de base
  basic: {
    dmg: {
      title: "Dégâts d’Attaque",
      subtitle: "Amélioration de Base",
      description: "+ 10% de dégâts infligés aux ennemis",
      cost: "10",
      src: "./icons/7/Skillicon7_14.png",
      value: 0.1,
    },
    speed: {
      title: "Vitesse d’Attaque",
      subtitle: "Amélioration de Base",
      description: "+ 5% de vitesse d’attaque",
      cost: "10",
      src: "./icons/7/Skillicon7_05.png",
      value: 0.05,
    },
    heal: {
      title: "Soin",
      subtitle: "Amélioration de Base",
      description: "Récupère 1 coeur",
      cost: "20",
      src: "./icons/7/Skillicon7_11.png",
      value: 1,
    },
  },
};

// language
if (window.location.pathname === "/info-final-game/index-en.html") {
  text = textEN;
}
