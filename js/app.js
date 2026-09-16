/* ============================================================
   YTU — APP.JS COMPLETO
   Guia Cultural de Recife — Lumminin
   ============================================================ */

/* ===================== STATE GLOBAL ===================== */
let totalPoints = 1250;
let isLogged = true;
let favorites = [];
let visited = [];
let currentDetailKey = "pacofrevo";
let currentCategory = "all";
let mapInstance = null;
let markerLayer = [];

/* ===================== DADOS: LUGARES ===================== */
const places = {
  pacofrevo: {
    name: "Paço do Frevo",
    img: "https://images.unsplash.com/photo-1596386461350-326ccb383e9f?w=800&h=500&fit=crop",
    category: "cultura",
    desc: "Um espaço vivo para conhecer, sentir e celebrar o frevo, Patrimônio Cultural Imaterial da Humanidade.",
    hours: "10h às 17h",
    price: "R$ 10",
    priceNote: "Grátis às terças",
    rating: "4.9",
    reviews: 328,
    dist: "850 m",
    address: "Praça do Arsenal — Bairro do Recife, Recife/PE",
    quiz: {
      question:
        "Qual dança/ritmo, patrimônio cultural imaterial da humanidade, é homenageado no Paço do Frevo?",
      options: [
        { text: "Samba", correct: false },
        { text: "Frevo", correct: true },
        { text: "Maracatu", correct: false },
        { text: "Forró", correct: false },
      ],
    },
  },
  cais: {
    name: "Cais do Sertão",
    img: "https://images.unsplash.com/photo-1555529771-7888783a18d3?w=800&h=500&fit=crop",
    category: "historia",
    desc: "Museu dedicado à cultura e história do sertão nordestino, com destaque para a vida de Luiz Gonzaga.",
    hours: "9h às 17h",
    price: "R$ 12",
    priceNote: "Grátis aos domingos",
    rating: "4.8",
    reviews: 210,
    dist: "1,2 km",
    address: "Av. Alfredo Lisboa, Bairro do Recife, Recife/PE",
    quiz: {
      question:
        "Qual artista pernambucano é o grande destaque do Cais do Sertão?",
      options: [
        { text: "Alceu Valença", correct: false },
        { text: "Luiz Gonzaga", correct: true },
        { text: "Chico Science", correct: false },
        { text: "Dominguinhos", correct: false },
      ],
    },
  },
  mercado: {
    name: "Mercado da Boa Vista",
    img: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=500&fit=crop",
    category: "culinaria",
    desc: "Comércio popular tradicional com produtos regionais, comidas típicas e artesanato local.",
    hours: "7h às 18h",
    price: "Grátis",
    priceNote: "Entrada livre",
    rating: "4.6",
    reviews: 150,
    dist: "1,8 km",
    address: "Bairro da Boa Vista, Recife/PE",
    quiz: {
      question:
        "O que é tradicionalmente vendido nos mercados populares do Recife?",
      options: [
        { text: "Apenas roupas", correct: false },
        { text: "Produtos regionais e comidas típicas", correct: true },
        { text: "Apenas eletrônicos", correct: false },
        { text: "Apenas livros", correct: false },
      ],
    },
  },
};

/* ===================== NAVEGAÇÃO ENTRE TELAS ===================== */
function goto(id, el) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");

  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  if (el) el.classList.add("active");
  else
    document
      .querySelector(`.nav-item[data-screen="${id}"]`)
      ?.classList.add("active");

  if (id === "screen-map") setTimeout(initMap, 80);
  window.scrollTo(0, 0);
}

/* ===================== TOAST ===================== */
function showToast(msg) {
  const t = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;
  t.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

/* ===================== PONTOS / GAMIFICAÇÃO ===================== */
function updatePointsUI() {
  const el = document.getElementById("ptsNum");
  if (el) {
    el.innerHTML =
      totalPoints.toLocaleString("pt-BR") +
      ' <small style="font-size:14px;">pts</small>';
  }
}

function addPoints(pts, msg) {
  totalPoints += pts;
  updatePointsUI();
  showToast(`${msg} (+${pts} pts)`);
  saveState();
  if (typeof confetti === "function") {
    confetti({
      particleCount: 120,
      spread: 80,
      colors: ["#F05A24", "#F2B807", "#0B52C6", "#D9381E"],
      origin: { y: 0.6 },
    });
  }
}

function checkIn() {
  if (!isLogged) return showToast("Faça login para fazer check-in");
  if (visited.includes(currentDetailKey))
    return showToast("Você já fez check-in aqui!");
  visited.push(currentDetailKey);
  addPoints(20, `Check-in em ${places[currentDetailKey]?.name || "local"}!`);
  addActivity(
    `Você visitou ${places[currentDetailKey]?.name || "um local"}`,
    20,
  );
  saveState();
}

/* ===================== ATIVIDADE RECENTE ===================== */
function addActivity(title, pts) {
  const list = document.getElementById("activityList");
  if (!list) return;
  const row = document.createElement("div");
  row.className = "activity-row";
  row.innerHTML = `
    <div class="icon-circle"><i class="fa-solid fa-check"></i></div>
    <div class="txt"><h5>${title}</h5><span>Agora</span></div>
    <div class="pts">+${pts} pts</div>`;
  list.prepend(row);
}

/* ===================== DETAIL SHEET (LOCAL) ===================== */
function openDetail(key) {
  const p = places[key] || places.pacofrevo;
  currentDetailKey = key;

  const nameEl = document.getElementById("detailName");
  const imgEl = document.getElementById("detailImg");
  if (nameEl) nameEl.textContent = p.name;
  if (imgEl) imgEl.src = p.img;

  const overlay = document.getElementById("detailOverlay");
  if (!overlay) return;

  const descEl = overlay.querySelector("p[style*='line-height']");
  if (descEl) descEl.textContent = p.desc;

  const ratingEl = overlay.querySelector(".rating-row");
  if (ratingEl)
    ratingEl.innerHTML = `<span class="stars">★ ${p.rating}</span> (${p.reviews} avaliações) · ${p.dist}`;

  const infoBoxes = overlay.querySelectorAll(".info-box");
  if (infoBoxes[0]) infoBoxes[0].querySelector(".val").textContent = p.hours;
  if (infoBoxes[1]) {
    infoBoxes[1].querySelector(".val").textContent = p.price;
    infoBoxes[1].querySelector(".sub").textContent = p.priceNote;
  }

  overlay.classList.add("show");

  const favBtn = overlay.querySelector(".icon-fav i");
  const favWrap = overlay.querySelector(".icon-fav");
  if (favWrap) {
    favWrap.classList.toggle("active", favorites.includes(key));
    if (favBtn)
      favBtn.className = favorites.includes(key)
        ? "fa-solid fa-star"
        : "fa-regular fa-star";
    favWrap.onclick = () => toggleFavorite(key, favWrap, favBtn);
  }
}

function closeDetail() {
  document.getElementById("detailOverlay")?.classList.remove("show");
}

/* ===================== ROTA (DETALHE) ===================== */
function openRouteDetail() {
  document.getElementById("routeOverlay")?.classList.add("show");
}
function closeRoute() {
  document.getElementById("routeOverlay")?.classList.remove("show");
}
function startRoute() {
  closeRoute();
  showToast("Rota iniciada! Bom passeio 🎉");
  goto("screen-map");
}

/* ===================== QUIZ ===================== */
function openQuiz() {
  const p = places[currentDetailKey] || places.pacofrevo;
  const q = p.quiz;

  const qEl = document.getElementById("quizQuestion");
  if (qEl) qEl.textContent = q.question;

  const optsWrap = document.getElementById("quizOptions");
  if (optsWrap) {
    optsWrap.innerHTML = "";
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "quiz-opt";
      btn.textContent = opt.text;
      btn.onclick = () => answerQuiz(btn, opt.correct);
      optsWrap.appendChild(btn);
    });
  }

  document.getElementById("quizModal")?.classList.add("show");
}

function closeQuiz() {
  document.getElementById("quizModal")?.classList.remove("show");
}

function answerQuiz(el, correct) {
  document.querySelectorAll(".quiz-opt").forEach((o) => (o.disabled = true));
  if (correct) {
    el.classList.add("correct");
    setTimeout(() => {
      closeQuiz();
      addPoints(10, "Resposta correta!");
      addActivity(
        `Quiz concluído: ${places[currentDetailKey]?.name || ""}`,
        10,
      );
    }, 600);
  } else {
    el.classList.add("wrong");
    setTimeout(() => showToast("Resposta incorreta, tente outro quiz!"), 400);
  }
}

/* ===================== FAVORITOS ===================== */
function toggleFavorite(key, wrapEl, iconEl) {
  const idx = favorites.indexOf(key);
  if (idx > -1) {
    favorites.splice(idx, 1);
    wrapEl?.classList.remove("active");
    if (iconEl) iconEl.className = "fa-regular fa-star";
    showToast("Removido dos favoritos");
  } else {
    favorites.push(key);
    wrapEl?.classList.add("active");
    if (iconEl) iconEl.className = "fa-solid fa-star";
    showToast("Adicionado aos favoritos ⭐");
  }
  saveState();
  renderFavorites();
}

function renderFavorites() {
  const list = document.getElementById("favoritesList");
  if (!list) return;
  if (favorites.length === 0) {
    list.innerHTML = `<p style="color:var(--text-2); text-align:center; padding:40px 0;">Toque na estrela ⭐ dos lugares para salvá-los aqui.</p>`;
    return;
  }
  list.innerHTML = favorites
    .map((key) => {
      const p = places[key];
      if (!p) return "";
      return `
        <div class="place-card" onclick="openDetail('${key}')">
          <img src="${p.img}" alt="${p.name}">
          <div class="info">
            <h4>${p.name}</h4>
            <p><i class="fa-solid fa-location-dot"></i> ${p.dist} · ${p.priceNote}</p>
          </div>
          <i class="fa-solid fa-chevron-right chev"></i>
        </div>`;
    })
    .join("");
}

/* ===================== LOGIN TOGGLE (PERFIL) ===================== */
function toggleLogin() {
  isLogged = !isLogged;
  saveState();
  renderProfile();
}

function renderProfile() {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.style.display = val;
  };
  set("profileHeaderLogged", isLogged ? "block" : "none");
  set("profileHeaderGuest", isLogged ? "none" : "block");
  set("userName", isLogged ? "block" : "none");
  set("loginBox", isLogged ? "none" : "block");
  set("badgeLockedTxt", isLogged ? "none" : "block");

  const badgesRow = document.getElementById("badgesRow");
  if (badgesRow) badgesRow.style.opacity = isLogged ? "1" : ".35";

  const activityList = document.getElementById("activityList");
  if (!isLogged) {
    const ptsEl = document.getElementById("ptsNum");
    if (ptsEl) ptsEl.innerHTML = '0 <small style="font-size:14px;">pts</small>';
    document
      .querySelectorAll(".metric .num")
      .forEach((m) => (m.textContent = "0"));
    if (activityList) {
      activityList.innerHTML = `
        <div class="activity-row">
          <div class="icon-circle" style="background:#eee; color:#999;"><i class="fa-solid fa-xmark"></i></div>
          <div class="txt"><h5>Você não fez login ainda</h5><span>Pendente</span></div>
        </div>`;
    }
  } else {
    updatePointsUI();
    document
      .querySelectorAll(".metric .num")
      .forEach((m, i) => (m.textContent = [24, 37, 18, 12][i]));
    if (activityList) {
      activityList.innerHTML = `
        <div class="activity-row">
          <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop">
          <div class="txt"><h5>Você visitou Caixa Cultural Recife</h5><span>Ontem</span></div>
          <div class="pts">+20 pts</div>
        </div>
        <div class="activity-row">
          <div class="icon-circle"><i class="fa-solid fa-check"></i></div>
          <div class="txt"><h5>Quiz concluído: Paço do Frevo</h5><span>Ontem</span></div>
          <div class="pts">+10 pts</div>
        </div>`;
    }
  }
}

/* ===================== LEAFLET MAP ===================== */
const spots = [
  {
    key: "pacofrevo",
    name: "Paço do Frevo",
    lat: -8.0611,
    lng: -34.8712,
    color: "#D9381E",
  },
  {
    key: "cais",
    name: "Cais do Sertão",
    lat: -8.0598,
    lng: -34.8709,
    color: "#F05A24",
  },
  {
    key: "mercado",
    name: "Mercado da Boa Vista",
    lat: -8.0665,
    lng: -34.8746,
    color: "#0B52C6",
  },
  {
    key: "pacofrevo",
    name: "Marco Zero",
    lat: -8.0631,
    lng: -34.8711,
    color: "#0B52C6",
  },
  {
    key: "cais",
    name: "Rua do Bom Jesus",
    lat: -8.0585,
    lng: -34.8705,
    color: "#F2B807",
  },
];

function initMap() {
  const mapEl = document.getElementById("mapView");
  if (!mapEl) return;
  if (mapInstance) {
    mapInstance.invalidateSize();
    return;
  }
  mapInstance = L.map("mapView", { zoomControl: false }).setView(
    [-8.0631, -34.8711],
    14,
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
    mapInstance,
  );

  spots.forEach((s) => {
    const icon = L.divIcon({
      html: `<div style="background:${s.color};width:34px;height:34px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,.3);">
               <i class="fa-solid fa-umbrella-beach" style="color:#fff;font-size:12px;"></i>
             </div>`,
      className: "",
      iconSize: [34, 34],
    });
    const m = L.marker([s.lat, s.lng], { icon }).addTo(mapInstance);
    m.bindPopup(`<b>${s.name}</b>`);
    m.on("click", () => openDetail(s.key));
    markerLayer.push({ marker: m, name: s.name });
  });
}

function filterMap(q) {
  q = q.toLowerCase();
  markerLayer.forEach(({ marker, name }) => {
    if (name.toLowerCase().includes(q)) marker.setOpacity(1);
    else marker.setOpacity(q ? 0.15 : 1);
  });
}

/* ===================== BUSCA (HOME) ===================== */
function searchPlaces(query) {
  query = query.toLowerCase().trim();
  document.querySelectorAll(".place-card, .now-card").forEach((row) => {
    const name = row.querySelector("h4")?.textContent.toLowerCase() || "";
    row.style.display = name.includes(query) ? "flex" : "none";
  });
}

function setupHomeSearch() {
  const input = document.querySelector("#screen-home .search-pill input");
  input?.addEventListener("input", (e) => searchPlaces(e.target.value));
}

/* ===================== FILTROS (CHIPS + CAT-PILLS) ===================== */
function setupChipFilters() {
  document
    .querySelectorAll(".chip-row, .filter-row, .cat-pill-row")
    .forEach((row) => {
      row.querySelectorAll(".chip, .filter-chip, .cat-pill").forEach((chip) => {
        chip.addEventListener("click", () => {
          row
            .querySelectorAll(".chip, .filter-chip, .cat-pill")
            .forEach((c) => c.classList.remove("active"));
          chip.classList.add("active");

          const label = chip.textContent.trim().toLowerCase();
          showToast(`Filtrando por: ${chip.textContent}`);

          if (row.classList.contains("filter-row")) {
            filterRoutesByChip(label);
          }
        });
      });
    });
}

function filterRoutesByChip(label) {
  const map = {
    recomendados: null,
    econômicas: "econômica",
    performáticas: "performática",
    "em grupo": "em grupo",
  };
  const target = map[label];
  document
    .querySelectorAll("#screen-routes .route-card-mini")
    .forEach((card) => {
      if (!target) return (card.style.display = "flex");
      const badge = card
        .querySelector(".badge")
        ?.textContent.trim()
        .toLowerCase();
      card.style.display = badge === target ? "flex" : "none";
    });
}

/* ===================== GEOLOCALIZAÇÃO REAL ===================== */
function setupGeolocation() {
  document.querySelector(".locate-btn")?.addEventListener("click", () => {
    if (!navigator.geolocation)
      return showToast("Geolocalização não suportada");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstance) {
          mapInstance.setView([latitude, longitude], 15);
          L.marker([latitude, longitude], {
            icon: L.divIcon({
              html: '<div style="background:#0B52C6;width:16px;height:16px;border-radius:50%;border:3px solid #fff;"></div>',
              iconSize: [16, 16],
            }),
          }).addTo(mapInstance);
        }
        showToast("Localização encontrada!");
      },
      () => showToast("Não foi possível obter localização"),
    );
  });
}

/* ===================== "VER TODOS" / "VER TUDO" ===================== */
function setupSectionLinks() {
  document.querySelectorAll(".section-title a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      goto("screen-routes");
    });
  });
}

/* ===================== SETTINGS ===================== */
function setupSettingsButtons() {
  document.querySelectorAll(".settings-btn").forEach((btn) => {
    btn.addEventListener("click", () => showToast("Configurações em breve ⚙️"));
  });
}

/* ===================== FECHAR OVERLAY NO FUNDO ===================== */
function setupOverlayClose() {
  ["detailOverlay", "routeOverlay"].forEach((id) => {
    const overlay = document.getElementById(id);
    overlay?.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("show");
    });
  });

  document.getElementById("quizModal")?.addEventListener("click", (e) => {
    if (e.target.id === "quizModal") closeQuiz();
  });
}

/* ===================== FAVORITAR NOS CARDS DE LISTA =====================
   Correção: .now-card já tem uma <i class="star"> fixa no HTML, então
   reaproveitamos ela. Só criamos a estrela extra em .place-card, que
   não tem nenhuma. Isso elimina a estrela duplicada do bug visual. */
function setupPlaceRowFavorites() {
  function extractKey(row) {
    const onClickAttr = row.getAttribute("onclick") || "";
    const match = onClickAttr.match(/openDetail\('(.+)'\)/);
    return match ? match[1] : null;
  }

  // now-card: reaproveita o ícone .star já existente no HTML
  document.querySelectorAll(".now-card").forEach((row) => {
    const star = row.querySelector(".star");
    const key = extractKey(row);
    if (!star || !key) return;
    star.className = favorites.includes(key)
      ? "fa-solid fa-star star"
      : "fa-regular fa-star star";
    star.onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(key, null, null);
      star.className = favorites.includes(key)
        ? "fa-solid fa-star star"
        : "fa-regular fa-star star";
    };
  });

  // place-card: cria a estrela, pois não existe no HTML
  document.querySelectorAll(".place-card").forEach((row) => {
    if (row.querySelector(".row-fav")) return;
    const key = extractKey(row);
    if (!key) return;
    const btn = document.createElement("i");
    btn.className = favorites.includes(key)
      ? "fa-solid fa-star row-fav"
      : "fa-regular fa-star row-fav";
    btn.style.cssText =
      "margin-left:8px;color:var(--yellow);font-size:16px;cursor:pointer;";
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(key, null, null);
      btn.className = favorites.includes(key)
        ? "fa-solid fa-star row-fav"
        : "fa-regular fa-star row-fav";
    };
    const chev = row.querySelector(".chev");
    if (chev) row.insertBefore(btn, chev);
    else row.appendChild(btn);
  });
}

/* ===================== PERSISTÊNCIA ===================== */
function loadState() {
  totalPoints = Number(localStorage.getItem("ytu_pts")) || 1250;
  isLogged = localStorage.getItem("ytu_logged") !== "false";
  favorites = JSON.parse(localStorage.getItem("ytu_favs") || "[]");
  visited = JSON.parse(localStorage.getItem("ytu_visited") || "[]");
}

function saveState() {
  localStorage.setItem("ytu_pts", totalPoints);
  localStorage.setItem("ytu_logged", isLogged);
  localStorage.setItem("ytu_favs", JSON.stringify(favorites));
  localStorage.setItem("ytu_visited", JSON.stringify(visited));
}

/* ===================== INIT GERAL ===================== */
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  updatePointsUI();
  renderProfile();
  renderFavorites();
  setupChipFilters();
  setupHomeSearch();
  setupGeolocation();
  setupSectionLinks();
  setupSettingsButtons();
  setupOverlayClose();
  setupPlaceRowFavorites();
});
