// ✅ script.js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Page Loader (0% -> 100%) ---------- */
(function pageLoader() {
  const loader = document.getElementById('pageLoader');
  const percentEl = document.getElementById('loaderPercent');
  const barEl = document.getElementById('loaderBar');
  if (!loader || !percentEl || !barEl) return;

  document.body.classList.add('is-loading');

  let progress = 0;
  let pageLoaded = false;
  window.addEventListener('load', () => { pageLoaded = true; });

  const render = (p) => {
    const n = Math.max(0, Math.min(100, p));
    percentEl.textContent = String(Math.round(n));
    barEl.style.width = `${n}%`;
  };

  const finish = () => {
    render(100);
    loader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    setTimeout(() => loader.remove(), 520);
  };

  const speedFactor = prefersReducedMotion ? 0.22 : 0.10;
  const capBeforeLoad = prefersReducedMotion ? 100 : 92;

  const tick = () => {
    const target = pageLoaded ? 100 : capBeforeLoad;
    const remaining = target - progress;
    const step = Math.max(0.18, remaining * speedFactor);
    progress = Math.min(target, progress + step);

    render(progress);

    if (pageLoaded && progress >= 99.6) {
      finish();
      return;
    }
    requestAnimationFrame(tick);
  };

  render(0);
  requestAnimationFrame(tick);
})();

/* ---------- Scroll Reveal ---------- */
const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -60px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ---------- Smooth scrolling for anchors ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  });
});

/* ---------- Active nav link tracking ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav a');

window.addEventListener('scroll', debounce(() => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop;
    if (window.pageYOffset >= top - 220) current = section.getAttribute('id');
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href').slice(1) === current);
  });
}, 100));

/* ---------- Proficiency bars animate on enter ---------- */
const bars = document.querySelectorAll('.proficiency-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      const w = bar.style.width || '0%';
      bar.style.width = '0%';
      requestAnimationFrame(() => { bar.style.width = w; });
      barObserver.unobserve(bar);
    }
  });
}, { threshold: 0.5 });

bars.forEach(b => barObserver.observe(b));

/* ---------- Mobile menu ---------- */
function setupMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');
  if (!hamburger || !nav) return;

  const setExpanded = (v) => hamburger.setAttribute('aria-expanded', String(v));

  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hamburger.classList.toggle('active', open);
    setExpanded(open);
  });

  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      setExpanded(false);
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('open')) return;
    const isInside = nav.contains(e.target) || hamburger.contains(e.target);
    if (!isInside) {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      setExpanded(false);
    }
  });
}
setupMobileMenu();

/* ---------- HERO Animated Background (GSAP) ---------- */
(function initHeroBg() {
  if (prefersReducedMotion) return;
  if (!window.gsap) return;

  const hero = document.querySelector('.hero');
  const heroBg = document.querySelector('.hero-bg');
  const blobs = gsap.utils.toArray('.hero-bg .blob');
  const avatar = document.querySelector('.avatar');
  if (!hero || !heroBg || blobs.length === 0) return;

  blobs.forEach((blob, i) => {
    gsap.to(blob, {
      x: () => gsap.utils.random(-170, 170),
      y: () => gsap.utils.random(-150, 150),
      scale: () => gsap.utils.random(0.9, 1.15),
      rotation: () => gsap.utils.random(-10, 10),
      duration: gsap.utils.random(8, 14),
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: i * 0.6
    });
  });

  const bgX = gsap.quickTo(heroBg, "x", { duration: 0.7, ease: "power3.out" });
  const bgY = gsap.quickTo(heroBg, "y", { duration: 0.7, ease: "power3.out" });

  const avX = avatar ? gsap.quickTo(avatar, "x", { duration: 0.6, ease: "power3.out" }) : null;
  const avY = avatar ? gsap.quickTo(avatar, "y", { duration: 0.6, ease: "power3.out" }) : null;

  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    bgX(dx * 18);
    bgY(dy * 14);
    if (avX && avY) { avX(dx * 10); avY(dy * 8); }
  });

  hero.addEventListener("mouseleave", () => {
    bgX(0); bgY(0);
    if (avX && avY) { avX(0); avY(0); }
  });
})();

/* =========================================================
   ✅ PROJECTS: render + scroll-snap slider + drag + controls
   ========================================================= */
(function initProjects() {
  const viewport = document.getElementById('projectsViewport');
  const track = document.getElementById('projectsTrack');
  const dotsWrap = document.getElementById('projectsDots');
  const prevBtn = document.getElementById('projectsPrev');
  const nextBtn = document.getElementById('projectsNext');

  if (!viewport || !track || !dotsWrap || !prevBtn || !nextBtn) return;

  const projects = [
    {
      title: "MyCinema – Cinema Web App (Now Showing & Ticket Booking Experience)",
      desc: "Cinema Booking Web App (Next.js + TMDB + VNPay + Admin Panel)",
      duration: "2 months",
      role: "Fullstack Developer",
      tech: ["Next.js", "Tailwind", "TypeScript", "TMDB API", "VNPay", "Admin Panel"],
      image: "./assets/mycinema.png", // empty => placeholder gradient
      liveUrl: "https://cinema-web-d51l.vercel.app/",
      githubUrl: "https://github.com/tranngocphat13/cinema_web"
    },
    {
      title: "E-commerce Website for Photocopiers – CMT.vn",
      desc: "A Vietnamese company that sells and rents photocopy machines and supplies.",
      duration: "3 weeks",
      role: "Front-end Developer",
      tech: ["Next.js", "Tailwind"],
      image: "./assets/cmt.png",
      liveUrl: "https://cmt.vn",
      githubUrl: "https://github.com/donhathuy521h0237/web_CMT_project"
    },
    {
      title: "Webflow Terralume Website ",
      desc: "Terralume.gr is an artisan ceramic brand specializing in handcrafted, nature-inspired pottery made in Greece.",
      duration: "10 days",
      role: "Frontend",
      tech: ["Next.js", "Tailwind", "SEO", "A/B Test"],
      image: "./assets/terralume.png",
      liveUrl: "https://terralume.gr/",
      githubUrl: "https://terralume.gr/"
    },
    {
      title: "Landing page Ippudo Ramen",
      desc: "Single-page landing site for IPPUDO Ramen Vietnam with smooth section navigation: Home/Menu/Services/Reservation/Contact.",
      duration: "3 days",
      role: "Frontend",
      tech: ["HTML", "CSS"],
      image: "./assets/ippudo.png",
      liveUrl: "https://ippudo-ramen.vercel.app/",
      githubUrl: "https://github.com/tranngocphat13/IPPUDO-RAMEN-HTML-CSS"
    },
    {
      title: "Portfolio Builder",
      desc: "Drag & drop builder to generate portfolio pages quickly with templates and export options.",
      duration: "1 weeks",
      role: "Frontend",
      tech: ["HTML", "CSS", "JS"],
      image: "./assets/portfolio.png",
      liveUrl: "https://profile-ten-beta-26.vercel.app/",
      githubUrl: "https://github.com/tranngocphat13/profile"
    }
  ];

  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));

  const makeCard = (p, index) => {
    const tech = (p.tech || []).map(t => `<span class="pbadge">${esc(t)}</span>`).join('');
    const thumb = p.image
      ? `<a class="project-thumb" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(p.title)} website">
           <img src="${esc(p.image)}" alt="${esc(p.title)} thumbnail" loading="lazy" decoding="async">
         </a>`
      : `<a class="project-thumb placeholder" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(p.title)} website"></a>`;

    return `
      <article class="project-card" data-index="${index}">
        ${thumb}
        <div class="project-body">
          <h3 class="project-title">${esc(p.title)}</h3>
          <p class="project-desc">${esc(p.desc)}</p>

          <div class="project-badges">${tech}</div>

          <div class="project-meta">
            <span><b>Duration:</b> ${esc(p.duration)}</span>
            <span><b>Role:</b> ${esc(p.role)}</span>
          </div>

          <div class="project-ctas">
            <div class="pbtns">
              <a class="pbtn pbtn-primary" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer">Live Demo</a>
              <a class="pbtn pbtn-ghost" href="${esc(p.githubUrl)}" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>

            <a class="goto-link" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Go to ${esc(p.title)} website">
              <span class="arrow">→</span>
              <span>Go to website</span>
            </a>
          </div>
        </div>
      </article>
    `;
  };

  // Render cards
  track.innerHTML = projects.map(makeCard).join('');

  // Build dots
  dotsWrap.innerHTML = projects.map((_, i) =>
    `<button class="pdot" type="button" aria-label="Go to project ${i + 1}" data-dot="${i}"></button>`
  ).join('');

  const cards = Array.from(track.querySelectorAll('.project-card'));
  const dots = Array.from(dotsWrap.querySelectorAll('.pdot'));

  let activeIndex = 0;

  const setActive = (idx) => {
    activeIndex = Math.max(0, Math.min(cards.length - 1, idx));
    cards.forEach((c, i) => c.classList.toggle('is-active', i === activeIndex));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIndex));
  };

  const scrollToIndex = (idx) => {
    const card = cards[idx];
    if (!card) return;
    const left = card.offsetLeft;
    viewport.scrollTo({
      left,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
    setActive(idx);
  };

  // IntersectionObserver for active card (root = viewport)
  const io = new IntersectionObserver((entries) => {
    // pick most visible
    let best = null;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
    }
    if (best) {
      const idx = Number(best.target.getAttribute('data-index') || 0);
      setActive(idx);
    }
  }, { root: viewport, threshold: [0.55, 0.65, 0.75] });

  cards.forEach(c => io.observe(c));

  // Prev/Next
  prevBtn.addEventListener('click', () => scrollToIndex(activeIndex - 1));
  nextBtn.addEventListener('click', () => scrollToIndex(activeIndex + 1));

  // Dots click
  dotsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.pdot');
    if (!btn) return;
    const i = Number(btn.getAttribute('data-dot'));
    scrollToIndex(i);
  });

  // Keyboard arrows when viewport focused
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToIndex(activeIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollToIndex(activeIndex + 1); }
  });

  // Drag to scroll (pointer)
  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let dragged = false;

  const onDown = (e) => {
    // ignore if clicking a link/button inside card
    if (e.target.closest('a, button')) return;

    isDown = true;
    dragged = false;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture?.(e.pointerId);

    startX = e.clientX;
    startScroll = viewport.scrollLeft;
  };

  const onMove = (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) dragged = true;
    viewport.scrollLeft = startScroll - dx;
  };

  const onUp = () => {
    if (!isDown) return;
    isDown = false;
    viewport.classList.remove('is-dragging');
  };

  viewport.addEventListener('pointerdown', onDown);
  viewport.addEventListener('pointermove', onMove);
  viewport.addEventListener('pointerup', onUp);
  viewport.addEventListener('pointercancel', onUp);
  viewport.addEventListener('pointerleave', onUp);

  // Prevent accidental click after drag
  viewport.addEventListener('click', (e) => {
    if (!dragged) return;
    const a = e.target.closest('a');
    if (a) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Init
  setActive(0);
})();

/* ---------- Contact form demo ---------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const message = document.getElementById('message')?.value?.trim();

    if (!name || !email || !message) {
      alert('Please fill in all fields');
      return;
    }

    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn?.textContent || 'Send Message';
    if (btn) btn.textContent = '✓ Sent!';

    console.log('Form submitted:', { name, email, message });
    alert(`Thanks ${name}! I'll get back to you at ${email} soon.`);
    contactForm.reset();

    setTimeout(() => { if (btn) btn.textContent = original; }, 1600);
  });
}

/* ---------- Utilities ---------- */
function debounce(func, wait) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => func.apply(this, args), wait);
  };
}

window.addEventListener('load', () => {
  console.log('%c👨‍💻 Welcome to my portfolio!', 'font-size: 16px; font-weight: 900; color: #7C5CFF;');
  console.log('%cBuilt with HTML, CSS, vanilla JS + GSAP', 'font-size: 12px; color: #A9B4CC;');
});
