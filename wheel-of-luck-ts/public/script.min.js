const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");
const namesInput = document.getElementById("namesInput");
const popup = document.getElementById("popup");
const popupResult = document.getElementById("popupResult");
const historyBox = document.getElementById("history");
const spinCountLabel = document.getElementById("spinCount");

const tickSound = new Audio("data:audio/mp3;base64,//uQxAA..."); // Replace with your actual tick audio
tickSound.volume = 0.6;

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
  const container = document.getElementById("wheelContainer");
  const size = container.offsetWidth;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = canvas.height = size * dpr;
  canvas.style.width = canvas.style.height = `${size}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  drawWheel(size);
}

function generateColors(n) {
  const palette = ['#f44336', '#4caf50', '#ff9800', '#2196f3', '#9c27b0', '#ffeb3b', '#00bcd4'];
  return Array.from({ length: n }, (_, i) => palette[i % palette.length]);
}

function drawWheel(size) {
  const radius = size / 2;
  arc = Math.PI * 2 / segments.length;
  ctx.clearRect(0, 0, size, size);

  segments.forEach((label, i) => {
    const angle = startAngle + i * arc;
    ctx.beginPath();
    ctx.fillStyle = colors[i];
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius - 10, angle, angle + arc);
    ctx.fill();

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
    if (shortLabel !== label) {
      shortLabel = shortLabel.slice(0, -1) + '…';
    }
    ctx.fillText(shortLabel, radius - 20, 10);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.16, 0, Math.PI * 2); // Bigger button
  ctx.fillStyle = "#2196f3";
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.font = `bold ${Math.floor(radius * 0.1)}px Quicksand`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("SPIN", radius, radius + radius * 0.03);

  // draw the pointer
  drawPointer(ctx, radius);
}

function drawPointer(ctx, radius) {
  const pointerHeight = radius * 0.18; // taller
  const pointerWidth = radius * 0.06;  // narrower for isosceles look

  // Position pointer at the top, overlapping the rim slightly
  ctx.save();
  ctx.translate(radius, radius - (radius - 28));

  // Outer gold border
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-pointerWidth, -pointerHeight);
  ctx.lineTo(pointerWidth, -pointerHeight);
  ctx.closePath();
  ctx.fillStyle = "#ffcc33";
  ctx.fill();

  // Inner red triangle
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.01);
  ctx.lineTo(-pointerWidth * 0.9, -pointerHeight * 0.92);
  ctx.lineTo(pointerWidth * 0.9, -pointerHeight * 0.92);
  ctx.closePath();
  ctx.fillStyle = "#b71c1c";
  ctx.shadowColor = "rgba(255, 0, 0, 0.6)";
  ctx.shadowBlur = spinning ? 20 : 0;
  ctx.fill();

  ctx.restore();
}

// Default easing: easeOutCubic
// function easeOutCubic(t, b, c, d) {
//   t /= d;
//   t--;
//   return c * (t * t * t + 1) + b;
// }

// Optional: easeOutQuart (uncomment to use instead)
function easeOutQuart(t, b, c, d) {
  t /= d;
  t--;
  return -c * (t * t * t * t - 1) + b;
}

function spin() {
  if (spinning || segments.length === 0) return;
  spinning = true;
  namesInput.disabled = true;

  spinTimeTotal = 4000; // 4 seconds
  spinAngleTotal = 1440 + Math.random() * 720; // 4 to 6 full spins

  lastSpinAngle = 0;
  lastSegmentIndex = -1; // for tick sound
  startTimestamp = null;

  requestAnimationFrame(rotateWheel);
}

let lastSpinAngle = 0;
let lastSegmentIndex = -1;
let startTimestamp = null;

function rotateWheel(timestamp) {
  if (!startTimestamp) startTimestamp = timestamp;

  const elapsed = timestamp - startTimestamp;

  if (elapsed >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }

  const easedAngle = easeOutQuart(elapsed, 0, spinAngleTotal, spinTimeTotal);
  const deltaAngle = easedAngle - lastSpinAngle;
  lastSpinAngle = easedAngle;

  startAngle += (deltaAngle * Math.PI / 180);
  drawWheel(canvas.clientWidth);

  // 🔊 Play tick when a new segment is crossed
  const degrees = startAngle * 180 / Math.PI + 90;
  const currentIndex = Math.floor((360 - degrees % 360) / (arc * 180 / Math.PI)) % segments.length;

  if (currentIndex !== lastSegmentIndex) {
    try {
      tickSound.currentTime = 0;
      tickSound.play();
    } catch (e) {
      // Ignore autoplay errors
    }
    lastSegmentIndex = currentIndex;
  }

  requestAnimationFrame(rotateWheel);
}

function stopRotateWheel() {
  const degrees = startAngle * 180 / Math.PI + 90;
  const index = Math.floor((360 - degrees % 360) / (arc * 180 / Math.PI)) % segments.length;
  const result = segments[index];

  popupResult.textContent = `${result}!`;
  popup.style.display = "flex";
  history.unshift(result);
  spinCountLabel.textContent = `Spins: ${history.length}`;
  updateHistory();
  namesInput.disabled = false;
  spinning = false;

  launchConfetti();
}

function updateHistory() {
  historyBox.innerText = history.slice(0, 10).join('\n');
}

function showTab(tab) {
  const entriesTab = document.getElementById('entriesTab');
  const resultsTab = document.getElementById('resultsTab');
  const entriesPanel = document.getElementById('entries-panel');
  const resultsPanel = document.getElementById('results-panel');

  if (tab === 'entries') {
    entriesTab.classList.add('active');
    resultsTab.classList.remove('active');
    entriesPanel.classList.add('active');
    resultsPanel.classList.remove('active');
  } else {
    resultsTab.classList.add('active');
    entriesTab.classList.remove('active');
    resultsPanel.classList.add('active');
    entriesPanel.classList.remove('active');
    updateHistory();
  }
}

function closePopup() {
  popup.style.display = 'none';
}

canvas.addEventListener("click", spin);

namesInput.addEventListener("input", () => {
  segments = namesInput.value.trim().split("\n").filter(Boolean);
  colors = generateColors(segments.length);
  startAngle = 0;
  resizeCanvas();
});

window.addEventListener("resize", resizeCanvas);
document.fonts.ready.then(resizeCanvas);

// Confetti
let confetti = [];

function launchConfetti() {
  for (let i = 0; i < 150; i++) {
    confetti.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -100,
      r: Math.random() * 6 + 4,
      d: Math.random() * 50 + 10,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
    });
  }
  animateConfetti();
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confetti.forEach(c => {
    c.y += 6;
    c.tiltAngle += 0.05;
    c.x += Math.sin(c.tiltAngle);
    c.tilt = Math.sin(c.tiltAngle) * 10;

    confettiCtx.beginPath();
    confettiCtx.lineWidth = c.r;
    confettiCtx.strokeStyle = c.color;
    confettiCtx.moveTo(c.x + c.tilt, c.y);
    confettiCtx.lineTo(c.x, c.y + c.tilt + c.r);
    confettiCtx.stroke();
  });

  confetti = confetti.filter(c => c.y < window.innerHeight);
  if (confetti.length > 0) {
    requestAnimationFrame(animateConfetti);
  }
}
