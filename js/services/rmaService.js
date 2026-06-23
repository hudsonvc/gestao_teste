// Serviço de domínio do RMA: centraliza as operações Firestore do módulo.
(function () {
    const colecoes = window.COLECOES_FIRESTORE || {};
    const firestoreService = window.firebaseServices.firestore;

    function colecaoRma() {
        return colecoes.CONTROLE_RMA || 'controle_rma';
    }

    function buscarPendencias(ano, mes) {
        return firestoreService.getQuery(
            colecaoRma(),
            (ref) => ref.where('ano', '==', ano).where('mes', '==', mes)
        );
    }

    function escutarRegistrosPorCidadeEAno(ano, municipio, onNext, onError) {
        return firestoreService.listenQuery(
            colecaoRma(),
            (ref) => ref.where('ano', '==', ano).where('municipio', '==', municipio),
            onNext,
            onError
        );
    }

    function buscarRegistroPorId(id) {
        return firestoreService.getDocument(colecaoRma(), id);
    }

    function salvarRegistro(id, dados) {
        if (id) {
            return firestoreService.updateDocument(colecaoRma(), id, dados);
        }

        return firestoreService.addDocument(colecaoRma(), dados);
    }

    function excluirRegistro(id) {
        return firestoreService.deleteDocument(colecaoRma(), id);
    }

    window.rmaService = {
        buscarPendencias,
        escutarRegistrosPorCidadeEAno,
        buscarRegistroPorId,
        salvarRegistro,
        excluirRegistro
    };
})();
