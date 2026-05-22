// --- INICIALIZAÇÃO (chamada por menu.js após o view ser injetado) ---
function initCalculadora() {
    const num = String(Math.floor(Math.random() * 9000000000) + 1000000000);
    document.getElementById("p_num_pedido").textContent = "#" + num;

    document.querySelectorAll(".panel-header").forEach(header => {
        const chevron = document.createElement("span");
        chevron.className = "panel-toggle";
        chevron.textContent = "▾";
        header.appendChild(chevron);
        header.addEventListener("click", () => {
            header.closest(".panel").classList.toggle("panel--collapsed");
        });
    });

    calcular();
}

// --- PEÇAS ---
function atualizarBotoesPeca() {
    const rows = document.querySelectorAll("#container-pecas .peca-row");
    rows.forEach((row, i) => {
        row.querySelector(".btn-remove").style.visibility = rows.length > 1 ? "visible" : "hidden";
    });
}

function adicionarPeca() {
    const div = document.createElement("div");
    div.className = "peca-row";
    div.innerHTML = `
      <input type="text" class="peca-nome" placeholder="ex: Suporte de Fone">
      <input type="text" class="peca-horas" placeholder="ex: 3:30 ou 2.5" oninput="calcular()">
      <input type="number" class="peca-peso" placeholder="0" step="0.01" oninput="calcular()">
      <button type="button" class="btn-remove" onclick="removerPeca(this)">✕</button>
    `;
    document.getElementById("container-pecas").appendChild(div);
    atualizarBotoesPeca();
}

function removerPeca(btn) {
    const container = document.getElementById("container-pecas");
    if (container.children.length <= 1) return;
    btn.parentElement.remove();
    atualizarBotoesPeca();
    calcular();
}

// --- EXTRAS ---
function adicionarCampoExtra() {
    const div = document.createElement("div");
    div.className = "extra-row";
    div.innerHTML = `
      <input type="text" class="extra-desc" placeholder="Descrição (ex: Lixa)">
      <input type="number" class="extra-val" placeholder="Valor" oninput="calcular()">
      <label class="extra-recibo"><span>Recibo?</span><input type="checkbox" class="extra-chk" checked></label>
      <button type="button" class="btn-remove" onclick="removerExtra(this)">✕</button>
    `;
    document.getElementById("container-extras").appendChild(div);
}

function removerExtra(btn) {
    btn.parentElement.remove();
    calcular();
}

// --- CÁLCULO PRINCIPAL ---
function calcularValores() {
    const pKg    = val("p_filamento");
    const pKwh   = val("p_kwh");
    const watts  = val("p_watts");

    let horas = 0, peso = 0;
    document.querySelectorAll(".peca-row").forEach(r => {
        horas += parseHoras(r.querySelector(".peca-horas")?.value);
        peso  += Number(r.querySelector(".peca-peso")?.value) || 0;
    });

    const consumoKwh     = (watts * horas) / 1000;
    const custoFilamento = (peso / 1000) * pKg;
    const custoEnergia   = consumoKwh * pKwh;

    const valorRoloEmbalagem = val("p_rolo_embalagem");
    const embalagensRolo     = Math.max(val("p_embalagens_rolo"), 1);
    const unidadesMes        = Math.max(val("p_unidades_mes"), 1);
    const custoFixoMensal    = val("p_custo_fixo");
    const custoEmbalagem     = valorRoloEmbalagem / embalagensRolo;
    const custoFixo          = custoFixoMensal / unidadesMes;

    const valorImpressora = val("p_impressora");
    const vidaUtilHoras   = Math.max(val("p_vida_util"), 1);
    const amortizacao     = (valorImpressora / vidaUtilHoras) * horas;

    const frete = val("p_frete");

    let totalExtras = 0;
    document.querySelectorAll(".extra-val").forEach((i) => { totalExtras += Number(i.value) || 0; });

    const taxaFalha   = val("p_falha");
    const imposto     = val("p_imposto");
    const taxaCartao  = val("p_cartao");
    const custoAnuncio = val("p_anuncio");
    const markup      = Math.max(val("p_markup"), 1);

    const custoBase   = custoFilamento + custoEnergia + custoEmbalagem + custoFixo + amortizacao + totalExtras + frete;
    const custoFalhas = custoBase * (taxaFalha / 100);
    const custoTotal  = custoBase + custoFalhas;

    const precoVenda    = custoTotal * markup;
    const valorImposto  = precoVenda * (imposto / 100);
    const valorCartao   = precoVenda * (taxaCartao / 100);
    const valorAnuncio  = precoVenda * (custoAnuncio / 100);
    const lucroBruto    = precoVenda - custoTotal;
    const lucroLiquido  = lucroBruto - valorImposto - valorCartao - valorAnuncio;

    const precoLojista        = precoVenda * 0.5;
    const lucroLiquidoLojista = (precoLojista - custoTotal) - (precoLojista * imposto / 100);

const lucroPct         = val("p_lucro_pct");
    const precoSugerido    = custoTotal * (1 + lucroPct / 100);
    const precoVendaManual = val("p_preco_venda_manual");
    const lucroTotal       = precoVendaManual - custoTotal;

    const taxaShopee    = val("p_taxa_shopee");
    const taxaML        = val("p_taxa_ml");
    const taxaTikTok    = val("p_taxa_tiktok");
    const feeShopee     = precoVenda * taxaShopee  / 100;
    const feeML         = precoVenda * taxaML      / 100;
    const feeTikTok     = precoVenda * taxaTikTok  / 100;
    const precoShopee   = precoVenda + feeShopee;
    const precoML       = precoVenda + feeML;
    const precoTikTok   = precoVenda + feeTikTok;
    const lucroShopee   = precoShopee  - feeShopee;
    const lucroML       = precoML      - feeML;
    const lucroTikTok   = precoTikTok  - feeTikTok;

    return {
        consumoKwh, custoFilamento, custoEnergia, custoEmbalagem, custoFixo,
        amortizacao, totalExtras, frete, custoFalhas, custoTotal, taxaFalha,
        precoVenda, valorImposto, valorCartao, valorAnuncio, lucroBruto, lucroLiquido,
        precoLojista, lucroLiquidoLojista,
        imposto, taxaCartao, custoAnuncio,
        lucroPct, precoSugerido, precoVendaManual, lucroTotal,
        taxaShopee, taxaML, taxaTikTok,
        precoShopee, precoML, precoTikTok,
        lucroShopee, lucroML, lucroTikTok,
    };
}

function calcular() {
    const v = calcularValores();

    document.getElementById("p_consumo_kwh").value = v.consumoKwh.toFixed(3);

    setTxt("res_filamento",   v.custoFilamento);
    setTxt("res_energia",     v.custoEnergia);
    setTxt("res_embalagem",   v.custoEmbalagem);
    setTxt("res_fixo",        v.custoFixo);
    setTxt("res_amortizacao", v.amortizacao);
    setTxt("res_extras",      v.totalExtras);
    setTxt("res_frete",       v.frete);
    setTxt("res_falhas",      v.custoFalhas);
    setTxt("res_custo_total", v.custoTotal);

    document.getElementById("lbl_falha").textContent   = v.taxaFalha;
    document.getElementById("lbl_imposto").textContent = v.imposto;
    document.getElementById("lbl_cartao").textContent  = v.taxaCartao;
    document.getElementById("lbl_anuncio").textContent = v.custoAnuncio;

    setTxt("res_preco_venda",   v.precoVenda);
    setTxt("res_lucro_bruto",   v.lucroBruto);
    setTxt("res_lucro_liquido", v.lucroLiquido);
    setTxt("res_preco_lojista", v.precoLojista);
    setTxt("res_lucro_lojista", v.lucroLiquidoLojista);

    document.getElementById("lbl_taxa_shopee").textContent = v.taxaShopee;
    document.getElementById("lbl_taxa_ml").textContent     = v.taxaML;
    document.getElementById("lbl_taxa_tiktok").textContent = v.taxaTikTok;
    setTxt("res_preco_shopee",  v.precoShopee);
    setTxt("res_lucro_shopee",  v.lucroShopee);
    setTxt("res_preco_ml",      v.precoML);
    setTxt("res_lucro_ml",      v.lucroML);
    setTxt("res_preco_tiktok",  v.precoTikTok);
    setTxt("res_lucro_tiktok",  v.lucroTikTok);

    setTxt("res_imposto", v.valorImposto);
    setTxt("res_cartao",  v.valorCartao);
    setTxt("res_anuncio", v.valorAnuncio);

    setTxt("res_preco_sugerido", v.precoSugerido);
    setTxt("res_lucro_total",    v.lucroTotal);
}

// --- UTILITÁRIOS ---
function parseHoras(str) {
    if (!str) return 0;
    str = String(str).trim().replace(/[hH]$/, "");
    if (str.includes(":")) {
        const [h, m] = str.split(":");
        return (Number(h) || 0) + (Number(m) || 0) / 60;
    }
    return Number(str) || 0;
}

function val(id) {
    return Number(document.getElementById(id).value) || 0;
}

function setTxt(id, valor) {
    document.getElementById(id).innerText = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// --- GERAR RECIBO ---
function gerarRecibo() {
    const v          = calcularValores();
    const fmt        = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const numPedido  = document.getElementById("p_num_pedido").textContent || "";
    const cliente    = document.getElementById("p_cliente").value || "";
    const observacao = document.getElementById("p_observacao").value || "";

    const pecas = [...document.querySelectorAll(".peca-row")]
        .map(r => r.querySelector(".peca-nome")?.value?.trim())
        .filter(Boolean);

    const extrasRecibo = [...document.querySelectorAll(".extra-row")]
        .filter(r => r.querySelector(".extra-chk")?.checked)
        .map(r => ({
            desc: r.querySelector(".extra-desc")?.value?.trim() || "Extra",
            val:  Number(r.querySelector(".extra-val")?.value) || 0,
        }))
        .filter(e => e.val > 0);

    const precoFinal        = v.precoVendaManual > 0 ? v.precoVendaManual : v.precoVenda;
    const totalExtrasRecibo = extrasRecibo.reduce((s, e) => s + e.val, 0);
    const precoImpressao    = precoFinal - totalExtrasRecibo;

    const itensHTML = [
        `<tr>
          <td>Impressão 3D${pecas.length ? ` — ${pecas.join(", ")}` : ""}</td>
          <td>${fmt(precoImpressao)}</td>
        </tr>`,
        ...extrasRecibo.map(e => `<tr><td>${e.desc}</td><td>${fmt(e.val)}</td></tr>`),
    ].join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Recibo ${numPedido}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; max-width: 480px; margin: 40px auto; padding: 32px; color: #111; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #111; padding-bottom: 16px; }
    .header h1 { font-size: 1.6rem; letter-spacing: .1em; text-transform: uppercase; }
    .header p { font-size: 13px; color: #555; margin-top: 4px; }
    .meta { font-size: 13px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 4px; }
    .obs { background: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 8px 12px; font-size: 13px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 0; }
    thead tr { border-bottom: 2px solid #111; }
    tbody tr { border-bottom: 1px solid #ddd; }
    th, td { padding: 8px 4px; }
    th:last-child, td:last-child { text-align: right; }
    th:first-child, td:first-child { text-align: left; }
    .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #111; padding-top: 12px; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 16px; font-size: 12px; color: #777; display: flex; justify-content: space-between; }
    @media print { body { margin: 0; padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Recibo</h1>
    <p>${numPedido ? `Pedido ${numPedido} &nbsp;·&nbsp; ` : ""}${new Date().toLocaleDateString("pt-BR")}</p>
  </div>
  ${cliente    ? `<div class="meta"><span><strong>Cliente:</strong> ${cliente}</span></div>` : ""}
  ${observacao ? `<div class="obs"><strong>Obs:</strong> ${observacao}</div>` : ""}
  <table>
    <thead><tr><th>Descrição</th><th>Valor</th></tr></thead>
    <tbody>${itensHTML}</tbody>
    <tfoot><tr class="total-row"><td>TOTAL</td><td>${fmt(precoFinal)}</td></tr></tfoot>
  </table>
  <div class="footer">
    <span>Obrigado pela preferência!</span>
    <span>${new Date().toLocaleDateString("pt-BR")}</span>
  </div>
</body>
</html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 800);
}

// --- SALVAR CÁLCULO ---
function salvarCalculo() {
    const v = calcularValores();
    const fmt = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const fmtN = (id) => document.getElementById(id).value || "—";

    const numPedido  = document.getElementById("p_num_pedido").textContent || "";
    const cliente    = document.getElementById("p_cliente").value || "";
    const observacao = document.getElementById("p_observacao").value;

    const pecas = [...document.querySelectorAll(".peca-row")].map(r => ({
        nome:  r.querySelector(".peca-nome")?.value || "—",
        horas: r.querySelector(".peca-horas")?.value || "0",
        peso:  r.querySelector(".peca-peso")?.value || "0",
    }));
    const nomesPecas = pecas.map(p => p.nome).filter(n => n !== "—").join(", ") || "Sem nome";

    const extrasHTML = (() => {
        const rows = [...document.querySelectorAll(".extra-row")];
        if (!rows.length) return "";
        return rows.map(r => {
            const desc = r.querySelector(".extra-desc")?.value || "";
            const vlr  = Number(r.querySelector(".extra-val")?.value) || 0;
            return `<tr><td>${desc}</td><td>${fmt(vlr)}</td></tr>`;
        }).join("");
    })();

    const p  = (label, id, suffix = "") => { const v = document.getElementById(id).value; return (v && v !== "0") ? `<tr><td>${label}</td><td>${v}${suffix}</td></tr>` : ""; };
    const c  = (label, valor, extra = "") => valor > 0 ? `<tr><td>${label}</td><td>${fmt(valor)}${extra}</td></tr>` : "";
    const mk = (title, bgColor, borderColor, textColor, preco, taxa, lucro) => taxa > 0 ? `
  <div class="box" style="background:${bgColor};border:1px solid ${borderColor};margin-bottom:8px">
    <div class="box-title" style="color:${textColor}">${title} (${taxa}%)</div>
    <div class="box-price" style="color:${textColor}">${fmt(preco)}</div>
    <div class="box-sub">Lucro líquido: ${fmt(lucro)}</div>
  </div>` : "";

    const marketplacesHTML = mk("Shopee",       "#fff4f2","#f8b4a4","#ee4d2d", v.precoShopee, v.taxaShopee, v.lucroShopee)
                           + mk("Mercado Livre","#fffde7","#ffe57f","#c9a800", v.precoML,     v.taxaML,     v.lucroML)
                           + mk("TikTok Shop",  "#e0f7fa","#80deea","#00838f", v.precoTikTok, v.taxaTikTok, v.lucroTikTok);

    const taxasVendaHTML = [
        v.valorImposto > 0 ? `<tr><td>Imposto (${v.imposto}%)</td><td>${fmt(v.valorImposto)}</td></tr>` : "",
        v.valorCartao  > 0 ? `<tr><td>Cartão (${v.taxaCartao}%)</td><td>${fmt(v.valorCartao)}</td></tr>` : "",
        v.valorAnuncio > 0 ? `<tr><td>Anúncio (${v.custoAnuncio}%)</td><td>${fmt(v.valorAnuncio)}</td></tr>` : "",
    ].join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Cálculo ${numPedido} — ${nomesPecas}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; color: #111; line-height: 1.5; }
    h1 { color: #1d4ed8; border-bottom: 2px solid #1d4ed8; padding-bottom: 8px; margin-bottom: 4px; }
    .meta { color: #555; font-size: 13px; margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 12px; }
    h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #374151; margin: 20px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 4px; }
    tr { border-bottom: 1px solid #e5e7eb; }
    td { padding: 6px 4px; }
    td:last-child { text-align: right; font-weight: 600; }
    td:first-child { color: #374151; font-weight: 400; }
    .total td { font-weight: 700; font-size: 16px; color: #16a34a; border-top: 2px solid #d1d5db; padding-top: 10px; }
    .params td:first-child { color: #6b7280; font-size: 13px; }
    .params td:last-child { color: #111; font-size: 13px; }
    .lucro-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px 16px; margin-bottom: 10px; }
    .lucro-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; }
    .lucro-row.total { font-weight: 700; font-size: 16px; border-top: 1px solid #bfdbfe; padding-top: 8px; margin-top: 4px; color: #1d4ed8; }
    .box { border-radius: 6px; padding: 12px 16px; margin-bottom: 10px; }
    .consumer { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .wholesale { background: #faf5ff; border: 1px solid #ddd6fe; }
    .box-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
    .consumer .box-title { color: #15803d; }
    .wholesale .box-title { color: #7c3aed; }
    .box-price { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .consumer .box-price { color: #16a34a; }
    .wholesale .box-price { color: #8b5cf6; }
    .box-sub { font-size: 12px; color: #555; }
    .obs { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px 14px; font-size: 13px; margin-bottom: 16px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Cálculo de Custos 3D</h1>
  <div class="meta">
    ${numPedido ? `<span><strong>Pedido:</strong> ${numPedido}</span>` : ""}
    ${cliente   ? `<span><strong>Cliente:</strong> ${cliente}</span>` : ""}
    <span><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</span>
  </div>
  ${observacao ? `<div class="obs"><strong>Obs:</strong> ${observacao}</div>` : ""}

  <h2>Peças</h2>
  <table>
    <tr style="background:#f3f4f6">
      <td><strong>Nome</strong></td>
      <td style="text-align:center"><strong>Horas</strong></td>
      <td style="text-align:right"><strong>Peso (g)</strong></td>
    </tr>
    ${pecas.map(p => `<tr><td>${p.nome}</td><td style="text-align:center;font-weight:400">${p.horas}h</td><td style="text-align:right;font-weight:400">${p.peso}g</td></tr>`).join("")}
  </table>

  <h2>Parâmetros Utilizados</h2>
  <table class="params">
    ${p("Custo Filamento",   "p_filamento",       "/kg")}
    ${p("Potência",          "p_watts",           " W")}
    ${p("Taxa energia",      "p_kwh",             " R$/kWh")}
    ${v.consumoKwh > 0 ? `<tr><td>Consumo calculado</td><td>${v.consumoKwh.toFixed(3)} kWh</td></tr>` : ""}
    ${p("Rolo embalagem",    "p_rolo_embalagem",  " R$")}
    ${p("Embalagens/rolo",   "p_embalagens_rolo", "")}
    ${p("Unidades/mês",      "p_unidades_mes",    "")}
    ${p("Custo fixo mensal", "p_custo_fixo",      " R$")}
    ${p("Impressora",        "p_impressora",      " R$")}
    ${p("Vida útil",         "p_vida_util",       " h")}
    ${p("Taxa de falha",     "p_falha",           "%")}
    ${p("Markup",            "p_markup",          "×")}
    ${p("Imposto",           "p_imposto",         "%")}
    ${p("Taxa cartão",       "p_cartao",          "%")}
    ${p("Custo anúncio",     "p_anuncio",         "%")}
    ${p("Frete",             "p_frete",           " R$")}
    ${p("Taxa Shopee",       "p_taxa_shopee",     "%")}
    ${p("Taxa Mercado Livre","p_taxa_ml",         "%")}
    ${p("Taxa TikTok Shop",  "p_taxa_tiktok",     "%")}
  </table>

  <h2>Custos Detalhados</h2>
  <table>
    ${c("Filamento",  v.custoFilamento)}
    ${c("Energia",    v.custoEnergia, ` (${v.consumoKwh.toFixed(3)} kWh)`)}
    ${c("Embalagem",  v.custoEmbalagem)}
    ${c("Custo Fixo", v.custoFixo)}
    ${c("Amortização",v.amortizacao)}
    ${extrasHTML}
    ${c("Frete",      v.frete)}
    ${c(`Falhas (${v.taxaFalha}%)`, v.custoFalhas)}
    <tr class="total"><td>CUSTO TOTAL</td><td>${fmt(v.custoTotal)}</td></tr>
  </table>

  <h2>Lucro</h2>
  <div class="lucro-box">
    ${v.lucroPct > 0 ? `<div class="lucro-row"><span>% de lucro</span><span>${v.lucroPct}%</span></div>` : ""}
    ${v.precoSugerido > 0 ? `<div class="lucro-row"><span>Preço sugerido</span><span>${fmt(v.precoSugerido)}</span></div>` : ""}
    ${v.precoVendaManual > 0 ? `<div class="lucro-row"><span>Preço de venda (manual)</span><span>${fmt(v.precoVendaManual)}</span></div>` : ""}
    ${v.precoVendaManual > 0 ? `<div class="lucro-row total"><span>LUCRO TOTAL</span><span>${fmt(v.lucroTotal)}</span></div>` : ""}
  </div>

  <h2>Precificação</h2>
  <div class="box consumer">
    <div class="box-title">Consumidor Final</div>
    <div class="box-price">${fmt(v.precoVenda)}</div>
    <div class="box-sub">Lucro bruto: ${fmt(v.lucroBruto)} &nbsp;|&nbsp; Lucro líquido: ${fmt(v.lucroLiquido)}</div>
  </div>
  <div class="box wholesale">
    <div class="box-title">Preço Lojista (50%)</div>
    <div class="box-price">${fmt(v.precoLojista)}</div>
    <div class="box-sub">Lucro líquido: ${fmt(v.lucroLiquidoLojista)}</div>
  </div>
  ${marketplacesHTML ? `<h2>Marketplaces</h2>${marketplacesHTML}` : ""}
  ${taxasVendaHTML   ? `<h2>Taxas sobre Venda</h2><table>${taxasVendaHTML}</table>` : ""}
</body>
</html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 800);
}
