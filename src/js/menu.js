const canvas = document.getElementById('menu-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false

export let menuDone = {done: false}

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// central image
const centralImg = new Image();
centralImg.src = './menu.png';

const imageNames = ['./sigils/blood.png', './sigils/bone.png', './sigils/rot.png', './sigils/ash.png', './sigils/phantom.png', './sigils/witchfire.png'];

const sigils = imageNames.map(name => ({
  img: (() => {
    const image = new Image();
    image.src = name;
    return image;
  })(),
  angle: Math.random() * Math.PI * 2,
  speed: (0.01 + Math.random() * 0.02) * (Math.random() < 0.5 ? -1 : 1),
  radiusX: 50 + Math.random() * 40,
  radiusY: 50 + Math.random() * 40
}));

export function menuAnim() {
  if (menuDone.done) return;

  // Draw a semi-transparent black rectangle over the canvas to create a fading trail effect
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Adjust alpha for trail persistence (0.05–0.2 works well)
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(centerX, centerY); // Move origin to center
  ctx.scale(4, 4);                 // Zoom in
  ctx.translate(-centerX, -centerY); // Move origin back

  for (const sigil of sigils) {
    sigil.angle += sigil.speed;

    const x = centerX + Math.cos(sigil.angle) * sigil.radiusX;
    const y = centerY + Math.sin(sigil.angle) * sigil.radiusY;

    if (sigil.img.complete) {
      ctx.drawImage(sigil.img, x - 8, y - 8, 16, 16);
    }
  }

  const width = centralImg.width * 1.5;
  const height = centralImg.height * 1.5;
  if (centralImg.complete) {
    ctx.drawImage(centralImg, centerX - width / 2, centerY - height / 2, width, height);
  }

  ctx.restore();

  requestAnimationFrame(menuAnim);
}
