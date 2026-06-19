(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = select('.menu-toggle');
        var panel = select('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slides = selectAll('[data-hero-slide]');
        var dots = selectAll('[data-hero-dot]');
        var prev = select('[data-hero-prev]');
        var next = select('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var roots = selectAll('[data-filter-root]');
        roots.forEach(function (root) {
            var section = root.closest('section') || document;
            var grid = select('[data-card-grid]', section) || select('[data-card-grid]');
            var cards = selectAll('[data-card]', grid || section);
            var searchForm = select('[data-local-search]', root);
            var keywordInput = searchForm ? select('input[name="keyword"]', searchForm) : null;
            var filters = selectAll('[data-filter]', root);
            var sort = select('[data-sort]', root);
            var empty = select('[data-empty-state]', section) || select('[data-empty-state]');
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query && keywordInput) {
                keywordInput.value = query;
            }

            function getValue(name) {
                var field = filters.find(function (item) {
                    return item.getAttribute('data-filter') === name;
                });
                return field ? field.value : '';
            }

            function apply() {
                var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
                var region = getValue('region');
                var year = getValue('year');
                var genre = getValue('genre');
                var type = getValue('type');
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.textContent
                    ].join(' ').toLowerCase();
                    var matched = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (region && card.getAttribute('data-region') !== region) {
                        matched = false;
                    }
                    if (year && card.getAttribute('data-year') !== year) {
                        matched = false;
                    }
                    if (genre && card.getAttribute('data-genre') !== genre) {
                        matched = false;
                    }
                    if (type && card.getAttribute('data-type') !== type) {
                        matched = false;
                    }
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            function applySort() {
                if (!sort || !grid) {
                    apply();
                    return;
                }
                var mode = sort.value;
                var sorted = cards.slice().sort(function (a, b) {
                    if (mode === 'newest') {
                        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                    }
                    if (mode === 'title') {
                        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                    }
                    return Number(b.getAttribute('data-hot')) - Number(a.getAttribute('data-hot'));
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
                apply();
            }

            if (searchForm) {
                searchForm.addEventListener('submit', function (event) {
                    event.preventDefault();
                    apply();
                });
            }
            if (keywordInput) {
                keywordInput.addEventListener('input', apply);
            }
            filters.forEach(function (filter) {
                filter.addEventListener('change', apply);
            });
            if (sort) {
                sort.addEventListener('change', applySort);
            }
            applySort();
        });
    }

    function setupPlayer() {
        selectAll('[data-player]').forEach(function (player) {
            var video = select('video[data-hls]', player);
            var button = select('[data-player-start]', player);
            var status = select('[data-player-status]', player);
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-hls');
            var hls = null;
            var initialized = false;

            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }

            function initialize() {
                if (initialized) {
                    return;
                }
                initialized = true;
                setStatus('正在加载');
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('可以播放');
                    });
                    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus('网络波动，正在重连');
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus('媒体恢复中');
                            hls.recoverMediaError();
                        } else {
                            setStatus('播放出错');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        setStatus('可以播放');
                    });
                } else {
                    setStatus('当前浏览器不支持播放');
                }
            }

            function play() {
                initialize();
                var promise = video.play();
                if (promise && typeof promise.then === 'function') {
                    promise.then(function () {
                        player.classList.add('playing');
                        setStatus('正在播放');
                    }).catch(function () {
                        setStatus('点击视频继续播放');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('playing');
                setStatus('正在播放');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('playing');
                setStatus('已暂停');
            });
            video.addEventListener('ended', function () {
                player.classList.remove('playing');
                setStatus('播放结束');
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
}());
