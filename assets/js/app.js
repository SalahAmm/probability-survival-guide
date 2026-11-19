(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function renderMath() {
    if (typeof window.renderMathInElement !== "function") {
      return;
    }

    window.renderMathInElement(document.body, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false,
      strict: false,
      errorColor: "#b84b2c",
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"]
    });
  }

  renderMath();

  var body = document.body;
  var menuButton = document.getElementById("menuButton");
  var sidebar = document.getElementById("sidebar");
  var sidebarScrim = document.getElementById("sidebarScrim");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var mobileQuery = window.matchMedia("(max-width: 980px)");
  var lastMenuTrigger = null;

  function setMenu(open, restoreFocus) {
    if (!menuButton || !sidebar) {
      return;
    }

    body.classList.toggle("nav-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");

    if (open) {
      lastMenuTrigger = document.activeElement;
      var focusTarget = sidebar.querySelector(".nav-link.is-active") || sidebar.querySelector(".nav-link");
      window.setTimeout(function () {
        if (focusTarget) {
          focusTarget.focus({ preventScroll: true });
        }
      }, reduceMotion ? 0 : 220);
    } else if (restoreFocus && lastMenuTrigger instanceof HTMLElement) {
      lastMenuTrigger.focus({ preventScroll: true });
    }
  }

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      setMenu(!body.classList.contains("nav-open"), true);
    });
  }

  if (sidebarScrim) {
    sidebarScrim.addEventListener("click", function () {
      setMenu(false, true);
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (mobileQuery.matches) {
        setMenu(false, false);
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && body.classList.contains("nav-open")) {
      setMenu(false, true);
    }
  });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", function (event) {
      if (!event.matches) {
        setMenu(false, false);
      }
    });
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(function (event) {
      if (!event.matches) {
        setMenu(false, false);
      }
    });
  }

  var readProgress = document.getElementById("readProgress");
  var toTop = document.getElementById("toTop");
  var sectionTargets = navLinks
    .map(function (link) {
      return document.getElementById(link.getAttribute("data-nav"));
    })
    .filter(Boolean);
  var scrollTicking = false;

  function updateScrollUI() {
    var scrollTop = window.scrollY || window.pageYOffset;
    var docHeight = document.documentElement.scrollHeight;
    var viewport = window.innerHeight;
    var maxScroll = Math.max(1, docHeight - viewport);
    var percent = Math.min(1, Math.max(0, scrollTop / maxScroll));

    if (readProgress) {
      readProgress.style.width = (percent * 100).toFixed(2) + "%";
    }

    if (toTop) {
      toTop.hidden = scrollTop < 720;
    }

    if (sectionTargets.length) {
      var probe = scrollTop + Math.min(190, viewport * 0.24);
      var activeId = sectionTargets[0].id;

      sectionTargets.forEach(function (section) {
        if (section.offsetTop <= probe) {
          activeId = section.id;
        }
      });

      if (scrollTop + viewport >= docHeight - 4) {
        activeId = sectionTargets[sectionTargets.length - 1].id;
      }

      navLinks.forEach(function (link) {
        var active = link.getAttribute("data-nav") === activeId;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    scrollTicking = false;
  }

  function requestScrollUpdate() {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollUI);
    }
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  updateScrollUI();

  var printButton = document.getElementById("printButton");
  var printCheat = document.getElementById("printCheat");
  [printButton, printCheat].forEach(function (button) {
    if (button) {
      button.addEventListener("click", function () {
        window.print();
      });
    }
  });

  var planKey = "probability-survival-plan-v1";
  var planCheckboxes = Array.prototype.slice.call(document.querySelectorAll("[data-plan-step]"));
  var planBar = document.getElementById("planBar");
  var planBarInline = document.getElementById("planBarInline");
  var planPercent = document.getElementById("planPercent");
  var planPercentInline = document.getElementById("planPercentInline");
  var planCount = document.getElementById("planCount");
  var planCountInline = document.getElementById("planCountInline");
  var resetPlan = document.getElementById("resetPlan");

  function readPlan() {
    try {
      var stored = window.localStorage.getItem(planKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  function savePlan(state) {
    try {
      window.localStorage.setItem(planKey, JSON.stringify(state));
    } catch (error) {
      return;
    }
  }

  function updatePlan() {
    var complete = 0;
    var state = {};

    planCheckboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        complete += 1;
        state[checkbox.getAttribute("data-plan-step")] = true;
      }
    });

    var total = planCheckboxes.length;
    var percent = total ? Math.round((complete / total) * 100) : 0;
    var text = complete + " of " + total + " blocks complete";

    if (planBar) {
      planBar.style.width = percent + "%";
    }
    if (planBarInline) {
      planBarInline.style.width = percent + "%";
    }
    if (planPercent) {
      planPercent.textContent = percent + "%";
    }
    if (planPercentInline) {
      planPercentInline.textContent = percent + "%";
    }
    if (planCount) {
      planCount.textContent = text;
    }
    if (planCountInline) {
      planCountInline.textContent = text;
    }

    savePlan(state);
  }

  var savedPlan = readPlan();
  planCheckboxes.forEach(function (checkbox) {
    checkbox.checked = Boolean(savedPlan[checkbox.getAttribute("data-plan-step")]);
    checkbox.addEventListener("change", updatePlan);
  });

  if (planCheckboxes.length) {
    updatePlan();
  }

  if (resetPlan) {
    resetPlan.addEventListener("click", function () {
      planCheckboxes.forEach(function (checkbox) {
        checkbox.checked = false;
      });
      updatePlan();
      if (planCheckboxes[0]) {
        planCheckboxes[0].focus({ preventScroll: true });
      }
    });
  }

  var timerDisplay = document.getElementById("timerDisplay");
  var timerToggle = document.getElementById("timerToggle");
  var timerReset = document.getElementById("timerReset");
  var timerStatus = document.getElementById("timerStatus");
  var timerCard = document.getElementById("timerCard");
  var duration = 40 * 60 * 1000;
  var remaining = duration;
  var endAt = 0;
  var timerId = null;
  var timerRunning = false;

  function formatTime(milliseconds) {
    var totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function paintTimer() {
    if (timerDisplay) {
      timerDisplay.textContent = formatTime(remaining);
    }
  }

  function clearTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function markTimerState(state) {
    if (!timerCard) {
      return;
    }
    timerCard.classList.toggle("is-running", state === "running");
    timerCard.classList.toggle("is-finished", state === "finished");

    if (timerStatus) {
      timerStatus.textContent =
        state === "running" ? "Running" :
        state === "paused" ? "Paused" :
        state === "finished" ? "Time's up" :
        "Ready";
    }

    if (timerToggle) {
      timerToggle.textContent =
        state === "running" ? "Pause timer" :
        state === "paused" ? "Resume timer" :
        state === "finished" ? "Restart timer" :
        "Start timer";
    }
  }

  function tickTimer() {
    remaining = Math.max(0, endAt - Date.now());
    paintTimer();

    if (remaining <= 0) {
      clearTimer();
      timerRunning = false;
      markTimerState("finished");
    }
  }

  function startTimer() {
    if (timerRunning) {
      return;
    }

    if (remaining <= 0) {
      remaining = duration;
    }

    endAt = Date.now() + remaining;
    timerRunning = true;
    markTimerState("running");
    clearTimer();
    timerId = window.setInterval(tickTimer, 250);
    tickTimer();
  }

  function pauseTimer() {
    remaining = Math.max(0, endAt - Date.now());
    timerRunning = false;
    clearTimer();
    paintTimer();
    markTimerState("paused");
  }

  function resetTimer() {
    clearTimer();
    timerRunning = false;
    remaining = duration;
    paintTimer();
    markTimerState("ready");
  }

  if (timerStatus) {
    timerStatus.setAttribute("aria-live", "polite");
  }

  if (timerToggle) {
    timerToggle.addEventListener("click", function () {
      if (timerRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });
  }

  if (timerReset) {
    timerReset.addEventListener("click", resetTimer);
  }

  if (timerDisplay) {
    paintTimer();
    markTimerState("ready");
  }

  var answerToggle = document.getElementById("answerToggle");
  var answerKey = document.getElementById("answerKey");

  if (answerToggle && answerKey) {
    answerToggle.addEventListener("click", function () {
      var willOpen = answerKey.hidden;
      answerKey.hidden = !willOpen;
      answerToggle.setAttribute("aria-expanded", String(willOpen));

      var label = answerToggle.querySelector("span");
      if (label) {
        label.textContent = willOpen ? "Hide warm-up key" : "Reveal warm-up key";
      }

      if (willOpen) {
        updateScrollUI();
        window.setTimeout(function () {
          var top = answerKey.getBoundingClientRect().top + window.scrollY - 26;
          if (mobileQuery.matches) {
            top -= 58;
          }
          window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
        }, 40);
      }
    });
  }

  var practiceSolutionsToggle = document.getElementById("practiceSolutionsToggle");
  var practiceSolutions = document.getElementById("practice-solutions");

  if (practiceSolutionsToggle && practiceSolutions) {
    practiceSolutionsToggle.addEventListener("click", function () {
      var willOpen = practiceSolutions.hidden;
      practiceSolutions.hidden = !willOpen;
      practiceSolutionsToggle.setAttribute("aria-expanded", String(willOpen));

      var label = practiceSolutionsToggle.querySelector("span");
      if (label) {
        label.textContent = willOpen ? "Hide practice solutions" : "Reveal practice solutions";
      }

      if (willOpen) {
        updateScrollUI();
        window.setTimeout(function () {
          var top = practiceSolutions.getBoundingClientRect().top + window.scrollY - 26;
          if (mobileQuery.matches) {
            top -= 58;
          }
          window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
        }, 40);
      }
    });
  }

  var copyCheatButton = document.getElementById("copyCheat");
  var copyCheatLabel = document.getElementById("copyCheatLabel");
  var copyLabel = copyCheatLabel ? copyCheatLabel.textContent : "Copy as text";

  var cheatSheetText = [
    "PROBABILITY SURVIVAL GUIDE — CHEAT SHEET",
    "",
    "[1] COUNTING",
    "• Codes (repeats OK, order matters): n^k",
    "• Lineup (no repeats, order matters): n!",
    "• Glued pairs (k pairs of size 2): k! × (2!)^k",
    "• Grab a handful (order does not matter): nCr = n! / [k!(n-k)!]",
    "",
    "[2] PROBABILITY & BAYES",
    "• Complement: P(A̅) = 1 - P(A)",
    "• Union: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)",
    "• Independent check: P(A ∩ B) = P(A) × P(B)",
    "• Total probability: P(D) = Σ P(Ai) × P(D|Ai)",
    "• Bayes: P(Ai|D) = [P(Ai) × P(D|Ai)] / P(D)",
    "",
    "[3] DISCRETE RANDOM VARIABLE X",
    "• Sum of probabilities = 1: Σ p_i = 1",
    "• CDF: F(x) = P(X ≤ x)  [intervals are a ≤ x < b]",
    "• Interval: P(a < X ≤ b) = F(b) - F(a)",
    "• Upper tail: P(X > a) = 1 - F(a)",
    "• E(X) = Σ x_i × p_i",
    "• E(X²) = Σ (x_i)² × p_i",
    "• Var(X) = E(X²) - [E(X)]²",
    "• σ(X) = √Var(X)",
    "• E(aX + b) = aE(X) + b",
    "• Var(aX + b) = a² Var(X)",
    "",
    "[4] NAMED LAWS",
    "• Binomial B(n, p): fixed n tries, Yes/No probability p",
    "  P(X=k) = C(n,k) × p^k × (1-p)^(n-k)",
    "  E(X) = np  |  Var(X) = np(1-p)",
    "• Poisson P(λ): average rate λ per interval (SCALE λ if time changes)",
    "  P(X=k) = e^(-λ) × λ^k / k!",
    "  E(X) = λ  |  Var(X) = λ",
    "• Approximation: if n ≥ 30 and p ≤ 0.1 (np < 5), B(n,p) ≈ P(λ = np)"
  ].join("\n");

  function legacyCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    document.body.removeChild(textarea);
    return copied;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return legacyCopy(text);
      });
    }

    return Promise.resolve(legacyCopy(text));
  }

  if (copyCheatButton) {
    copyCheatButton.addEventListener("click", function () {
      copyText(cheatSheetText).then(function (copied) {
        copyCheatButton.classList.toggle("is-copied", copied);
        if (copyCheatLabel) {
          copyCheatLabel.textContent = copied ? "Copied to clipboard" : "Copy failed";
        }
        window.setTimeout(function () {
          copyCheatButton.classList.remove("is-copied");
          if (copyCheatLabel) {
            copyCheatLabel.textContent = copyLabel;
          }
        }, 2200);
      });
    });
  }
})();
