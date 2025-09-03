document.addEventListener("DOMContentLoaded", () => {
  const allAudioElements = [];

  // Helper function to format time from seconds to MM:SS
  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Set up each voice-over item
  document.querySelectorAll(".vo-item").forEach(item => {
    const audio = item.querySelector("audio");
    const playPauseBtn = item.querySelector(".play-pause-btn");
    const progressBar = item.querySelector(".progress-bar");
    const progressBarFill = item.querySelector(".progress-bar-fill");
    const durationEl = item.querySelector(".duration");
    
    allAudioElements.push(audio);

    // 1. Automatic Duration Detection
    audio.addEventListener("loadedmetadata", () => {
      durationEl.textContent = formatDuration(audio.duration);
    });

    // 2. Play/Pause Logic
    playPauseBtn.addEventListener("click", () => {
      const isPlaying = item.classList.contains("playing");
      
      if (isPlaying) {
        audio.pause();
      } else {
        // Pause all other audio elements first
        allAudioElements.forEach(otherAudio => {
          if (otherAudio !== audio) {
            otherAudio.pause();
          }
        });
        audio.play();
      }
    });

    audio.addEventListener("play", () => {
      // Remove 'playing' from all other items
      document.querySelectorAll('.vo-item.playing').forEach(p => p.classList.remove('playing'));
      item.classList.add("playing");
    });

    audio.addEventListener("pause", () => {
      item.classList.remove("playing");
    });

    // 3. Progress Bar Update
    audio.addEventListener("timeupdate", () => {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progressBarFill.style.width = `${progressPercent}%`;
      // Optional: update current time display if you add one
    });

    // 4. Seek/Scrub on Progress Bar Click
    progressBar.addEventListener("click", (e) => {
      const barWidth = progressBar.clientWidth;
      const clickX = e.offsetX;
      const seekTime = (clickX / barWidth) * audio.duration;
      audio.currentTime = seekTime;
    });

    // Reset when audio finishes
    audio.addEventListener("ended", () => {
      item.classList.remove("playing");
      progressBarFill.style.width = '0%';
      audio.currentTime = 0;
    });
  });

  // Handle "See more" buttons
  const seeBtns = document.querySelectorAll(".see-more");
  seeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const actorId = btn.dataset.for;
      const actor = document.getElementById(actorId);
      if (!actor) return;

      const list = actor.querySelector(".vo-list");
      const chunk = Number(list.dataset.chunk) || 3;
      const items = Array.from(list.querySelectorAll(".vo-item"));
      const hidden = items.filter(it => !it.classList.contains("visible"));

      if (hidden.length === 0) {
        // This logic is now changed to simply show all, or you can keep the reset behavior
        // For simplicity, let's just hide the button if everything is visible.
        return;
      }

      // reveal next chunk
      hidden.slice(0, chunk).forEach(it => it.classList.add("visible"));
      if (items.filter(it => !it.classList.contains("visible")).length === 0) {
        btn.style.display = "none";
      }
    });
  });

  // Hide "See more" if not needed initially
  document.querySelectorAll(".actor").forEach(actor => {
    const list = actor.querySelector(".vo-list");
    const chunk = Number(list.dataset.chunk) || 3;
    const items = list.querySelectorAll(".vo-item");
    const btn = actor.querySelector(".see-more");
    if (items.length <= chunk && btn) {
      btn.style.display = "none";
    }
  });
});