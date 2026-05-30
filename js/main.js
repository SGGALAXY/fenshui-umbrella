/* =========================================================
   分水·寻伞 | 交互脚本 main.js
   交互清单：
     1) 导航滚动变色 + 顶部阅读进度条 + 移动端收起
     2) 伞面影像墙动态渲染
     3) 通用影像灯箱（影像墙 + 工序图版，Bootstrap Modal）
     4) 工序索引滚动联动 + 点击跳转（IntersectionObserver）
     5) 滚动揭示动画 + 回到顶部
     6) 留言表单校验 + 访客簿动态渲染
     7) 非遗知识问答小游戏
   轮播自动播放由 Bootstrap Carousel(data-bs-ride) 实现。
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1) 导航滚动变色 + 阅读进度条 ---------- */
  var nav = document.getElementById("mainNav");
  var progress = document.getElementById("readProgress");
  var lastScrollY = window.scrollY || 0;
  var scrollDir = "down";
  var bridgeEls = [];
  function onScroll() {
    var y = window.scrollY;
    scrollDir = y >= lastScrollY ? "down" : "up";
    lastScrollY = y;
    nav.classList.toggle("nav-scrolled", y > 60);
    // 阅读进度：已滚动比例
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    // 回到顶部按钮
    toTop.classList.toggle("show", y > 600);
    updateBridgeParallax();
  }

  // 移动端点击导航项后收起折叠菜单
  var navCollapseEl = document.getElementById("navItems");
  document.querySelectorAll("#navItems .nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      var c = bootstrap.Collapse.getInstance(navCollapseEl);
      if (c && navCollapseEl.classList.contains("show")) c.hide();
    });
  });

  /* ---------- 2) 伞面影像墙渲染 ---------- */
  var works = [
    { img: "images/work-peony.png",         zh: "牡丹 · 富贵", en: "PEONY",     size: "feature", desc: "朱砂为底，缠枝牡丹，寓意花开富贵、繁荣昌盛。" },
    { img: "images/work-lotus.png",         zh: "荷 · 清韵",   en: "LOTUS",     size: "std",     desc: "淡墨写荷，出淤泥而不染，是文人心中的高洁之姿。" },
    { img: "images/work-landscape.png",     zh: "山水 · 烟客", en: "LANDSCAPE", size: "std",     desc: "米色伞面上一卷水墨山水，远山如黛，渔舟唱晚。" },
    { img: "images/work-crane.png",         zh: "仙鹤 · 延年", en: "CRANE",     size: "third",   desc: "祥云之间仙鹤翩跹，寓意松鹤延年、福寿绵长。" },
    { img: "images/work-plum.png",          zh: "梅 · 傲雪",   en: "PLUM",      size: "third",   desc: "疏影横斜，墨梅点点，象征坚韧不拔的风骨。" },
    { img: "images/work-dragonphoenix.png", zh: "龙凤 · 呈祥", en: "WEDDING",   size: "third",   desc: "婚嫁红伞，龙凤交辉，承载团圆美满的传统祝福。" },
    { img: "images/work-vine.png",          zh: "缠枝 · 连绵", en: "VINE",      size: "third",   desc: "缠枝莲纹绵延不断，寓意生生不息、福泽绵长。" },
    { img: "images/work-bao.png",           zh: "八宝 · 纳吉", en: "TREASURES", size: "wide",    desc: "八宝吉祥纹与绶带相缀，是民间最隆重的祈福纹样。" }
  ];
  var wall = document.getElementById("imageWall");
  if (wall) {
    works.forEach(function (w) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "wall-item " + w.size;
      // 影像墙的图也可被灯箱放大：写入 data 属性
      item.setAttribute("data-img", w.img);
      item.setAttribute("data-title", w.zh);
      item.setAttribute("data-desc", w.desc);
      item.setAttribute("data-tag", w.en);
      item.innerHTML =
        '<img src="' + w.img + '" alt="' + w.zh + ' 伞面" />' +
        '<span class="wall-cap"><span>' + w.en + "</span><b>" + w.zh + "</b></span>";
      wall.appendChild(item);
    });
  }

  /* ---------- 3) 通用影像灯箱 ---------- */
  // 影像墙 .wall-item 与工序 .plate-open 都通过 data-img/title/desc 触发
  var lbEl = document.getElementById("lightboxModal");
  var lb = lbEl ? new bootstrap.Modal(lbEl) : null;
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-img]");
    if (!trigger || !lb) return;
    document.getElementById("lightboxImg").src = trigger.getAttribute("data-img");
    document.getElementById("lightboxImg").alt = trigger.getAttribute("data-title") || "";
    document.getElementById("lightboxTag").textContent = trigger.getAttribute("data-tag") || "PLATE";
    document.getElementById("lightboxTitle").textContent = trigger.getAttribute("data-title") || "";
    document.getElementById("lightboxDesc").textContent = trigger.getAttribute("data-desc") || "";
    lb.show();
  });

  /* ---------- 4) 工序索引滚动联动 + 点击跳转 ---------- */
  var jumps = Array.prototype.slice.call(document.querySelectorAll(".craft-jump"));
  var records = jumps.map(function (b) { return document.getElementById(b.dataset.target); });
  // 点击索引平滑滚动到对应工序
  jumps.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.dataset.target);
      if (target) {
        var top = target.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });
  // 滚动时高亮当前工序索引
  if ("IntersectionObserver" in window && records.length) {
    var crSpy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            jumps.forEach(function (b) { b.classList.toggle("active", b.dataset.target === id); });
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    records.forEach(function (r) { if (r) crSpy.observe(r); });
  }

  /* ---------- 5) 滚动揭示 + 回到顶部 ---------- */
  var toTop = document.getElementById("toTop");
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  function bindReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in-view"); }); return; }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add("in-view"); io.unobserve(entry.target); }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach(function (el) { io.observe(el); });
  }
  bindReveal();

  function bindBridgeMotion() {
    bridgeEls = Array.prototype.slice.call(document.querySelectorAll(".chapter-bridge"));
    if (!bridgeEls.length) return;
    if (!("IntersectionObserver" in window)) {
      bridgeEls.forEach(function (el) { el.classList.add("bridge-visible"); });
      return;
    }
    var bridgeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (entry.isIntersecting) {
            el.classList.toggle("bridge-from-up", scrollDir === "up");
            el.classList.toggle("bridge-from-down", scrollDir !== "up");
            el.classList.add("bridge-visible");
          } else {
            el.classList.remove("bridge-visible");
          }
        });
      },
      { threshold: 0.16, rootMargin: "-4% 0px -4% 0px" }
    );
    bridgeEls.forEach(function (el) { bridgeObserver.observe(el); });
    updateBridgeParallax();
  }

  function updateBridgeParallax() {
    if (!bridgeEls.length) return;
    var vh = window.innerHeight || 1;
    bridgeEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var centerOffset = (rect.top + rect.height / 2 - vh / 2) / vh;
      var offset = Math.max(-26, Math.min(26, centerOffset * -34));
      el.style.setProperty("--bridge-parallax", offset.toFixed(1) + "px");
    });
  }
  bindBridgeMotion();

  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", updateBridgeParallax);
  onScroll();

  /* ---------- 6) 留言表单校验 + 访客簿渲染 ---------- */
  var form = document.getElementById("guestForm");
  var msgWall = document.getElementById("messageWall");
  var seed = [
    { name: "晚晴", role: "喜欢传统手工艺", body: "去年在泸州亲手做了一把油纸伞，至今舍不得用。这门手艺真该被更多人看见。" },
    { name: "阿哲", role: "第一次了解", body: "原来一把伞要九十多道工序！致敬每一位守艺人。" }
  ];
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function renderMsg(m) {
    var li = document.createElement("li");
    li.innerHTML =
      '<div class="msg-head">' +
        '<span><span class="msg-avatar">' + escapeHtml(m.name.charAt(0)) + "</span>" +
        '<span class="msg-name">' + escapeHtml(m.name) + "</span></span>" +
        '<span class="msg-role">' + escapeHtml(m.role) + "</span>" +
      "</div>" +
      '<p class="msg-body">' + escapeHtml(m.body) + "</p>";
    return li;
  }
  if (msgWall) seed.forEach(function (m) { msgWall.appendChild(renderMsg(m)); });
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
      msgWall.insertBefore(renderMsg({
        name: document.getElementById("gName").value.trim(),
        role: document.getElementById("gRole").value,
        body: document.getElementById("gMsg").value.trim()
      }), msgWall.firstChild);
      form.reset();
      form.classList.remove("was-validated");
    });
  }

  /* ---------- 7) 非遗知识问答小游戏 ---------- */
  var quizData = [
    { q: "泸州分水油纸伞于哪一年被列入国家级非物质文化遗产名录？", options: ["2006 年", "2008 年", "2011 年", "2014 年"], answer: 1, tip: "2008 年，泸州油纸伞制作技艺入选第二批国家级非遗名录。" },
    { q: "制作一把地道的分水油纸伞，大约需要多少道工序？", options: ["约 30 道", "约 50 道", "约 90 余道", "约 200 道"], answer: 2, tip: "全凭手工，前后须经 90 余道工序。" },
    { q: "油纸伞伞面防水，主要依靠哪种传统材料处理？", options: ["松香", "桐油", "石灰水", "蜂蜡"], answer: 1, tip: "刷天然桐油成膜，使伞面防水透光、经久耐用。" }
  ];
  var quizBody = document.getElementById("quizBody");
  var qIndex = 0, qScore = 0;
  function renderQuiz(n) {
    var item = quizData[n];
    var html =
      '<p class="quiz-progress">第 ' + (n + 1) + " / " + quizData.length + " 题</p>" +
      '<h3 class="quiz-q">' + item.q + "</h3><div>";
    item.options.forEach(function (opt, i) { html += '<button class="quiz-opt" data-i="' + i + '">' + opt + "</button>"; });
    html += '</div><p class="quiz-feedback"></p>';
    quizBody.innerHTML = html;
    var opts = quizBody.querySelectorAll(".quiz-opt");
    opts.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var chosen = Number(btn.dataset.i);
        var fb = quizBody.querySelector(".quiz-feedback");
        opts.forEach(function (b) {
          b.disabled = true;
          var bi = Number(b.dataset.i);
          if (bi === item.answer) b.classList.add("correct");
          if (bi === chosen && chosen !== item.answer) b.classList.add("wrong");
        });
        if (chosen === item.answer) { qScore++; fb.textContent = "✓ 答对了！" + item.tip; fb.className = "quiz-feedback ok"; }
        else { fb.textContent = "✗ 正确答案见高亮。" + item.tip; fb.className = "quiz-feedback no"; }
        setTimeout(function () {
          qIndex++;
          if (qIndex < quizData.length) renderQuiz(qIndex); else renderResult();
        }, 1400);
      });
    });
  }
  function renderResult() {
    var medal = qScore === quizData.length ? "非遗小达人 🏆" : (qScore === 2 ? "很不错！" : "再接再厉");
    quizBody.innerHTML =
      '<div class="quiz-result">' +
        '<div class="quiz-score">' + qScore + " / " + quizData.length + "</div>" +
        '<p class="quiz-medal">' + medal + "</p>" +
        '<button class="btn btn-cinnabar" id="quizRetry">再答一次</button>' +
      "</div>";
    document.getElementById("quizRetry").addEventListener("click", function () { qIndex = 0; qScore = 0; renderQuiz(0); });
  }
  if (quizBody) renderQuiz(0);
})();
