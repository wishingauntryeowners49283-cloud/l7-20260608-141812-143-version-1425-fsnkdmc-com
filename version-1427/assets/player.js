import { H as Hls } from "./hls.js";

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("video[data-hls-src]").forEach(function (video) {
    var source = video.getAttribute("data-hls-src");
    var card = video.closest("[data-player-card]");
    var trigger = card ? card.querySelector("[data-player-trigger]") : null;
    var hlsInstance = null;
    var initialized = false;

    function initializePlayer() {
      if (initialized || !source) {
        return;
      }

      initialized = true;

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      }
    }

    function startPlayback() {
      initializePlayer();

      if (card) {
        card.classList.add("is-playing");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (card) {
            card.classList.remove("is-playing");
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", function () {
      initializePlayer();

      if (card) {
        card.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", function () {
      if (card && video.currentTime === 0) {
        card.classList.remove("is-playing");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
});
