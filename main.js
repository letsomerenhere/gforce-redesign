// NAV BAR - Desktop & Mobile Combined
document.querySelectorAll('.has-panel').forEach(item => {
  const link = item.querySelector('.top-link');
  const panel = item.querySelector('.dropdown-panel');
  let hoverTimer;

  function openMenu() { 
    clearTimeout(hoverTimer); 
    item.classList.add('open'); 
  }
  
  function closeMenu() { 
    hoverTimer = setTimeout(() => item.classList.remove('open'), 150); 
  }

  // Desktop: Hover open/close (only above 991px)
  if (window.innerWidth > 991) {
    link.addEventListener('mouseenter', openMenu);
    link.addEventListener('mouseleave', closeMenu);
    panel.addEventListener('mouseenter', openMenu);
    panel.addEventListener('mouseleave', closeMenu);
  }

  // Click handler for both desktop and mobile
  link.addEventListener('click', e => {
    console.log('Link clicked, open state:', item.classList.contains('open'));
    
    // Allow middle-click or modifier keys
    if (e.button === 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const isOpen = item.classList.contains('open');
    const isMobile = window.innerWidth <= 991;

    if (!isOpen) {
      // First click: prevent navigation and open dropdown
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('Opening dropdown');
      
      // Close all others
      document.querySelectorAll('.has-panel.open').forEach(openItem => {
        if (openItem !== item) openItem.classList.remove('open');
      });
      
      // Open this one
      item.classList.add('open');
      return;
    }

    // Second click: allow navigation
    console.log('Second click - navigating');
    // Don't prevent default - let link work
  }, { capture: true });
});
// Header theme switching
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const getThemeUnderHeader = () => {
    const y = header.offsetHeight + 1; 
    const x = Math.round(window.innerWidth / 2);
    let el = document.elementFromPoint(x, y);
    while (el && el !== document.body && !el.hasAttribute?.('data-theme')) {
      el = el.parentElement;
    }
    return el?.getAttribute?.('data-theme') || 'light';
  };

  const apply = () => {
    const theme = getThemeUnderHeader();
    header.classList.toggle('header--dark', theme === 'dark');
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    requestAnimationFrame(() => { apply(); ticking = false; });
    ticking = true;
  };

  ['scroll','resize'].forEach(evt =>
    window.addEventListener(evt, onScroll, { passive: true })
  );
  document.addEventListener('DOMContentLoaded', apply);
  apply();
})();

// HAMBURGER MENU TOGGLE
(function(){
  const header = document.querySelector('.site-header');
  const toggle = document.getElementById('navToggle');

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  header.addEventListener('click', (e) => {
    if (e.target === header && header.classList.contains('is-open')) {
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 991) {
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.querySelectorAll('.has-panel.open').forEach(item => {
        item.classList.remove('open');
      });
    }
  });
})();

// Close mobile menu when clicking sublinks
document.querySelectorAll('.dropdown-panel a').forEach(sublink => {
  sublink.addEventListener('click', () => {
    const header = document.querySelector('.site-header');
    const toggle = document.getElementById('navToggle');
    
    // Only close on mobile
    if (window.innerWidth <= 991) {
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      
      // Also close all open dropdowns
      document.querySelectorAll('.has-panel.open').forEach(item => {
        item.classList.remove('open');
      });
    }
  });
});

// Sticky label observer
(() => {
  const SECTIONS = document.querySelectorAll('.res-section');
  if (!SECTIONS.length) return;

  const onChange = (entries) => {
    entries.forEach(entry => {
      const section = entry.target;
      const label = section.querySelector('.res-label');
      if (!label) return;

      if (entry.isIntersecting) {
        document.querySelectorAll('.res-label.is-active')
          .forEach(el => el.classList.remove('is-active'));
        label.classList.add('is-active');
      }
    });
  };

  const observer = new IntersectionObserver(onChange, {
    root: null,
    rootMargin: '-96px 0px -80% 0px',
    threshold: 0
  });

  SECTIONS.forEach(sec => observer.observe(sec));
})();

// Prevent widow words
document.querySelectorAll('p').forEach(p => {
  const words = p.innerHTML.trim().split(' ');
  if (words.length > 4) {
    const lastWords = words.splice(-4).join('&nbsp;');
    p.innerHTML = words.join(' ') + ' ' + lastWords;
  }
});

// Smooth scroll with offset - MODIFIED to not interfere with top-links
(function() {
  const OFFSET = 60;
  
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    // Skip top-links in nav - they handle their own clicks
    if (link.classList.contains('top-link')) return;
    
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      const hash = href.startsWith('#') ? href : href.includes('#') ? '#' + href.split('#')[1] : null;
      
      if (hash && hash !== '#') {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.pageYOffset - OFFSET;
          window.scrollTo({ top, behavior: 'smooth' });
          history.pushState(null, null, hash);
        }
      }
    });
  });
  
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        const top = target.getBoundingClientRect().top + window.pageYOffset - OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 100);
  }
})();