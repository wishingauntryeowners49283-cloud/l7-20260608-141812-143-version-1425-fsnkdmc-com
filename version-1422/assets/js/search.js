(function () {
  const data = window.MOVIE_SEARCH_DATA || [];
  const app = document.querySelector('[data-search-app]');

  if (!app) {
    return;
  }

  const input = app.querySelector('[data-global-search-input]');
  const regionFilter = app.querySelector('[data-global-region-filter]');
  const yearFilter = app.querySelector('[data-global-year-filter]');
  const typeFilter = app.querySelector('[data-global-type-filter]');
  const results = app.querySelector('[data-global-results]');
  const count = app.querySelector('[data-global-count]');
  const params = new URLSearchParams(window.location.search);

  function uniqueSorted(values, compare) {
    return Array.from(new Set(values.filter(Boolean))).sort(compare);
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cardTemplate(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-card-link" href="' + escapeHtml(movie.url) + '">',
      '    <div class="poster-frame poster-fallback-' + (Number(movie.cover.replace(/\D/g, '')) % 8) + '">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="poster-img" loading="lazy" onerror="this.classList.add(\'is-missing\');">',
      '      <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '      <span class="poster-hot">热度 ' + escapeHtml(movie.hot) + '</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine || movie.summary) + '</p>',
      '      <div class="movie-meta-line">',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '      </div>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function applySearch() {
    const query = normalize(input ? input.value : '');
    const region = regionFilter ? regionFilter.value : 'all';
    const year = yearFilter ? yearFilter.value : 'all';
    const type = typeFilter ? typeFilter.value : 'all';

    const matched = data.filter(function (movie) {
      const haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.oneLine,
        movie.summary,
        (movie.tags || []).join(' ')
      ].join(' '));

      const matchedQuery = !query || haystack.indexOf(query) !== -1;
      const matchedRegion = region === 'all' || movie.region === region;
      const matchedYear = year === 'all' || movie.year === year;
      const matchedType = type === 'all' || movie.type === type;

      return matchedQuery && matchedRegion && matchedYear && matchedType;
    }).slice(0, 200);

    if (results) {
      results.innerHTML = matched.map(cardTemplate).join('');
    }

    if (count) {
      count.textContent = String(matched.length);
    }
  }

  fillSelect(regionFilter, uniqueSorted(data.map(function (movie) { return movie.region; })));
  fillSelect(yearFilter, uniqueSorted(data.map(function (movie) { return movie.year; }), function (a, b) {
    return Number(String(b).replace(/\D/g, '')) - Number(String(a).replace(/\D/g, ''));
  }));
  fillSelect(typeFilter, uniqueSorted(data.map(function (movie) { return movie.type; })));

  if (input && params.get('q')) {
    input.value = params.get('q');
  }

  [input, regionFilter, yearFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applySearch);
      control.addEventListener('change', applySearch);
    }
  });

  applySearch();
})();
