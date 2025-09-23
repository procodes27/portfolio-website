// Basic interactivity: mobile nav toggle, smooth scroll, simple form "send" UI
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('primary-navigation');
  const year = document.getElementById('year');
  const backToTop = document.getElementById('backToTop');
  const contactForm = document.getElementById('contactForm');
  const sendBtn = document.getElementById('sendBtn');

  // Set current year in footer
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  if (navToggle && nav) {
    const setAria = (expanded) => {
      navToggle.setAttribute('aria-expanded', String(expanded));
      nav.setAttribute('aria-hidden', String(!expanded));
      document.body.style.overflow = expanded ? 'hidden' : '';
    };

    navToggle.addEventListener('click', () => {
      const willOpen = !navToggle.classList.contains('active');
      navToggle.classList.toggle('active', willOpen);
      nav.classList.toggle('active', willOpen);
      setAria(willOpen);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !navToggle.contains(e.target) && nav.classList.contains('active')) {
        navToggle.classList.remove('active');
        nav.classList.remove('active');
        setAria(false);
      }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        navToggle.classList.remove('active');
        nav.classList.remove('active');
        setAria(false);
      }
    });

    // Reset state on resize
    const resetOnResize = () => {
      if (window.innerWidth > 768) {
        navToggle.classList.remove('active');
        nav.classList.remove('active');
        setAria(false);
      }
    };
    window.addEventListener('resize', resetOnResize);
  }

  // Smooth scrolling with header offset
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const targetId = a.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const header = document.querySelector('.site-header');
      const headerHeight = header ? header.offsetHeight : 0;
      const top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - headerHeight);

      window.scrollTo({ top, behavior: 'smooth' });

      // Remove persistent focus highlight on the clicked link
      a.blur();

      // Close mobile nav after click
      if (window.innerWidth <= 768 && nav && navToggle && nav.classList.contains('active')) {
        navToggle.classList.remove('active');
        nav.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  });

  // Scroll effects: header + back-to-top + active link highlight
  const header = document.querySelector('.site-header');
  const sectionNodes = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.primary-nav a[href^="#"]');
  let ticking = false;
  const onScroll = () => {
    const y = window.pageYOffset || document.documentElement.scrollTop;

    // Header state
    if (header) header.classList.toggle('scrolled', y > 50);

    // Back to top
    if (backToTop) backToTop.classList.toggle('visible', y > 500);

    // Active link
    let current = '';
    sectionNodes.forEach(sec => {
      const top = sec.offsetTop - 160;
      const bottom = top + sec.offsetHeight;
      if (y >= top && y < bottom) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });

    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  });
  onScroll();

  // Back to top click
  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Contact form handling (basic UX)
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      if (sendBtn) {
        const original = sendBtn.innerHTML;
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        setTimeout(() => {
          contactForm.reset();
          sendBtn.disabled = false;
          sendBtn.innerHTML = original;
          alert('Thanks! Your message has been prepared.'); // keep simple and unobtrusive
        }, 1200);
      }
    });
  }

  // Animations
  initRevealAnimations();
  initCountUpStats();
  initContactHoverGlow(); // smooth glow follows cursor on contact tiles
});

function initRevealAnimations() {
  // Apply reveal to elements that don't need to preserve a parent transform
  const targets = document.querySelectorAll(
    '.skill-category, .stat, .contact-method, .about-card .card-header, .about-card .card-content, .project-thumb, .project-body, .cp-card'
  );

  targets.forEach(el => el.classList.add('will-animate'));

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => {
      el.classList.add('fade-in-up');
      el.classList.remove('will-animate');
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        entry.target.classList.remove('will-animate');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }); // reveal slightly earlier

  targets.forEach(el => observer.observe(el));
}

function initCountUpStats() {
  const nums = document.querySelectorAll('.stat-number');
  if (!nums.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      if (el.dataset.animated === 'true') {
        obs.unobserve(el);
        return;
      }
      el.dataset.animated = 'true';

      const original = el.textContent.trim();
      const hasPlus = original.endsWith('+');
      const target = parseFloat(original.replace(/[^\d.]/g, '')) || 0;

      const duration = 900; // faster (was 1200ms)
      const start = performance.now();

      const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const val = Math.floor(easeOutCubic(p) * target);
        el.textContent = `${val}${hasPlus ? '+' : ''}`;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = `${target}${hasPlus ? '+' : ''}`;
      };

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  nums.forEach(n => observer.observe(n));
}

function initContactHoverGlow() {
  // Apply glow to contact tiles, skill tiles, hero socials, and CP cards
  const tiles = document.querySelectorAll('.contact-method, .skill-category, .hero-social a, .cp-card');
  if (!tiles.length) return;

  tiles.forEach(tile => {
    let rafId = null;
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;

    const rectOf = () => tile.getBoundingClientRect();
    const toLocal = (e) => {
      const r = rectOf();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const loop = () => {
      const ease = 0.18;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      tile.style.setProperty('--px', `${currentX.toFixed(2)}px`);
      tile.style.setProperty('--py', `${currentY.toFixed(2)}px`);

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(loop);
      } else {
        rafId = null;
      }
    };

    const setTarget = (x, y) => {
      targetX = x; targetY = y;
      if (rafId == null) rafId = requestAnimationFrame(loop);
    };

    tile.addEventListener('pointerenter', (e) => {
      const { x, y } = toLocal(e);
      currentX = x; currentY = y;
      setTarget(x, y);
    }, { passive: true });

    tile.addEventListener('pointermove', (e) => {
      const { x, y } = toLocal(e);
      setTarget(x, y);
    }, { passive: true });

    tile.addEventListener('pointerleave', () => {
      const r = rectOf();
      setTarget(r.width / 2, r.height / 2);
      setTimeout(() => {
        if (rafId != null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }, 240);
    });
  });
}
