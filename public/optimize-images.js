(function () {
  function upgrade(img) {
    if (!img || img.dataset.optimized) return;
    const src = img.getAttribute("src");
    if (!src || src.startsWith("/img?")) return;

    const w = Math.ceil(img.getBoundingClientRect().width || 900);
    img.loading = img.loading || "lazy";
    img.decoding = "async";
    img.fetchPriority = "low";
    img.src = `/img?src=${encodeURIComponent(src)}&w=${w}`;
    img.dataset.optimized = "1";
  }

  // Upgrade existing images
  document.querySelectorAll("img").forEach(upgrade);

  // Upgrade images added later (when you switch categories)
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((n) => {
        if (n.tagName === "IMG") upgrade(n);
        else if (n.querySelectorAll) n.querySelectorAll("img").forEach(upgrade);
      });
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // If layout grows, request a bigger width (up to 1200)
  window.addEventListener("resize", () => {
    document.querySelectorAll("img[data-optimized]").forEach((img) => {
      const want = Math.ceil(img.getBoundingClientRect().width || 900);
      const url = new URL(img.src, location.href);
      const have = parseInt(url.searchParams.get("w") || "0", 10);
      if (want > have && want <= 1200) {
        url.searchParams.set("w", want);
        img.src = url.toString();
      }
    });
  });
})();