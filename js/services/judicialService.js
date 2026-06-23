// Serviço de domínio Judicial: centraliza operações Firestore dos processos.
(function () {
    const firestoreService = window.firebaseServices.firestore;

    function escutarProcessos(colecao, onNext, onError) {
        return firestoreService.listenCollection(colecao, onNext, onError);
    }

    function buscarProcessoPorId(colecao, id) {
        return firestoreService.getDocument(colecao, id);
    }

    function excluirProcesso(colecao, id) {
        return firestoreService.deleteDocument(colecao, id);
    }

    async function salvarProcesso({ id, colecaoOrigem, colecaoDestino, dados }) {
        if (!id) {
            await firestoreService.addDocument(colecaoDestino, dados);
            return { acao: 'criado' };
        }

        if (colecaoOrigem !== colecaoDestino) {
            await firestoreService.deleteDocument(colecaoOrigem, id);
            await firestoreService.addDocument(colecaoDestino, dados);
            return { acao: 'movido' };
        }

        await firestoreService.updateDocument(colecaoOrigem, id, dados);
        return { acao: 'atualizado' };
    }

    window.judicialService = {
        escutarProcessos,
        buscarProcessoPorId,
        excluirProcesso,
        salvarProcesso
    };
})();
