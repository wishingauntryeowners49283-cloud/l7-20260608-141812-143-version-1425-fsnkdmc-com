import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(player) {
  const video = player.querySelector('video');
  const shell = player.querySelector('.video-shell');
  const playButton = player.querySelector('[data-big-play]');
  const state = player.querySelector('[data-player-state]');
  const source = player.dataset.hlsSource;

  if (!video || !source) {
    return;
  }

  function setState(message) {
    if (state) {
      state.textContent = message;
    }
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setState('就绪，点击播放');
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setState('播放源暂时不可用，请稍后重试');
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setState('就绪，点击播放');
  } else {
    setState('当前浏览器不支持 HLS 播放');
  }

  function requestPlay() {
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setState('请再次点击播放');
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', requestPlay);
  }

  video.addEventListener('play', function () {
    if (shell) {
      shell.classList.add('is-playing');
    }
    setState('正在播放');
  });

  video.addEventListener('pause', function () {
    if (shell) {
      shell.classList.remove('is-playing');
    }
    setState('已暂停');
  });

  video.addEventListener('ended', function () {
    if (shell) {
      shell.classList.remove('is-playing');
    }
    setState('播放结束');
  });
}

Array.from(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
