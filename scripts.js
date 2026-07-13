// ================= HEADER SCROLL STATE =================
const header = document.getElementById('site-header');
const onScroll = () => {
  if (window.scrollY > 40) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll);
onScroll();

// ================= MOBILE NAV =================
const menuBtn = document.getElementById('menu-btn');
const navLinks = document.getElementById('nav-links');

menuBtn.addEventListener('click', () => {
  const isActive = navLinks.classList.toggle('active');
  menuBtn.setAttribute('aria-expanded', isActive);
  menuBtn.innerHTML = isActive ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', false);
    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  });
});

// ================= SCROLL REVEAL (progressive enhancement) =================
// Elements are visible by default in CSS. Only if this script runs do we
// add .pre-anim (which starts them hidden) and then reveal them as they
// scroll into view. This means the page is always readable even if JS
// fails to load or run.
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealEls.length) {
  revealEls.forEach(el => el.classList.add('pre-anim'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));
}

// ================= ANIMATED COUNTERS =================
const counters = document.querySelectorAll('.counter');

const animateCounter = (el) => {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1600;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  };
  requestAnimationFrame(tick);
};

if ('IntersectionObserver' in window && counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));
}

// ================= CONTACT FORM (demo submit) =================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button');
    const original = btn.innerHTML;
    btn.innerHTML = 'Message Sent <i class="fas fa-check"></i>';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
      contactForm.reset();
    }, 2400);
  });
}

// ================= CART (demo, in-memory) =================
let cartCount = 0;
const cartBadge = document.getElementById('cart-badge');

const bumpBadge = () => {
  if (!cartBadge) return;
  cartBadge.textContent = cartCount;
  cartBadge.classList.add('show');
  cartBadge.classList.remove('bump');
  // restart the bump animation
  void cartBadge.offsetWidth;
  cartBadge.classList.add('bump');
};

document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('added')) return;
    cartCount += 1;
    bumpBadge();
    btn.classList.add('added');
    const label = btn.querySelector('.cta-label');
    const original = label ? label.textContent : null;
    if (label) label.textContent = 'Added';
    setTimeout(() => {
      btn.classList.remove('added');
      if (label && original) label.textContent = original;
    }, 1800);
  });
});

