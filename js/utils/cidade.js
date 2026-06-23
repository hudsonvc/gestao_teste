// Utilitários de normalização de cidades usados pelos filtros do sistema.
(function () {
    function normalizarCidade(nome) {
        if (!nome) return "";

        const n = nome
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();

        if (n.includes("couto") || n.includes("magalhaes") || n.includes("malhaes")) return "couto";
        if (n.includes("datas")) return "datas";
        if (n.includes("gouveia")) return "gouveia";
        if (n.includes("monjolos")) return "monjolos";
        if (n.includes("goncalo") || n.includes("sgrp") || n.includes("preto")) return "sgrp";
        return n;
    }

    window.normalizarCidade = normalizarCidade;
})();
