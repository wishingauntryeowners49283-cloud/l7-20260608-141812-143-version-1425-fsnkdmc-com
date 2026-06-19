(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            timer = window.setInterval(function() {
                showSlide(activeIndex + 1);
            }, 5400);
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                window.clearInterval(timer);
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var pageSearch = document.querySelector('[data-page-search]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var cardList = document.querySelector('[data-card-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (pageSearch && query) {
        pageSearch.value = query;
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cardList) {
            return;
        }
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
        var term = normalize(pageSearch ? pageSearch.value : '');
        var year = normalize(yearFilter ? yearFilter.value : '');
        var type = normalize(typeFilter ? typeFilter.value : '');
        var visible = 0;

        cards.forEach(function(card) {
            var content = normalize(card.getAttribute('data-content'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matchesTerm = !term || content.indexOf(term) !== -1;
            var matchesYear = !year || cardYear.indexOf(year) !== -1;
            var matchesType = !type || cardType.indexOf(type) !== -1;
            var shouldShow = matchesTerm && matchesYear && matchesType;
            card.classList.toggle('is-hidden-card', !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (pageSearch) {
        pageSearch.addEventListener('input', applyFilters);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }
    if (cardList) {
        applyFilters();
    }
})();
