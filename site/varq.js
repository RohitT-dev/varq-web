/*
  Varq — site script. Everything here is progressive: the pages read fine without it.
    1. theme toggle (remembered on this device only)
    2. the edge light on a legal page tracks how far you have read
    3. the contents list follows the section you are in
    4. copy-address button
*/
(function () {
  "use strict";

  var root = document.documentElement;

  // Safari before 14 only has the old addListener() on a MediaQueryList.
  function onChange(mq, fn) {
    if (mq.addEventListener) mq.addEventListener("change", fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  /* ── 1. Theme ─────────────────────────────────────────────────────────── */
  var KEY = "varq-theme";
  var COLORS = { light: "#edf1f6", dark: "#070e1b" };
  var toggle = document.getElementById("themeToggle");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function isDark() {
    return root.dataset.theme ? root.dataset.theme === "dark" : prefersDark.matches;
  }
  // The browser's own chrome (address bar) follows the page theme, including a manual choice.
  function syncChrome() {
    var color = COLORS[isDark() ? "dark" : "light"];
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      if (root.dataset.theme) metas[i].removeAttribute("media");
      metas[i].setAttribute("content", color);
    }
  }
  function syncToggle() {
    if (toggle) toggle.setAttribute("aria-pressed", isDark() ? "true" : "false");
    syncChrome();
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {}
      syncToggle();
    });
    onChange(prefersDark, syncToggle);
    syncToggle();
  }

  /* ── 2. Reading progress on the sheet's edge ──────────────────────────── */
  var sheet = document.querySelector(".sheet[data-reading]");
  var edge = sheet && sheet.querySelector(".edge");
  if (edge) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var rect = sheet.getBoundingClientRect();
      var probe = window.innerHeight * 0.55; // the line the eye rests on
      var read = (probe - rect.top) / rect.height;
      edge.style.setProperty("--read", Math.min(1, Math.max(0.04, read)).toFixed(4));
    };
    var request = function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    update();
  }

  /* ── 3. Contents: collapse on small screens, follow the reader ────────── */
  var toc = document.querySelector("details.toc");
  if (toc) {
    var wide = window.matchMedia("(min-width: 1160px)");
    var syncToc = function () {
      toc.open = wide.matches;
    };
    syncToc();
    onChange(wide, syncToc);

    // Choosing a section on a small screen closes the list. The link then disappears,
    // so hand focus to the section it pointed at instead of dropping it on the page.
    toc.addEventListener("click", function (e) {
      var link = e.target.closest && e.target.closest("a[href^='#']");
      if (!link || wide.matches) return;
      toc.open = false;
      var target = document.getElementById(link.getAttribute("href").slice(1));
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });

    var links = Array.prototype.slice.call(toc.querySelectorAll("a[href^='#']"));
    var byId = {};
    links.forEach(function (a) {
      byId[a.getAttribute("href").slice(1)] = a;
    });
    var sections = links
      .map(function (a) {
        return document.getElementById(a.getAttribute("href").slice(1));
      })
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      var current = null;
      var visible = {};
      var mark = function () {
        var id = null;
        for (var i = 0; i < sections.length; i++) {
          if (visible[sections[i].id]) {
            id = sections[i].id; // first section (in reading order) that is on screen
            break;
          }
        }
        if (!id || id === current) return;
        if (current && byId[current]) byId[current].removeAttribute("aria-current");
        byId[id].setAttribute("aria-current", "location");
        current = id;
      };
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            visible[en.target.id] = en.isIntersecting;
          });
          mark();
        },
        { rootMargin: "-12% 0px -62% 0px", threshold: 0 }
      );
      sections.forEach(function (s) {
        io.observe(s);
      });
    }
  }

  /* ── 4. Copy address ──────────────────────────────────────────────────── */
  var copyBtn = document.querySelector("[data-copy]");
  if (copyBtn) {
    var label = copyBtn.querySelector("[data-copy-label]");
    var status = document.querySelector("[data-copy-status]");
    var idle = label ? label.textContent : "";
    var timer;
    var done = function (ok) {
      var message = ok ? "Copied" : "Couldn’t copy. Select the address instead.";
      copyBtn.dataset.state = ok ? "done" : "failed";
      if (label) label.textContent = message;
      if (status) status.textContent = message; // the button's own name stays "Copy email address"
      clearTimeout(timer);
      timer = setTimeout(function () {
        delete copyBtn.dataset.state;
        if (label) label.textContent = idle;
        if (status) status.textContent = "";
      }, 2400);
    };
    var legacyCopy = function (text) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-100px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(ta);
      return ok;
    };
    copyBtn.addEventListener("click", function () {
      var text = copyBtn.getAttribute("data-copy");
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          function () {
            done(true);
          },
          function () {
            done(legacyCopy(text));
          }
        );
        return;
      }
      done(legacyCopy(text));
    });
  }
})();
