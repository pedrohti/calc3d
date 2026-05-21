// --- INICIALIZAÇÃO (chamada por menu.js após o view ser injetado) ---
function initCalculadora() {
    const num = String(Math.floor(Math.random() * 9000000000) + 1000000000);
    document.getElementById("p_num_pedido").textContent = "#" + num;
    calcular();
}

// --- PEÇAS ---
function adicionarPeca() {
    const div = document.createElement("div");
    div.className = "peca-row";
    div.innerHTML = `
      <input type="text" class="peca-nome" placeholder="ex: Suporte de Fone">
      <input type="number" class="peca-horas" placeholder="0" step="0.1" oninput="calcular()">
      <input type="number" class="peca-peso" placeholder="0" step="0.01" oninput="calcular()">
      <button type="button" class="btn-remove" onclick="removerPeca(this)">✕</button>
    `;
    document.getElementById("container-pecas").appendChild(div);
}

function removerPeca(btn) {
    const container = document.getElementById("container-pecas");
    if (container.children.length <= 1) return;
    btn.parentElement.remove();
    calcular();
}

// --- EXTRAS ---
function adicionarCampoExtra() {
    const div = document.createElement("div");
    div.className = "extra-row";
    div.innerHTML = `
      <input type="text" class="extra-desc" placeholder="Descrição (ex: Lixa)">
      <input type="number" class="extra-val" placeholder="Valor" oninput="calcular()">
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
        horas += Number(r.querySelector(".peca-horas")?.value) || 0;
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

    return {
        consumoKwh, custoFilamento, custoEnergia, custoEmbalagem, custoFixo,
        amortizacao, totalExtras, frete, custoFalhas, custoTotal, taxaFalha,
        precoVenda, valorImposto, valorCartao, valorAnuncio, lucroBruto, lucroLiquido,
        precoLojista, lucroLiquidoLojista,
        imposto, taxaCartao, custoAnuncio,
        lucroPct, precoSugerido, precoVendaManual, lucroTotal,
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

    setTxt("res_imposto", v.valorImposto);
    setTxt("res_cartao",  v.valorCartao);
    setTxt("res_anuncio", v.valorAnuncio);

    setTxt("res_preco_sugerido", v.precoSugerido);
    setTxt("res_lucro_total",    v.lucroTotal);
}

// --- UTILITÁRIOS ---
function val(id) {
    return Number(document.getElementById(id).value) || 0;
}

function setTxt(id, valor) {
    document.getElementById(id).innerText = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Cálculo ${numPedido} — ${nomesPecas}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; color: #111; line-height: 1.5; }
    h1 { color: #1d4ed8; border-bottom: 2px solid #1d4ed8; padding-bottom: 8px; margin-bottom: 4px; }
    .meta { color: #555; font-size: 13px; margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 12px; }
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
    .personal { background: #fffbeb; border: 1px solid #fde68a; }
    .box-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
    .consumer .box-title { color: #15803d; }
    .wholesale .box-title { color: #7c3aed; }
    .personal .box-title { color: #d97706; }
    .box-price { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .consumer .box-price { color: #16a34a; }
    .wholesale .box-price { color: #8b5cf6; }
    .personal .box-price { color: #f59e0b; }
    .box-sub { font-size: 12px; color: #555; }
    .obs { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; font-size: 13px; margin-top: 16px; }
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
    <tr><td>Custo Filamento</td><td>R$ ${fmtN("p_filamento")}</td></tr>
    <tr><td>Potência impressora</td><td>${fmtN("p_watts")} W</td></tr>
    <tr><td>Taxa energia</td><td>${fmtN("p_kwh")} R$/kWh</td></tr>
    <tr><td>Consumo calculado</td><td>${v.consumoKwh.toFixed(3)} kWh</td></tr>
    <tr><td>Rolo embalagem</td><td>${fmtN("p_rolo_embalagem")} R$ / ${fmtN("p_embalagens_rolo")} unid.</td></tr>
    <tr><td>Unidades/mês</td><td>${fmtN("p_unidades_mes")}</td></tr>
    <tr><td>Custo fixo mensal</td><td>${fmtN("p_custo_fixo")} R$</td></tr>
    <tr><td>Valor impressora</td><td>${fmtN("p_impressora")} R$</td></tr>
    <tr><td>Vida útil</td><td>${fmtN("p_vida_util")} horas</td></tr>
    <tr><td>Taxa de falha</td><td>${fmtN("p_falha")}%</td></tr>
    <tr><td>Markup</td><td>${fmtN("p_markup")}×</td></tr>
    <tr><td>Imposto</td><td>${fmtN("p_imposto")}%</td></tr>
    <tr><td>Taxa cartão</td><td>${fmtN("p_cartao")}%</td></tr>
    <tr><td>Custo anúncio</td><td>${fmtN("p_anuncio")}%</td></tr>
    <tr><td>Frete</td><td>${fmtN("p_frete")} R$</td></tr>
  </table>

  <h2>Custos Detalhados</h2>
  <table>
    <tr><td>Filamento</td><td>${fmt(v.custoFilamento)}</td></tr>
    <tr><td>Energia (${v.consumoKwh.toFixed(3)} kWh)</td><td>${fmt(v.custoEnergia)}</td></tr>
    <tr><td>Embalagem</td><td>${fmt(v.custoEmbalagem)}</td></tr>
    <tr><td>Custo Fixo</td><td>${fmt(v.custoFixo)}</td></tr>
    <tr><td>Amortização</td><td>${fmt(v.amortizacao)}</td></tr>
    ${extrasHTML}
    <tr><td>Frete</td><td>${fmt(v.frete)}</td></tr>
    <tr><td>Falhas (${v.taxaFalha}%)</td><td>${fmt(v.custoFalhas)}</td></tr>
    <tr class="total"><td>CUSTO TOTAL</td><td>${fmt(v.custoTotal)}</td></tr>
  </table>

  <h2>Lucro</h2>
  <div class="lucro-box">
    <div class="lucro-row"><span>% de lucro</span><span>${v.lucroPct}%</span></div>
    <div class="lucro-row"><span>Preço sugerido</span><span>${fmt(v.precoSugerido)}</span></div>
    <div class="lucro-row"><span>Preço de venda (manual)</span><span>${v.precoVendaManual > 0 ? fmt(v.precoVendaManual) : "—"}</span></div>
    <div class="lucro-row total"><span>LUCRO TOTAL</span><span>${v.precoVendaManual > 0 ? fmt(v.lucroTotal) : "—"}</span></div>
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
  <h2>Taxas sobre Venda</h2>
  <table>
    <tr><td>Imposto (${v.imposto}%)</td><td>${fmt(v.valorImposto)}</td></tr>
    <tr><td>Cartão (${v.taxaCartao}%)</td><td>${fmt(v.valorCartao)}</td></tr>
    <tr><td>Anúncio (${v.custoAnuncio}%)</td><td>${fmt(v.valorAnuncio)}</td></tr>
  </table>

  ${observacao ? `<div class="obs"><strong>Obs:</strong> ${observacao}</div>` : ""}
</body>
</html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 800);
}
