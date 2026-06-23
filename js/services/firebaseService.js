// Inicialização e acesso centralizado aos serviços Firebase/Firestore.
(function () {
    const firebaseConfig = {
        apiKey: "AIzaSyBnHxMaz-JoMuFmz8OkD9SDLAoYH0w_Sps",
        authDomain: "sistema-creas-paf.firebaseapp.com",
        projectId: "sistema-creas-paf",
        storageBucket: "sistema-creas-paf.firebasestorage.app",
        messagingSenderId: "571371015910",
        appId: "1:571371015910:web:690ebbff3cbad88e283527"
    };

    if (!window.firebase) {
        throw new Error("Firebase SDK não foi carregado antes de firebaseService.js");
    }

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.firestore();
    const auth = firebase.auth();

    const firestore = {
        collection(nomeColecao) {
            return db.collection(nomeColecao);
        },

        document(nomeColecao, id) {
            return db.collection(nomeColecao).doc(id);
        },

        getDocument(nomeColecao, id) {
            return this.document(nomeColecao, id).get();
        },

        addDocument(nomeColecao, dados) {
            return this.collection(nomeColecao).add(dados);
        },

        updateDocument(nomeColecao, id, dados) {
            return this.document(nomeColecao, id).update(dados);
        },

        deleteDocument(nomeColecao, id) {
            return this.document(nomeColecao, id).delete();
        },

        getCollection(nomeColecao) {
            return this.collection(nomeColecao).get();
        },

        getQuery(nomeColecao, montarQuery) {
            return montarQuery(this.collection(nomeColecao)).get();
        },

        listenCollection(nomeColecao, onNext, onError) {
            return this.collection(nomeColecao).onSnapshot(onNext, onError);
        },

        listenQuery(nomeColecao, montarQuery, onNext, onError) {
            return montarQuery(this.collection(nomeColecao)).onSnapshot(onNext, onError);
        }
    };

    window.firebaseServices = {
        app: firebase.app(),
        db,
        auth,
        firestore,
        timestampNow() {
            return firebase.firestore.Timestamp.now();
        }
    };

    // Mantém acesso legado disponível para depuração e rotinas ainda não migradas.
    window.db = db;
    window.auth = auth;
})();
