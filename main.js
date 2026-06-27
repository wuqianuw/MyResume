/* ─── Mobile Menu ─── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link, .btn-mobile').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─── Navbar scroll active ─── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

/* ══════════════════════════════════════════════
   GSAP ANIMATION SYSTEM
   ══════════════════════════════════════════════ */
let gsap, ScrollTrigger;

function loadGSAP() {
  return new Promise((resolve) => {
    if (window.gsap) {
      gsap = window.gsap;
      ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      resolve();
      return;
    }
    // Poll for GSAP (loaded via defer script)
    const check = () => {
      if (window.gsap) {
        gsap = window.gsap;
        ScrollTrigger = window.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

loadGSAP().then(() => {

  // ── Helper: ease tokens ──
  const E = {
    out: 'power3.out',
    inOut: 'power2.inOut',
    smooth: 'power4.out',
    slow: 'expo.out',
  };

  // ───────────────────────────
  //  1. OPENING SEQUENCE
  // ───────────────────────────
  const hero = document.querySelector('.hero');
  const videoWrap = document.querySelector('.hero-media-wrap');
  const navbar = document.getElementById('navbar');
  const badge = document.querySelector('[data-anim="badge"]');
  const heroLines = document.querySelectorAll('.hero-line-inner');
  const desc = document.querySelector('[data-anim="desc"]');
  const cta = document.querySelector('[data-anim="cta"]');

  const tl = gsap.timeline({
    defaults: { ease: E.out },
  });

  // Set initial states
  gsap.set(navbar, { y: -40, opacity: 0 });
  gsap.set(badge, { opacity: 0, y: 20 });
  gsap.set(heroLines, { y: '100%' });
  gsap.set([desc, cta], { opacity: 0, y: 24 });

  // 0 → 0.4s: video blur reveal (scale up slightly for cinematic feel)
  gsap.set(videoWrap, { scale: 1.08, filter: 'blur(16px)', opacity: 0.6 });
  tl.to(videoWrap, {
    scale: 1,
    filter: 'blur(0px)',
    opacity: 1,
    duration: 1.8,
    ease: 'power2.out',
  });

  // 0.6 → 1.0s: navbar slides down
  tl.to(navbar, { y: 0, opacity: 1, duration: 0.8 }, 0.6);

  // 0.8 → 1.3s: badge fades up
  tl.to(badge, { opacity: 1, y: 0, duration: 0.7 }, 0.9);

  // 1.3 → 2.3s: title lines — each line slides up with compression overshoot
  tl.to(heroLines, {
    y: '0%',
    duration: 1.0,
    stagger: 0.12,
    ease: 'power4.out',
  }, 1.3);

  // 2.2 → 2.7s: subtitle
  tl.to(desc, { opacity: 1, y: 0, duration: 0.7 }, 2.3);

  // 2.5 → 3.0s: cta
  tl.to(cta, { opacity: 1, y: 0, duration: 0.6 }, 2.6);

  // ───────────────────────────
  //  2. SECTION: SPLIT LABEL + BIG TITLE ENTRANCE
  // ───────────────────────────
  document.querySelectorAll('[data-section]').forEach(section => {
    const labels = section.querySelectorAll('[data-split]');

    // Collect stagger targets: either direct children of [data-stagger], or [data-stagger] elements themselves
    const staggerParents = section.querySelectorAll('[data-stagger]');
    let staggerItems = [];
    staggerParents.forEach(parent => {
      const children = parent.children;
      if (children.length) {
        staggerItems.push(...children);
      } else {
        staggerItems.push(parent);
      }
    });

    // Animate each [data-split] element
    labels.forEach(el => {
      if (el.classList.contains('contact-title')) {
        // Already pre-split in HTML, skip
        return;
      }
      wrapText(el);
    });

    // ScrollTrigger for the section
    ScrollTrigger.create({
      trigger: section,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        // Animate split elements
        const splitLines = section.querySelectorAll('.split-line-inner');
        if (splitLines.length) {
          gsap.set(splitLines, { y: '100%' });
          gsap.to(splitLines, {
            y: '0%',
            duration: 1.0,
            stagger: 0.08,
            ease: 'power4.out',
          });
        }

        // Animate stagger items
        if (staggerItems.length) {
          gsap.set(staggerItems, { opacity: 0, y: 32 });
          gsap.to(staggerItems, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
            delay: 0.35,
          });
        }

        // Parallax (subtle)
        const parallaxEl = section.querySelector('[data-parallax]');
        if (parallaxEl) {
          gsap.set(parallaxEl, { opacity: 0, y: 40 });
          gsap.to(parallaxEl, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.2 });
        }

        // Animate counters in this section
        section.querySelectorAll('.stat-number:not([data-counted])').forEach(el => {
          el.dataset.counted = 'true';
          const target = parseInt(el.dataset.target, 10);
          animateCounter(el, target);
        });

        // Image reveal
        section.querySelectorAll('[data-reveal]').forEach(el => {
          gsap.set(el, { clipPath: 'inset(0 100% 0 0)' });
          gsap.to(el, {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.9,
            ease: 'power3.inOut',
            delay: 0.3,
          });
        });
      },
    });
  });

  // ───────────────────────────
  //  3. HERO SECTION CONTENT (ScrollTrigger for subsequent visits)
  // ───────────────────────────
  // Already handled by opening timeline

  // ───────────────────────────
  //  4. COUNTER ANIMATION
  // ───────────────────────────
  function animateCounter(el, target) {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    const suffix = el.dataset.suffix || '';
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      el.textContent = current + suffix;
      if (current >= target) clearInterval(timer);
    }, duration / steps);
  }

  // ───────────────────────────
  //  5. REFRESH ScrollTrigger on load
  // ───────────────────────────
  ScrollTrigger.refresh();

}); // end loadGSAP

/* ─── Helper: wrap text chars/lines in split spans ─── */
function wrapText(el) {
  const text = el.textContent.trim();
  if (!text) return;
  el.innerHTML = `<span class="split-line"><span class="split-line-inner">${text}</span></span>`;
}
