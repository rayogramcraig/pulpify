/* ===================== Pulpify — front end logic ===================== */
/* NOTE: no backend/AI yet. File parsing, cover "recommendation", PDF
   generation and binding are all mocked client-side so the UI can be
   wired to real services later. */

(function () {
  "use strict";

  /* ---------- Cover style art (hand-built SVG placeholders) ---------- */

  function svgWrap(bg, inner) {
    return (
      '<svg viewBox="0 0 148 210" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="148" height="210" fill="' + bg + '"/>' +
      inner +
      "</svg>"
    );
  }

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // fit a title into up to 3 lines of a given max chars/line
  function wrapTitle(title, maxChars, maxLines) {
    const words = String(title || "").toUpperCase().split(/\s+/);
    const lines = [];
    let cur = "";
    for (const w of words) {
      const trial = cur ? cur + " " + w : w;
      if (trial.length > maxChars && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = trial;
      }
      if (lines.length === maxLines) break;
    }
    let truncated = false;
    if (lines.length === maxLines) {
      // more words were left over than fit — mark for an ellipsis
      const consumed = lines.join(" ").length;
      if (words.join(" ").length > consumed) truncated = true;
    } else if (cur) {
      lines.push(cur);
    }
    const result = lines.slice(0, maxLines);
    if (truncated && result.length) {
      const last = result[result.length - 1];
      result[result.length - 1] = last.replace(/[.,;:]+$/, "") + "…";
    }
    return result;
  }

  // render a block of title text, bottom-anchored, with size/line-spacing
  // chosen automatically by how many lines it wrapped to.
  function titleBlock(lines, x, bottomY, color, sizes, gaps) {
    const n = lines.length;
    const size = sizes[n - 1] || sizes[sizes.length - 1];
    const gap = gaps[n - 1] || gaps[gaps.length - 1];
    const startY = bottomY - (n - 1) * gap;
    return lines
      .map(
        (l, i) =>
          '<text x="' + x + '" y="' + (startY + i * gap) + '" font-family="Anton,sans-serif" font-size="' + size + '" fill="' + color + '">' + esc(l) + "</text>"
      )
      .join("");
  }

  const COVER_STYLES = [
    {
      key: "pushpin",
      name: "PushPin",
      keywords: ["idea", "invent", "brain", "think", "mind"],
      render(title, author) {
        const t = title ? wrapTitle(title, 13, 2) : ["PushPin"];
        return svgWrap(
          "#e9e2cd",
          '<text x="12" y="30" font-family="Anton,sans-serif" font-size="24" fill="#1a1a1a">' +
            esc(t[0]) +
            "</text>" +
            (t[1] ? '<text x="12" y="52" font-family="Anton,sans-serif" font-size="24" fill="#1a1a1a">' + esc(t[1]) + "</text>" : "") +
            '<g transform="translate(30,70)">' +
            '<path d="M18 0 C40 0 54 18 54 40 C54 54 47 63 41 70 L41 86 L9 86 L9 70 C3 63 0 52 0 36 C0 16 6 0 18 0 Z" fill="#1a1a1a"/>' +
            '<circle cx="30" cy="38" r="18" fill="#c0392b"/>' +
            '<line x1="30" y1="38" x2="30" y2="18" stroke="#f1e9d3" stroke-width="3"/>' +
            '<circle cx="30" cy="38" r="4.5" fill="#f1e9d3"/>' +
            "</g>" +
            (author ? '<text x="12" y="198" font-family="EB Garamond,serif" font-style="italic" font-size="11" fill="#55503f">' + esc(author) + "</text>" : "")
        );
      }
    },
    {
      key: "midcentury",
      name: "Midcentury Abstract",
      keywords: ["design", "modern", "shape", "form"],
      render(title, author) {
        const t = title ? wrapTitle(title, 15, 2) : ["MIDCENTURY", "ABSTRACT"];
        return svgWrap(
          "#aebfc2",
          '<text x="12" y="26" font-family="Anton,sans-serif" font-size="15" fill="#1f2a2b">' + esc(t[0]) + "</text>" +
            (t[1] ? '<text x="12" y="44" font-family="Anton,sans-serif" font-size="15" fill="#1f2a2b">' + esc(t[1]) + "</text>" : "") +
            '<ellipse cx="95" cy="118" rx="32" ry="52" fill="none" stroke="#f1ece0" stroke-width="4" transform="rotate(-15 95 118)"/>' +
            '<ellipse cx="78" cy="136" rx="26" ry="17" fill="#22303a" transform="rotate(8 78 136)"/>' +
            '<path d="M28 156 q22 -38 54 -18 q9 6 -1 13 q-28 14 -53 5z" fill="#c9723b"/>' +
            '<path d="M18 96 q42 8 68 62" fill="none" stroke="#3a4a4d" stroke-width="2"/>' +
            (author ? '<text x="12" y="196" font-family="EB Garamond,serif" font-style="italic" font-size="10" fill="#3a4a4d">' + esc(author) + "</text>" : "")
        );
      }
    },
    {
      key: "typographic",
      name: "Typographic",
      keywords: ["poem", "essay", "word", "letter"],
      render(title, author) {
        const t = title ? wrapTitle(title, 8, 3) : ["TYPO", "GRAPH", "IC"];
        const colors = ["#1a1a1a", "#1a1a1a", "#c0392b"];
        let y = 78;
        let lines = "";
        t.forEach((line, i) => {
          lines += '<text x="10" y="' + y + '" font-family="Anton,sans-serif" font-size="26" fill="' + colors[i % 3] + '">' + esc(line) + "</text>";
          y += 34;
        });
        return svgWrap(
          "#efe7d3",
          '<text x="14" y="22" font-family="EB Garamond,serif" font-style="italic" font-size="9" fill="#55503f">STORIES BY</text>' +
            '<text x="14" y="35" font-family="Anton,sans-serif" font-size="11" fill="#1a1a1a">' + esc(author || "GORDON VALE") + "</text>" +
            '<line x1="14" y1="44" x2="134" y2="44" stroke="#1a1a1a" stroke-width="2"/>' +
            lines +
            '<line x1="14" y1="' + (y - 20) + '" x2="80" y2="' + (y - 20) + '" stroke="#1a1a1a" stroke-width="3"/>'
        );
      }
    },
    {
      key: "classicPulp",
      name: "Classic",
      keywords: ["love", "romance", "heart", "affair", "society"],
      render(title, author) {
        const t = title ? wrapTitle(title, 14, 3) : ["CLASSIC"];
        return svgWrap(
          "#171a24",
          '<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#232838"/><stop offset="1" stop-color="#0d0f16"/></linearGradient></defs>' +
            '<rect width="148" height="210" fill="url(#g1)"/>' +
            '<text x="10" y="18" font-family="EB Garamond,serif" font-style="italic" font-size="8" fill="#e8e0c8">A dangerous woman.</text>' +
            '<text x="10" y="29" font-family="EB Garamond,serif" font-style="italic" font-size="8" fill="#e8e0c8">A deadly game.</text>' +
            '<path d="M40 150 q-2 -40 20 -55 q22 15 20 55 q-20 12 -40 0z" fill="#7a1f1f"/>' +
            '<circle cx="60" cy="88" r="12" fill="#d8b48f"/>' +
            '<rect x="10" y="168" width="128" height="14" fill="#0a0b10"/>' +
            '<circle cx="26" cy="182" r="6" fill="#0a0b10"/><circle cx="120" cy="182" r="6" fill="#0a0b10"/>' +
            titleBlock(t, 10, 205, "#e8b93f", [26, 20, 15], [0, 20, 16])
        );
      }
    },
    {
      key: "crime",
      name: "Crime",
      keywords: ["murder", "detective", "gun", "crime", "police", "killer", "theft", "steal"],
      render(title, author) {
        const t = title ? wrapTitle(title, 11, 3) : ["CRIME"];
        return svgWrap(
          "#b8924a",
          '<text x="10" y="18" font-family="EB Garamond,serif" font-style="italic" font-size="8" fill="#f1e9d3">Murder never sleeps.</text>' +
            '<g transform="translate(70,60)">' +
            '<ellipse cx="0" cy="0" rx="22" ry="8" fill="#151210"/>' +
            '<circle cx="0" cy="4" r="15" fill="#151210"/>' +
            '<path d="M-20 20 q20 -14 40 0 l6 70 q-26 14 -52 0 z" fill="#211c18"/>' +
            "</g>" +
            titleBlock(t, 10, 203, "#a5271b", [30, 20, 15], [0, 22, 17])
        );
      }
    },
    {
      key: "adventure",
      name: "Adventure",
      keywords: ["jungle", "expedition", "treasure", "explore", "island", "journey", "voyage"],
      render(title, author) {
        const t = title ? wrapTitle(title, 12, 3) : ["ADVENTURE"];
        return svgWrap(
          "#8a9a72",
          '<text x="10" y="18" font-family="EB Garamond,serif" font-style="italic" font-size="8" fill="#2c3320">Beyond the map lies danger!</text>' +
            '<path d="M0 130 L45 80 L70 105 L110 55 L148 90 L148 150 L0 150 Z" fill="#5c6b46"/>' +
            '<path d="M95 60 l30 -14 l6 6 l-22 16 z" fill="#e9e2cd"/>' +
            titleBlock(t, 10, 202, "#232818", [t.length === 1 && t[0].length > 7 ? 19 : 26, 20, 15], [0, 20, 16])
        );
      }
    },
    {
      key: "scifi",
      name: "Science Fiction",
      keywords: ["space", "rocket", "planet", "future", "robot", "alien", "star", "moon", "machine", "electric"],
      render(title, author) {
        const t = title ? wrapTitle(title, 14, 3) : ["SCIENCE", "FICTION"];
        return svgWrap(
          "#0e1420",
          '<circle cx="120" cy="150" r="26" fill="#8a3a22"/>' +
            '<text x="10" y="18" font-family="EB Garamond,serif" font-style="italic" font-size="8" fill="#e9e2cd">The future is not ours.</text>' +
            '<g transform="translate(56,60) rotate(18)">' +
            '<path d="M10 0 C16 10 16 40 16 60 L4 60 C4 40 4 10 10 0 Z" fill="#e9e2cd"/>' +
            '<path d="M4 55 l-8 14 l8 -4 Z" fill="#a5271b"/>' +
            '<path d="M16 55 l8 14 l-8 -4 Z" fill="#a5271b"/>' +
            '<circle cx="10" cy="18" r="3.4" fill="#0e1420"/>' +
            "</g>" +
            titleBlock(t, 10, 202, "#f1e9d3", [24, 18, 14], [0, 20, 16])
        );
      }
    }
  ];

  function renderPlainSpine(title, author) {
    const t = wrapTitle(title || "Untitled", 16, 3);
    let ty = 110 - (t.length - 1) * 11;
    let lines = "";
    t.forEach((line) => {
      lines += '<text x="74" y="' + ty + '" text-anchor="middle" font-family="EB Garamond,serif" font-weight="700" font-size="13" fill="#2b2620">' + esc(line) + "</text>";
      ty += 18;
    });
    return (
      '<svg viewBox="0 0 148 210" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="148" height="210" fill="#e9dfc4"/>' +
      '<rect width="148" height="52" fill="#6d7458"/>' +
      '<rect y="164" width="148" height="46" fill="#b9432b"/>' +
      '<ellipse cx="74" cy="26" rx="34" ry="15" fill="#f1e9d3" stroke="#2b2620" stroke-width="1.2"/>' +
      '<text x="74" y="24" text-anchor="middle" font-family="Anton,sans-serif" font-size="8" fill="#2b2620">PULPIFY</text>' +
      '<text x="74" y="33" text-anchor="middle" font-family="Anton,sans-serif" font-size="8" fill="#2b2620">CLASSIC</text>' +
      '<line x1="14" y1="60" x2="134" y2="60" stroke="#c9b989" stroke-width="1"/>' +
      lines +
      '<line x1="14" y1="' + (ty + 4) + '" x2="134" y2="' + (ty + 4) + '" stroke="#c9b989" stroke-width="1"/>' +
      '<text x="74" y="150" text-anchor="middle" font-family="Anton,sans-serif" font-size="11" fill="#2b2620" letter-spacing="1">' +
      esc((author || "UNKNOWN").toUpperCase()) +
      "</text>" +
      '<circle cx="74" cy="187" r="14" fill="#f1e9d3" stroke="#2b2620" stroke-width="1"/>' +
      '<text x="74" y="191" text-anchor="middle" font-family="Permanent Marker,cursive" font-size="12" fill="#b9432b">Go!</text>' +
      "</svg>"
    );
  }

  function styleByKey(key) {
    return COVER_STYLES.find((s) => s.key === key);
  }

  /* ---------- naive text parsing + "recommendation" (placeholder for AI) ---------- */

  function titleCaseFilename(name) {
    const base = name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
    return base.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
  }

  function parseText(text, filename) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let title = lines[0] ? lines[0].replace(/^["“]+|["”]+$/g, "") : titleCaseFilename(filename);
    let author = "Unknown Author";
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      const m = lines[i].match(/^(?:by|written by)\s+(.+)$/i);
      if (m) {
        author = m[1].trim();
        break;
      }
      if (i === 1 && lines[1].length < 40 && !/[.:;]$/.test(lines[1])) {
        author = lines[1];
      }
    }
    if (!title) title = titleCaseFilename(filename);
    return { title, author };
  }

  function recommendStyle(text) {
    const lower = text.toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const style of COVER_STYLES) {
      let score = 0;
      for (const kw of style.keywords) {
        const matches = lower.split(kw).length - 1;
        score += matches;
      }
      if (score > bestScore) {
        bestScore = score;
        best = style;
      }
    }
    if (!best) {
      // deterministic fallback based on text length so the demo still feels alive
      const idx = text.length % COVER_STYLES.length;
      best = COVER_STYLES[idx];
    }
    return best.key;
  }

  /* ---------- state ---------- */

  const state = {
    hasFile: false,
    fileName: "",
    title: "",
    author: "",
    rawText: "",
    paperSize: "letter",
    coverStyle: null, // selected on screen 1
    recommended: null,
    screen: "upload",
    qty: 1,
    outputStyle: null // null = plain Pulpify Classic, else a COVER_STYLES key
  };

  const BASE_PRICE = 19.99;
  const CUSTOM_PRICE = 4.99;

  /* ---------- DOM refs ---------- */

  const dropzone = document.getElementById("dropzone");
  const dzEmpty = document.getElementById("dzEmpty");
  const dzFilled = document.getElementById("dzFilled");
  const fileInput = document.getElementById("fileInput");
  const fileTitleEl = document.getElementById("fileTitle");
  const fileNameEl = document.getElementById("fileName");
  const fileAuthorEl = document.getElementById("fileAuthor");
  const replaceLink = document.getElementById("replaceLink");

  const paperToggle = document.getElementById("paperToggle");
  const labelLetter = document.getElementById("labelLetter");
  const labelA4 = document.getElementById("labelA4");

  const coverStyleLabel = document.getElementById("coverStyleLabel");
  const coverGrid = document.getElementById("coverGrid");

  const stepUpload = document.getElementById("stepUpload");
  const stepStyle = document.getElementById("stepStyle");
  const stepGo = document.getElementById("stepGo");

  const screenUpload = document.getElementById("screen-upload");
  const screenOutput = document.getElementById("screen-output");

  const bookCover = document.getElementById("bookCover");
  const outputGrid = document.querySelector(".output-grid");
  const upsellSidebar = document.getElementById("upsellSidebar");
  const upsellGrid = document.getElementById("upsellGrid");
  const revertLink = document.getElementById("revertClassicLink");

  const qtyInput = document.getElementById("qtyInput");
  const totalPriceEl = document.getElementById("totalPrice");
  const orderForm = document.getElementById("orderForm");
  const backToUpload = document.getElementById("backToUpload");

  const downloadPdfLink = document.getElementById("downloadPdfLink");
  const bindingInstructionsLink = document.getElementById("bindingInstructionsLink");

  const modalOverlay = document.getElementById("modalOverlay");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");

  /* ---------- build cover grid (screen 1) ---------- */

  function buildGrid(container, { withNames } = { withNames: true }) {
    container.innerHTML = "";
    COVER_STYLES.forEach((style) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = withNames ? "cover-card" : "cover-card upsell-card";
      card.dataset.key = style.key;
      card.innerHTML =
        '<div class="cover-art">' + style.render(null, null) + "</div>" +
        (withNames ? '<div class="cover-name">' + esc(style.name) + "</div>" : "");
      container.appendChild(card);
    });
  }

  buildGrid(coverGrid, { withNames: true });
  buildGrid(upsellGrid, { withNames: false });
  upsellGrid.classList.add("upsell-grid");
  upsellGrid.classList.remove("cover-grid");
  // fix classnames: upsellGrid cards should be .upsell-card only (not .cover-card), avoid unlock/opacity rules
  Array.from(upsellGrid.children).forEach((c) => c.classList.remove("cover-card"));

  /* ---------- screen 1 interactions ---------- */

  dropzone.addEventListener("click", () => {
    if (!state.hasFile) fileInput.click();
  });
  dropzone.addEventListener("keydown", (e) => {
    if (!state.hasFile && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      fileInput.click();
    }
  });
  ["dragover", "dragenter"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      if (!state.hasFile) dropzone.classList.add("drag-over");
    })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove("drag-over");
    })
  );
  dropzone.addEventListener("drop", (e) => {
    if (state.hasFile) return;
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) loadFile(file);
  });
  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (file) loadFile(file);
  });

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const parsed = parseText(text, file.name);
      state.hasFile = true;
      state.fileName = file.name;
      state.title = parsed.title;
      state.author = parsed.author;
      state.rawText = text;
      state.recommended = recommendStyle(text || parsed.title);
      state.coverStyle = null;
      renderUploadScreen();
    };
    reader.onerror = () => {
      alert("Could not read that file — try a plain .txt file.");
    };
    reader.readAsText(file);
  }

  replaceLink.addEventListener("click", (e) => {
    e.preventDefault();
    state.hasFile = false;
    state.fileName = "";
    state.title = "";
    state.author = "";
    state.rawText = "";
    state.coverStyle = null;
    state.recommended = null;
    fileInput.value = "";
    renderUploadScreen();
  });

  paperToggle.addEventListener("click", () => {
    state.paperSize = state.paperSize === "letter" ? "a4" : "letter";
    renderUploadScreen();
  });

  coverGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".cover-card");
    if (!card || !state.hasFile) return;
    state.coverStyle = state.coverStyle === card.dataset.key ? null : card.dataset.key;
    renderUploadScreen();
  });

  function renderUploadScreen() {
    dzEmpty.hidden = state.hasFile;
    dzFilled.hidden = !state.hasFile;
    dropzone.classList.toggle("filled", state.hasFile);

    if (state.hasFile) {
      fileTitleEl.textContent = "“" + state.title + "”";
      fileNameEl.textContent = state.fileName;
      fileAuthorEl.textContent = state.author;
    }

    paperToggle.setAttribute("aria-checked", state.paperSize === "a4" ? "true" : "false");
    labelLetter.style.opacity = state.paperSize === "letter" ? "1" : ".55";
    labelA4.style.opacity = state.paperSize === "a4" ? "1" : ".55";

    // cover label
    if (!state.hasFile) {
      coverStyleLabel.classList.remove("ready");
      coverStyleLabel.innerHTML = "Cover Style (choose one):";
    } else {
      coverStyleLabel.classList.add("ready");
      const recName = styleByKey(state.recommended).name;
      coverStyleLabel.innerHTML =
        'Cover Style (<em>For</em> “' + esc(state.title) + '” <em>we recommend</em> <span class="rec-name">' + esc(recName) + '</span>:)';
    }

    coverGrid.classList.toggle("unlocked", state.hasFile);
    coverGrid.classList.toggle("has-selection", !!state.coverStyle);
    Array.from(coverGrid.children).forEach((card) => {
      card.classList.toggle("selected", card.dataset.key === state.coverStyle);
    });

    // step icons
    stepUpload.classList.toggle("active", state.hasFile);
    stepStyle.classList.toggle("active", !!state.coverStyle);
    stepGo.classList.toggle("go-ready", state.hasFile);
    stepGo.classList.remove("show-printer");
  }

  /* ---------- navigation ---------- */

  function goToScreen(name) {
    state.screen = name;
    screenUpload.hidden = name !== "upload";
    screenOutput.hidden = name !== "output";
    if (name === "output") {
      state.outputStyle = state.coverStyle; // carry over selection from step 1 (may be null)
      stepGo.classList.add("show-printer");
      renderOutputScreen();
    } else {
      stepGo.classList.remove("show-printer");
      renderUploadScreen();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  stepUpload.addEventListener("click", () => goToScreen("upload"));
  stepStyle.addEventListener("click", () => {
    if (state.hasFile) goToScreen("upload");
  });
  stepGo.addEventListener("click", () => {
    if (state.screen === "upload") {
      if (state.hasFile) goToScreen("output");
    } else {
      goToScreen("upload");
    }
  });
  backToUpload.addEventListener("click", () => goToScreen("upload"));

  /* ---------- screen 2: get your book ---------- */

  function currentPrice() {
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    const unit = BASE_PRICE + (state.outputStyle ? CUSTOM_PRICE : 0);
    return { qty, unit, total: qty * unit };
  }

  function renderOutputScreen() {
    const title = state.title || "Untitled";
    const author = state.author || "Unknown Author";

    if (state.outputStyle) {
      bookCover.innerHTML = styleByKey(state.outputStyle).render(title, author);
    } else {
      bookCover.innerHTML = renderPlainSpine(title, author);
    }

    outputGrid.classList.toggle("no-sidebar", false); // sidebar always available for upsell/downgrade
    upsellSidebar.hidden = false;

    upsellGrid.classList.toggle("has-selection", !!state.outputStyle);
    Array.from(upsellGrid.children).forEach((c) => {
      c.classList.toggle("selected", c.dataset.key === state.outputStyle);
    });
    revertLink.hidden = !state.outputStyle;

    updatePrice();
  }

  function updatePrice() {
    const { total } = currentPrice();
    totalPriceEl.textContent = "$" + total.toFixed(2);
  }

  qtyInput.addEventListener("input", updatePrice);

  upsellGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".upsell-card");
    if (!card) return;
    state.outputStyle = card.dataset.key;
    renderOutputScreen();
  });

  revertLink.addEventListener("click", (e) => {
    e.preventDefault();
    state.outputStyle = null;
    renderOutputScreen();
  });

  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const { qty, total } = currentPrice();
    openModal(
      "<h3>Order queued.</h3>" +
        "<p>" + qty + " copy" + (qty > 1 ? "ies" : "") + " of <em>“" + esc(state.title || "Untitled") + "”</em> — total <strong>$" + total.toFixed(2) + "</strong>.</p>" +
        "<p>This is a front-end preview, so nothing was actually charged or shipped. Checkout and fulfillment will connect once the backend is wired up.</p>"
    );
  });

  downloadPdfLink.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(
      "<h3>Download PDF</h3>" +
        "<p>Once the backend/AI layer is connected, this will generate a print-ready, " +
        esc(state.paperSize === "a4" ? "A4" : "Letter") +
        "-sized PDF of “" + esc(state.title || "your book") + "” with the " +
        esc(state.outputStyle ? styleByKey(state.outputStyle).name : "Pulpify Classic") +
        " cover, laid out for home binding.</p>"
    );
  });

  bindingInstructionsLink.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(
      "<h3>Do-it-yourself binding</h3>" +
        "<ol>" +
        "<li>Print your Pulpify PDF double-sided, short-edge binding.</li>" +
        "<li>Fold each sheet in half and nest into signatures of 4–6 sheets.</li>" +
        "<li>Stack signatures in order and clamp the spine edge.</li>" +
        "<li>Apply PVA glue along the spine, let it tack up, then apply a second coat.</li>" +
        "<li>Press your Pulpify cover onto the glued spine and trim the edges once dry.</li>" +
        "</ol>" +
        "<p>Full illustrated instructions will live here.</p>"
    );
  });

  function openModal(html) {
    modalBody.innerHTML = html;
    modalOverlay.hidden = false;
  }
  function closeModal() {
    modalOverlay.hidden = true;
  }
  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  /* ---------- init ---------- */
  renderUploadScreen();
})();
