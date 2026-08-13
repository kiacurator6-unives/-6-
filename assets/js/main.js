// THE GARAGE KEY — shared site behavior (mobile sidebar drawer + active link state)
(function () {
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  const scrim = document.getElementById('scrim');

  function closeNav() {
    if (!sidebar || !scrim) return;
    sidebar.classList.remove('open');
    scrim.classList.remove('show');
  }

  if (menuBtn && sidebar && scrim) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      scrim.classList.toggle('show');
    });
    scrim.addEventListener('click', closeNav);
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
})();
