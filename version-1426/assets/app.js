(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatCount(value) {
    var number = Number(value || 0);
    if (number >= 10000) {
      return (number / 10000).toFixed(1) + "万";
    }
    return String(number);
  }

  function initMobileMenu() {
    var button = qs(".mobile-menu-button");
    var menu = qs(".mobile-menu");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      menu.hidden = expanded;
    });
  }

  function initHeroSlider() {
    var hero = qs(".hero");
    if (!hero) {
      return;
    }

    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dot", hero);
    var prev = qs(".hero-control.prev", hero);
    var next = qs(".hero-control.next", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function nextSlide() {
      show(current + 1);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(nextSlide, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        nextSlide();
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide") || 0));
        restart();
      });
    });

    restart();
  }

  function initLocalFilters() {
    qsa(".local-filter-input").forEach(function (input) {
      var targetId = input.getAttribute("data-filter-target");
      var target = targetId ? document.getElementById(targetId) : null;
      if (!target) {
        return;
      }

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        qsa(".movie-card", target).forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" ").toLowerCase();
          card.hidden = keyword && haystack.indexOf(keyword) === -1;
        });
      });
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>#" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\">",
      "  <a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">",
      "    <img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.classList.add('image-failed')\">",
      "    <span class=\"play-mask\" aria-hidden=\"true\">▶</span>",
      "    <span class=\"card-category\">" + escapeHtml(movie.category) + "</span>",
      "    <span class=\"card-duration\">" + escapeHtml(movie.duration) + "</span>",
      "  </a>",
      "  <div class=\"card-body\">",
      "    <h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "    <div class=\"card-meta\"><span>" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + "</span><span>" + formatCount(movie.views) + "观看</span></div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function initSearchPage() {
    var results = qs("#search-results");
    var summary = qs("#search-summary");
    var form = qs("#advanced-search-form");
    if (!results || !summary || !form || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var keywordInput = qs("#search-keyword");
    var typeInput = qs("#search-type");
    var regionInput = qs("#search-region");
    var yearInput = qs("#search-year");
    var params = new URLSearchParams(window.location.search);

    keywordInput.value = params.get("q") || "";
    typeInput.value = params.get("type") || "";
    regionInput.value = params.get("region") || "";
    yearInput.value = params.get("year") || "";

    function matches(movie, keyword, type, region, year) {
      var haystack = [
        movie.title,
        movie.oneLine,
        movie.category,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase();

      return (!keyword || haystack.indexOf(keyword) !== -1) &&
        (!type || movie.type === type) &&
        (!region || movie.region === region) &&
        (!year || movie.year === year);
    }

    function render() {
      var keyword = keywordInput.value.trim().toLowerCase();
      var type = typeInput.value;
      var region = regionInput.value;
      var year = yearInput.value;
      var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return matches(movie, keyword, type, region, year);
      });
      var visible = matched.slice(0, 120);

      summary.textContent = "共找到 " + matched.length + " 部影片" + (matched.length > visible.length ? "，当前显示前 " + visible.length + " 部。" : "。");
      results.innerHTML = visible.map(createSearchCard).join("\n");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });

    [keywordInput, typeInput, regionInput, yearInput].forEach(function (input) {
      input.addEventListener("input", render);
      input.addEventListener("change", render);
    });

    render();
  }

  function initPlayers() {
    qsa(".player-shell").forEach(function (shell) {
      var video = qs("video", shell);
      var button = qs(".player-start", shell);
      var message = qs(".player-message", shell);
      var source = shell.getAttribute("data-video-src");
      var started = false;
      var hlsInstance = null;

      if (!video || !button || !source) {
        return;
      }

      button.addEventListener("click", function () {
        if (started) {
          video.play();
          return;
        }
        started = true;
        shell.classList.add("is-playing");

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              if (message) {
                message.textContent = "浏览器阻止了自动播放，请再次点击播放器播放。";
              }
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (message && data && data.fatal) {
              message.textContent = "播放源加载失败，请刷新页面或更换浏览器。";
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            video.play().catch(function () {
              if (message) {
                message.textContent = "浏览器阻止了自动播放，请再次点击播放器播放。";
              }
            });
          }, { once: true });
        } else if (message) {
          shell.classList.remove("is-playing");
          started = false;
          message.textContent = "当前浏览器不支持 HLS 播放，请使用 Chrome、Edge、Safari 或 Firefox 的最新版本。";
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroSlider();
    initLocalFilters();
    initSearchPage();
    initPlayers();
  });
}());
