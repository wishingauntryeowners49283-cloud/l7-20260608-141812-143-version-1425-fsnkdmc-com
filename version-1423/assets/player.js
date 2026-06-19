(function () {
  const players = document.querySelectorAll('.video-player');

  players.forEach(function (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');
    const source = player.getAttribute('data-source');
    let attached = false;
    let hls = null;

    function attachSource() {
      if (attached || !video || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      attached = true;
    }

    function beginPlayback() {
      attachSource();
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', beginPlayback);
    }

    if (video) {
      video.addEventListener('click', beginPlayback);
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
