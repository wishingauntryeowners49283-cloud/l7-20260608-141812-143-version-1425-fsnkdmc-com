(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initializeMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
    document.querySelectorAll(".mobile-panel a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    });
  }

  function initializeHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (slides.length === 0) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function initializeSearch() {
    var input = document.getElementById("siteSearch");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".search-item"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    if (!input || cards.length === 0) {
      return;
    }
    var activeFilter = "";
    var empty = document.createElement("div");
    empty.className = "search-empty";
    empty.textContent = "暂无相关作品";
    var grid = cards[0].parentElement;
    if (grid && grid.parentElement) {
      grid.parentElement.insertBefore(empty, grid.nextSibling);
    }

    function haystack(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = haystack(card);
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
        var shouldShow = matchedQuery && matchedFilter;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });
      empty.style.display = visible === 0 ? "block" : "none";
    }

    input.addEventListener("input", apply);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeFilter = chip.getAttribute("data-filter") || "";
        apply();
      });
    });
  }

  function bindStream(video, stream) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }
    if (typeof Hls !== "undefined" && Hls.isSupported()) {
      if (video.hlsInstance) {
        video.hlsInstance.destroy();
      }
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      video.hlsInstance = hls;
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }
    video.src = stream;
  }

  function initializePlayers() {
    document.querySelectorAll(".watch-player").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-layer");
      var stream = player.getAttribute("data-stream");
      if (!video || !stream) {
        return;
      }

      function play() {
        if (!player.classList.contains("is-ready")) {
          bindStream(video, stream);
          player.classList.add("is-ready");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }

      player.addEventListener("click", function () {
        if (!player.classList.contains("is-ready")) {
          play();
        }
      });
    });
  }

  onReady(function () {
    initializeMobileMenu();
    initializeHero();
    initializeSearch();
    initializePlayers();
  });
}());
