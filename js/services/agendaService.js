// Serviço de domínio da Agenda: centraliza as operações Firestore do módulo.
(function () {
    const colecoes = window.COLECOES_FIRESTORE || {};
    const firestoreService = window.firebaseServices.firestore;

    function colecaoAgenda() {
        return colecoes.AGENDA_GERAL || 'agenda_geral';
    }

    function escutarEventos(onNext, onError) {
        return firestoreService.listenQuery(
            colecaoAgenda(),
            (ref) => ref.orderBy('data_criacao', 'desc'),
            onNext,
            onError
        );
    }

    function salvarEvento(id, dados) {
        if (id) {
            return firestoreService.updateDocument(colecaoAgenda(), id, dados);
        }

        return firestoreService.addDocument(colecaoAgenda(), dados);
    }

    function excluirEvento(id) {
        return firestoreService.deleteDocument(colecaoAgenda(), id);
    }

    function buscarEventoPorId(id) {
        return firestoreService.getDocument(colecaoAgenda(), id);
    }

    function criarTimestamp() {
        return window.firebaseServices.timestampNow();
    }

    window.agendaService = {
        escutarEventos,
        salvarEvento,
        excluirEvento,
        buscarEventoPorId,
        criarTimestamp
    };
})();
