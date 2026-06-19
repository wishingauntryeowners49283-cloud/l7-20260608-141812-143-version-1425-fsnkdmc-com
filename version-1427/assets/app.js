document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("img[data-fallback='poster']").forEach(function (image) {
    image.addEventListener("error", function () {
      image.style.display = "none";
    }, { once: true });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var currentSlide = 0;
  var heroTimer = null;

  function showHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  function startHeroTimer() {
    if (slides.length <= 1) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showHeroSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = Number(dot.getAttribute("data-hero-dot"));
      showHeroSlide(index);
      startHeroTimer();
    });
  });

  startHeroTimer();

  var searchPanel = document.querySelector("[data-search-panel]");

  if (searchPanel) {
    var input = searchPanel.querySelector("[data-search-input]");
    var filters = Array.prototype.slice.call(searchPanel.querySelectorAll("[data-filter]"));
    var reset = searchPanel.querySelector("[data-reset-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-results] .movie-card"));
    var count = document.querySelector("[data-search-count]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applySearch() {
      var keyword = normalize(input ? input.value : "");
      var activeFilters = {};

      filters.forEach(function (filter) {
        activeFilters[filter.getAttribute("data-filter")] = normalize(filter.value);
      });

      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-category")
        ].join(" "));

        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesFilters = Object.keys(activeFilters).every(function (key) {
          var expected = activeFilters[key];
          var actual = normalize(card.getAttribute("data-" + key));
          return !expected || actual === expected;
        });
        var shouldShow = matchesKeyword && matchesFilters;

        card.style.display = shouldShow ? "" : "none";

        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "共 " + visible + " 部影片";
      }
    }

    if (input) {
      input.addEventListener("input", applySearch);
    }

    filters.forEach(function (filter) {
      filter.addEventListener("change", applySearch);
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }

        filters.forEach(function (filter) {
          filter.value = "";
        });

        applySearch();
      });
    }

    applySearch();
  }
});
