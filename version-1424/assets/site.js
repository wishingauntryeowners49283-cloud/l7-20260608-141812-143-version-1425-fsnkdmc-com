(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  $all('img.cover-image').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-hidden');
    }, { once: true });
  });

  var menuButton = $('[data-menu-button]');
  var navLinks = $('[data-nav-links]');
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var slider = $('[data-hero-slider]');
  if (slider) {
    var slides = $all('[data-hero-slide]', slider);
    var dots = $all('[data-hero-dot]', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    var prevButton = $('[data-hero-prev]', slider);
    var nextButton = $('[data-hero-next]', slider);
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var localFilter = $('[data-local-filter]');
  if (localFilter) {
    var cards = $all('.movie-card');
    localFilter.addEventListener('input', function () {
      var value = localFilter.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('is-filtered-out', value && haystack.indexOf(value) === -1);
      });
    });
  }

  var video = $('#movie-player');
  var overlay = $('#player-overlay');
  if (video && overlay) {
    var stream = video.getAttribute('data-stream');
    var loaded = false;

    function loadAndPlay() {
      overlay.classList.add('is-hidden');
      if (!stream) {
        video.play().catch(function () {});
        return;
      }
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }
      video.play().catch(function () {});
    }

    overlay.addEventListener('click', loadAndPlay);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        loadAndPlay();
      }
    });
  }

  var searchPage = $('[data-search-page]');
  if (searchPage && window.MOVIES) {
    var keywordInput = $('#search-keyword');
    var categorySelect = $('#search-category');
    var yearSelect = $('#search-year');
    var resetButton = $('#search-reset');
    var resultBox = $('#search-results');
    var statusBox = $('#search-status');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    keywordInput.value = initialQuery;

    function card(movie) {
      return '<article class="movie-card">' +
        '<a class="poster" href="' + movie.url + '">' +
        '<img class="cover-image" src="./' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="card-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.summary) + '</p>' +
        '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
      });
    }

    function render() {
      var keyword = keywordInput.value.trim().toLowerCase();
      var category = categorySelect.value;
      var year = yearSelect.value;
      var matches = window.MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.summary, movie.category, movie.year].join(' ').toLowerCase();
        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (category && movie.category !== category) {
          return false;
        }
        if (year && String(movie.year).indexOf(year) === -1) {
          return false;
        }
        return true;
      }).slice(0, 80);
      resultBox.innerHTML = matches.map(card).join('');
      $all('img.cover-image', resultBox).forEach(function (img) {
        img.addEventListener('error', function () {
          img.classList.add('image-hidden');
        }, { once: true });
      });
      if (!keyword && !category && !year) {
        statusBox.textContent = '输入关键词或选择条件后显示匹配影片';
      } else {
        statusBox.textContent = '匹配影片：' + matches.length;
      }
    }

    [keywordInput, categorySelect, yearSelect].forEach(function (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });
    resetButton.addEventListener('click', function () {
      keywordInput.value = '';
      categorySelect.value = '';
      yearSelect.value = '';
      render();
    });
    render();
  }
})();
