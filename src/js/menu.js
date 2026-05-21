async function carregarView(viewId) {
    const arquivos = {
        'view-calculadora': 'src/views/calculadora.html',
    };
    const res = await fetch(arquivos[viewId]);
    const html = await res.text();
    document.getElementById(viewId).innerHTML = html;
}

async function navegar(viewId) {
    document.querySelectorAll(".view-section").forEach((v) => (v.style.display = "none"));
    document.querySelectorAll(".menu-list li").forEach((li) => li.classList.remove("active"));

    await carregarView(viewId);
    document.getElementById(viewId).style.display = "block";

    if (viewId === "view-calculadora") {
        document.getElementById("btn-calc")?.classList.add("active");
        initCalculadora();
    }
}

document.addEventListener("DOMContentLoaded", () => navegar("view-calculadora"));
