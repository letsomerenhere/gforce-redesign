// NAV BAR
document.querySelectorAll('.has-panel').forEach(item => {
  const link  = item.querySelector('.top-link');
  const panel = item.querySelector('.dropdown-panel');
  let hoverTimer;

  function openMenu()  { clearTimeout(hoverTimer); item.classList.add('open'); }
  function closeMenu() { hoverTimer = setTimeout(() => item.classList.remove('open'), 150); }

  // Hover open/close
  link .addEventListener('mouseenter', openMenu);
  link .addEventListener('mouseleave', closeMenu);
  panel.addEventListener('mouseenter', openMenu);
  panel.addEventListener('mouseleave', closeMenu);

  // Click: first click opens, second click navigates
  link.addEventListener('click', e => {
    // allow middle-click or modifier keys to behave normally
    if (e.button === 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const isOpen = item.classList.contains('open');

    if (!isOpen) {
      // first click just opens menu
      e.preventDefault();
      document.querySelectorAll('.has-panel.open').forEach(openItem => openItem.classList.remove('open'));
      item.classList.add('open');
      return;
    }

    // if already open, let the browser follow the link (no preventDefault)
    // optional: close other open panels before navigating
    document.querySelectorAll('.has-panel.open').forEach(openItem => openItem.classList.remove('open'));
  }, { capture: true }); // capture helps beat other handlers that might preventDefault
});

// Close all when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.has-panel')) {
    document.querySelectorAll('.has-panel.open').forEach(openItem => openItem.classList.remove('open'));
  }
});



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
  
    // Run on load, scroll, resize—throttled with rAF
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

  // HAMBURGER MENU
  (function(){
    const header = document.querySelector('.site-header');
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('primaryNav');
    const topLinks = document.querySelectorAll('.menu-root > .has-panel > .top-link');
  
    // Toggle mobile menu
    toggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  
    // Toggle dropdowns in mobile
    topLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (window.innerWidth > 991) return; // Desktop behavior
        
        e.preventDefault();
        const parent = link.parentElement;
        const isOpen = parent.classList.contains('open');
        
        // Close all others
        document.querySelectorAll('.has-panel.open').forEach(item => {
          if (item !== parent) item.classList.remove('open');
        });
        
        // Toggle current
        parent.classList.toggle('open', !isOpen);
      });
    });
  
    // Close menu when clicking overlay
    header.addEventListener('click', (e) => {
      if (e.target === header && header.classList.contains('is-open')) {
        header.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        header.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  
    // Reset on resize
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

  
//  sticky h1
  (() => {
    const SECTIONS = document.querySelectorAll('.res-section');
    if (!SECTIONS.length) return;
  
    const onChange = (entries) => {
      entries.forEach(entry => {
        const section = entry.target;
        const label = section.querySelector('.res-label');
        if (!label) return;
  
        if (entry.isIntersecting) {
          // Clear all active states
          document.querySelectorAll('.res-label.is-active')
            .forEach(el => el.classList.remove('is-active'));
          // Activate the current section label
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

  
  
  document.querySelectorAll('p').forEach(p => {
    const words = p.innerHTML.trim().split(' ');
    if (words.length > 4) {
      const lastWords = words.splice(-3).join('&nbsp;');
      p.innerHTML = words.join(' ') + ' ' + lastWords;
    }
  });
  