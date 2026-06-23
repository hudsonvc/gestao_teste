// Serviço de backup: centraliza a leitura das coleções exportadas.
(function () {
    const colecoes = window.COLECOES_FIRESTORE || {};
    const firestoreService = window.firebaseServices.firestore;

    function listarColecoesBackup() {
        return [
            colecoes.AGENDA_GERAL || 'agenda_geral',
            colecoes.CONTATOS || 'contatos',
            colecoes.CONTROLE_RMA || 'controle_rma',
            colecoes.JUDICIAL || 'judicial',
            colecoes.JUDICIAL_ADVOGADA || 'judicial_advogada',
            colecoes.JUDICIAL_DESLIGADOS || 'judicial_desligados',
            colecoes.JUDICIAL_NAO_GERAL || 'judicial_nao_geral',
            colecoes.JUDICIAL_PERIODICOS || 'judicial_periodicos',
            colecoes.JUDICIAL_PROTETIVAS || 'judicial_protetivas',
            colecoes.JUDICIAL_RESPONDIDOS || 'judicial_respondidos',
            'pacientes_paf',
            'usuarios'
        ];
    }

    async function buscarDadosColecao(nomeColecao) {
        const snapshot = await firestoreService.getCollection(nomeColecao);
        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => ({ id_doc: doc.id, ...doc.data() }));
    }

    window.backupService = {
        listarColecoesBackup,
        buscarDadosColecao
    };
})();
