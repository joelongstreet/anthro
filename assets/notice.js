// Translator's notice popover. Configure per page via data attributes on
// <dialog class="notice">: data-glyphs, data-decoding, data-final.
(function () {
  var dialog = document.querySelector("dialog.notice");
  if (!dialog || typeof dialog.showModal !== "function") return;

  var status = dialog.querySelector(".notice-status");
  var button = dialog.querySelector("button");
  var GLYPHS = dialog.dataset.glyphs || "⏃⏚☊⎅⟒⎎☌⊑⟟⟊☍⌰⋔⋏⍜⌿⍾⍀⌇⏁⎍⎐⍙⌖⊬⋉";
  var DECODING = dialog.dataset.decoding || "Decoding…";
  var FINAL = dialog.dataset.final || "Complete";
  var DURATION = 3200;
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var glyphs = Array.from(GLYPHS);

  // Wrap each decodable element: hidden final text holds layout,
  // a live layer shows the glyphs resolving into English.
  var targets = Array.prototype.map.call(
    dialog.querySelectorAll("[data-decode]"),
    function (el) {
      var text = el.textContent.replace(/\s+/g, " ").trim();
      el.textContent = "";
      el.classList.add("decode");
      var ghost = document.createElement("span");
      ghost.className = "ghost";
      ghost.textContent = text;
      var live = document.createElement("span");
      live.className = "live";
      live.setAttribute("aria-hidden", "true");
      el.appendChild(ghost);
      el.appendChild(live);
      return { text: text, live: live };
    }
  );

  var total = targets.reduce(function (n, t) {
    return n + t.text.length;
  }, 0);

  function glyph() {
    return glyphs[Math.floor(Math.random() * glyphs.length)];
  }

  function render(progress) {
    var revealed = Math.floor(progress * total);
    targets.forEach(function (t) {
      var out = "";
      for (var i = 0; i < t.text.length; i++) {
        var ch = t.text[i];
        out += revealed > i || ch === " " ? ch : glyph();
      }
      revealed -= t.text.length;
      t.live.textContent = out;
    });
    if (status) {
      status.textContent =
        progress < 1
          ? DECODING + " " + Math.floor(progress * 100) + "%"
          : FINAL;
    }
  }

  var start = null;
  var done = false;
  function tick(now) {
    if (done) return;
    if (start === null) start = now;
    var p = Math.min(1, (now - start) / DURATION);
    render(p);
    if (p < 1) requestAnimationFrame(tick);
  }

  function finish() {
    done = true;
    render(1);
  }

  if (button) {
    button.addEventListener("click", function () {
      dialog.close();
    });
  }
  dialog.addEventListener("close", finish);

  dialog.showModal();
  if (reduceMotion) finish();
  else requestAnimationFrame(tick);
})();
