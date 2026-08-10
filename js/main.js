(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Moving green particle field ----- */
  const canvas = document.getElementById("stars");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let raf = 0;
    const maxDist = 140;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = window.innerWidth * window.innerHeight;
      const count = Math.min(130, Math.max(55, Math.floor(area / 12000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.2 + 0.6,
        a: Math.random() * 0.55 + 0.25,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      if (!ctx || reduced) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.x < -20) p.x = window.innerWidth + 20;
        if (p.x > window.innerWidth + 20) p.x = -20;
        if (p.y < -20) p.y = window.innerHeight + 20;
        if (p.y > window.innerHeight + 20) p.y = -20;

        const glow = 0.55 + Math.sin(p.pulse) * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134, 239, 172, ${p.a * glow})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${0.08 * glow})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    if (!reduced) {
      draw();
    } else {
      ctx.fillStyle = "rgba(134, 239, 172, 0.35)";
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      resize();
      if (!reduced) draw();
    });
  }

  /* ----- Typewriter: mistype → erase → correct name ----- */
  const typedEl = document.getElementById("typedName");
  const cursorEl = document.getElementById("typedCursor");

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const typeText = async (el, text, speed = 70) => {
    for (let i = 0; i < text.length; i++) {
      el.textContent += text[i];
      await sleep(speed + Math.random() * 40);
    }
  };

  const eraseText = async (el, speed = 42) => {
    while (el.textContent.length > 0) {
      el.textContent = el.textContent.slice(0, -1);
      await sleep(speed);
    }
  };

  const runTypewriter = async () => {
    if (!typedEl) return;
    const finalName = "Kalana Lakshan";

    if (reduced) {
      typedEl.textContent = finalName;
      cursorEl?.classList.add("done");
      return;
    }

    typedEl.textContent = "";
    await sleep(450);
    await typeText(typedEl, "Kalana Laskhan", 68);
    await sleep(520);
    await eraseText(typedEl, 38);
    await sleep(280);
    await typeText(typedEl, finalName, 72);
    await sleep(400);
    cursorEl?.classList.add("done");
  };

  runTypewriter();

  /* ----- Mobile nav ----- */
  const toggle = document.getElementById("navToggle");
  const sideNav = document.getElementById("sideNav");

  const closeNav = () => {
    sideNav?.classList.remove("open");
    toggle?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  };

  toggle?.addEventListener("click", () => {
    const open = sideNav?.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  sideNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  /* ----- Scroll spy + reveal ----- */
  const sections = [...document.querySelectorAll(".section[id]")];
  const navLinks = [...document.querySelectorAll(".side-nav a")];

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === id);
    });
  };

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  sections.forEach((section) => revealObserver.observe(section));

  const spyObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    },
    { threshold: [0.25, 0.45, 0.6], rootMargin: "-20% 0px -35% 0px" }
  );

  sections.forEach((section) => spyObserver.observe(section));
  if (sections[0]) {
    sections[0].classList.add("visible");
    setActive(sections[0].id);
  }

  /* ----- Project filters ----- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      cards.forEach((card) => {
        const cats = (card.dataset.categories || "").split(/\s+/);
        const show = filter === "all" || cats.includes(filter);
        card.classList.toggle("hidden", !show);
      });
    });
  });
})();
