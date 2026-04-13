const commonMotos = [
  { nome: "Honda CG 125", velocidade: 120, categoria: "Raiz", status: "disponivel" },
  { nome: "Honda Biz 125", velocidade: 110, categoria: "Raiz", status: "disponivel" },
  { nome: "Honda Pop 110i", velocidade: 105, categoria: "Meme", status: "disponivel" },
  { nome: "Honda Bros 160", velocidade: 150, categoria: "Off-road", status: "esgotado" },
  { nome: "Honda Twister 250", velocidade: 160, categoria: "Street", status: "disponivel" },
  { nome: "Yamaha NMAX 160", velocidade: 120, categoria: "Scooter", status: "disponivel" }
];

const vipMotos = [
  { nome: "Honda CBR 1000RR", velocidade: 300, categoria: "Esportiva", status: "disponivel", precoVip: "R$ 74,90" },
  { nome: "Ducati Panigale V4", velocidade: 320, categoria: "Esportiva", status: "disponivel", precoVip: "R$ 79,90" },
  { nome: "Yamaha MT-07", velocidade: 230, categoria: "Esportiva", status: "disponivel", precoVip: "R$ 52,90" },
  { nome: "Suzuki GSX-R1000", velocidade: 305, categoria: "Esportiva", status: "disponivel", precoVip: "R$ 69,90" },
  { nome: "Honda Africa Twin", velocidade: 210, categoria: "Off-road", status: "disponivel", precoVip: "R$ 54,90" },
  { nome: "BMW S1000 RR", velocidade: 310, categoria: "Esportiva", status: "disponivel", precoVip: "R$ 59,90" },
  { nome: "Honda CG 160 Titan", velocidade: 150, categoria: "Street", status: "disponivel", precoVip: "R$ 29,90" },
  { nome: "Honda CG 160 Fan", velocidade: 145, categoria: "Street", status: "disponivel", precoVip: "R$ 27,90" },
  { nome: "Honda CG 160 Start", velocidade: 140, categoria: "Street", status: "disponivel", precoVip: "R$ 25,90" },
  { nome: "Honda XRE 300", velocidade: 180, categoria: "Off-road", status: "disponivel", precoVip: "R$ 39,90" },
  { nome: "Yamaha Lander 250", velocidade: 170, categoria: "Off-road", status: "disponivel", precoVip: "R$ 37,90" },
  { nome: "Yamaha XJ6", velocidade: 210, categoria: "Esportiva", status: "disponivel", precoVip: "R$ 49,90" },
  { nome: "Honda Sahara 300", velocidade: 175, categoria: "Off-road", status: "disponivel", precoVip: "R$ 36,90" },
  { nome: "Yamaha MT-03", velocidade: 190, categoria: "Esportiva", status: "disponivel", precoVip: "R$ 34,90" },
  { nome: "Yamaha R3", velocidade: 200, categoria: "Esportiva", status: "disponivel", precoVip: "R$ 44,90" },
  { nome: "Yamaha XT 660", velocidade: 185, categoria: "Off-road", status: "disponivel", precoVip: "R$ 39,90" }
];

const catalogGrid = document.getElementById("catalogGrid");
const vipGrid = document.getElementById("vipGrid");

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function statusInfo(status) {
  if (status === "esgotado") {
    return { label: "Esgotado", className: "soldout" };
  }
  return { label: "Disponivel", className: "available" };
}

function cardImageByCategory(categoria) {
  const map = {
    "Street": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80",
    "Off-road": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
    "Esportiva": "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1000&q=80",
    "Scooter": "https://images.unsplash.com/photo-1558979158-65a1eaa08691?auto=format&fit=crop&w=1000&q=80",
    "Raiz": "https://images.unsplash.com/photo-1524591652733-73fa1ae7b5ee?auto=format&fit=crop&w=1000&q=80",
    "Meme": "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?auto=format&fit=crop&w=1000&q=80"
  };

  return map[categoria] || map.Street;
}

const localImageBySlug = {
  "honda-biz-125": "/motos/imgs/honda-biz-125.jpg",
  "honda-bros-160": "/motos/imgs/honda-bros-160.webp",
  "honda-cg-125": "/motos/imgs/honda-cg-125.webp",
  "honda-cg-160-fan": "/motos/imgs/honda-cg-160-fan.webp",
  "honda-cg-160-start": "/motos/imgs/honda-cg-160-start.webp",
  "honda-cg-160-titan": "/motos/imgs/honda-cg-160-titan.webp",
  "honda-pop-110i": "/motos/imgs/honda-pop-110i.webp",
  "honda-twister-250": "/motos/imgs/honda-twister-250.jpg",
  "honda-xre-300": "/motos/imgs/honda-xre-300.webp",
  "yamaha-lander-250": "/motos/imgs/yamaha-lander-250.webp",
  "yamaha-nmax-160": "/motos/imgs/yamaha-nmax-160.jpg",
  "yamaha-mt-03": "/motos/imgs/yamaha-mt-03.webp",
  "yamaha-r3": "/motos/imgs/yamaha-r3.webp",
  "yamaha-xt-660": "/motos/imgs/yamaha-xt-660.jpg",
  "yamaha-xj6": "/motos/imgs/xj6.webp",
  "honda-sahara-300": "/motos/imgs/sahara300.webp",
  "bmw-s1000-rr": "/motos/imgs/s1000rr.webp",
  "honda-africa-twin": "/motos/imgs/honda-africa-twin.webp",
  "suzuki-gsx-r1000": "/motos/imgs/suzuki-gsx-r1000.webp",
  "yamaha-mt-07": "/motos/imgs/yamaha-mt-07.png",
  "ducati-panigale-v4": "/motos/imgs/ducati-panigale-v4.jpg",
  "honda-cbr-1000rr": "/motos/imgs/honda-cbr-1000rr.webp"
};

function resolveCardImage(moto) {
  const slug = slugify(moto.nome);
  return localImageBySlug[slug] || cardImageByCategory(moto.categoria);
}

function renderCatalog() {
  const list = commonMotos;

  catalogGrid.innerHTML = list
    .map((moto) => {
      const status = statusInfo(moto.status);
      const image = resolveCardImage(moto);
      const slug = slugify(moto.nome);
      return `
        <article class="card">
          <div class="card-image">
            <img src="${image}" alt="${moto.nome}" loading="lazy" />
            <span class="badge">Comum</span>
          </div>
          <div class="card-content">
            <h3>${moto.nome}</h3>
            <ul class="specs">
              <li><span class="spec-label">Velocidade</span><strong>${moto.velocidade} km/h</strong></li>
              <li><span class="spec-label">Categoria</span><strong>${moto.categoria}</strong></li>
            </ul>
            <p class="status ${status.className}">${status.label}</p>
            <div class="card-footer">
              <span class="price">Moeda RP</span>
              <a class="btn btn-ghost" href="motos/${slug}.html">Abrir Página</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderVip() {
  const list = vipMotos;

  vipGrid.innerHTML = list
    .map((moto) => {
      const status = statusInfo(moto.status);
      const image = resolveCardImage(moto);
      const slug = slugify(moto.nome);
      return `
        <article class="card">
          <div class="card-image">
            <img src="${image}" alt="${moto.nome}" loading="lazy" />
            <span class="badge vip-tag">VIP Real</span>
          </div>
          <div class="card-content">
            <h3>${moto.nome}</h3>
            <ul class="specs">
              <li><span class="spec-label">Velocidade</span><strong>${moto.velocidade} km/h</strong></li>
              <li><span class="spec-label">Categoria</span><strong>${moto.categoria}</strong></li>
            </ul>
            <p class="status ${status.className}">${status.label}</p>
            <div class="card-footer">
              <span class="price">${moto.precoVip} (dinheiro real)</span>
              <a class="btn btn-primary" href="motos/${slug}.html">Abrir Página</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function initReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

renderCatalog();
renderVip();
initReveal();