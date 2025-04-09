const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const namesInput = document.getElementById("namesInput");
const popup = document.getElementById("popup");
const popupResult = document.getElementById("popupResult");
const historyBox = document.getElementById("history");
let segments = namesInput.value.trim().split("\n").filter(Boolean);
let colors = [];
let startAngle = 0;
let arc = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let spinAngleTotal = 0;
let spinning = false;
let hasUserSpun = false;
let idleTimer;
let history = [];

function generateColors(n) {
  const baseColors = ['#e57373', '#64b5f6', '#81c784', '#ffb74d', '#ba68c8', '#4dd0e1', '#ffd54f'];
  return Array.from({ length: n }, (_, i) => baseColors[i % baseColors.length]);
}

function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
  canvas.width = canvas.height = size;
  drawWheel();
}

function drawWheel() {
  segments = namesInput.value.trim().split("\n").filter(Boolean);
  if (segments.length === 0) return;
  colors = generateColors(segments.length);
  arc = Math.PI * 2 / segments.length;
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw segments
  segments.forEach((label, i) => {
    const angle = startAngle + i * arc;
    ctx.beginPath();
    ctx.fillStyle = colors[i];
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius - 10, angle, angle + arc);
    ctx.lineTo(radius, radius);
    ctx.fill();

    // Draw text
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#333";
    ctx.font = `${Math.floor(radius / 12)}px Quicksand`;
    let shortLabel = label;
    const maxWidth = radius * 0.75;
    while (ctx.measureText(shortLabel).width > maxWidth && shortLabel.length > 0) {
      shortLabel = shortLabel.slice(0, -1);
    }
    if (shortLabel !== label) shortLabel = shortLabel.slice(0, -1) + "…";
    ctx.fillText(shortLabel, radius - 20, 10);
    ctx.restore();
  });

  // Draw center spin circle
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "#2e7d32";
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 10;
  ctx.fill();

  // Pointer triangle
  ctx.beginPath();
  ctx.moveTo(radius, radius * 0.12);
  ctx.lineTo(radius - 12, radius * 0.03);
  ctx.lineTo(radius + 12, radius * 0.03);
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 5;
  ctx.fill();

  // Spin text
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

function rotateWheel(showResult = true) {
  spinTime += 30;
  if (spinTime >= spinTimeTotal) {
    if (showResult) stopRotateWheel();
    return;
  }

  const spinAngle = easeOutCubic(spinTime, 0, spinAngleTotal, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawWheel();
  requestAnimationFrame(() => rotateWheel(showResult));
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

function spin(showResult = true) {
  if (spinning) return;
  spinning = true;
  namesInput.disabled = true;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3000 + 6000;
  spinAngleTotal = Math.random() * 1000 + 1500;
  rotateWheel(showResult);
  if (showResult) hasUserSpun = true;
  clearTimeout(idleTimer);
  resetIdleSpin();
}

function resetIdleSpin() {
  if (!hasUserSpun) {
    idleTimer = setTimeout(() => {
      if (!spinning) spin(false);
    }, 10000); // idle spin after 10s
  }
}

// Bindings
canvas.addEventListener("click", () => spin(true));
namesInput.addEventListener("input", () => {
  drawWheel();
});
window.addEventListener("resize", resizeCanvas);

// Init
resizeCanvas();
resetIdleSpin();
