(() => {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  const scene = document.getElementById('scene');
  const card = document.getElementById('heroCard');
  const meteorLayer = document.getElementById('meteorLayer');
  const sparkBurst = document.getElementById('sparkBurst');
  const celebrateBtn = document.getElementById('celebrateBtn');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let shootingStarTimer = null;

  class Star {
    constructor(initial = false) {
      this.reset(initial);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.r = Math.random() * 1.4 + 0.25;
      this.baseAlpha = Math.random() * 0.65 + 0.2;
      this.alpha = this.baseAlpha;
      this.twinkle = Math.random() * 0.025 + 0.006;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.07 + 0.012;
      this.tint = Math.random() > 0.82 ? '176,205,255' : '255,255,255';
    }
    update(t) {
      this.y -= this.speed;
      if (this.y < -10) this.reset(false);
      this.alpha = Math.max(0.08, this.baseAlpha + Math.sin(t * this.twinkle + this.phase) * 0.32);
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${this.tint},${this.alpha})`;
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      if (this.r > 1.15) {
        ctx.strokeStyle = `rgba(${this.tint},${this.alpha * .45})`;
        ctx.lineWidth = .55;
        ctx.beginPath();
        ctx.moveTo(this.x - this.r * 3, this.y);
        ctx.lineTo(this.x + this.r * 3, this.y);
        ctx.moveTo(this.x, this.y - this.r * 3);
        ctx.lineTo(this.x, this.y + this.r * 3);
        ctx.stroke();
      }
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(260, Math.floor((width * height) / 6000));
    stars = Array.from({ length: count }, () => new Star(true));
  }

  function animate(t = 0) {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(star => { star.update(t); star.draw(); });
    requestAnimationFrame(animate);
  }

  function createMeteor(isBurst = false) {
    const meteor = document.createElement('span');
    meteor.className = 'meteor';
    meteor.style.left = `${Math.random() * 55 - 10}vw`;
    meteor.style.top = `${Math.random() * 35 - 15}vh`;
    meteor.style.animationDuration = `${1.15 + Math.random() * .9}s`;
    meteor.style.opacity = `${.55 + Math.random() * .45}`;
    meteor.style.transform = `rotate(${-28 - Math.random() * 18}deg)`;
    meteorLayer.appendChild(meteor);
    meteor.addEventListener('animationend', () => meteor.remove(), { once: true });

    if (isBurst && Math.random() > .35) {
      setTimeout(() => createMeteor(false), 120 + Math.random() * 340);
    }
  }

  function scheduleMeteor() {
    clearTimeout(shootingStarTimer);
    const delay = 3500 + Math.random() * 6500;
    shootingStarTimer = setTimeout(() => {
      createMeteor(false);
      scheduleMeteor();
    }, delay);
  }

  function burstAt(x, y) {
    const amount = window.innerWidth < 600 ? 32 : 52;
    for (let i = 0; i < amount; i++) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      const angle = (Math.PI * 2 * i) / amount + Math.random() * .35;
      const distance = 70 + Math.random() * 190;
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
      spark.style.animationDelay = `${Math.random() * .18}s`;
      spark.style.width = spark.style.height = `${3 + Math.random() * 5}px`;
      sparkBurst.appendChild(spark);
      spark.addEventListener('animationend', () => spark.remove(), { once: true });
    }
  }

  celebrateBtn.addEventListener('click', () => {
    const rect = celebrateBtn.getBoundingClientRect();
    burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
    for (let i = 0; i < 7; i++) setTimeout(() => createMeteor(true), i * 150);
    celebrateBtn.querySelector('.btn-text').textContent = 'MOONDUST ESTÁ BRILHANDO ✨';
    setTimeout(() => {
      celebrateBtn.querySelector('.btn-text').textContent = 'ATIVAR CHUVA ESTELAR';
    }, 2600);
  });

  if (!reduceMotion) {
    scene.addEventListener('pointermove', (event) => {
      const x = (event.clientX / window.innerWidth - .5) * 2;
      const y = (event.clientY / window.innerHeight - .5) * 2;
      card.style.transform = `rotateY(${x * 3.5}deg) rotateX(${-y * 3}deg)`;
    });
    scene.addEventListener('pointerleave', () => {
      card.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  animate();
  if (!reduceMotion) scheduleMeteor();
})();
