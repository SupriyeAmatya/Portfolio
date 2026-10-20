(() => {
  const DROP_AFTER_MS = 8000;   // how long an opened project stays up before it falls
  const PAUSE_ON_HOVER = true;  // hold the timer while the pointer/focus is on the card

  const { projects, notes } = window.PORTFOLIO;
  const $ = (id) => document.getElementById(id);
  const board = $("board"), grid = $("grid"), lane = $("lane");
  const svg = $("wires"), notesEl = $("notes"), scrim = $("scrim");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SVG_NS = "http://www.w3.org/2000/svg";

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const thumbHTML = (p) => p.image
    ? `<img src="${esc(p.image)}" alt="" loading="lazy">`
    : `<span>image</span>`;

  /* ---------- Grid cells ---------- */
  const cells = new Map();
  projects.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <button class="cell" type="button" data-id="${esc(p.id)}" aria-haspopup="dialog">
        <div class="thumb">${thumbHTML(p)}</div>
        <div class="cell-meta"><span>${String(i + 1).padStart(2, "0")}</span><span>${esc(p.year)}</span></div>
        <div class="cell-title">${esc(p.title)}</div>
        <div class="cell-tags">${p.tags.map(esc).join(" · ")}</div>
      </button>`;
    const btn = li.firstElementChild;
    btn.addEventListener("click", () => openProject(p, btn));
    cells.set(p.id, btn);
    grid.appendChild(li);
  });

  /* ---------- Post-its ---------- */
  let topZ = 1;
  const noteState = notes.map((n, i) => {
    const el = document.createElement("div");
    el.className = "note";
    el.tabIndex = 0;
    el.setAttribute("aria-label", `${n.title}${n.meta ? ", " + n.meta : ""}. ${n.body}. Arrow keys move the note.`);
    el.innerHTML = `<b>${esc(n.title)}</b>${n.meta ? `<span class="meta">${esc(n.meta)}</span>` : ""}<div>${esc(n.body)}</div>`;
    notesEl.appendChild(el);
    return { ...n, el, fx: 0, fy: 0, x: 0, y: 0, tilt: (i % 2 ? 1 : -1) * (1 + (i * 7) % 3) * 0.6 };
  });
  const byId = new Map(noteState.map((n) => [n.id, n]));

  const isStacked = () => matchMedia("(max-width: 760px)").matches;
  let layoutMode = null;

  // Default positions: spread the notes through the lane (right column, or a strip on top on phones).
  function layoutDefault() {
    const b = board.getBoundingClientRect(), l = lane.getBoundingClientRect();
    const lx = l.left - b.left, ly = l.top - b.top;
    const count = noteState.length;
    noteState.forEach((n, i) => {
      const w = n.el.offsetWidth, h = n.el.offsetHeight;
      let x, y;
      if (isStacked()) {
        const cols = 2, rows = Math.ceil(count / cols);
        const cw = l.width / cols, rh = l.height / rows;
        const c = i % cols, r = Math.floor(i / cols);
        x = lx + c * cw + (cw - w) / 2 + (r % 2 ? 8 : -8);
        y = ly + r * rh + (rh - h) / 2;
      } else {
        const step = count > 1 ? (l.height - h) / (count - 1) : 0;
        x = lx + (i % 2 ? l.width - w : 0);
        y = ly + i * step;
      }
      n.fx = x / b.width;
      n.fy = y / b.height;
    });
    layoutMode = isStacked();
  }

  function placeNote(n, bw, bh) {
    const w = n.el.offsetWidth, h = n.el.offsetHeight;
    n.x = Math.max(0, Math.min(bw - w, n.fx * bw));
    n.y = Math.max(0, Math.min(bh - h, n.fy * bh));
    n.el.style.transform = `translate(${n.x}px, ${n.y}px) rotate(${n.el.classList.contains("is-dragging") ? 0 : n.tilt}deg)`;
  }

  function placeAll() {
    if (layoutMode !== isStacked()) layoutDefault();
    const { width, height } = board.getBoundingClientRect();
    noteState.forEach((n) => placeNote(n, width, height));
    drawWires();
  }

  /* ---------- Wires ---------- */
  const wires = [];
  function addWire(from, toKind, toId) {
    const path = document.createElementNS(SVG_NS, "path");
    path.classList.add("wire");
    if (toKind === "cell") path.classList.add("to-cell");
    svg.appendChild(path);
    wires.push({ path, from, toKind, toId });
  }
  noteState.forEach((n) => {
    n.wires.forEach((t) => byId.has(t) && addWire(n.id, "note", t));
    n.projects.forEach((t) => cells.has(t) && addWire(n.id, "cell", t));
  });

  const pin = (n) => ({ x: n.x + n.el.offsetWidth / 2, y: n.y + 10 });
  function cellAnchor(id, b) {
    const r = cells.get(id).getBoundingClientRect();
    return { x: r.left - b.left + r.width / 2, y: r.top - b.top + 1 };
  }

  // A slack cable: quadratic curve that droops below the midpoint, more so the wider the span.
  function cable(a, c) {
    const sag = Math.min(70, Math.abs(c.x - a.x) * 0.35 + 14);
    const mx = (a.x + c.x) / 2, my = (a.y + c.y) / 2 + sag;
    return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
  }

  function drawWires() {
    const b = board.getBoundingClientRect();
    wires.forEach((w) => {
      const a = pin(byId.get(w.from));
      const c = w.toKind === "note" ? pin(byId.get(w.toId)) : cellAnchor(w.toId, b);
      w.path.setAttribute("d", cable(a, c));
    });
  }

  function setHot(id) {
    wires.forEach((w) => w.path.classList.toggle("is-hot", !!id && (w.from === id || w.toId === id)));
    const linked = new Set(id ? byId.get(id).projects : []);
    cells.forEach((el, pid) => el.classList.toggle("is-linked", linked.has(pid)));
  }

  /* ---------- Dragging ---------- */
  noteState.forEach((n) => {
    const el = n.el;
    let grab = null;

    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.style.zIndex = ++topZ;
      el.classList.add("is-dragging");
      grab = { dx: e.clientX - n.x, dy: e.clientY - n.y };
      setHot(n.id);
      move(e.clientX, e.clientY);
    });
    el.addEventListener("pointermove", (e) => grab && move(e.clientX, e.clientY));
    const end = () => {
      if (!grab) return;
      grab = null;
      el.classList.remove("is-dragging");
      placeAll();
      if (!el.matches(":hover")) setHot(null);
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    function move(cx, cy) {
      const b = board.getBoundingClientRect();
      n.fx = (cx - grab.dx) / b.width;
      n.fy = (cy - grab.dy) / b.height;
      placeNote(n, b.width, b.height);
      drawWires();
    }

    el.addEventListener("pointerenter", () => setHot(n.id));
    el.addEventListener("pointerleave", () => !grab && setHot(null));
    el.addEventListener("focus", () => { el.style.zIndex = ++topZ; setHot(n.id); });
    el.addEventListener("blur", () => setHot(null));
    el.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 40 : 10;
      const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (!d) return;
      e.preventDefault();
      const b = board.getBoundingClientRect();
      n.fx = (n.x + d[0]) / b.width;
      n.fy = (n.y + d[1]) / b.height;
      placeNote(n, b.width, b.height);
      drawWires();
    });
  });

  $("tidy").addEventListener("click", () => { layoutDefault(); placeAll(); });

  new ResizeObserver(placeAll).observe(board);
  window.addEventListener("load", placeAll);
  placeAll();

  /* ---------- Pop up, then fall ---------- */
  let active = null;

  function openProject(p, cell) {
    if (active) drop(true);

    const pop = document.createElement("div");
    pop.className = "pop";
    pop.tabIndex = -1;
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", p.title);
    pop.innerHTML = `
      <div class="thumb">${thumbHTML(p)}</div>
      <div class="pop-body">
        <h3>${esc(p.title)}</h3>
        <p class="role">${esc(p.role)} · ${esc(p.year)}</p>
        <p class="summary">${esc(p.summary)}</p>
        <ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        <div class="actions">${p.links.map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</div>
        <div class="timer"><i></i></div>
        <div class="pop-foot"><span>${PAUSE_ON_HOVER ? "Hover to hold" : ""}</span><button type="button">Drop now (Esc)</button></div>
      </div>`;
    document.body.appendChild(pop);

    // Centre it, then animate from the cell's rectangle (FLIP).
    const vw = innerWidth, vh = innerHeight;
    const w = pop.offsetWidth, h = pop.offsetHeight;
    const left = (vw - w) / 2, top = Math.max(16, (vh - h) / 2);
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;

    const from = cell.getBoundingClientRect();
    cell.classList.add("is-out");
    scrim.hidden = false;
    scrim.classList.remove("is-fading");

    const intro = reduceMotion ? null : pop.animate(
      [
        { transform: `translate(${from.left - left}px, ${from.top - top}px) scale(${from.width / w}, ${from.height / h})`, opacity: 0.7 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 420, easing: "cubic-bezier(.2, .9, .3, 1.15)" }
    );

    const timer = pop.querySelector(".timer i").animate(
      [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }],
      { duration: DROP_AFTER_MS, easing: "linear", fill: "forwards" }
    );
    timer.onfinish = () => drop(false);

    if (PAUSE_ON_HOVER) {
      // Hover only counts once the card has landed, so a cursor it grew under doesn't freeze it.
      let armed = !intro;
      if (intro) intro.finished.then(() => { armed = true; }, () => {});
      const hold = () => timer.playState === "running" && timer.pause();
      const resume = () => !pop.contains(document.activeElement) && timer.playState === "paused" && timer.play();
      pop.addEventListener("pointerenter", (e) => armed && e.pointerType === "mouse" && hold());
      pop.addEventListener("pointerleave", resume);
      pop.addEventListener("focusin", (e) => e.target !== pop && hold());
      pop.addEventListener("focusout", () => setTimeout(() => !pop.matches(":hover") && resume()));
    }

    pop.querySelector(".pop-foot button").addEventListener("click", () => drop(true));
    active = { pop, cell, timer };
    pop.focus({ preventScroll: true });
  }

  function drop(fast) {
    if (!active) return;
    const { pop, cell, timer } = active;
    active = null;
    timer.onfinish = null;
    timer.cancel();
    const hadFocus = pop.contains(document.activeElement);

    scrim.classList.add("is-fading");
    setTimeout(() => { if (!active) scrim.hidden = true; }, 300);

    const back = () => {
      pop.remove();
      cell.classList.remove("is-out");
      if (!reduceMotion) {
        cell.animate([{ transform: "translateY(-14px)", opacity: 0 }, { transform: "none", opacity: 1 }],
          { duration: 320, easing: "cubic-bezier(.3, 1.4, .5, 1)" });
      }
      if (hadFocus) cell.focus({ preventScroll: true });
    };

    if (reduceMotion) { back(); return; }

    // Gravity: a small lift, then an accelerating fall with a tumble.
    const dir = Math.random() < 0.5 ? -1 : 1;
    const fall = innerHeight - pop.getBoundingClientRect().top + 40;
    pop.style.pointerEvents = "none";
    pop.animate(
      [
        { transform: "perspective(900px) translateY(0)", offset: 0 },
        { transform: `perspective(900px) translateY(-10px) rotate(${dir * 1.5}deg)`, offset: 0.14, easing: "cubic-bezier(.55, 0, 1, .45)" },
        { transform: `perspective(900px) translate(${dir * 60}px, ${fall}px) rotate(${dir * 14}deg) rotateX(28deg)` },
      ],
      { duration: fast ? 520 : 950, fill: "forwards" }
    ).onfinish = back;
  }

  scrim.addEventListener("click", () => drop(true));
  document.addEventListener("keydown", (e) => e.key === "Escape" && drop(true));
})();
