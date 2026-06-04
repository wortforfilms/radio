const surfaceById = (id) => document.getElementById(id);

function fillBars(id, count = 28) {
  const target = surfaceById(id);
  if (!target) return;
  target.innerHTML = Array.from({ length: count }, (_, index) => {
    const height = 18 + Math.abs(Math.sin(index * 0.46)) * 92;
    return `<i style="height:${height}px;animation-delay:${(index % 6) * 0.08}s"></i>`;
  }).join("");
}

function drawSurfaceVisualizer(id = "surfaceCanvas") {
  const canvas = surfaceById(id);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let tick = 0;
  function frame() {
    tick += 0.03;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 20, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    grad.addColorStop(0, "rgba(0,245,212,.34)");
    grad.addColorStop(1, "rgba(5,11,16,1)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 92; i += 1) {
      const x = (i / 91) * canvas.width;
      const h = Math.abs(Math.sin(i * 0.24 + tick)) * 250 + 20;
      ctx.fillStyle = i % 3 ? "rgba(0,245,212,.7)" : "rgba(255,107,53,.72)";
      ctx.fillRect(x, canvas.height / 2 - h / 2, canvas.width / 130, h);
    }
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 180; i += 1) {
      const x = (i / 179) * canvas.width;
      const y = canvas.height / 2 + Math.sin(i * 0.16 + tick * 2) * 74 + Math.cos(i * 0.04 - tick) * 32;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    requestAnimationFrame(frame);
  }
  frame();
}

function bindSurfaceControls() {
  document.querySelectorAll("[data-toggle-active]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.toggleActive;
      document.querySelectorAll(`[data-toggle-active="${group}"]`).forEach((item) => item.classList.remove("primary"));
      button.classList.add("primary");
    });
  });

  document.querySelectorAll("[data-scene]").forEach((button) => {
    button.addEventListener("click", () => {
      const status = surfaceById("visualizerStatus");
      if (status) status.textContent = `Scene: ${button.dataset.scene} · Input: local/browser · Verification: draft`;
    });
  });

  const clock = surfaceById("surfaceClock");
  if (clock) {
    setInterval(() => {
      clock.textContent = `${new Date().toTimeString().split(" ")[0]} DRAFT`;
    }, 1000);
  }

  const speak = surfaceById("speakBtn");
  if (speak) {
    speak.addEventListener("click", () => {
      const status = surfaceById("ttsStatus");
      if (status) status.textContent = "SPEAKING · LOCAL BROWSER TTS · SERVER AUDIO EVIDENCE NULL";
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
        speechSynthesis.speak(new SpeechSynthesisUtterance("Radio Vaigyaaniq local draft announcement. Server audio evidence NULL."));
      }
    });
  }

  const stop = surfaceById("stopBtn");
  if (stop) {
    stop.addEventListener("click", () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      const status = surfaceById("ttsStatus");
      if (status) status.textContent = "STOPPED · LOCAL BROWSER TTS";
    });
  }

  const mark = surfaceById("markLine");
  if (mark) {
    mark.addEventListener("click", () => {
      const line = surfaceById("lyricDraft")?.value || "NULL";
      const list = surfaceById("lyricList");
      if (list) list.innerHTML = `<span class="surface-label">Cue List</span><p>[00:00.00] ${line}</p><small>DRAFT · VERIFIED NULL</small>`;
    });
  }

  const gift = surfaceById("giftBtn");
  const modal = surfaceById("giftModal");
  const close = surfaceById("closeGift");
  if (gift && modal) gift.addEventListener("click", () => modal.classList.add("active"));
  if (close && modal) close.addEventListener("click", () => modal.classList.remove("active"));
  if (modal) modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("active");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fillBars("surfaceBars", 28);
  drawSurfaceVisualizer("surfaceCanvas");
  bindSurfaceControls();
});
