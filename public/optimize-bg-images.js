// public/optimize-bg-images.js
(function () {
  const MAX_W = 1200, MIN_W = 320;

  function parseBg(urlStr) {
    const m = urlStr && urlStr.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m ? m[1] : null;
  }

  function wantWidth(el) {
    const rect = el.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.ceil((rect.width || 600) * dpr);
    return Math.min(MAX_W, Math.max(MIN_W, w));
  }

  function upgrade(el) {
    if (!el || el.dataset.bgOptimized === "1") return;

    const cs = getComputedStyle(el);
    const bg = cs.backgroundImage;
    const src = parseBg(bg);
    if (!src || src.startsWith("data:") || src.startsWith("/img?")) return;

    const w = wantWidth(el);
    el.style.backgroundImage = `url(/img?src=${encodeURIComponent(src)}&w=${w})`;
    el.dataset.bgOptimized = "1";
  }

  // Observe elements entering viewport
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) upgrade(e.target);
    });
  }, { rootMargin: "600px" }); // prefetch a bit before visible

  // Attach observer to existing elements that have a background image
  function scan(root = document) {
    const all = root.querySelectorAll("*");
    all.forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none") io.observe(el);
    });
  }
  scan();

  // Watch DOM for newly added nodes (e.g., when switching categories)
  const mo = new MutationObserver(muts => {
    for (const m of muts) {
      m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (getComputedStyle(n).backgroundImage !== "none") io.observe(n);
        // also check descendants
        if (n.querySelectorAll) {
          n.querySelectorAll("*").forEach(el => {
            if (getComputedStyle(el).backgroundImage !== "none") io.observe(el);
          });
        }
      });
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // If an optimized element grows, request a larger width
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll("[data-bg-optimized='1']").forEach(el => {
        const url = parseBg(getComputedStyle(el).backgroundImage);
        if (!url || !url.includes("/img?")) return;
        const u = new URL(url, location.href);
        const have = parseInt(u.searchParams.get("w") || "0", 10);
        const need = wantWidth(el);
        if (need > have && need <= MAX_W) {
          u.searchParams.set("w", need);
          el.style.backgroundImage = `url(${u.toString()})`;
        }
      });
    }, 200);
  });
})();