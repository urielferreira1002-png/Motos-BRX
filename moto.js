const motos = [
  { nome: "Honda CG 160 Titan", velocidade: 140, categoria: "Street", status: "disponivel", tipo: "Comum" },
  { nome: "Honda CG 160 Fan", velocidade: 135, categoria: "Street", status: "disponivel", tipo: "Comum" },
  { nome: "Honda CG 160 Start", velocidade: 130, categoria: "Street", status: "disponivel", tipo: "Comum" },
  { nome: "Honda CG 125", velocidade: 120, categoria: "Raiz", status: "disponivel", tipo: "Comum" },
  { nome: "Honda Biz 125", velocidade: 110, categoria: "Raiz", status: "disponivel", tipo: "Comum" },
  { nome: "Honda Pop 110i", velocidade: 105, categoria: "Meme", status: "esgotado", tipo: "Comum" },
  { nome: "Honda XRE 300", velocidade: 160, categoria: "Off-road", status: "disponivel", tipo: "Comum" },
  { nome: "Honda Bros 160", velocidade: 150, categoria: "Off-road", status: "disponivel", tipo: "Comum" },
  { nome: "Honda CB 300F", velocidade: 170, categoria: "Street", status: "disponivel", tipo: "VIP", precoVip: "R$ 24,90" },
  { nome: "Honda Twister 250", velocidade: 160, categoria: "Street", status: "disponivel", tipo: "Comum" },
  { nome: "Yamaha Fazer 250", velocidade: 165, categoria: "Street", status: "disponivel", tipo: "Comum" },
  { nome: "Yamaha Lander 250", velocidade: 155, categoria: "Off-road", status: "disponivel", tipo: "Comum" },
  { nome: "Yamaha XTZ 150", velocidade: 140, categoria: "Off-road", status: "disponivel", tipo: "Comum" },
  { nome: "Yamaha Factor 150", velocidade: 135, categoria: "Street", status: "esgotado", tipo: "Comum" },
  { nome: "Yamaha MT-03", velocidade: 190, categoria: "Esportiva", status: "disponivel", tipo: "VIP", precoVip: "R$ 34,90" },
  { nome: "Yamaha R3", velocidade: 200, categoria: "Esportiva", status: "disponivel", tipo: "VIP", precoVip: "R$ 44,90" },
  { nome: "Yamaha XT 660", velocidade: 180, categoria: "Off-road", status: "esgotado", tipo: "VIP", precoVip: "R$ 39,90" },
  { nome: "Yamaha NMAX 160", velocidade: 120, categoria: "Scooter", status: "disponivel", tipo: "Comum" },
  { nome: "Yamaha Neo 125", velocidade: 110, categoria: "Scooter", status: "disponivel", tipo: "Comum" },
  { nome: "Yamaha Crosser 150", velocidade: 145, categoria: "Off-road", status: "disponivel", tipo: "Comum" },
  { nome: "Dafra NH 190", velocidade: 140, categoria: "Off-road", status: "disponivel", tipo: "Comum" },
  { nome: "Dafra Apache RTR 200", velocidade: 160, categoria: "Street", status: "disponivel", tipo: "Comum" },
  { nome: "Dafra Next 250", velocidade: 165, categoria: "Street", status: "disponivel", tipo: "Comum" },
  { nome: "Haojue DK 150", velocidade: 130, categoria: "Street", status: "disponivel", tipo: "Comum" },
  { nome: "Haojue DR 160", velocidade: 140, categoria: "Street", status: "disponivel", tipo: "Comum" },
  { nome: "Haojue NK 150", velocidade: 135, categoria: "Street", status: "disponivel", tipo: "Comum" },
  { nome: "Shineray XY 150", velocidade: 120, categoria: "Raiz", status: "esgotado", tipo: "Comum" },
  { nome: "Shineray Jet 125", velocidade: 110, categoria: "Scooter", status: "disponivel", tipo: "Comum" },
  { nome: "Sundown Max 125", velocidade: 115, categoria: "Raiz", status: "disponivel", tipo: "Comum" },
  { nome: "Traxx Star 50", velocidade: 90, categoria: "Meme", status: "esgotado", tipo: "Comum" }
];

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

function imageByCategory(categoria) {
  const map = {
    "Street": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1400&q=80",
    "Off-road": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80",
    "Esportiva": "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1400&q=80",
    "Scooter": "https://images.unsplash.com/photo-1558979158-65a1eaa08691?auto=format&fit=crop&w=1400&q=80",
    "Raiz": "https://images.unsplash.com/photo-1524591652733-73fa1ae7b5ee?auto=format&fit=crop&w=1400&q=80",
    "Meme": "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?auto=format&fit=crop&w=1400&q=80"
  };
  return map[categoria] || map.Street;
}

function renderDetail() {
  const root = document.getElementById("detailRoot");
  const slug = new URLSearchParams(window.location.search).get("modelo");

  const moto = motos.find((item) => slugify(item.nome) === slug);
  if (!moto) {
    root.innerHTML = `
      <section class="detail-empty">
        <h1 class="detail-title">Moto não encontrada</h1>
        <p class="detail-meta">Volte para o catálogo e selecione um modelo válido.</p>
        <p><a class="btn btn-primary" href="index.html#catalogo">Ir para Catálogo</a></p>
      </section>
    `;
    return;
  }

  const status = statusInfo(moto.status);
  const image = imageByCategory(moto.categoria);
  const compra = moto.tipo === "VIP" ? `${moto.precoVip} (dinheiro real)` : "Moeda RP";

  document.title = `${moto.nome} | Motos BRX`;

  root.innerHTML = `
    <section class="detail-layout reveal visible">
      <article class="detail-visual">
        <img src="${image}" alt="${moto.nome}" loading="lazy" />
      </article>

      <article class="detail-panel">
        <p class="kicker">Página Individual</p>
        <h1 class="detail-title">${moto.nome}</h1>
        <p class="detail-meta">Modelo ${moto.tipo} para cidade RP com foco em estilo e desempenho.</p>

        <ul class="detail-specs">
          <li><span class="spec-label">Velocidade máxima</span><strong>${moto.velocidade} km/h</strong></li>
          <li><span class="spec-label">Categoria</span><strong>${moto.categoria}</strong></li>
          <li><span class="spec-label">Tipo</span><strong>${moto.tipo}</strong></li>
          <li><span class="spec-label">Forma de compra</span><strong>${compra}</strong></li>
        </ul>

        <p class="status ${status.className}">${status.label}</p>

        <div class="detail-actions">
          <a class="btn btn-primary" href="https://discord.gg/seu-servidor" target="_blank" rel="noopener noreferrer">Comprar no Discord</a>
          <a class="btn btn-ghost" href="index.html#catalogo">Voltar ao catálogo</a>
        </div>
      </article>
    </section>
  `;
}

renderDetail();