// THE GARAGE KEY — shared site behavior (top nav dropdown + active link state)
(function () {
  const navList = document.getElementById('navList');
  const menuBtn = document.getElementById('menuBtn');

  function closeNav() {
    if (!navList) return;
    navList.classList.remove('open');
  }

  if (menuBtn && navList) {
    menuBtn.addEventListener('click', () => {
      navList.classList.toggle('open');
    });
  }

  // Mark the current page's nav link as active by comparing file names.
  // Works regardless of relative path depth (index.html vs chapters/xx.html).
  const links = document.querySelectorAll('#navList a');
  const current = location.pathname.split('/').pop() || 'index.html';

  links.forEach((a) => {
    const href = a.getAttribute('href') || '';
    const target = href.split('/').pop();
    if (target === current) {
      a.classList.add('active');
    }
    a.addEventListener('click', closeNav);
  });

  // close the mobile dropdown if the viewport is resized back to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 880) closeNav();
  });
})();
