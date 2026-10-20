/* 펼침면 띠: 좌우 넘김·위치 표시·목차/대표 숫자에서 해당 면으로 이동. 내용은 정적 HTML이라 이 스크립트가 없어도 모두 읽힌다. */
(function () {
  "use strict";
  try {
    var d = document, root = d.documentElement;
    root.classList.add("js");
    var strip = d.getElementById("strip"), works = d.getElementById("works");
    if (!strip || !works) return;
    var sps = [].slice.call(strip.querySelectorAll(".sp"));
    var ctrl = d.getElementById("ctrl"), pos = d.getElementById("pos"), posk = d.getElementById("posk");
    var prev = d.getElementById("prev"), next = d.getElementById("next"), live = d.getElementById("live");
    var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var n = sps.length, cur = -1, raf = 0;
    if (!n) return;
    ctrl.hidden = false;
    // 키보드는 띠의 방향키와 위쪽 막대 버튼으로 넘긴다: 면마다 있는 이전/다음 링크는 탭 순서에서 뺀다
    [].forEach.call(strip.querySelectorAll(".pager a"), function (a) { a.tabIndex = -1; });
    function p2(x) { return (x < 10 ? "0" : "") + x; }
    // 휴대폰에서는 다음 면 가장자리가 보이도록 면이 띠보다 조금 좁다: 한 칸 = 면 사이 거리
    function step() { return (n > 1 ? sps[1].offsetLeft - sps[0].offsetLeft : strip.clientWidth) || 1; }
    function idx() { var max = strip.scrollWidth - strip.clientWidth; if (max > 0 && strip.scrollLeft >= max - 2) return n - 1; return Math.max(0, Math.min(n - 1, Math.round(strip.scrollLeft / step()))); }
    function paint() {
      var i = idx(); if (i === cur) return; cur = i;
      pos.textContent = p2(i + 1) + " / " + p2(n);
      posk.textContent = sps[i].getAttribute("data-kind");
      prev.disabled = i === 0; next.disabled = i === n - 1;
      works.style.setProperty("--p", ((i + 1) / n).toFixed(4));
    }
    function go(i, focus) {
      i = Math.max(0, Math.min(n - 1, i));
      var beh = mq.matches ? "auto" : "smooth";
      strip.scrollTo({ left: Math.min(i * step(), strip.scrollWidth - strip.clientWidth), behavior: beh });
      var top = works.getBoundingClientRect().top;
      if (Math.abs(top) > 2) works.scrollIntoView({ behavior: beh, block: "start" });
      if (focus) sps[i].focus({ preventScroll: true });
      live.textContent = p2(i + 1) + " / " + p2(n) + ", " + sps[i].getAttribute("data-kind") + ", " + sps[i].getAttribute("data-title");
    }
    strip.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; paint(); }); }, { passive: true });
    strip.addEventListener("keydown", function (e) {
      if (e.target !== strip && sps.indexOf(e.target) < 0) return;
      var k = e.key, i = idx(), t = null;
      if (k === "ArrowRight" || k === "PageDown") t = i + 1; else if (k === "ArrowLeft" || k === "PageUp") t = i - 1;
      else if (k === "Home") t = 0; else if (k === "End") t = n - 1;
      if (t === null) return; e.preventDefault(); go(t, false);
    });
    prev.addEventListener("click", function () { go(idx() - 1, false); });
    next.addEventListener("click", function () { go(idx() + 1, false); });
    d.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      // 휴대폰에서 보이는 옆 면 가장자리를 누르면 그 면으로 넘긴다
      var hit = e.target.closest && e.target.closest(".sp");
      if (hit && !e.target.closest("a, button")) { var j = sps.indexOf(hit); if (j >= 0 && j !== idx()) { go(j, false); return; } }
      var a = e.target.closest && e.target.closest('a[href^="#s-"]'); if (!a) return;
      var el = d.getElementById(a.getAttribute("href").slice(1)), i = sps.indexOf(el); if (i < 0) return;
      e.preventDefault(); go(i, true);
      if (history.replaceState) history.replaceState(null, "", "#" + el.id);
    });
    // 키보드 초점이 다른 면의 링크로 가면(옆 면 가장자리에 걸친 링크 포함) 그 면으로 넘긴다
    strip.addEventListener("focusin", function (e) {
      var hit = e.target.closest && e.target.closest(".sp"), j = sps.indexOf(hit);
      if (j >= 0 && e.target !== hit && j !== idx()) go(j, false);
    });
    window.addEventListener("resize", function () { if (cur >= 0) strip.scrollLeft = Math.min(cur * step(), strip.scrollWidth - strip.clientWidth); });
    // 주소에 #s-아이디가 있으면 그 면을 연다(목차 링크 공유용)
    if (location.hash.indexOf("#s-") === 0) { var t0 = sps.indexOf(d.getElementById(location.hash.slice(1))); if (t0 >= 0) setTimeout(function () { go(t0, true); }, 0); }
    paint();
  } catch (e) { /* 정적 내용은 영향 없음 */ }
})();
