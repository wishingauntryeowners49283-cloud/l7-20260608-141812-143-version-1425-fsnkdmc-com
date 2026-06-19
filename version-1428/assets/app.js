document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    const searchInputs = document.querySelectorAll("[data-page-search]");

    searchInputs.forEach(function (input) {
        const cards = Array.from(document.querySelectorAll("[data-filter]"));
        const empty = document.querySelector("[data-empty-result]");
        const params = new URLSearchParams(window.location.search);
        const initial = params.get("q") || "";

        if (initial) {
            input.value = initial;
        }

        function applyFilter() {
            const query = input.value.trim().toLowerCase();
            let visible = 0;

            cards.forEach(function (card) {
                const text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
                const matched = !query || text.indexOf(query) !== -1;
                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        input.addEventListener("input", applyFilter);
        applyFilter();
    });

    document.querySelectorAll(".player-shell").forEach(function (shell) {
        const video = shell.querySelector("video");
        const button = shell.querySelector(".play-overlay");
        const source = shell.getAttribute("data-stream");

        if (!video || !source) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else {
            video.src = source;
        }

        function playVideo() {
            const request = video.play();
            shell.classList.add("is-playing");

            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
            shell.classList.remove("is-playing");
        });
    });
});
