// Utilitários puros do RMA: cálculos sem acesso ao DOM ou Firebase.
(function () {
    const MESES_NOMES = [
        'JANEIRO',
        'FEVEREIRO',
        'MARÇO',
        'ABRIL',
        'MAIO',
        'JUNHO',
        'JULHO',
        'AGOSTO',
        'SETEMBRO',
        'OUTUBRO',
        'NOVEMBRO',
        'DEZEMBRO'
    ];

    function obterReferenciaMesAnterior(dataBase = new Date()) {
        let indiceMes = dataBase.getMonth() - 1;
        let ano = dataBase.getFullYear();

        if (indiceMes < 0) {
            indiceMes = 11;
            ano--;
        }

        return {
            mes: MESES_NOMES[indiceMes],
            ano: ano.toString()
        };
    }

    function temDataEnvioValida(dataEnvio) {
        if (!dataEnvio) return false;

        const valor = dataEnvio.trim();
        return valor !== '' && valor !== '00/00/00' && valor !== '00/00/0000';
    }

    function listarCidadesPendentes(municipios, cidadesComRegistro) {
        return municipios.filter(cidade => !cidadesComRegistro.includes(cidade));
    }

    window.rmaUtils = {
        MESES_NOMES,
        obterReferenciaMesAnterior,
        temDataEnvioValida,
        listarCidadesPendentes
    };
})();
