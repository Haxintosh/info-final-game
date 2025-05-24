export class UpgCard {
  constructor(placement, title, subtitle, description, cost, imgPath,) {
    this.placement = placement
    this.title = title
    this.subtitle = subtitle
    this.description = description
    this.cost = cost
    this.img = new Image()
    this.img.src = imgPath

    this.choosing = false
  }


}