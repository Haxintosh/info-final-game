import "./style.css";
import { Map } from "./js/map-class.js";
import { MapGenerator } from "./js/map-gen-class.js";

const mapGen = new MapGenerator("canvas");

await mapGen.init();
// mapGen.update().catch(console.error);
animate();

function animate() {
  requestAnimationFrame(animate);
  try {
    mapGen.update();
  } catch (error) {
    console.error(error);
  }
}
