const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const namesInput = document.getElementById("namesInput");
const popup = document.getElementById("popup");
const popupResult = document.getElementById("popupResult");
const historyBox = document.getElementById("history");

let segments = namesInput.value.trim().split("\n").filter(Boolean);
let colors = generateColors(segments.length);
let startAngle = 0;
let arc = Math.PI * 2 / segments.length;
let spinTime = 0;
let spinTimeTotal = 0;
let spinAngleTotal = 0;
let spinning = false;
let history = [];


function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(window.innerWidth * 0.7, window.innerHeight * 0.6);
  
  canvas.style.width = size + 'px';   // CSS size
  canvas.style.height = size + 'px';

  canvas.width = size * dpr;          // actual pixel size
  canvas.height = size * dpr;

  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
  ctx.scale(dpr, dpr);                // scale drawing context

  drawWheel();
}


function generateColors(n) {
  const baseColors = ['#e57373', '#64b5f6', '#81c784', '#ffb74d', '#ba68c8', '#4dd0e1', '#ffd54f'];
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(baseColors[i % baseColors.length]);
  }
  return result;
}

function drawWheel() {
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  arc = Math.PI * 2 / segments.length;

  segments.forEach((label, i) => {
    const angle = startAngle + i * arc;
    ctx.beginPath();
    ctx.fillStyle = colors[i];
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius - 10, angle, angle + arc);
    ctx.lineTo(radius, radius);
    ctx.fill();    

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#333";
    ctx.font = `${Math.floor(radius / 12)}px Quicksand`;
    let shortLabel = label;
    let maxWidth = radius * 0.75;
    while (ctx.measureText(shortLabel).width > maxWidth && shortLabel.length > 0) {
      shortLabel = shortLabel.slice(0, -1);
    }
    if (shortLabel !== label) shortLabel = shortLabel.slice(0, -1) + "…";
    ctx.fillText(shortLabel, radius - 20, 10);
    ctx.restore();
  });

  // Central spin button
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "#2196f3"; // Light blue
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 10;
  ctx.fill();

  // Triangle pointer
  ctx.beginPath();
  ctx.moveTo(radius, radius * 0.12);
  ctx.lineTo(radius - 12, radius * 0.03);
  ctx.lineTo(radius + 12, radius * 0.03);
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 5;
  ctx.fill();

  // SPIN label
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.floor(radius * 0.08)}px Quicksand`;
  ctx.textAlign = "center";
  ctx.fillText("SPIN", radius, radius + radius * 0.03);
}

function easeOutCubic(t, b, c, d) {
  t /= d;
  t--;
  return c * (t * t * t + 1) + b;
}

function rotateWheel() {
  spinTime += 30;
  if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }

  const spinAngle = easeOutCubic(spinTime, 0, spinAngleTotal, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawWheel();
  requestAnimationFrame(rotateWheel);
}

function stopRotateWheel() {
  const degrees = startAngle * 180 / Math.PI + 90;
  const arcd = arc * 180 / Math.PI;
  const index = Math.floor((360 - degrees % 360) / arcd) % segments.length;
  const result = segments[index];
  popupResult.textContent = `You won: ${result}!`;
  popup.style.display = "flex";
  spinning = false;
  namesInput.disabled = false;
  history.unshift(result);
  historyBox.style.display = "block";
  historyBox.innerText = history.slice(0, 10).join('\n');
}

function spin() {
  if (spinning) return;
  spinning = true;
  namesInput.disabled = true;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3000 + 6000;
  spinAngleTotal = Math.random() * 1000 + 1500;
  rotateWheel();
}

canvas.addEventListener("click", spin);

namesInput.addEventListener("input", () => {
  segments = namesInput.value.trim().split("\n").filter(Boolean);
  colors = generateColors(segments.length);
  startAngle = 0;
  drawWheel();
});

window.addEventListener("resize", resizeCanvas);

// Wait until font loads then draw
document.fonts.ready.then(() => {
  resizeCanvas();
  drawWheel();
});
