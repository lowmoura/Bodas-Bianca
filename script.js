(() => {
  const stage = document.getElementById("dessertStage");
  const canvas = document.getElementById("sprinkleCanvas");
  const toast = document.getElementById("toast");
  if (!stage || !canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let toastTimer;

  const colors = ["#fff7e9", "#f7a9c2", "#d96e95", "#e9b879", "#c58ab1", "#ffffff"];
  const rand = (min, max) => Math.random() * (max - min) + min;

  function resizeCanvas() {
    const rect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function heartPath(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * .35);
    ctx.bezierCurveTo(x - size * .9, y - size * .2, x - size * .5, y - size * .8, x, y - size * .25);
    ctx.bezierCurveTo(x + size * .5, y - size * .8, x + size * .9, y - size * .2, x, y + size * .35);
    ctx.closePath();
  }

  function drawParticle(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    if (p.type === "heart") {
      heartPath(0, 0, p.size);
      ctx.fill();
    } else if (p.type === "star") {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? p.size : p.size * .42;
        const a = -Math.PI / 2 + i * Math.PI / 5;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.roundRect(-p.size * .55, -p.size * .19, p.size * 1.1, p.size * .38, p.size * .18);
      ctx.fill();
    }
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const now = performance.now();
    particles = particles.filter(p => p.alpha > .025 && (p.y < height + 30 || p.stuck));
    for (const p of particles) {
      if (!p.stuck) {
        p.vy += .105;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        p.alpha = Math.max(.04, 1 - (now - p.born) / p.life);
        // The dessert occupies the center of the stage; particles settle around its lower half.
        const landingY = height * randLanding(p);
        if (p.y >= landingY) {
          p.y = landingY;
          p.stuck = true;
          p.vx = 0;
          p.vy = 0;
          p.alpha = .95;
        }
      } else {
        p.alpha = Math.max(.18, p.alpha - .0007);
      }
      drawParticle(p);
    }
    requestAnimationFrame(animate);
  }

  function randLanding(p) {
    // Keep sprinkles on the visible heart rather than across the entire page.
    const normalizedX = p.x / Math.max(width, 1);
    const centerBias = 1 - Math.min(1, Math.abs(normalizedX - .5) * 2);
    return .48 + centerBias * .28 + rand(-.025, .035);
  }

  function burst(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    const originX = clientX == null ? width / 2 : clientX - rect.left;
    const originY = clientY == null ? height * .34 : clientY - rect.top;
    const count = 34;
    for (let i = 0; i < count; i++) {
      const typeRoll = Math.random();
      particles.push({
        x: originX + rand(-24, 24),
        y: originY + rand(-8, 12),
        vx: rand(-2.2, 2.2),
        vy: rand(-4.2, -1.2),
        size: typeRoll < .5 ? rand(4, 8) : rand(5, 10),
        color: colors[Math.floor(Math.random() * colors.length)],
        type: typeRoll < .48 ? "heart" : typeRoll < .62 ? "star" : "sprinkle",
        rotation: rand(-1, 1),
        spin: rand(-.08, .08),
        alpha: 1,
        born: performance.now(),
        life: rand(5500, 9000),
        stuck: false
      });
    }
    // Keep the animation light even after many taps.
    if (particles.length > 420) particles = particles.slice(-300);
    showToast();
  }

  function showToast() {
    if (!toast) return;
    toast.textContent = "Mais um pouquinho de doçura ♡";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1500);
  }

  function handleInteraction(event) {
    if (event && event.cancelable) event.preventDefault();
    const point = event && event.touches ? event.touches[0] : event;
    burst(point ? point.clientX : null, point ? point.clientY : null);
  }

  stage.addEventListener("pointerdown", handleInteraction, { passive: false });
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();
  animate();
})();
