
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function createResultItem(movie) {
        var item = document.createElement('a');
        item.className = 'search-result-item';
        item.href = movie.url;

        var image = document.createElement('img');
        image.src = movie.poster;
        image.alt = movie.title;
        image.loading = 'lazy';

        var textBox = document.createElement('span');
        var title = document.createElement('strong');
        title.textContent = movie.title;
        var meta = document.createElement('span');
        meta.textContent = [movie.year, movie.region, movie.type, movie.genre].filter(Boolean).join(' · ');

        textBox.appendChild(title);
        textBox.appendChild(meta);
        item.appendChild(image);
        item.appendChild(textBox);
        return item;
    }

    function initSearch() {
        var forms = document.querySelectorAll('.nav-search, .big-search');
        forms.forEach(function (form) {
            var input = form.querySelector('.site-search-input');
            var results = form.querySelector('.site-search-results');
            if (!input || !results || !Array.isArray(window.SITE_MOVIES)) {
                return;
            }

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var first = results.querySelector('a');
                if (first) {
                    window.location.href = first.href;
                }
            });

            input.addEventListener('input', function () {
                var query = normalize(input.value);
                results.innerHTML = '';

                if (query.length < 1) {
                    results.classList.remove('is-open');
                    return;
                }

                var matches = window.SITE_MOVIES.filter(function (movie) {
                    var haystack = [
                        movie.title,
                        movie.year,
                        movie.region,
                        movie.type,
                        movie.genre,
                        movie.oneLine,
                        (movie.tags || []).join(' ')
                    ].join(' ').toLowerCase();
                    return haystack.indexOf(query) !== -1;
                }).slice(0, 18);

                matches.forEach(function (movie) {
                    results.appendChild(createResultItem(movie));
                });

                results.classList.toggle('is-open', matches.length > 0);
            });

            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    results.classList.remove('is-open');
                }
            });
        });
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }

        button.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var slider = document.querySelector('.hero-slider');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var previous = slider.querySelector('.hero-control.prev');
        var next = slider.querySelector('.hero-control.next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
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

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        restart();
    }

    function initLocalFilters() {
        var grids = document.querySelectorAll('.filter-grid');
        grids.forEach(function (grid) {
            var section = grid.closest('.section-shell');
            if (!section) {
                return;
            }
            var input = section.querySelector('.local-filter-input');
            var buttons = Array.prototype.slice.call(section.querySelectorAll('.filter-button'));
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var activeType = 'all';

            function apply() {
                var query = input ? normalize(input.value) : '';
                cards.forEach(function (card) {
                    var cardType = card.getAttribute('data-type') || '';
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.textContent
                    ].join(' '));
                    var typeMatch = activeType === 'all' || cardType === activeType;
                    var textMatch = !query || text.indexOf(query) !== -1;
                    card.classList.toggle('is-hidden', !(typeMatch && textMatch));
                });
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeType = button.getAttribute('data-filter') || 'all';
                    buttons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    apply();
                });
            });

            if (input) {
                input.addEventListener('input', apply);
            }
        });
    }

    function initPlayers() {
        var frames = document.querySelectorAll('.player-frame');
        frames.forEach(function (frame) {
            var video = frame.querySelector('video');
            var overlay = frame.querySelector('.player-overlay');
            var stream = frame.getAttribute('data-stream');
            var started = false;
            var hlsInstance = null;

            if (!video || !overlay || !stream) {
                return;
            }

            function start() {
                if (!started) {
                    started = true;
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: false
                        });
                        hlsInstance.loadSource(stream);
                        hlsInstance.attachMedia(video);
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = stream;
                    } else {
                        video.src = stream;
                    }
                }

                overlay.classList.add('is-hidden');
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            }

            overlay.addEventListener('click', start);
            frame.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    start();
                }
            });
            frame.setAttribute('tabindex', '0');

            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initLocalFilters();
        initPlayers();
    });
})();
