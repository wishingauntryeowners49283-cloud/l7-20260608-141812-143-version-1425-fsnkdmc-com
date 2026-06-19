(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  const filterPanels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  filterPanels.forEach(function (panel) {
    const scope = panel.parentElement || document;
    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
    const searchInput = panel.querySelector('[data-search-input]');
    const regionFilter = panel.querySelector('[data-region-filter]');
    const yearFilter = panel.querySelector('[data-year-filter]');
    const typeFilter = panel.querySelector('[data-type-filter]');
    const count = panel.querySelector('[data-visible-count]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const query = normalize(searchInput ? searchInput.value : '');
      const region = regionFilter ? regionFilter.value : 'all';
      const year = yearFilter ? yearFilter.value : 'all';
      const type = typeFilter ? typeFilter.value : 'all';
      let visible = 0;

      cards.forEach(function (card) {
        const title = normalize(card.dataset.title);
        const cardRegion = card.dataset.region || '';
        const cardYear = card.dataset.year || '';
        const cardType = card.dataset.type || '';
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type
        ].join(' '));

        const matchedQuery = !query || haystack.indexOf(query) !== -1 || title.indexOf(query) !== -1;
        const matchedRegion = region === 'all' || cardRegion === region;
        const matchedYear = year === 'all' || cardYear === year;
        const matchedType = type === 'all' || cardType === type;
        const matched = matchedQuery && matchedRegion && matchedYear && matchedType;

        card.classList.toggle('hidden-by-filter', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [searchInput, regionFilter, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
})();
