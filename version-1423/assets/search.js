(function () {
  const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];
  const input = document.getElementById('search-input');
  const regionSelect = document.getElementById('filter-region');
  const yearSelect = document.getElementById('filter-year');
  const typeSelect = document.getElementById('filter-type');
  const results = document.getElementById('search-results');
  const summary = document.getElementById('search-summary');
  const loadMore = document.getElementById('load-more');
  let visible = 40;
  let matched = [];

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function uniqueValues(key) {
    return Array.from(new Set(movies.map(function (movie) {
      return movie[key];
    }).filter(Boolean))).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillSelect(select, values, label) {
    if (!select) {
      return;
    }

    select.innerHTML = '<option value="all">' + label + '</option>' + values.map(function (value) {
      return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
    }).join('');
  }

  function card(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card">' +
      '<a href="video/' + escapeHtml(movie.id) + '.html" class="movie-card-link">' +
      '<div class="poster-frame">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
      '<span class="play-badge">▶</span>' +
      '</div>' +
      '<div class="movie-card-content">' +
      '<div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p>' + escapeHtml(movie.one_line) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</a>' +
      '</article>';
  }

  function getQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function filterMovies() {
    const keyword = (input.value || '').trim().toLowerCase();
    const region = regionSelect.value;
    const year = yearSelect.value;
    const type = typeSelect.value;

    matched = movies.filter(function (movie) {
      const fields = [
        movie.title,
        movie.one_line,
        movie.summary,
        movie.review,
        movie.region,
        movie.year,
        movie.type,
        movie.genre_raw,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();

      return (!keyword || fields.indexOf(keyword) !== -1) &&
        (region === 'all' || movie.region === region) &&
        (year === 'all' || movie.year === year) &&
        (type === 'all' || movie.type === type);
    });

    matched.sort(function (a, b) {
      return b.hot - a.hot || Number(a.id) - Number(b.id);
    });
  }

  function render() {
    filterMovies();
    const slice = matched.slice(0, visible);
    results.innerHTML = slice.map(card).join('');

    if (summary) {
      summary.textContent = matched.length ? '找到 ' + matched.length + ' 个结果' : '未找到相关内容';
    }

    if (loadMore) {
      loadMore.hidden = visible >= matched.length;
    }
  }

  fillSelect(regionSelect, uniqueValues('region'), '全部地区');
  fillSelect(yearSelect, uniqueValues('year'), '全部年份');
  fillSelect(typeSelect, uniqueValues('type'), '全部类型');

  const initialQuery = getQuery();

  if (initialQuery && input) {
    input.value = initialQuery;
  }

  [input, regionSelect, yearSelect, typeSelect].forEach(function (element) {
    if (!element) {
      return;
    }

    element.addEventListener('input', function () {
      visible = 40;
      render();
    });

    element.addEventListener('change', function () {
      visible = 40;
      render();
    });
  });

  if (loadMore) {
    loadMore.addEventListener('click', function () {
      visible += 40;
      render();
    });
  }

  render();
})();
