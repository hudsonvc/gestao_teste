// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyBnHxMaz-JoMuFmz8OkD9SDLAoYH0w_Sps",
    authDomain: "sistema-creas-paf.firebaseapp.com",
    projectId: "sistema-creas-paf",
    storageBucket: "sistema-creas-paf.firebasestorage.app",
    messagingSenderId: "571371015910",
    appId: "1:571371015910:web:690ebbff3cbad88e283527"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();



// --- FUNÇÃO PARA EDITAR (PREPARAR EDIÇÃO) ---
window.prepararEdicao = async (id, col) => {
    idProcessoEmEdicao = id;
    const modal = document.getElementById('modalCadastroJudicial');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.setAttribute('data-colecao', col);
    document.getElementById('tituloModalCadastro').innerText = "EDITAR  PROCESSO";

    const conteudoInterno = modal.querySelector('div'); 
    if (conteudoInterno) {
        conteudoInterno.style.maxHeight = '95vh';
        conteudoInterno.style.display = 'flex';
        conteudoInterno.style.flexDirection = 'column';
        conteudoInterno.style.overflow = 'hidden';
    }

    try {
        const doc = await db.collection(col).doc(id).get();
        if (doc.exists) {
            const d = doc.data();
            
            // Preenche os campos fixos com suporte a nomes alternativos do banco
            document.getElementById('addNome').value = d.nome || d.nomeUsuario || d.parteUsuario || d["Nome da Família ou Usuário"] || '';
            document.getElementById('addProcesso').value = d.processo || d.numeroOficio || d.numeroProcesso || d["Número do Processo"] || '';
            document.getElementById('addRemetente').value = d.remetente || d.vara || '';
            document.getElementById('addMeio').value = d.meio_recebimento || '';
            document.getElementById('addMunicipio').value = d.municipio || d["Município"] || d["Municípío"] || d.cidade || '';

            const container = document.getElementById('containerLinhasDatas');
            if (container) {
                container.innerHTML = '';
                container.style.maxHeight = '400px';
                container.style.overflowY = 'auto';
                container.style.paddingRight = '10px';
                container.style.border = '1px solid rgba(0,0,0,0.1)';
                container.style.borderRadius = '8px';
                container.style.marginBottom = '10px';

                // IMPORTANTE: Passa os dados do histórico para a função que cria as linhas
                (d.historico_evolucao || []).forEach(item => {
                    adicionarNovaLinhaData(item);
                });
            }
        }
    } catch (e) { 
        console.error("Erro ao editar:", e); 
    }

    document.body.style.overflow = 'hidden';
};

// --- FUNÇÃO AUXILIAR PARA SEMPRE QUE ADICIONAR UMA LINHA, DAR SCROLL PARA BAIXO ---
function adicionarNovaLinhaData(item) {
    // ... sua lógica atual de criar a linha ...
    // (Apenas um exemplo do comando de scroll abaixo)
    const container = document.getElementById('containerLinhasDatas');
    if (container) {
        // Isso faz o scroll descer automaticamente quando você clica em "Adicionar Nova Demanda"
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

// --- FUNÇÃO PARA FECHAR MODAL ---
window.fecharModalCadastro = function() {
    const modal = document.getElementById('modalCadastroJudicial');
    if (modal) {
        modal.style.display = 'none';
        // Remove a trava de scroll do corpo da página ao fechar
        document.body.style.overflow = 'auto';
    }
};


// --- VARIÁVEIS GLOBAIS ---
const LINK_PLANILHA_STATUS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRNo1Y9qY1yAnErz_e1s26mpUD6vGxvzfsWbB0fwDxkQf9LadfBouevcOopjdJSZHIPR7vEnG39eDtx/pub?gid=1540001503&single=true&output=csv";
let idProcessoEmEdicao = null;
let paginaAtual = 1;
const itensPorPagina = 10;
let dadosFiltradosGlobal = [];

const menus = {
    paefi_unificado: {
        titulo: "PAEFI - Gestão, Registro Simplificado e Acolhida",
        opcoes: [
            { texto: "PAEFI - Registro Simplificado Atendimento Geral", link: "https://docs.google.com/spreadsheets/d/1NZYngl8WRcRWzIJ2xytYqkSY_2jxLrJqU0a_MPQqImo/edit?usp=sharing", icone: "fa-users-gear" },
            { texto: "Ficha Acolhida Inicial - Couto", link: "https://docs.google.com/document/d/1aepYWuwdNGFBLjBHPtHItH8q2EjMS6L-/edit?usp=sharing&ouid=105013242170562667223&rtpof=true&sd=true", icone: "fa-file-signature" },
            { texto: "Ficha Acolhida Inicial - Datas", link: "https://docs.google.com/document/d/1QDVycTzAlBb6znj6Me2yOtpHoiZ125GZ/edit?usp=sharing&ouid=105013242170562667223&rtpof=true&sd=true", icone: "fa-file-signature" },
            { texto: "Ficha Acolhida Inicial - Gouveia", link: "https://docs.google.com/document/d/1wvfsNW5gdyiJblacOxRGoLze8z34AXWu/edit?usp=sharing&ouid=105013242170562667223&rtpof=true&sd=true", icone: "fa-file-signature" },
            { texto: "Ficha Acolhida Inicial - Monjolos", link: "https://docs.google.com/document/d/1G8yiZC50k9DkMx9XrpzEhZipVo4AtBZP/edit?usp=sharing&ouid=105013242170562667223&rtpof=true&sd=true", icone: "fa-file-signature" },
            { texto: "Ficha Acolhida Inicial - SGRP", link: "https://docs.google.com/document/d/1wR7gLwC71B_JhtWuQhp-v7LqmSqXptHr/edit?usp=sharing&ouid=105013242170562667223&rtpof=true&sd=true", icone: "fa-file-signature" },
            { texto: "Registro Simplificado - Couto Magalhães", link: "https://docs.google.com/spreadsheets/d/1wlp8VDHyJ_RVM_JQqKa0W7OBkoiC7g8a/edit?usp=drive_link", icone: "fa-house-user" },
            { texto: "Registro Simplificado - Datas", link: "https://docs.google.com/spreadsheets/d/1nwvRUkZ28zBsCUoHHxPH9WGpxwERSbxH/edit?usp=drive_link", icone: "fa-house-user" },
            { texto: "Registro Simplificado - Gouveia", link: "https://docs.google.com/spreadsheets/d/1D9TcIl95xBVtyKbvlSNxFDAwWm7acPRc/edit?usp=drive_link&ouid=105013242170562667223&rtpof=true&sd=true", icone: "fa-house-user" },
            { texto: "Registro Simplificado - Monjolos", link: "https://docs.google.com/spreadsheets/d/1CY6gBnp_KtISHzFf0L7fc7ZeHncMcjkI/edit?usp=drive_link&ouid=105013242170562667223&rtpof=true&sd=true", icone: "fa-house-user" },
            { texto: "Registro Simplificado - SGRP", link: "https://docs.google.com/spreadsheets/d/178aswuI1TMy-nBWaWsg3wNfaK97Tp8ah/edit?usp=drive_link&ouid=105013242170562667223&rtpof=true&sd=true", icone: "fa-house-user" }
        ]
    },
    judicial: {
        titulo: "Acompanhamento Judicial Geral",
        opcoes: [
            { texto: "Judicial - Geral ", link: "javascript:abrirTelaJudicial()", icone: "fa-scale-balanced" },
            { texto: "Não Judicial - Geral", link: "javascript:abrirTelaNaoJudicial()", icone: "fa-file-signature" },
            { texto: "Acompanhamento Advogada", link: "javascript:abrirTelaAdvogada()", icone: "fa-user-tie" } 
        ]
    },
    judicial_municipios: {
        titulo: "Acompanhamento Judicial por Município",
        opcoes: [
            { texto: "Couto", link: "https://docs.google.com/spreadsheets/d/1A--k28WWA65p3eCVtVUSk_8-SYDw_Yzg0Us8Q-K3wsU/edit?usp=sharing", icone: "fa-location-dot" },
            { texto: "Datas", link: "https://docs.google.com/spreadsheets/d/17aRg8A6yONUQxzkz-Q54XkLy3Mq_3CAthrftBKQQY0s/edit?usp=sharing", icone: "fa-location-dot" },
            { texto: "Gouveia", link: "https://docs.google.com/spreadsheets/d/1zyqqIz9bLVpFzLi-FUNl1HFIBGaYSUGjltxPnIyF8Rg/edit?usp=sharing", icone: "fa-location-dot" },
            { texto: "Monjolos", link: "https://docs.google.com/spreadsheets/d/1FglFe7-Cx29zB0jWskcn7C9fa-1a_g3_VKJK09LMxu4/edit?usp=sharing", icone: "fa-location-dot" },
            { texto: "SGRP", link: "https://docs.google.com/spreadsheets/d/1E6hj8LKbEU9cZYrmxND5ZbE8EJILLNN8N4t0joN9pK0/edit#gid=0", icone: "fa-location-dot" }
        ]
    },
    fichas_familia: {
        titulo: "Fichas de Acompanhamento Familiar",
        opcoes: [
            { texto: "Ficha - Couto", link: "https://docs.google.com/document/d/1iJTbClbZyoXcSiD0Xz1mv3h3BlB84OnH/edit?usp=sharing", icone: "fa-file-lines" },
            { texto: "Ficha - Datas", link: "https://docs.google.com/document/d/12NDaPKBEZcy5aHEEkD0-h3qnoQ6EWUKY/edit?usp=sharing", icone: "fa-file-lines" },
            { texto: "Ficha - Gouveia", link: "https://docs.google.com/document/d/1XmnGkgHTq3DZ_8uFEZ7F5dW7ZAg0EYdV/edit?usp=sharing", icone: "fa-file-lines" },
            { texto: "Ficha - Monjolos", link: "https://docs.google.com/document/d/1R-TaCEPmZEp6pCcenaSX-0j1KjwPc3l4/edit?usp=sharing&ouid=105013242170562667223&rtpof=true&sd=true", icone: "fa-file-lines" },
            { texto: "Ficha - SGRP", link: "https://docs.google.com/document/d/1AFHb1sMadIMLDluBkdVe6iEOZ6Whgjo9/edit?usp=sharing", icone: "fa-file-lines" }
        ]
    },
    mulher: {
        titulo: "Ficha de Acompanhamento à Mulher",
        opcoes: [
            { texto: "Ficha de Acolhimento à Mulher - Couto", link: "https://docs.google.com/document/d/182m31Wt2OEnPxHDOnLWlldgo4P6xilEmSMZJARaqMg4/edit?usp=sharing", icone: "fa-file-waveform" },
            { texto: "Ficha de Acompanhamento à Mulher - Datas", link: "https://docs.google.com/document/d/12fkWp7TYh5U4qi8aGSfWUoG0227Y7y50Rp4t5iJHFlM/edit?usp=sharing", icone: "fa-file-waveform" },
            { texto: "Ficha de Acompanhamento à Mulher - Gouveia", link: "https://docs.google.com/document/d/1PYvadvEWFwqSaYUA2YF8hG2jIlDWA48VbbPMwb1JFAk/edit?usp=sharing", icone: "fa-file-waveform" },
            { texto: "Ficha de Acompanhamento à Mulher - Monjolos", link: "https://docs.google.com/document/d/1ZvlAmua2MChaZeZPpnSsMf2k-v7nkitip8N7_LVQABo/edit?usp=sharing", icone: "fa-file-waveform" },
            { texto: "Ficha de Acompanhamento à Mulher - SGRP", link: "https://docs.google.com/document/d/1fr7zxgF9ffuKLfiFoMHGbRawr-tE6r_EdkZIxLTcvU4/edit?usp=sharing", icone: "fa-file-waveform" }
        ]
    },
    recepcao: {
        titulo: "Recepção",
        opcoes: [ { texto: "Acessar Planilha Recepção", link: "https://docs.google.com/spreadsheets/d/1UDNi5E4yHdjVN-0TqT2mSH_Zlb1_n4FC/edit?usp=sharing", icone: "fa-clipboard-user" } ]
    },
    oficios: {
        titulo: "Ofícios 2026",
        opcoes: [ { texto: "Acessar Controle de Ofícios", link: "https://docs.google.com/spreadsheets/d/1nLMOare0F1WojJBoV_RujKnGUgHN8MdCJx_h2EkwUiw/edit?usp=sharing", icone: "fa-file-export" } ]
    },
    contatos: {
        titulo: "Lista de Contatos",
        opcoes: [ { texto: "Acessar Contatos", link: "https://docs.google.com/spreadsheets/d/1qIu1ROZTg5iYd0MT7Jh5ubq6OHUDctMXLjRzsXCKykQ/edit?usp=sharing", icone: "fa-address-book" } ]
    },
    agenda: {
        titulo: "Agenda 2026",
        opcoes: [ 
            { 
                texto: "Acessar Agenda 2026", 
                link: "javascript:abrirTelaAgenda()", 
                icone: "fa-calendar-days" 
            } 
        ]
    },
rma: {
    titulo: "RMA",
    opcoes: [ 
        { 
            texto: 'Controle de Envio <span id="indicador-pulsar-rma"></span>', 
            link: "javascript:abrirTelaRma()", 
            icone: "fa-chart-simple" 
        },
        { 
            texto: "Planilha RMA", 
            link: "https://docs.google.com/spreadsheets/d/1pReSzUNUYKIs5syqHVxzMPnuGJBC_0eP2PJWJmdazpI/edit?usp=sharing", 
            icone: "fa-magnifying-glass-chart" 
        }
    ]
},
    historico: {
        titulo: "Histórico",
        opcoes: [ { texto: "Controle SEDESE 2021", link: "https://docs.google.com/spreadsheets/d/14orG_IfnGtQrbsojIjOTTgx-trAVmSH8/edit#gid=409096394", icone: "fa-box-archive" } ]
    },
  gemini_ajuda: {
        titulo: "Ajuda com IA (Google Gemini)",
        opcoes: [
            { texto: "Fazer uma Pergunta ao Gemini", link: "https://gemini.google.com/", icone: "fa-solid fa-robot" }
        ]
    }
};
// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarStatusCidades();
    setInterval(carregarStatusCidades, 300000);
});

function mostrarAba(abaId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(abaId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- MODAIS GERAIS ---
function abrirModal(tipo) {
    const m = menus[tipo];
    if (!m) return;
    document.getElementById('modalTitle').innerText = m.titulo;
    const container = document.getElementById('modalOptions');
    container.innerHTML = m.opcoes.map(o => `
        <a href="${o.link}" ${o.link.startsWith('http') ? 'target="_blank"' : ''} class="modal-option">
            <i class="fa-solid ${o.icone}"></i>
            <span>${o.texto}</span>
        </a>
    `).join('');
    document.getElementById('modalUniversal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modalUniversal').style.display = 'none';
}

// --- STATUS CIDADES ---
async function carregarStatusCidades() {
    try {
        const res = await fetch(LINK_PLANILHA_STATUS);
        const csv = await res.text();
        const linhas = csv.split('\n').map(l => l.split(','));
        const cabecalho = linhas[0];
        const dados = linhas.slice(1);
        const indices = {
            cidade: cabecalho.findIndex(c => c.trim().toUpperCase() === "CIDADE"),
            status: cabecalho.findIndex(c => c.trim().toUpperCase() === "STATUS"),
            servico: cabecalho.findIndex(c => c.trim().toUpperCase() === "SERVIÇO")
        };
        const container = document.getElementById('gridStatusCidades');
        container.innerHTML = "";
        const cidadesUnicas = [...new Set(dados.map(d => d[indices.cidade]?.trim()).filter(Boolean))];
        cidadesUnicas.forEach(cid => {
            const statusCid = dados.find(d => d[indices.cidade]?.trim() === cid && d[indices.servico]?.trim().toUpperCase() === "SISTEMA")?.[indices.status]?.trim() || "OFFLINE";
            const classeStatus = statusCid.toUpperCase() === "ONLINE" ? "status-online" : "status-offline";
            container.innerHTML += `
                <div class="card-cidade">
                    <div class="card-cidade-nome">${cid}</div>
                    <div class="card-cidade-status ${classeStatus}">${statusCid}</div>
                </div>`;
        });
    } catch (e) { console.error("Erro status:", e); }
}

// --- FUNÇÃO AUXILIAR PARA NORMALIZAR NOMES DE CIDADES ---
function normalizarCidade(nome) {
    if (!nome) return "";
    let n = nome.trim().toLowerCase();
    if (n.includes("couto") || n.includes("magalhães") || n.includes("malhães")) return "couto";
    if (n.includes("datas")) return "datas";
    if (n.includes("gouveia")) return "gouveia";
    if (n.includes("monjolos")) return "monjolos";
    if (n.includes("são gonçalo") || n.includes("sgrp")) return "sgrp";
    return n;
}



function abrirTelaJudicial() {
    const modalJudicial = document.getElementById('modalJudicialModerno');
    if (!modalJudicial) return;
    
    modalJudicial.style.display = 'flex';
    modalJudicial.innerHTML = `
        <style>
            #toast-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
            }
            .toast-mensagem {
                background: #2d3436;
                color: white;
                padding: 12px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                margin-top: 10px;
                font-size: 14px;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideIn 0.3s ease-out, fadeOut 0.5s 2.5s forwards;
            }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        </style>

        <div class="modal-content-judicial" style="width: 98%; max-width: 1600px; background: white; padding: 15px; border-radius: 8px; position: relative; height: 95vh; overflow: hidden; display: flex; flex-direction: column;">
            <span onclick="this.closest('#modalJudicialModerno').style.display='none'" style="position:absolute; right:15px; top:10px; cursor:pointer; font-size:25px; color:#FF0000; z-index:101;">&times;</span>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 10px; padding-right: 30px;">
                <div style="display: flex; gap: 8px; flex: 1;">
                    <input type="text" id="inputPesquisaJudicial" oninput="paginaAtual=1; carregarDadosJudiciaisNaTabelaReal('judicial')" placeholder="Pesquisar..." style="padding: 8px; width: 220px; border: 1px solid #ddd; border-radius: 4px;">
                    
                    <select id="filtroTela" onchange="paginaAtual=1; carregarDadosJudiciaisNaTabelaReal('judicial')" style="padding: 8px; border-radius: 4px; border: 1px solid #0984e3; background: #e3f2fd; color: #0984e3; font-weight: bold;">
                        <option value="judicial"> Ordenados por Município</option>
                        <option value="judicial_respondidos">🟢 Respondidos</option>
                        <option value="judicial_periodicos">🟡 Periódicos</option>
                        <option value="judicial_protetivas">🟣 Medidas Protetivas</option>
                        <option value="judicial_desligados">🚫 Desligados</option>
                    </select>

                    <select id="filtroCidade" onchange="paginaAtual=1; carregarDadosJudiciaisNaTabelaReal('judicial')" style="padding: 8px; border-radius: 4px; border: 1px solid #ddd; background: white;">
                        <option value="TODOS">Todas as Cidades</option>
                        <option value="PRAZO_CRITICO" style="color: #d63031; font-weight: bold;"> PRAZOS (14 DIAS)</option>
                        <option value="Couto de Magalhães">Couto de Magalhães</option>
                        <option value="Datas">Datas</option>
                        <option value="Gouveia">Gouveia</option>
                        <option value="Monjolos">Monjolos</option>
                        <option value="São Gonçalo do Rio Preto">São Gonçalo do Rio Preto</option>
                    </select>

                    <button onclick="copiarRelatorioTeams()" style="padding: 8px 15px; border-radius: 4px; border: none; background: #2d3436; color: white; cursor: pointer; font-weight: bold; margin-left: 10px; display: inline-flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-copy"></i> COPIAR PARA O TEAMS
                    </button>
                </div>
                <button onclick="abrirFormularioNovo('judicial')" style="background: #2d3436; color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">+ Novo Processo</button>
            </div>

            <div style="overflow-y: auto; flex: 1; border: 1px solid #eee; border-radius: 4px; background: #f9f9f9;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed;">
                    <thead style="position: sticky; top: 0; background: #2d3436; color: white; z-index: 10;">
                        <tr>
                            <th style="padding: 10px; text-align: left; width: 200px;">Usuário/Família</th>
                            <th style="padding: 10px; text-align: left; width: 160px;">Remetente</th>
                            <th style="padding: 10px; text-align: left; width: 160px;">Nº Processo</th>
                            <th style="padding: 10px; text-align: center; width: 110px;">Cidade</th>
                            <th style="padding: 10px; text-align: left;">Histórico / Movimentações </th>
                            <th style="padding: 10px; text-align: center; width: 80px;">Editar</th>
                        </tr>
                    </thead>
                    <tbody id="corpoTabelaJudicial"></tbody>
                </table>
            </div>
            <div id="controlesPaginacao" style="display: flex; justify-content: center; align-items: center; gap: 15px; padding: 10px; background: #f8f9fa;">
                <button onclick="mudarPagina(-1, 'judicial')" id="btnAnterior" style="padding: 5px 12px; cursor: pointer; border-radius:4px; border:1px solid #ccc;">Anterior</button>
                <span id="infoPagina" style="font-size: 13px; font-weight: bold;">Página 1</span>
                <button onclick="mudarPagina(1, 'judicial')" id="btnProximo" style="padding: 5px 12px; cursor: pointer; border-radius:4px; border:1px solid #ccc;">Próximo</button>
            </div>
        </div>
    `;
    carregarDadosJudiciaisNaTabelaReal('judicial');
}

function abrirTelaNaoJudicial() {
    const modalNJ = document.getElementById('modalNaoJudicialModerno');
    if (!modalNJ) return;
    
    paginaAtual = 1;
    modalNJ.style.display = 'flex';
    modalNJ.innerHTML = `
        <div class="modal-content-judicial" style="width: 98%; max-width: 1600px; background: white; padding: 15px; border-radius: 8px; position: relative; height: 95vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
            <span onclick="document.getElementById('modalNaoJudicialModerno').style.display='none'" style="position:absolute; right:15px; top:10px; cursor:pointer; font-size:30px; color:#FF0000; z-index:1000; font-weight:bold;">&times;</span>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; gap: 10px; padding-right: 40px;">
                <div style="display: flex; gap: 8px; flex: 1;">
                    <input type="text" id="inputPesquisaNJ" oninput="paginaAtual=1; carregarDadosJudiciaisNaTabelaReal('judicial_nao_geral')" placeholder="Pesquisar Não Judicial..." style="padding: 10px; width: 250px; border: 1px solid #ddd; border-radius: 4px;">
                    <select id="filtroCidadeNJ" onchange="paginaAtual=1; carregarDadosJudiciaisNaTabelaReal('judicial_nao_geral')" style="padding: 10px; border-radius: 4px; border: 1px solid #ddd; background: white;">
                        <option value="TODOS">Todas as Cidades</option>
                        <option value="couto">Couto de Magalhães</option>
                        <option value="datas">Datas</option>
                        <option value="gouveia">Gouveia</option>
                        <option value="monjolos">Monjolos</option>
                        <option value="sgrp">São Gonçalo do Rio Preto</option>
                    </select>
                </div>
                <button onclick="abrirFormularioNovo('judicial_nao_geral')" style="background: #2d3436; color: white; border: none; padding: 10px 25px; border-radius: 8px; cursor: pointer; font-weight: bold;">+ Novo Processo </button>
            </div>
            <div style="flex: 1; overflow-y: auto; border: 1px solid #eee; border-radius: 6px; background: #fff;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed;">
                    <thead style="position: sticky; top: 0; background: #2d3436; color: white; z-index: 100;">
                        <tr>
                            <th style="padding: 15px 10px; text-align: left; width: 220px;">Usuário/Família</th>
                            <th style="padding: 15px 10px; text-align: left; width: 180px;">Remetente</th>
                            <th style="padding: 15px 10px; text-align: left; width: 180px;">Nº Ofício</th>
                            <th style="padding: 15px 10px; text-align: center; width: 130px;">Cidade</th>
                            <th style="padding: 15px 10px; text-align: left;">Histórico / Movimentações</th>
                            <th style="padding: 15px 10px; text-align: center; width: 90px;">Editar</th>
                        </tr>
                    </thead>
                    <tbody id="corpoTabelaNaoJudicial"></tbody>
                </table>
            </div>
            <div id="controlesPaginacaoNJ" style="display: flex; justify-content: center; align-items: center; gap: 20px; padding: 15px; background: #f8f9fa; border-top: 1px solid #ddd;">
                <button onclick="mudarPagina(-1, 'judicial_nao_geral')" id="btnAnteriorNJ" style="padding: 8px 15px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc;">Anterior</button>
                <span id="infoPaginaNJ" style="font-size: 14px; font-weight: bold;">Página 1</span>
                <button onclick="mudarPagina(1, 'judicial_nao_geral')" id="btnProximoNJ" style="padding: 8px 15px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc;">Próximo</button>
            </div>
        </div>
    `;
    // CORREÇÃO AQUI
    carregarDadosJudiciaisNaTabelaReal('judicial_nao_geral');
}
// Função específica para fechar sem dar refresh na página
function fecharModalNaoJudicial() {
    const modal = document.getElementById('modalNaoJudicial');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Devolve o scroll ao fundo
    }
}

// Função para fechar específica
function fecharModalNaoJudicial() {
    const modal = document.getElementById('modalNaoJudicial');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}


function abrirTelaAdvogada() {
    fecharModal();
    const modalJudicial = document.getElementById('modalJudicialModerno');
    modalJudicial.style.display = 'flex';
    modalJudicial.innerHTML = `
        <div class="modal-content-judicial" style="width: 98%; max-width: 1600px; background: white; padding: 15px; border-radius: 8px; position: relative; height: 95vh; overflow: hidden; display: flex; flex-direction: column;">
            <span onclick="fecharModalJudicial()" style="position:absolute; right:15px; top:10px; cursor:pointer; font-size:25px; color:#FF0000; z-index:101; line-height: 1;">&times;</span>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 10px; padding-right: 30px;">
                <div style="display: flex; gap: 8px; flex: 1;">
                    <input type="text" id="inputPesquisaAdvogada" oninput="paginaAtual=1; carregarDadosJudiciaisNaTabelaReal('advogada')" placeholder="Pesquisar Processos Advogada..." style="padding: 8px; width: 220px; border: 1px solid #ddd; border-radius: 4px;">
                    <select id="filtroCidadeAdvogada" onchange="paginaAtual=1; carregarDadosJudiciaisNaTabelaReal('advogada')" style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                        <option value="TODOS">Todas as Cidades</option>
                        <option value="couto">Couto de Magalhães</option>
                        <option value="datas">Datas</option>
                        <option value="gouveia">Gouveia</option>
                        <option value="monjolos">Monjolos</option>
                        <option value="sgrp">São Gonçalo do Rio Preto</option>
                    </select>
                </div>
                <button onclick="abrirFormularioNovo('judicial_advogada')" style="background: #2d3436; color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; position: relative; z-index: 100;">+ Novo Processo </button>
            </div>
            <div style="overflow-y: auto; flex: 1; border: 1px solid #eee; border-radius: 4px;">
                <table style="width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 13px; table-layout: fixed;">
                    <thead style="position: sticky; top: 0; background: #2d3436; color: white; z-index: 10;">
                        <tr>
                            <th style="padding: 10px; text-align: left; width: 200px;">Parte / Usuário</th>
                            <th style="padding: 10px; text-align: left; width: 160px;">Vara / Comarca</th>
                            <th style="padding: 10px; text-align: left; width: 160px;">Nº Processo</th>
                            <th style="padding: 10px; text-align: center; width: 110px;">Cidade</th>
                            <th style="padding: 10px; text-align: left;">Movimentações Jurídicas</th>
                            <th style="padding: 10px; text-align: center; width: 60px;">Editar</th>
                        </tr>
                    </thead>
                    <tbody id="corpoTabelaAdvogada"></tbody>
                </table>
            </div>
            <div id="controlesPaginacaoAdvogada" style="display: flex; justify-content: center; align-items: center; gap: 15px; padding: 10px; background: #f8f9fa;">
                <button onclick="mudarPagina(-1, 'advogada')" id="btnAnteriorAdv" style="padding: 5px 12px; cursor: pointer;">Anterior</button>
                <span id="infoPaginaAdv" style="font-size: 13px; font-weight: bold;">Página 1</span>
                <button onclick="mudarPagina(1, 'advogada')" id="btnProximoAdv" style="padding: 5px 12px; cursor: pointer;">Próximo</button>
            </div>
        </div>
    `;
    carregarDadosJudiciaisNaTabelaReal('advogada');
}

// --- FUNÇÃO CARREGAR DADOS ADAPTADA PARA FILTROS INTELIGENTES SEM DUPLICAR ---

// --- FUNÇÃO CARREGAR DADOS CORRIGIDA (FILTRO DE CIDADE + PERIÓDICOS) ---
// --- FUNÇÃO CARREGAR DADOS HÍBRIDA (SUPORTA DADOS IMPORTADOS ANTIGOS E NOVOS) ---
function carregarDadosJudiciaisNaTabelaReal(tipo) {
    let idInput, idFiltroCid, colecaoAtiva;
    if (tipo === 'judicial_nao_geral') {
        idInput = 'inputPesquisaNJ'; idFiltroCid = 'filtroCidadeNJ'; colecaoAtiva = "judicial_nao_geral";
    } else if (tipo === 'advogada') {
        idInput = 'inputPesquisaAdvogada'; idFiltroCid = 'filtroCidadeAdvogada'; colecaoAtiva = "judicial_advogada";
    } else {
        idInput = 'inputPesquisaJudicial'; idFiltroCid = 'filtroCidade'; colecaoAtiva = document.getElementById('filtroTela')?.value || "judicial";
    }
    
    const termo = document.getElementById(idInput)?.value.toLowerCase() || "";
    let filtroCidRaw = document.getElementById(idFiltroCid)?.value || "TODOS";
    
    const mapaCidades = { "sgrp": "São Gonçalo do Rio Preto", "couto": "Couto de Magalhães", "datas": "Datas", "gouveia": "Gouveia", "monjolos": "Monjolos", "felicio": "Felício dos Santos" };
    const cidadeFiltroDesejada = mapaCidades[filtroCidRaw] || filtroCidRaw;

    // 🌟 MÁGICA DA BUSCA HÍBRIDA:
    // Se o filtro selecionado for Periódicos ou Protetivas, o sistema vai buscar 
    // TANTO na coleção principal (novos registros) QUANTO na coleção antiga (dados importados)
    let listasParaConsultar = [colecaoAtiva];
    if (colecaoAtiva === 'judicial_periodicos' || colecaoAtiva === 'judicial_protetivas') {
        listasParaConsultar.push('judicial'); // Adiciona a coleção principal na varredura
    }

    let todosDadosCombinados = {};

    // Criamos ouvintes em tempo real para as coleções necessárias
    listasParaConsultar.forEach(nomeColecao => {
        db.collection(nomeColecao).onSnapshot((snapshot) => {
            snapshot.forEach(doc => {
                const d = doc.data();
                const historico = d.historico_evolucao || [];
                const nome = (d.nome || d.nomeUsuario || "").toLowerCase();
                const proc = (d.processo || d.numeroOficio || "").toLowerCase();

                // Identifica a cidade tratando acentuações e maiúsculas/minúsculas
                const municipioBancoRaw = d.municipio || d["Município"] || d["Municípío"] || d.cidade || "";
                const municipioBancoNormalizado = normalizarCidade(municipioBancoRaw);
                const filtroCidadeNormalizado = normalizarCidade(cidadeFiltroDesejada);

                // Se estamos buscando na lista principal 'judicial', validamos se o processo realmente pertence à aba filtrada
                if (nomeColecao === 'judicial') {
                    if (colecaoAtiva === 'judicial_periodicos' && !historico.some(h => String(h.status).toLowerCase() === 'periodico')) {
                        return;
                    }
                    if (colecaoAtiva === 'judicial_protetivas' && !historico.some(h => String(h.status).toLowerCase() === 'protetiva')) {
                        return;
                    }
                }

                // Aplica o filtro de Cidade de forma idêntica ao oficial
                let atendeFiltroCidade = (filtroCidRaw === "TODOS") || 
                                         (filtroCidRaw === "PRAZO_CRITICO" && historico.some(h => verificarAlertaPrazo(h.data_proxima_resposta, tipo))) || 
                                         (municipioBancoNormalizado === filtroCidadeNormalizado);

                // Aplica a busca por termo (Nome ou Número)
                if (atendeFiltroCidade && (nome.includes(termo) || proc.includes(termo))) {
                    // Armazena usando o ID do documento para evitar qualquer duplicidade na tela
                    todosDadosCombinados[doc.id] = { id: doc.id, ...d };
                }
            });

            // Converte o objeto de volta para array, ordena por modificação recente e renderiza na tela
            let arrayFinalParaExibir = Object.values(todosDadosCombinados);
            arrayFinalParaExibir.sort((a, b) => new Date(b.data_ultima_modificacao) - new Date(a.data_ultima_modificacao));
            
            dadosFiltradosGlobal = arrayFinalParaExibir;
            renderizarTabelaPaginada(tipo);
        });
    });
}

function carregarDadosJudiciaisNaTabelaReal(tipo) {
    let idInput, idFiltroCid, colecaoAtiva;
    if (tipo === 'judicial_nao_geral') {
        idInput = 'inputPesquisaNJ'; idFiltroCid = 'filtroCidadeNJ'; colecaoAtiva = "judicial_nao_geral";
    } else if (tipo === 'advogada') {
        idInput = 'inputPesquisaAdvogada'; idFiltroCid = 'filtroCidadeAdvogada'; colecaoAtiva = "judicial_advogada"; // Correção cirúrgica do ID do input
    } else {
        idInput = 'inputPesquisaJudicial'; idFiltroCid = 'filtroCidade'; colecaoAtiva = document.getElementById('filtroTela')?.value || "judicial";
    }
    
    const termo = document.getElementById(idInput)?.value.toLowerCase() || "";
    let filtroCidRaw = document.getElementById(idFiltroCid)?.value || "TODOS";
    const mapaCidades = { "sgrp": "São Gonçalo do Rio Preto", "couto": "Couto de Magalhães", "datas": "Datas", "gouveia": "Gouveia", "monjolos": "Monjolos", "felicio": "Felício dos Santos" };
    const filtroNorm = (mapaCidades[filtroCidRaw] || filtroCidRaw).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    db.collection(colecaoAtiva).onSnapshot((snapshot) => {
        let todosDados = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            const historico = d.historico_evolucao || [];
            const cidBanco = (d.municipio || d.cidade || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const nome = (d.nome || d.nomeUsuario || "").toLowerCase();
            const proc = (d.processo || d.numeroOficio || "").toLowerCase();

            let atendeFiltroCidade = (filtroCidRaw === "TODOS") || 
                                     (filtroCidRaw === "PRAZO_CRITICO" && historico.some(h => verificarAlertaPrazo(h.data_proxima_resposta, tipo))) || 
                                     (cidBanco === filtroNorm);

            if (atendeFiltroCidade && (nome.includes(termo) || proc.includes(termo))) {
                todosDados.push({ id: doc.id, ...d });
            }
        });

        // Ordenação global simplificada
        todosDados.sort((a, b) => new Date(b.data_ultima_modificacao) - new Date(a.data_ultima_modificacao));
        
        dadosFiltradosGlobal = todosDados;
        renderizarTabelaPaginada(tipo);
    });
}

function renderizarTabelaPaginada(tipo) {
    let idTabela = 'corpoTabelaJudicial';
    let idInfoPagina = 'infoPagina';
    let idBtnAnterior = 'btnAnterior';
    let idBtnProximo = 'btnProximo';
    
    if (tipo === 'judicial_nao_geral') {
        idTabela = 'corpoTabelaNaoJudicial';
        idInfoPagina = 'infoPaginaNJ';
        idBtnAnterior = 'btnAnteriorNJ';
        idBtnProximo = 'btnProximoNJ';
    } else if (tipo === 'advogada') {
        idTabela = 'corpoTabelaAdvogada';
        idInfoPagina = 'infoPaginaAdv';
        idBtnAnterior = 'btnAnteriorAdv';
        idBtnProximo = 'btnProximoAdv';
    }

    const corpo = document.getElementById(idTabela);
    if (!corpo) return;

    const totalPaginas = Math.ceil(dadosFiltradosGlobal.length / itensPorPagina) || 1;
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const dadosExibir = dadosFiltradosGlobal.slice(inicio, inicio + itensPorPagina);

    const filtroCidElem = document.getElementById(tipo === 'judicial_nao_geral' ? 'filtroCidadeNJ' : (tipo === 'advogada' ? 'filtroCidadeAdvogada' : 'filtroCidade'));
    const modoCriticoAtivo = filtroCidElem && filtroCidElem.value === "PRAZO_CRITICO";

    corpo.innerHTML = '';
    
    dadosExibir.forEach((d, index) => {
        const historicoRaw = d.historico_evolucao || [];
        const historico = [...historicoRaw].sort((a, b) => {
            const converterParaData = (str) => {
                if (!str || str === "-") return new Date(0);
                const partes = str.split('/');
                return partes.length === 3 ? new Date(partes[2], partes[1] - 1, partes[0]) : new Date(0);
            };
            return converterParaData(b.data_rec) - converterParaData(a.data_rec);
        });

        // --- INÍCIO DA REGRA DE COR AJUSTADA ---
        const filtroTelaAtivo = document.getElementById('filtroTela')?.value;
        const statusPrincipal = (d.status || "").toLowerCase();
        let corLinha = '#ffffff';

        // Regra prioritária: Se estiver no filtro de periódicos, a linha fica amarela
        if (filtroTelaAtivo === 'judicial_periodicos') {
            corLinha = '#FFFF00'; 
        } else {
            // Caso contrário, segue a lógica original de verificar o histórico
            if (statusPrincipal.includes("respondido") || historico.some(h => h.status === 'respondido')) corLinha = '#e8f5e9';
            if (historico.some(h => h.status === 'protetiva')) corLinha = '#f3e5f5';
        }
        // --- FIM DA REGRA DE COR AJUSTADA ---

        const idScroll = `scroll-hist-${index}`;

        let htmlHist = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span style="font-size: 10px; font-weight: bold; color: #636e72;">${modoCriticoAtivo ? 'EXIBINDO APENAS PRAZO CRÍTICO' : 'MOVIMENTAÇÕES'}</span>
                <button onclick="toggleExpandirHistorico('${idScroll}', this)" style="background: none; border: none; color: #0984e3; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-expand"></i> <span style="font-size: 9px;">EXPANDIR</span>
                </button>
            </div>
            <div id="${idScroll}" style="display: flex; flex-direction: column; gap: 6px; max-height: 150px; overflow-y: auto; padding-right: 5px; scrollbar-width: thin; transition: max-height 0.3s ease-out;">`;
        
        if(historico.length > 0) {
            const historicoParaExibir = modoCriticoAtivo 
                ? historico.filter(h => verificarAlertaPrazo(h.data_proxima_resposta, tipo))
                : historico;

            htmlHist += historicoParaExibir.map(h => {
                const temAlerta = verificarAlertaPrazo(h.data_proxima_resposta, tipo);
                let corBox = h.status === 'respondido' ? '#43ec43' : 
                             (h.status === 'periodico' ? '#FFFF00' : 
                             (h.status === 'protetiva' ? '#A28AF9' : 
                             (h.status === 'extensao' ? '#74b9ff' : '#f8f9fa')));
                
                const backgroundStyle = temAlerta ? 'background-color: #ffeaea !important;' : `background: ${corBox};`;
                const borderStyle = temAlerta ? 'border: 2px solid #d63031 !important;' : 'border: 1px solid rgba(0,0,0,0.05);';
                const textStyle = temAlerta ? 'color: #d63031; font-weight: bold;' : '';
                const sideBarColor = temAlerta ? '#d63031' : '#7f8c8d';

                return `
                    <div style="font-size:11px; padding: 6px 8px; border-left: 4px solid ${sideBarColor}; ${backgroundStyle} ${borderStyle} border-radius: 4px; margin-bottom: 2px;">
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.08); padding-bottom: 2px; margin-bottom: 4px;">
                            <span><strong>Data De Recebimento: ${h.data_rec || '-'}</strong> | <strong>Prazo Para Envio de Relatório:</strong> ${h.prazo || '-'}</span>
                            ${h.link ? `<a href="${h.link}" target="_blank" style="color: #0984e3; font-weight: bold; text-decoration: none;"> DRIVE</a>` : ''}
                        </div>
                        <div style="margin-bottom: 2px;"><strong>Última Resposta:</strong> ${h.resposta || '-'}</div>
                        <div style="margin-bottom: 2px;">
                            <strong>Próxima Resposta:</strong> 
                            <span style="${textStyle}">${h.data_proxima_resposta || '-'}</span>
                        </div>
                        <div style="font-style: italic; color: #555; word-wrap: break-word;"><strong>Obs:</strong> ${h.obs || '-'}</div>
                    </div>`;
            }).join('');
        } else {
            htmlHist += `<div style="font-size:11px; padding:5px; color:#777; font-style: italic;">Sem movimentações</div>`;
        }
        htmlHist += `</div>`;

        let colEdicao = (tipo === 'judicial_nao_geral') ? 'judicial_nao_geral' : (tipo === 'advogada' ? 'judicial_advogada' : (document.getElementById('filtroTela')?.value || "judicial"));

        const nomeParaModal = (d.nome || d.nomeUsuario || d.parteUsuario || '-').replace(/'/g, "\\'");

        corpo.innerHTML += `
            <tr style="background: ${corLinha}; border-bottom: 1px solid #eee;">
                <td style="padding: 12px 10px; font-weight: bold; vertical-align: top; font-size: 13px;">${d.nome || d.nomeUsuario || d.parteUsuario || '-'}</td>
                <td style="padding: 12px 10px; vertical-align: top; font-size: 12px;">${d.vara || d.remetente || '-'}</td>
                <td style="padding: 12px 10px; vertical-align: top; font-size: 12px;">${d.processo || d.numeroOficio || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; vertical-align: top; font-size: 12px;">${d.municipio || '-'}</td>
                <td style="padding: 8px 10px; vertical-align: top; width: 45%;">${htmlHist}</td>
                <td style="padding: 12px 10px; text-align: center; vertical-align: top;">
                    <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
                        <button onclick="prepararEdicao('${d.id}', '${colEdicao}')" style="background: #2d3436; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;" title="Editar Processo">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="solicitarExclusaoModal('${d.id}', '${colEdicao}', '${nomeParaModal}', '${tipo}')" style="background: #2d3436; color: #ff7675; border: none; padding: 8px; border-radius: 4px; cursor: pointer;" title="Excluir Processo">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    const infoPagElem = document.getElementById(idInfoPagina);
    if (infoPagElem) infoPagElem.innerText = `Página ${paginaAtual} de ${totalPaginas}`;
}

window.solicitarExclusaoModal = (id, colecao, nomeUsuario, tipoAtual) => {
    const existente = document.getElementById('dialogConfirmacaoExcluir');
    if (existente) existente.remove();

    const dialog = document.createElement('dialog');
    dialog.id = 'dialogConfirmacaoExcluir';
    
    dialog.style.border = 'none';
    dialog.style.borderRadius = '8px';
    dialog.style.padding = '24px';
    dialog.style.maxWidth = '420px';
    dialog.style.width = '90%';
    dialog.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
    dialog.style.textAlign = 'center';
    dialog.style.fontFamily = 'sans-serif';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.margin = '0';

    dialog.innerHTML = `
        <div style="color: #d63031; font-size: 44px; margin-bottom: 14px;">
            <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 style="margin: 0 0 10px 0; color: #2d3436; font-size: 19px; font-weight: bold;">Confirmar Exclusão</h3>
        <p style="margin: 0 0 24px 0; color: #636e72; font-size: 14px; line-height: 1.5; text-align: center;">
            Tem certeza que deseja excluir permanentemente o processo de <strong>${nomeUsuario}</strong>?<br>Esta ação removerá o registro do banco de dados e não poderá ser desfeita.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="btnCancelarExclusao" style="background: #dfe6e9; color: #2d3436; border: none; padding: 10px 22px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">
                Cancelar
            </button>
            <button id="btnConfirmarExclusao" style="background: #d63031; color: white; border: none; padding: 10px 22px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">
                Excluir Registro
            </button>
        </div>
        <style>
            dialog::backdrop {
                background: rgba(0, 0, 0, 0.6) !important;
                backdrop-filter: blur(2px);
            }
        </style>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    document.getElementById('btnCancelarExclusao').onclick = () => {
        dialog.close();
        dialog.remove();
    };

    document.getElementById('btnConfirmarExclusao').onclick = async () => {
        try {
            document.getElementById('btnConfirmarExclusao').innerText = "Excluindo...";
            document.getElementById('btnConfirmarExclusao').disabled = true;
            
            await db.collection(colecao).doc(id).delete();
            
            dialog.close();
            dialog.remove();

            // Dispara a recarga forçada da tabela com os dados corretos
            if (typeof carregarDadosJudiciaisNaTabelaReal === "function") {
                carregarDadosJudiciaisNaTabelaReal(tipoAtual);
            }

            if (typeof mostrarToast === "function") {
                mostrarToast("Processo removido com sucesso!");
            } else {
                alert("Processo removido com sucesso!");
            }
        } catch (e) {
            console.error("Erro ao deletar do Firebase:", e);
            alert("Erro ao tentar excluir o processo. Verifique a conexão.");
            dialog.close();
            dialog.remove();
        }
    };
};

// --- FUNÇÃO DO MODAL DE EXCLUSÃO PROFISSIONAL COM ATUALIZAÇÃO EM TEMPO REAL ---
window.solicitarExclusaoModal = (id, colecao, nomeUsuario, tipoAtual) => {
    const existente = document.getElementById('dialogConfirmacaoExcluir');
    if (existente) existente.remove();

    const dialog = document.createElement('dialog');
    dialog.id = 'dialogConfirmacaoExcluir';
    
    dialog.style.border = 'none';
    dialog.style.borderRadius = '8px';
    dialog.style.padding = '24px';
    dialog.style.maxWidth = '420px';
    dialog.style.width = '90%';
    dialog.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
    dialog.style.textAlign = 'center';
    dialog.style.fontFamily = 'sans-serif';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.margin = '0';

    dialog.innerHTML = `
        <div style="color: #d63031; font-size: 44px; margin-bottom: 14px;">
            <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 style="margin: 0 0 10px 0; color: #2d3436; font-size: 19px; font-weight: bold;">Confirmar Exclusão</h3>
        <p style="margin: 0 0 24px 0; color: #636e72; font-size: 14px; line-height: 1.5; text-align: center;">
            Tem certeza que deseja excluir permanentemente o processo de <strong>${nomeUsuario}</strong>?<br>Esta ação removerá o registro do banco de dados e não poderá ser desfeita.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="btnCancelarExclusao" style="background: #dfe6e9; color: #2d3436; border: none; padding: 10px 22px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">
                Cancelar
            </button>
            <button id="btnConfirmarExclusao" style="background: #d63031; color: white; border: none; padding: 10px 22px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">
                Excluir Registro
            </button>
        </div>
        <style>
            dialog::backdrop {
                background: rgba(0, 0, 0, 0.6) !important;
                backdrop-filter: blur(2px);
            }
        </style>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    document.getElementById('btnCancelarExclusao').onclick = () => {
        dialog.close();
        dialog.remove();
    };

    document.getElementById('btnConfirmarExclusao').onclick = async () => {
        try {
            document.getElementById('btnConfirmarExclusao').innerText = "Excluindo...";
            document.getElementById('btnConfirmarExclusao').disabled = true;
            
            // Remove o documento do Firebase
            await db.collection(colecao).doc(id).delete();
            
            dialog.close();
            dialog.remove();

            // 🌟 ATUALIZAÇÃO EM TEMPO REAL: Recarrega os dados imediatamente na tabela ativa
            if (typeof carregarDadosJudiciaisNaTabelaReal === "function") {
                carregarDadosJudiciaisNaTabelaReal(tipoAtual);
            }

            if (typeof mostrarToast === "function") {
                mostrarToast("Processo removido com sucesso!");
            } else {
                alert("Processo removido com sucesso!");
            }
        } catch (e) {
            console.error("Erro ao deletar do Firebase:", e);
            alert("Erro ao tentar excluir o processo. Verifique a conexão.");
            dialog.close();
            dialog.remove();
        }
    };
};

// --- FUNÇÃO DO MODAL DE EXCLUSÃO PROFISSIONAL TOP-LAYER (IMPEDE FICAR OCULTO) ---
window.solicitarExclusaoModal = (id, colecao, nomeUsuario) => {
    const existente = document.getElementById('dialogConfirmacaoExcluir');
    if (existente) existente.remove();

    const dialog = document.createElement('dialog');
    dialog.id = 'dialogConfirmacaoExcluir';
    
    // Estilização limpa e profissional centralizada por cima de tudo
    dialog.style.border = 'none';
    dialog.style.borderRadius = '8px';
    dialog.style.padding = '24px';
    dialog.style.maxWidth = '420px';
    dialog.style.width = '90%';
    dialog.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
    dialog.style.textAlign = 'center';
    dialog.style.fontFamily = 'sans-serif';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.margin = '0';

    dialog.innerHTML = `
        <div style="color: #d63031; font-size: 44px; margin-bottom: 14px;">
            <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 style="margin: 0 0 10px 0; color: #2d3436; font-size: 19px; font-weight: bold;">Confirmar Exclusão</h3>
        <p style="margin: 0 0 24px 0; color: #636e72; font-size: 14px; line-height: 1.5; text-align: center;">
            Tem certeza que deseja excluir permanentemente o processo de <strong>${nomeUsuario}</strong>?<br>Esta ação removerá o registro do banco de dados e não poderá ser desfeita.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="btnCancelarExclusao" style="background: #dfe6e9; color: #2d3436; border: none; padding: 10px 22px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px; transition: background 0.2s;">
                Cancelar
            </button>
            <button id="btnConfirmarExclusao" style="background: #d63031; color: white; border: none; padding: 10px 22px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px; transition: background 0.2s;">
                Excluir Registro
            </button>
        </div>
        <style>
            dialog::backdrop {
                background: rgba(0, 0, 0, 0.6) !important;
                backdrop-filter: blur(2px);
            }
        </style>
    `;

    document.body.appendChild(dialog);
    dialog.showModal();

    document.getElementById('btnCancelarExclusao').onclick = () => {
        dialog.close();
        dialog.remove();
    };

    document.getElementById('btnConfirmarExclusao').onclick = async () => {
        try {
            document.getElementById('btnConfirmarExclusao').innerText = "Excluindo...";
            document.getElementById('btnConfirmarExclusao').disabled = true;
            
            await db.collection(colecao).doc(id).delete();
            
            dialog.close();
            dialog.remove();

            if (typeof mostrarToast === "function") {
                mostrarToast("Processo removido com sucesso!");
            } else {
                alert("Processo removido com sucesso!");
            }
        } catch (e) {
            console.error("Erro ao deletar do Firebase:", e);
            alert("Erro ao tentar excluir o processo. Verifique a conexão.");
            dialog.close();
            dialog.remove();
        }
    };
};


// --- FUNÇÃO DE EXCLUSÃO PROFISSIONAL CENTRALIZADA (SEM ALTERAR O VISUAL) ---
window.solicitarExclusaoModal = (id, colecao, nomeUsuario) => {
    // Remove qualquer dialog duplicado para não acumular lixo na memória
    const existente = document.getElementById('dialogConfirmacaoExcluir');
    if (existente) existente.remove();

    // Cria o elemento dialog nativo que ignora qualquer barreira de z-index do layout
    const dialog = document.createElement('dialog');
    dialog.id = 'dialogConfirmacaoExcluir';
    
    // Estilização minimalista e profissional centralizada
    dialog.style.border = 'none';
    dialog.style.borderRadius = '8px';
    dialog.style.padding = '24px';
    dialog.style.maxWidth = '450px';
    dialog.style.width = '90%';
    dialog.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    dialog.style.textAlign = 'center';
    dialog.style.fontFamily = 'sans-serif';

    dialog.innerHTML = `
        <div style="color: #d63031; font-size: 40px; margin-bottom: 12px;">
            <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 style="margin: 0 0 10px 0; color: #2d3436; font-size: 18px; font-weight: bold;">Confirmar Exclusão</h3>
        <p style="margin: 0 0 24px 0; color: #636e72; font-size: 14px; line-height: 1.5;">
            Tem certeza que deseja excluir permanentemente o processo de <strong>${nomeUsuario}</strong>?<br>Esta ação não poderá ser desfeita.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="btnCancelarExclusao" style="background: #dfe6e9; color: #2d3436; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">
                Cancelar
            </button>
            <button id="btnConfirmarExclusao" style="background: #d63031; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">
                Excluir Registro
            </button>
        </div>
    `;

    document.body.appendChild(dialog);
    
    // Abre como modal nativo do navegador (Garante centralização perfeita sobre toda a aplicação)
    dialog.showModal();

    // Evento para fechar e remover ao clicar em cancelar
    document.getElementById('btnCancelarExclusao').onclick = () => {
        dialog.close();
        dialog.remove();
    };

    // Evento para executar a exclusão segura no Firebase
    document.getElementById('btnConfirmarExclusao').onclick = async () => {
        try {
            document.getElementById('btnConfirmarExclusao').innerText = "Excluindo...";
            document.getElementById('btnConfirmarExclusao').disabled = true;
            
            await db.collection(colecao).doc(id).delete();
            
            dialog.close();
            dialog.remove();

            if (typeof mostrarToast === "function") {
                mostrarToast("Processo removido com sucesso!");
            } else {
                alert("Processo removido com sucesso!");
            }
        } catch (e) {
            console.error("Erro ao deletar do Firebase:", e);
            alert("Erro ao tentar excluir o processo. Verifique a conexão.");
            dialog.close();
            dialog.remove();
        }
    };
};


// --- FUNÇÃO PARA ABRIR NOVO CADASTRO ---
window.abrirFormularioNovo = function(colecaoAlvo = 'judicial') {
    idProcessoEmEdicao = null; 
    const modal = document.getElementById('modalCadastroJudicial');
    
    if (!modal) {
        console.error("ERRO: Elemento 'modalCadastroJudicial' não encontrado!");
        return;
    }

    // 1. Exibe o modal
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    // 2. Ajusta a DIV interna para ter scroll igual à tela de exibição
    const cartaoInterno = modal.querySelector('div');
    if (cartaoInterno) {
        cartaoInterno.style.maxHeight = '90vh'; // Limita a 90% da altura da tela
        cartaoInterno.style.overflowY = 'auto'; // Ativa o scroll interno
        cartaoInterno.style.display = 'flex';
        cartaoInterno.style.flexDirection = 'column';
    }

    // Limpeza de campos
    document.getElementById('addNome').value = '';
    document.getElementById('addProcesso').value = '';
    document.getElementById('addRemetente').value = '';
    document.getElementById('addMeio').value = '';
    document.getElementById('addMunicipio').value = 'Couto de Magalhães';
    
    modal.setAttribute('data-colecao', colecaoAlvo);
    document.getElementById('tituloModalCadastro').innerText = " NOVO PROCESSO";

    const container = document.getElementById('containerLinhasDatas');
    container.innerHTML = ''; 
    adicionarNovaLinhaData(); 
    
    // Trava o scroll do fundo (página principal) enquanto cadastra
    document.body.style.overflow = 'hidden';
};
// --- FUNÇÃO PARA FECHAR (X e CANCELAR) ---
window.fecharModalCadastro = function() {
    const modal = document.getElementById('modalCadastroJudicial');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Devolve o scroll para a página de trás
    }
};

window.adicionarNovaLinhaData = (dados = null) => {
    const container = document.getElementById('containerLinhasDatas');
    const div = document.createElement('div');
    div.className = 'linha-data-entry';
    
    // Estilização ajustada para centralizar proporcionalmente (95% de largura)
    div.style = `
        background: #f8f9fa; 
        padding: 25px 20px 20px 20px; 
        border-radius: 8px; 
        margin: 15px auto 20px auto; 
        width: 95%;
        border: 1px solid #dee2e6; 
        position: relative; 
        display: grid; 
        gap: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        box-sizing: border-box;
    `;
    
    div.innerHTML = `
        <button onclick="this.parentElement.remove()" 
            style="position: absolute; top: 10px; right: 10px; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; font-weight: bold; z-index: 5; transition: 0.2s;">
            &times;
        </button>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
            <div style="display: flex; flex-direction: column;">
                <label style="font-size: 10px; font-weight: bold; color: #555; margin-bottom: 5px; text-transform: uppercase;">Data de Recebimento</label>
                <input type="text" class="data-rec-input" placeholder="DD/MM/AAAA" value="${dados?.data_rec || ''}" style="padding:10px; border:1px solid #ccc; border-radius:4px;">
            </div>
            <div style="display: flex; flex-direction: column;">
                <label style="font-size: 10px; font-weight: bold; color: #555; margin-bottom: 5px; text-transform: uppercase;">Prazo para Envio de Relatório</label>
                <input type="text" class="prazo-input" placeholder="Ex: mensal" value="${dados?.prazo || ''}" style="padding:10px; border:1px solid #ccc; border-radius:4px;">
            </div>
            <div style="display: flex; flex-direction: column;">
                <label style="font-size: 10px; font-weight: bold; color: #555; margin-bottom: 5px; text-transform: uppercase;">Status</label>
                <select class="cor-input" style="padding:10px; border:1px solid #ccc; border-radius:4px;">
                    <option value="normal" ${dados?.status === 'normal' ? 'selected' : ''}>Padrão</option>
                    <option value="protetiva" ${dados?.status === 'protetiva' ? 'selected' : ''}>🟣 Medida Protetiva</option>
                    <option value="periodico" ${dados?.status === 'periodico' ? 'selected' : ''}>🟡 Periódico</option>
                    <option value="respondido" ${dados?.status === 'respondido' ? 'selected' : ''}>🟢 Respondido</option>
                    <option value="extensao" ${dados?.status === 'extensao' ? 'selected' : ''}>🔵 Extensão de Prazo</option>
                </select>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="display: flex; flex-direction: column;">
                <label style="font-size: 10px; font-weight: bold; color: #555; margin-bottom: 5px; text-transform: uppercase;">Data da Última Resposta</label>
                <input type="text" class="resposta-input" value="${dados?.resposta || ''}" style="padding:10px; border:1px solid #ccc; border-radius:4px;">
            </div>
            <div style="display: flex; flex-direction: column;">
                <label style="font-size: 10px; font-weight: bold; color: #555; margin-bottom: 5px; text-transform: uppercase;">Data da Próxima Resposta</label>
                <input type="text" class="prox-resposta-input" placeholder="DD/MM/AAAA" value="${dados?.data_proxima_resposta || ''}" style="padding:10px; border:1px solid #ccc; border-radius:4px;">
            </div>
        </div>

        <div style="display: flex; flex-direction: column;">
            <label style="font-size: 10px; font-weight: bold; color: #555; margin-bottom: 5px; text-transform: uppercase;">Link Drive</label>
            <input type="text" class="link-input" placeholder="https://drive.google.com/..." value="${dados?.link || ''}" style="padding:10px; border:1px solid #ccc; border-radius:4px;">
        </div>

        <div style="display: flex; flex-direction: column;">
            <label style="font-size: 10px; font-weight: bold; color: #555; margin-bottom: 5px; text-transform: uppercase;">Observações</label>
            <textarea class="obs-input" style="padding:10px; border:1px solid #ccc; border-radius:4px; height:60px; resize: none; font-family: sans-serif;">${dados?.obs || ''}</textarea>
        </div>
    `;
    container.appendChild(div);
};

// --- CONFIGURAÇÃO DA AGENDA ---
let ANO_VIGENTE_AGENDA = new Date().getFullYear().toString();

let paginaAtualAgenda = 1;
const itensPorPaginaAgenda = 15;
let todosDadosAgenda = []; 

function abrirTelaAgenda() {
    fecharModal();
    const modalBase = document.getElementById('modalJudicialModerno'); 
    if (!modalBase) return;
    
    modalBase.style.display = 'flex';
    modalBase.innerHTML = `
        <div class="modal-content-judicial" style="width: 98%; max-width: 1600px; background: white; padding: 15px; border-radius: 8px; position: relative; height: 95vh; display: flex; flex-direction: column;">
            <span onclick="fecharModalJudicial()" style="position:absolute; right:15px; top:10px; cursor:pointer; font-size:25px; color:#FF0000; z-index:101;">&times;</span>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                
                <div style="width: 100%; text-align: center; display: flex; flex-direction: column; align-items: center;"> 
                    <h2 style="margin: 0; color: #2c3e50;"><i class="fa-solid fa-calendar-days"></i> AGENDA ${ANO_VIGENTE_AGENDA}</h2>
                    
                    <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; justify-content: center; align-items: center;">
                        <span style="font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; background: #3ae43a; color: white;">Realizado</span>
                        <span style="font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; background: #95a5a6; color: white;">Desmarcado</span>
                        <span style="font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; background: #1575d4; color: white;">Reunião de Rede</span>
                        <span style="font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; background: #00d2d3; color: white;">Aviso</span>
                        <span style="font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; background: #ff771c; color: white;">Evento de Hoje</span>

                        <select id="selectAnoAgenda" onchange="mudarAnoAgenda(this.value)" style="padding: 0 10px; border-radius: 6px; border: 1px solid #ddd; background: #f1f2f6; font-weight: bold; cursor: pointer; height: 25px; font-size: 12px; margin-left: 5px;">
                            ${(() => {
                                let options = '';
                                const anoAtual = new Date().getFullYear();
                                for (let i = 2026; i <= anoAtual; i++) {
                                    options += `<option value="${i}" ${ANO_VIGENTE_AGENDA == i ? 'selected' : ''}>${i}</option>`;
                                }
                                return options;
                            })()}
                        </select>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; align-items: center; position: absolute; right: 60px; top: 20px;">
                    <input type="text" id="inputPesquisaAgenda" oninput="paginaAtualAgenda=1; carregarDadosAgendaReal()" placeholder="Pesquisar..." style="padding: 10px; border-radius: 6px; border: 1px solid #ddd; width: 200px;">
                    <button onclick="abrirNovoCadastroAgenda()" style="background: #2c3e50; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        <i class="fa-solid fa-plus"></i> NOVO
                    </button>
                </div>
            </div>

            <div style="overflow-y: auto; flex: 1; border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: white;">
                    <thead style="position: sticky; top: 0; background: #2d3436; color: white; z-index: 10;">
                        <tr>
                            <th style="padding: 12px 12px 12px 25px; text-align: left; width: 25%;">EVENTO / REUNIÃO</th>
                            <th style="padding: 12px; text-align: center; width: 15%;">MUNICÍPIO</th>
                            <th style="padding: 12px; text-align: center; width: 10%;">DATA</th>
                            <th style="padding: 12px; text-align: center; width: 8%;">HORA</th>
                            <th style="padding: 12px; text-align: center; width: 12%;">EQUIPE</th>
                            <th style="padding: 12px; text-align: center;">OBSERVAÇÕES</th>
                            <th style="padding: 12px; text-align: center; width: 60px;">EDITAR</th>
                        </tr>
                    </thead>
                    <tbody id="corpoTabelaAgendaReal"></tbody>
                </table>
            </div>

            <div id="paginacaoAgenda" style="display: flex; justify-content: center; align-items: center; gap: 15px; padding: 10px; border-top: 1px solid #eee; background: #f9f9f9;"></div>
        </div>
    `;
    escutarAgendaRealTime();
}

window.mudarAnoAgenda = (novoAno) => {
    ANO_VIGENTE_AGENDA = novoAno.toString();
    paginaAtualAgenda = 1;
    const h2 = document.querySelector('.modal-content-judicial h2');
    if (h2) h2.innerHTML = `<i class="fa-solid fa-calendar-days"></i> AGENDA ${ANO_VIGENTE_AGENDA}`;
    escutarAgendaRealTime();
};

function escutarAgendaRealTime() {
    db.collection("agenda_geral")
      .orderBy("data_criacao", "desc")
      .onSnapshot((snapshot) => {
        todosDadosAgenda = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            if (String(d.ano) === ANO_VIGENTE_AGENDA) {
                todosDadosAgenda.push({ id: doc.id, ...d });
            }
        });

        todosDadosAgenda.sort((a, b) => {
            const conv = (s) => {
                if(!s || !s.includes('/')) return 0;
                const [d, m, y] = s.split('/');
                return new Date(y, m - 1, d).getTime();
            };
            return conv(b.data) - conv(a.data);
        });

        const modalAberto = document.getElementById('modalJudicialModerno').style.display === 'flex';
        if(modalAberto) { verificarCompromissosHoje(); }
        carregarDadosAgendaReal();
    });
}

function carregarDadosAgendaReal() {
    const corpo = document.getElementById('corpoTabelaAgendaReal');
    const paginacaoDiv = document.getElementById('paginacaoAgenda');
    const termo = document.getElementById('inputPesquisaAgenda')?.value.toLowerCase() || "";
    if(!corpo) return;

    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const hojeStr = hoje.toLocaleDateString('pt-BR');

    let filtrados = todosDadosAgenda.filter(d => 
        (d.evento || "").toLowerCase().includes(termo) || 
        (d.municipio || "").toLowerCase().includes(termo)
    );

    const totalPaginas = Math.ceil(filtrados.length / itensPorPaginaAgenda) || 1;
    const inicio = (paginaAtualAgenda - 1) * itensPorPaginaAgenda;
    const itensPagina = filtrados.slice(inicio, inicio + itensPorPaginaAgenda);

    corpo.innerHTML = '';
    itensPagina.forEach(d => {
        let statusEfetivo = d.status || "Pendente";
        const [dia, mes, ano] = d.data.split('/');
        const dataEvento = new Date(ano, mes - 1, dia);
        dataEvento.setHours(0,0,0,0);

        if (statusEfetivo === "Pendente") {
            if (d.data === hojeStr) statusEfetivo = "Evento de Hoje";
            else if (dataEvento < hoje) statusEfetivo = "Realizado";
        }

        let corFundo = "#ffffff", corTexto = "#2d3436";
        if(statusEfetivo === "Realizado") { corFundo = "#3bd33b"; corTexto = "white"; }
        else if(statusEfetivo === "Desmarcado") { corFundo = "#95a5a6"; corTexto = "white"; }
        else if(statusEfetivo === "Reunião de Rede") { corFundo = "#1575d4"; corTexto = "white"; }
        else if(statusEfetivo === "Aviso") { corFundo = "#00d2d3"; corTexto = "white"; }
        else if(statusEfetivo === "Evento de Hoje") { corFundo = "#ff771c"; corTexto = "white"; }

        corpo.innerHTML += `
            <tr style="background-color: ${corFundo}; color: ${corTexto}; border-bottom: 1px solid rgba(0,0,0,0.1);">
                <td style="padding: 10px; font-weight: bold; text-align: left;">${d.evento}</td>
                <td style="padding: 10px; text-align: center;">${d.municipio}</td>
                <td style="padding: 10px; text-align: center; font-weight: bold;">${d.data}</td>
                <td style="padding: 10px; text-align: center;">${d.horario}</td>
                <td style="padding: 10px; text-align: center;">${d.equipe}</td>
                <td style="padding: 10px; font-size: 11px; text-align: center;">${d.observacoes}</td>
                <td style="padding: 10px; text-align: center;">
                    <button onclick="prepararEdicaoAgenda('${d.id}')" style="background: white; border: none; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        <i class="fa-solid fa-pen-to-square" style="font-size: 12px; color: #2d3436;"></i>
                    </button>
                </td>
            </tr>`;
    });

    paginacaoDiv.innerHTML = `
        <button onclick="mudarPaginaAgenda(-1)" ${paginaAtualAgenda === 1 ? 'disabled' : ''} style="padding: 5px 12px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc;">Anterior</button>
        <span style="font-weight: bold; font-size: 13px;">Página ${paginaAtualAgenda} de ${totalPaginas}</span>
        <button onclick="mudarPaginaAgenda(1)" ${paginaAtualAgenda === totalPaginas ? 'disabled' : ''} style="padding: 5px 12px; cursor: pointer; border-radius: 4px; border: 1px solid #ccc;">Próxima</button>
    `;
}

function mudarPaginaAgenda(valor) {
    paginaAtualAgenda += valor;
    carregarDadosAgendaReal();
}
//Aviso mensagem de compromisso 

function verificarCompromissosHoje() {
    const hojeStr = new Date().toLocaleDateString('pt-BR');
    const paraHoje = todosDadosAgenda.filter(d => d.data === hojeStr && (d.status === "Pendente" || !d.status));
    
    if (paraHoje.length > 0) {
        tocarSomAviso();
        setTimeout(() => {
            // 1. Injeta os estilos CSS do aviso centralizado e do fundo escuro se eles ainda não existirem
            if (!document.getElementById('estilos-notificacao-agenda-centro')) {
                const estilos = document.createElement('style');
                estilos.id = 'estilos-notificacao-agenda-centro';
                estilos.innerHTML = `
                    #overlay-notificacao-agenda {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        background: rgba(0, 0, 0, 0.4); /* Fundo escurecido suave */
                        backdrop-filter: blur(4px); /* Efeito de desfoque ao fundo */
                        z-index: 10000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        animation: fadeInOverlayAgenda 0.3s ease forwards;
                    }
                    .notificacao-agenda-centro {
                        background: #ffffff;
                        color: #2d3436;
                        padding: 30px;
                        border-radius: 16px;
                        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                        border-top: 8px solid #e67e22; /* Barra superior laranja de destaque */
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        max-width: 480px;
                        width: 90%;
                        text-align: center;
                        position: relative;
                        animation: scaleInAgenda 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                        display: flex;
                        flex-direction: column;
                        max-height: 85vh;
                    }
                    .notificacao-agenda-centro.esconder {
                        animation: scaleOutAgenda 0.3s ease forwards;
                    }
                    #overlay-notificacao-agenda.esconder-overlay {
                        animation: fadeOutOverlayAgenda 0.3s ease forwards;
                    }
                    .notificacao-agenda-centro-icone {
                        font-size: 45px;
                        margin-bottom: 15px;
                        display: inline-block;
                        animation: balancoIcone 1s ease infinite alternate;
                    }
                    .notificacao-agenda-centro-titulo {
                        font-size: 20px;
                        font-weight: bold;
                        color: #2d3436;
                        margin-bottom: 12px;
                        letter-spacing: 0.5px;
                    }
                    .notificacao-agenda-centro-texto {
                        font-size: 15px;
                        line-height: 1.6;
                        color: #55595c;
                        margin-bottom: 15px;
                    }
                    .notificacao-agenda-centro-btn {
                        background: #e67e22;
                        color: #ffffff;
                        border: none;
                        padding: 12px 35px;
                        font-size: 15px;
                        font-weight: 600;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: background 0.2s, transform 0.1s;
                        box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
                        width: 100%;
                    }
                    .notificacao-agenda-centro-btn:hover {
                        background: #d35400;
                    }
                    .notificacao-agenda-centro-btn:active {
                        transform: scale(0.98);
                    }
                    @keyframes fadeInOverlayAgenda {
                        to { opacity: 1; }
                    }
                    @keyframes fadeOutOverlayAgenda {
                        to { opacity: 0; }
                    }
                    @keyframes scaleInAgenda {
                        from { transform: scale(0.8); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    @keyframes scaleOutAgenda {
                        to { transform: scale(0.8); opacity: 0; }
                    }
                    @keyframes balancoIcone {
                        from { transform: rotate(-5deg); }
                        to { transform: rotate(5deg); }
                    }
                `;
                document.head.appendChild(estilos);
            }

            // 2. Cria o elemento de fundo (Overlay)
            const overlay = document.createElement('div');
            overlay.id = 'overlay-notificacao-agenda';

            // 3. Cria a caixa da mensagem centralizada
            const divNotificacao = document.createElement('div');
            divNotificacao.className = 'notificacao-agenda-centro';
            
            // Mapeamento corrigido apontando para d.horario e d.evento com a inclusão dinâmica do município
            const compromissosListaHtml = paraHoje.map(d => {
                const hora = d.horario || d.Horario || 'Agenda';
                const desc = d.evento || 'Compromisso sem descrição';
                
                // Captura o município ou cidade informado no documento do Firestore
                const cidadeInformada = d.municipio || d.cidade || '';
                // Se houver uma cidade informada, monta a tag sutil de exibição
                const htmlCidade = cidadeInformada ? ` <span style="color: #7f8c8d; font-size: 11px; font-weight: normal; font-style: italic;">(${cidadeInformada})</span>` : '';
                
                return `
                    <div style="display: flex; align-items: center; gap: 10px; background: #fff5eb; border-left: 4px solid #e67e22; padding: 10px 12px; border-radius: 6px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); text-align: left;">
                        <span style="background: #e67e22; color: white; padding: 3px 7px; border-radius: 4px; font-weight: bold; font-size: 11px; white-space: nowrap;">${hora}</span>
                        <span style="color: #2d3436; font-size: 13px; font-weight: 500; word-break: break-word; flex: 1;">
                            ${desc}${htmlCidade}
                        </span>
                    </div>
                `;
            }).join('');

            divNotificacao.innerHTML = `
                <div class="notificacao-agenda-centro-icone">📢</div>
                <div class="notificacao-agenda-centro-titulo">AGENDA INFORMA</div>
                <div class="notificacao-agenda-centro-texto">
                    Você tem <span style="color: #e67e22; font-weight: bold; font-size: 17px;">${paraHoje.length} compromisso(s)</span> para HOJE!
                </div>
                
                <div style="flex: 1; overflow-y: auto; max-height: 240px; padding-right: 4px; margin-bottom: 15px; scrollbar-width: thin;">
                    ${compromissosListaHtml}
                </div>

                <div style="font-size: 12px; color: #55595c; margin-bottom: 15px;">
                    As linhas foram destacadas em <span style="color: #e67e22; font-weight: bold;">LARANJA</span> na sua agenda.
                </div>
                <button class="notificacao-agenda-centro-btn" id="btn-fechar-agenda-aviso">Entendido</button>
            `;

            // 4. Junta os elementos e coloca na página
            overlay.appendChild(divNotificacao);
            document.body.appendChild(overlay);

            // 5. Função interna para fechar com animação suave ao clicar no botão
            document.getElementById('btn-fechar-agenda-aviso').addEventListener('click', () => {
                divNotificacao.classList.add('esconder');
                overlay.classList.add('esconder-overlay');
                setTimeout(() => {
                    overlay.remove();
                }, 300);
            });

        }, 1000);
    }
}

function tocarSomAviso() {
    try {
        const audio = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3');
        audio.play();
    } catch (e) {
        console.log("Áudio bloqueado pelo navegador.");
    }
}

function mostrarModalFormAgenda(titulo, dados = null) {
    const modalForm = document.getElementById('modalCadastroJudicial');
    modalForm.style.display = 'flex';
    
    // Converte data DD/MM/AAAA para AAAA-MM-DD para o input type="date"
    let dataFormatada = "";
    if (dados?.data) {
        const [d, m, a] = dados.data.split('/');
        dataFormatada = `${a}-${m}-${d}`;
    }

    modalForm.innerHTML = `
        <div style="background: white; width: 450px; border-radius: 12px; padding: 25px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <span onclick="fecharModalCadastro()" style="position:absolute; right:15px; top:10px; cursor:pointer; font-size:25px; color:#999;">&times;</span>
            <h3 style="margin-top:0; color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; text-align: center;">${titulo}</h3>
            
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
                <label style="font-size: 11px; font-weight: bold; color: #7f8c8d;">STATUS DO EVENTO</label>
                <select id="f_ag_status" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd; outline: none;">
                    <option value="Pendente" ${dados?.status === 'Pendente' ? 'selected' : ''}>⚪ Pendente </option>
                    <option value="Realizado" ${dados?.status === 'Realizado' ? 'selected' : ''}>🟢 Realizado (Verde)</option>
                    <option value="Desmarcado" ${dados?.status === 'Desmarcado' ? 'selected' : ''}>🔘 Desmarcado (Cinza)</option>
                    <option value="Reunião de Rede" ${dados?.status === 'Reunião de Rede' ? 'selected' : ''}>🔵 Reunião de Rede (Azul)</option>
                    <option value="Aviso" ${dados?.status === 'Aviso' ? 'selected' : ''}>🔵 Aviso (Azul Claro)</option>
                </select>

                <input type="text" id="f_ag_evento" placeholder="Evento / Reunião" value="${dados?.evento || ''}" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd; outline: none;">
                <input type="text" id="f_ag_municipio" placeholder="Município" value="${dados?.municipio || ''}" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd; outline: none;">
                
                <div style="display: flex; gap: 10px;">
                    <div style="flex:1;">
                        <label style="font-size: 10px; font-weight: bold; color: #7f8c8d;">DATA</label>
                        <input type="date" id="f_ag_data" value="${dataFormatada}" style="width:90%; padding: 10px; border-radius: 6px; border: 1px solid #ddd; outline: none;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-size: 10px; font-weight: bold; color: #7f8c8d;">HORÁRIO</label>
                        <input type="time" id="f_ag_hora" value="${dados?.horario || ''}" style="width:90%; padding: 10px; border-radius: 6px; border: 1px solid #ddd; outline: none;">
                    </div>
                </div>

                <input type="text" id="f_ag_equipe" placeholder="Equipe Responsável" value="${dados?.equipe || ''}" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd; outline: none;">
                <textarea id="f_ag_obs" placeholder="Observações" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd; height: 70px; resize: none; outline: none;">${dados?.observacoes || ''}</textarea>
                
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button onclick="salvarAgendaFirebase()" style="flex: 2; background: #2c3e50; color: white; padding: 14px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                        <i class="fa-solid fa-floppy-disk"></i> SALVAR
                    </button>
                    ${dados ? `
                        <button onclick="excluirAgendaFirebase()" style="flex: 1; background: #e74c3c; color: white; padding: 14px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

async function salvarAgendaFirebase() {
    const dataInput = document.getElementById('f_ag_data').value; // Formato AAAA-MM-DD
    const horaInput = document.getElementById('f_ag_hora').value;
    const eventoInput = document.getElementById('f_ag_evento').value;

    // VALIDAÇÃO BÁSICA COM EVENTO E DATA VISUAIS MODERNOS
    if (!dataInput || !horaInput || !eventoInput) {
        mostrarAvisoCampos("Campos Obrigatórios", "Por favor, preencha o <strong>Evento, Data e Hora</strong> antes de continuar.");
        return;
    }

    // Converte AAAA-MM-DD para DD/MM/AAAA para salvar no padrão do seu banco
    const [ano, mes, dia] = dataInput.split('-');
    const dataBR = `${dia}/${mes}/${ano}`;

    const dados = {
        status: document.getElementById('f_ag_status').value,
        evento: eventoInput,
        municipio: document.getElementById('f_ag_municipio').value,
        data: dataBR,
        horario: horaInput,
        equipe: document.getElementById('f_ag_equipe').value,
        observacoes: document.getElementById('f_ag_obs').value,
        ano: ANO_VIGENTE_AGENDA,
        data_criacao: firebase.firestore.Timestamp.now()
    };

    try {
        if (idAgendaEdicao) {
            await db.collection("agenda_geral").doc(idAgendaEdicao).update(dados);
            mostrarNotificacaoSucesso("Agenda updated com sucesso!");
        } else {
            await db.collection("agenda_geral").add(dados);
            mostrarNotificacaoSucesso("Novo compromisso cadastrado!");
        }
        fecharModalCadastro();
    } catch (e) { 
        mostrarToast("Erro ao salvar.", "#e74c3c"); 
    }
}

async function excluirAgendaFirebase() {
    confirmarAcaoPersonalizada(
        "Excluir Compromisso?", 
        "Deseja mesmo excluir este compromisso permanentemente do sistema?", 
        async () => {
            try {
                await db.collection("agenda_geral").doc(idAgendaEdicao).delete();
                mostrarNotificacaoSucesso("Compromisso removido com sucesso!");
                fecharModalCadastro();
            } catch (e) { 
                mostrarToast("Erro ao excluir.", "#e74c3c"); 
            }
        }
    );
}

let idAgendaEdicao = null;
function abrirNovoCadastroAgenda() { idAgendaEdicao = null; mostrarModalFormAgenda("NOVO EVENTO"); }
async function prepararEdicaoAgenda(id) { 
    idAgendaEdicao = id; 
    const doc = await db.collection("agenda_geral").doc(id).get(); 
    if (doc.exists) mostrarModalFormAgenda("EDITAR EVENTO", doc.data()); 
}


// Código usado para configurar a logica de salvamento direto no FIREBASE


function mostrarToast(mensagem, cor = "#2d3436") {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-mensagem';
    toast.style.borderLeft = `5px solid ${cor}`;
    toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${mensagem}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000); // Remove após 3 segundos
}


// --- FUNÇÃO SALVAR ATUALIZADA COM MIGRAÇÃO E TRATAMENTO DE ABAS AUTOMÁTICO ---
// --- FUNÇÃO SALVAR ATUALIZADA (APENAS RESPONDIDOS MUDAM DE COLEÇÃO) ---
window.salvarNoFirebase = async () => {
    const modal = document.getElementById('modalCadastroJudicial');
    if (!modal) return;
    
    const colecaoOrigem = modal.getAttribute('data-colecao') || 'judicial';
    
    const nome = document.getElementById('addNome').value.trim();
    const processo = document.getElementById('addProcesso').value.trim();
    const remetente = document.getElementById('addRemetente').value.trim();
    const meio = document.getElementById('addMeio').value.trim();
    const municipio = document.getElementById('addMunicipio').value.trim();

    if (!nome) { alert("O campo Nome Usuário/Família é obrigatório."); return; }

    const historico = [];
    document.querySelectorAll('.linha-data-entry').forEach(bloco => {
        const d_rec = bloco.querySelector('.data-rec-input').value.trim();
        const prz = bloco.querySelector('.prazo-input').value.trim();
        const st = bloco.querySelector('.cor-input').value;
        const resp = bloco.querySelector('.resposta-input').value.trim();
        const prox = bloco.querySelector('.prox-resposta-input').value.trim();
        const lnk = bloco.querySelector('.link-input').value.trim();
        const o = bloco.querySelector('.obs-input').value.trim();

        if (d_rec || prz || resp || prox || lnk || o) {
            historico.push({
                data_rec: d_rec,
                prazo: prz,
                status: st,
                resposta: resp,
                data_proxima_resposta: prox,
                link: lnk,
                obs: o
            });
        }
    });

    // Determina o status com base na ÚLTIMA movimentação lançada
    let statusFinalDoProcesso = "judicial"; 
    
    if (historico.length > 0) {
        const historicoOrdenadoTemp = [...historico].sort((a, b) => {
            const conv = (s) => {
                if (!s) return new Date(0);
                const p = s.split('/');
                return p.length === 3 ? new Date(p[2], p[1]-1, p[0]) : new Date(0);
            };
            return conv(a.data_rec) - conv(b.data_rec);
        });
        
        const ultimaMovimentacaoLancada = historicoOrdenadoTemp[historicoOrdenadoTemp.length - 1];
        const statusUltimaLinha = ultimaMovimentacaoLancada.status;

        // 🌟 SÓ MOVE DE COLEÇÃO SE FOR RESPONDIDO OU DESLIGADO
        if (statusUltimaLinha === 'respondido') {
            statusFinalDoProcesso = "judicial_respondidos";
        } else if (statusUltimaLinha === 'desligado') {
            statusFinalDoProcesso = "judicial_desligados";
        } else {
            statusFinalDoProcesso = "judicial"; // Mantém na lista principal (mesmo se for periódico ou protetiva)
        }
    }

    const dados = {
        nome: nome,
        processo: processo,
        remetente: remetente,
        meio_recebimento: meio,
        municipio: municipio,
        status: statusFinalDoProcesso, 
        historico_evolucao: historico,
        data_ultima_modificacao: new Date().toISOString()
    };

    try {
        let colecaoDestinoFinal = colecaoOrigem;
        
        if (colecaoOrigem !== 'judicial_nao_geral' && colecaoOrigem !== 'judicial_advogada') {
            colecaoDestinoFinal = statusFinalDoProcesso;
        }

        if (idProcessoEmEdicao) {
            if (colecaoOrigem !== colecaoDestinoFinal) {
                await db.collection(colecaoOrigem).doc(idProcessoEmEdicao).delete();
                await db.collection(colecaoDestinoFinal).add(dados);
                mostrarToast("Processo atualizado e movido de aba com sucesso!");
            } else {
                await db.collection(colecaoOrigem).doc(idProcessoEmEdicao).update(dados);
                mostrarToast("Processo atualizado com sucesso!");
            }
        } else {
            await db.collection(colecaoDestinoFinal).add(dados);
            mostrarToast("Novo processo cadastrado com sucesso!");
        }
        
        fecharModalCadastro();
    } catch (e) {
        console.error("Erro ao salvar dados no Firebase:", e);
        alert("Erro ao salvar dados. Por favor, verifique a sua ligação.");
    }
};


// ==========================================
// FUNÇÕES AUXILIARES DE NOTIFICAÇÕES MODERNAS
// ==========================================

function mostrarNotificacaoSucesso(mensagem) {
    const existente = document.getElementById('toast-sucesso-agenda');
    if (existente) existente.remove();

    if (!document.getElementById('estilos-toast-sucesso')) {
        const estilos = document.createElement('style');
        estilos.id = 'estilos-toast-sucesso';
        estilos.innerHTML = `
            #toast-sucesso-agenda {
                position: fixed; bottom: 20px; right: 20px;
                background: #2ecc71; color: white; padding: 12px 25px;
                border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                font-family: 'Segoe UI', sans-serif; font-size: 14px;
                font-weight: 600; z-index: 10005; display: flex;
                align-items: center; gap: 10px; transform: translateY(100px);
                opacity: 0; animation: slideInToast 0.3s ease forwards;
            }
            #toast-sucesso-agenda.esconder { animation: slideOutToast 0.3s ease forwards; }
            @keyframes slideInToast { to { transform: translateY(0); opacity: 1; } }
            @keyframes slideOutToast { to { transform: translateY(100px); opacity: 0; } }
        `;
        document.head.appendChild(estilos);
    }

    const toast = document.createElement('div');
    toast.id = 'toast-sucesso-agenda';
    toast.innerHTML = `<span>✅</span> <span>${mensagem}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('esconder');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function confirmarAcaoPersonalizada(titulo, texto, acaoConfirmada) {
    if (!document.getElementById('estilos-modal-confirmacao')) {
        const estilos = document.createElement('style');
        estilos.id = 'estilos-modal-confirmacao';
        estilos.innerHTML = `
            #overlay-confirmacao {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
                z-index: 10001; display: flex; align-items: center; justify-content: center;
                opacity: 0; animation: fadeInOverlayAgenda 0.3s ease forwards;
            }
            .modal-confirmacao-caixa {
                background: #ffffff; padding: 25px; border-radius: 16px;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25); border-top: 8px solid #e74c3c;
                font-family: 'Segoe UI', sans-serif; max-width: 400px; width: 90%; text-align: center;
                animation: scaleInAgenda 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            .btn-confirma-sim { background: #e74c3c; color: white; border: none; padding: 11px 22px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; }
            .btn-confirma-sim:hover { background: #c0392b; }
            .btn-confirma-nao { background: #b2bec3; color: #2d3436; border: none; padding: 11px 22px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; }
            .btn-confirma-nao:hover { background: #636e72; color: white; }
        `;
        document.head.appendChild(estilos);
    }

    const overlay = document.createElement('div');
    overlay.id = 'overlay-confirmacao';

    const caixa = document.createElement('div');
    caixa.className = 'modal-confirmacao-caixa';
    caixa.innerHTML = `
        <div style="font-size: 35px; margin-bottom: 10px;">⚠️</div>
        <h3 style="margin: 0 0 10px 0; color: #2d3436;">${titulo}</h3>
        <p style="font-size: 14px; color: #636e72; margin-bottom: 25px; line-height: 1.5;">${texto}</p>
        <div style="display: flex; justify-content: center; gap: 15px;">
            <button class="btn-confirma-nao" id="btn-confirma-nao">Cancelar</button>
            <button class="btn-confirma-sim" id="btn-confirma-sim">Confirmar</button>
        </div>
    `;

    overlay.appendChild(caixa);
    document.body.appendChild(overlay);

    const fechar = () => overlay.remove();
    document.getElementById('btn-confirma-nao').onclick = fechar;
    document.getElementById('btn-confirma-sim').onclick = () => {
        fechar();
        acaoConfirmada();
    };
}

function mostrarAvisoCampos(titulo, texto) {
    const overlay = document.createElement('div');
    overlay.id = 'overlay-notificacao-agenda';

    const divNotificacao = document.createElement('div');
    divNotificacao.className = 'notificacao-agenda-centro';
    divNotificacao.style.borderTop = '8px solid #f1c40f';

    divNotificacao.innerHTML = `
        <div class="notificacao-agenda-centro-icone">✏️</div>
        <div class="notificacao-agenda-centro-titulo">${titulo}</div>
        <div class="notificacao-agenda-centro-texto" style="margin-bottom: 20px;">
            ${texto}
        </div>
        <button class="notificacao-agenda-centro-btn" style="background: #f1c40f; box-shadow: 0 4px 12px rgba(241, 196, 15, 0.3);" id="btn-fechar-alerta-campos">Entendido</button>
    `;

    overlay.appendChild(divNotificacao);
    document.body.appendChild(overlay);

    document.getElementById('btn-fechar-alerta-campos').addEventListener('click', () => {
        divNotificacao.style.transform = 'scale(0.8)';
        divNotificacao.style.opacity = '0';
        divNotificacao.style.transition = '0.3s ease';
        setTimeout(() => overlay.remove(), 250);
    });
}



// Garante que a função de paginação exista
window.mudarPagina = function(direcao, tipo) {
    if (typeof paginaAtual !== 'undefined') {
        paginaAtual += direcao;
        if (paginaAtual < 1) paginaAtual = 1;
        carregarDadosJudiciaisNaTabelaReal(tipo);
    } else {
        console.error("Erro: Variável 'paginaAtual' não definida.");
    }
};

// Esta função garante que o "couto" do select bata com "Couto de Magalhães" do banco
function normalizarCidade(cidade) {
    if (!cidade) return "";
    const c = cidade.toLowerCase().trim();
    if (c.includes("couto")) return "couto";
    if (c.includes("datas")) return "datas";
    if (c.includes("gouveia")) return "gouveia";
    if (c.includes("monjolos")) return "monjolos";
    if (c.includes("gonçalo") || c.includes("sgrp") || c.includes("preto")) return "sgrp";
    return c;
}

// Configuração de expandir o processo quando está sendo usado individual
window.toggleExpandirHistorico = function(idScroll, botao) {
    const div = document.getElementById(idScroll);
    if (!div) return;

    if (div.style.maxHeight === '150px' || div.style.maxHeight === '') {
        div.style.maxHeight = 'none'; // Remove o limite
        div.style.overflowY = 'visible'; // Desativa o scroll interno
        botao.innerHTML = '<i class="fa-solid fa-compress"></i> <span style="font-size: 9px;">RECOLHER</span>';
    } else {
        div.style.maxHeight = '150px'; // Volta o limite original
        div.style.overflowY = 'auto'; // Reativa o scroll
        botao.innerHTML = '<i class="fa-solid fa-expand"></i> <span style="font-size: 9px;">EXPANDIR</span>';
    }
};

function verificarAlertaPrazo(dataString, tipo) {
    if (tipo !== 'judicial' || !dataString || dataString === "-") return false;

    const partes = dataString.split('/');
    if (partes.length !== 3) return false;
    
    const dataProcesso = new Date(partes[2], partes[1] - 1, partes[0]);
    dataProcesso.setHours(0, 0, 0, 0);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // --- NOVA LÓGICA DE FILTRO POR ANO ---
    // Se a data do processo for de um ano anterior ao ano atual, ignoramos (não é mais crítico)
    if (dataProcesso.getFullYear() < hoje.getFullYear()) {
        return false; 
    }

    // Se a data já passou (mas é deste ano), continua sendo alerta (atrasado)
    if (dataProcesso < hoje) return true;

    // Calcular o limite da janela (Hoje + 14 dias úteis)
    let dataLimite = new Date(hoje);
    let diasUteisContados = 0;
    while (diasUteisContados < 14) {
        dataLimite.setDate(dataLimite.getDate() + 1);
        let diaSemana = dataLimite.getDay();
        if (diaSemana !== 0 && diaSemana !== 6) { 
            diasUteisContados++;
        }
    }

    return dataProcesso <= dataLimite;
}

// Função auxiliar (caso você precise calcular os 14 dias úteis via código no futuro)
function calcularDataComDiasUteis(dataInicio, diasUteis) {
    let data = new Date(dataInicio);
    let cont = 0;
    while (cont < diasUteis) {
        data.setDate(data.getDate() + 1);
        if (data.getDay() !== 0 && data.getDay() !== 6) { // 0 = Domingo, 6 = Sábado
            cont++;
        }
    }
    return data;
}

// Função para gerar o relatório para o TEAMS
function copiarRelatorioTeams() {
    // Filtramos apenas os processos que têm algum prazo crítico
    const todosCriticos = dadosFiltradosGlobal.filter(d => {
        const hist = d.historico_evolucao || [];
        return hist.some(h => verificarAlertaPrazo(h.data_proxima_resposta, 'judicial'));
    });

    if (todosCriticos.length === 0) {
        mostrarToast("Nenhum prazo crítico encontrado para gerar o relatório.", "#e74c3c");
        return;
    }

    // Regras de Equipe
    const equipe1Cidades = ["Datas", "Couto de Magalhães", "São Gonçalo do Rio Preto"];
    const equipe2Cidades = ["Gouveia", "Monjolos"];

    let relatorioEquipe1 = "👥 *EQUIPE 1 (Datas, Couto, SGRP)*\n";
    let relatorioEquipe2 = "👥 *EQUIPE 2 (Gouveia, Monjolos)*\n";
    let temEquipe1 = false;
    let temEquipe2 = false;

    todosCriticos.forEach(d => {
        const municipio = d.municipio || "-";
        const histCritico = (d.historico_evolucao || [])
            .filter(h => verificarAlertaPrazo(h.data_proxima_resposta, 'judicial'));

        histCritico.forEach(h => {
            let bloco = `📍 *NOME:* ${d.nome || d.nomeUsuario || d.parteUsuario || '-'}\n`;
            bloco += `📁 *PROCESSO:* ${d.processo || d.numeroOficio || '-'}\n`;
            bloco += `📅 *VENCIMENTO:* ${h.data_proxima_resposta}\n`;
            bloco += `🏙️ *MUNICÍPIO:* ${municipio}\n`;
            bloco += `--------------------------------\n`;

            if (equipe1Cidades.includes(municipio)) {
                relatorioEquipe1 += bloco;
                temEquipe1 = true;
            } else if (equipe2Cidades.includes(municipio)) {
                relatorioEquipe2 += bloco;
                temEquipe2 = true;
            }
        });
    });

    // Montagem do texto final
    let textoFinal = "📢 *RELATÓRIO DE PRAZOS *\n\n";
    if (temEquipe1) textoFinal += relatorioEquipe1 + "\n";
    if (temEquipe2) textoFinal += relatorioEquipe2;

    navigator.clipboard.writeText(textoFinal).then(() => {
        mostrarToast("✅ Relatório copiado com sucesso!");
    }).catch(err => {
        mostrarToast("Erro ao copiar automaticamente.", "#e74c3c");
    });
}


// Nova Configuração do R.M.A ==========================================================

// ==========================================
// VARIÁVEIS GLOBAIS RMA
// ==========================================
let dataAtualSistema = new Date();
let ANO_VIGENTE_RMA = dataAtualSistema.getFullYear().toString(); 
let CIDADE_ATUAL_RMA = "COUTO DE MAGALHÃES"; 
let todosDadosRma = [];
let idRmaEdicao = null;
const MUNICIPIOS_LISTA = ["COUTO DE MAGALHÃES", "DATAS", "GOUVEIA", "MONJOLOS", "SÃO GONÇALO DO RIO PRETO"];

// ==========================================
// CRIAÇÃO DOS CONTAINERS EXCLUSIVOS
// ==========================================
if (!document.getElementById('modalRmaPrincipal')) {
    const mainModal = document.createElement('div');
    mainModal.id = 'modalRmaPrincipal';
    document.body.appendChild(mainModal);
}

if (!document.getElementById('modalRmaFormulario')) {
    const formModal = document.createElement('div');
    formModal.id = 'modalRmaFormulario';
    document.body.appendChild(formModal);
}

// ==========================================
// INJEÇÃO DOS ESTILOS EXCLUSIVOS
// ==========================================
const styleRma = document.createElement('style');
styleRma.innerHTML = `
    #modalRmaPrincipal {
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        width: 100% !important; height: 100% !important;
        display: none; align-items: center; justify-content: center;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10005 !important;
    }

    #modalRmaFormulario {
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        width: 100% !important; height: 100% !important;
        display: none; align-items: center; justify-content: center;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10010 !important;
    }

    /* ESTILO DE PULSAÇÃO PARA CARDS E BOTÕES */
    .alerta-vencido-btn {
        position: relative !important;
        border: 2px solid #ef4444 !important;
        animation: pulso-rma-btn 2s infinite !important;
        background-color: #fff1f2 !important;
    }

    @keyframes pulso-rma-btn {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); transform: scale(1); }
        70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); transform: scale(1.02); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); transform: scale(1); }
    }

    .badge-pendente-icon {
        background-color: #ef4444; color: white; font-size: 10px; width: 18px; height: 18px;
        display: flex; align-items: center; justify-content: center; border-radius: 50%;
        position: absolute; right: 8px; top: 8px; font-weight: bold; z-index: 20;
    }

    .btn-fechar-rma-fino {
        font-size: 20px !important; color: #f30606 !important; cursor: pointer !important;
        transition: all 0.2s; display: flex; align-items: center; justify-content: center;
    }
    
  

    .faixa-alerta-rma {
        background: #fff5f5; border: 1px solid #feb2b2; color: #c53030;
        padding: 10px 15px; border-radius: 8px; margin-bottom: 15px;
        display: none; align-items: center; gap: 10px; font-weight: 500; font-size: 14px;
    }
`;
document.head.appendChild(styleRma);

// ==========================================
// FUNÇÕES DE CONTROLE
// ==========================================
window.fecharRmaPrincipal = () => { document.getElementById('modalRmaPrincipal').style.display = 'none'; };
window.fecharRmaFormulario = () => { document.getElementById('modalRmaFormulario').style.display = 'none'; };

function aplicarEstiloPulsoRma(ativar) {
    // Lista de textos que devem disparar o pulso no elemento pai
    const textosAlvo = ["Controle RMA", "Controle de Envio"];
    
    const todosElementos = document.querySelectorAll('div, a, button, span');
    todosElementos.forEach(el => {
        const txt = el.innerText ? el.innerText.trim() : "";
        if (textosAlvo.includes(txt)) {
            const container = el.closest('div') || el.parentElement; 
            if (container) {
                if (ativar) {
                    container.classList.add("alerta-vencido-btn");
                    if (!container.querySelector('.badge-pendente-icon')) {
                        container.insertAdjacentHTML('beforeend', '<span class="badge-pendente-icon">!</span>');
                    }
                } else {
                    container.classList.remove("alerta-vencido-btn");
                    const b = container.querySelector('.badge-pendente-icon');
                    if (b) b.remove();
                }
            }
        }
    });
}

window.verificarPendenciasRma = function() {
    const agora = new Date();
    const diaAtual = agora.getDate();
    const mesesNomes = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
    
    let indexMesAnterior = agora.getMonth() - 1;
    let anoReferencia = agora.getFullYear();
    if (indexMesAnterior < 0) { indexMesAnterior = 11; anoReferencia--; }

    const mesAnteriorNome = mesesNomes[indexMesAnterior];
    const anoReferenciaStr = anoReferencia.toString();

    db.collection("controle_rma")
      .where("ano", "==", anoReferenciaStr)
      .where("mes", "==", mesAnteriorNome)
      .get()
      .then((snapshot) => {
          let cidadesComRegistro = [];
          snapshot.forEach(doc => {
              const d = doc.data();
              if (d.data_envio && d.data_envio.trim() !== "" && d.data_envio !== "00/00/00" && d.data_envio !== "00/00/0000") {
                  cidadesComRegistro.push(d.municipio);
              }
          });

          let pendentes = MUNICIPIOS_LISTA.filter(c => !cidadesComRegistro.includes(c));
          const temPendenciaGlobal = pendentes.length > 0 && diaAtual > 7;
          
          // Aplica pulso tanto no card da Home quanto no botão de menu
          aplicarEstiloPulsoRma(temPendenciaGlobal);

          const faixa = document.getElementById('alertaPendenciaRma');
          if (faixa) {
              if (pendentes.includes(CIDADE_ATUAL_RMA) && diaAtual > 7) {
                  faixa.style.display = 'flex';
                  faixa.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ATENÇÃO: Hoje é dia ${diaAtual} e o RMA de <b>${mesAnteriorNome}</b> está pendente para: <b>${CIDADE_ATUAL_RMA}</b>`;
              } else {
                  faixa.style.display = 'none';
              }
          }
      });
};

// ==========================================
// TELA PRINCIPAL RMA
// ==========================================
window.abrirTelaRma = function() {
    const modalBase = document.getElementById('modalRmaPrincipal'); 
    if (!modalBase) return;
    
    const anoAtual = new Date().getFullYear();
    const proximoAno = anoAtual + 1;
    let optionsAno = `<option value="${anoAtual}" ${ANO_VIGENTE_RMA == anoAtual ? 'selected' : ''}>${anoAtual}</option>`;
    if (new Date().getMonth() === 11) {
        optionsAno += `<option value="${proximoAno}" ${ANO_VIGENTE_RMA == proximoAno ? 'selected' : ''}>${proximoAno}</option>`;
    }

    modalBase.style.display = 'flex';
    modalBase.innerHTML = `
        <div style="width: 98%; max-width: 1500px; background: white; padding: 25px; border-radius: 12px; position: relative; height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            
            <div class="btn-fechar-rma-fino" onclick="fecharRmaPrincipal()" 
                 style="position: absolute; top: 12px; right: 12px; cursor: pointer; font-size: 20px; color: #e74c3c; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; z-index: 100; transition: all 0.2s;">
                 <i class="fa-solid fa-xmark"></i>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-chart-simple" style="color: #3498db; font-size: 24px;"></i>
                        <h2 style="margin: 0; color: #2c3e50; font-size: 22px; letter-spacing: -0.5px;">RMA</h2>
                        <select id="selectAnoRma" onchange="mudarAnoRma(this.value)" style="padding: 2px 5px; border-radius: 5px; border: 1px solid #ccc; font-weight: bold; font-size: 14px; cursor:pointer;">${optionsAno}</select>
                    </div>
                    
                    <div style="display: flex; background: #f1f2f6; padding: 4px; border-radius: 8px; gap: 2px;">
                        ${MUNICIPIOS_LISTA.map(cidade => `
                            <button onclick="filtrarCidadeRma('${cidade}')" 
                                style="padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 11px; transition: all 0.2s;
                                ${CIDADE_ATUAL_RMA === cidade ? 'background: #2c3e50; color: white;' : 'background: transparent; color: #7f8c8d;'}">
                                ${cidade}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 15px; margin-right: 35px;">
                    <button onclick="abrirNovoCadastroRma()" style="background: #2c3e50; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; font-size: 13px;">
                        <i class="fa-solid fa-plus"></i> NOVO RMA
                    </button>
                </div>
            </div>

            <div id="alertaPendenciaRma" class="faixa-alerta-rma"></div>

            <div style="overflow-y: auto; flex: 1; border: 1px solid #eee; border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead style="position: sticky; top: 0; background: #2c3e50; color: white; z-index: 10;">
                        <tr>
                            <th style="padding: 15px; text-align: left;">MUNICÍPIO</th>
                            <th style="padding: 15px; text-align: center;">MÊS REF</th>
                            <th style="padding: 15px; text-align: center;">DATA ENVIO</th>
                            <th style="padding: 15px; text-align: left;">OBSERVAÇÕES</th>
                            <th style="padding: 15px; text-align: center;">DRIVE</th>
                            <th style="padding: 15px; text-align: center;">EDITAR</th>
                        </tr>
                    </thead>
                    <tbody id="corpoTabelaRmaExclusivo"></tbody>
                </table>
            </div>
        </div>
    `;
    verificarPendenciasRma();
    escutarRmaRealTime();
};

function escutarRmaRealTime() {
    db.collection("controle_rma")
      .where("ano", "==", ANO_VIGENTE_RMA)
      .where("municipio", "==", CIDADE_ATUAL_RMA)
      .onSnapshot((snapshot) => {
        todosDadosRma = [];
        snapshot.forEach(doc => todosDadosRma.push({ id: doc.id, ...doc.data() }));
        const mesesOrdem = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
        todosDadosRma.sort((a, b) => mesesOrdem.indexOf(a.mes) - mesesOrdem.indexOf(b.mes));
        renderizarTabelaRma();
    });
}

function renderizarTabelaRma() {
    const corpo = document.getElementById('corpoTabelaRmaExclusivo');
    if(!corpo) return;
    corpo.innerHTML = '';
    
    if(todosDadosRma.length === 0) {
        corpo.innerHTML = `<tr><td colspan="6" style="padding: 40px; text-align: center; color: #95a5a6;">Nenhum registro encontrado para esta cidade em ${ANO_VIGENTE_RMA}.</td></tr>`;
        return;
    }

    todosDadosRma.forEach(d => {
        const dataDisplay = (d.data_envio === "00/00/00" || d.data_envio === "00/00/0000") 
            ? `<span style="color: #e74c3c; font-weight: bold;">${d.data_envio}</span>` 
            : (d.data_envio || '-');

        const linkDoc = d.link_arquivo 
            ? `<a href="${d.link_arquivo}" target="_blank" style="color: #0e7ceb; font-size: 18px;"><i class="fa-brands fa-google-drive"></i></a>` 
            : '-';

        corpo.innerHTML += `
            <tr style="border-bottom: 1px solid #eee; transition: background 0.2s;" onmouseover="this.style.background='#f9f9f9'" onmouseout="this.style.background='transparent'">
                <td style="padding: 12px; font-weight: bold; color: #2c3e50;">${d.municipio}</td>
                <td style="padding: 12px; text-align: center; font-weight: bold;">${d.mes}</td>
                <td style="padding: 12px; text-align: center;">${dataDisplay}</td>
                <td style="padding: 12px; font-size: 13px; color: #7f8c8d;">${d.observacoes || ''}</td>
                <td style="padding: 12px; text-align: center;">${linkDoc}</td>
                <td style="padding: 12px; text-align: center;">
                    <button onclick="prepararEdicaoRma('${d.id}')" style="background: #f1f2f6; border: none; padding: 6px 10px; border-radius: 6px; cursor:pointer; color: #2c3e50;">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </td>
            </tr>`;
    });
}

window.filtrarCidadeRma = function(cidade) { CIDADE_ATUAL_RMA = cidade; abrirTelaRma(); };
window.mudarAnoRma = (ano) => { ANO_VIGENTE_RMA = ano; escutarRmaRealTime(); };

// ==========================================
// FORMULÁRIO DE CADASTRO/EDIÇÃO EXCLUSIVO
// ==========================================
window.abrirNovoCadastroRma = () => { idRmaEdicao = null; mostrarModalFormRma(`NOVO RMA - ${CIDADE_ATUAL_RMA}`); };
window.prepararEdicaoRma = async (id) => { 
    idRmaEdicao = id; 
    const doc = await db.collection("controle_rma").doc(id).get(); 
    if (doc.exists) mostrarModalFormRma("EDITAR REGISTRO", doc.data()); 
};

function mostrarModalFormRma(titulo, dados = null) {
    const modalForm = document.getElementById('modalRmaFormulario');
    if(!modalForm) return;

    modalForm.style.display = 'flex';
    modalForm.innerHTML = `
        <div style="background: white; width: 400px; border-radius: 12px; padding: 25px; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <span onclick="fecharRmaFormulario()" class="btn-fechar-rma-fino" style="position:absolute; right:20px; top:15px;"><i class="fa-solid fa-xmark"></i></span>
            <h3 style="text-align:center; margin-top:0; color: #2c3e50; border-bottom: 2px solid #f1f2f6; padding-bottom: 10px;">${titulo}</h3>
            
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                <input type="hidden" id="f_rma_municipio" value="${dados?.municipio || CIDADE_ATUAL_RMA}">
                
                <label style="font-size:11px; font-weight:bold; color: #7f8c8d;">MÊS DE REFERÊNCIA</label>
                <select id="f_rma_mes" style="padding: 10px; border-radius: 8px; border:1px solid #ddd; outline: none;">
                    ${["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"].map(m => 
                        `<option value="${m}" ${dados?.mes === m ? 'selected' : ''}>${m}</option>`
                    ).join('')}
                </select>

                <label style="font-size:11px; font-weight:bold; color: #7f8c8d;">DATA DE ENVIO</label>
                <input type="text" id="f_rma_data" placeholder="00/00/0000" value="${dados?.data_envio || ''}" style="padding: 10px; border-radius: 8px; border:1px solid #ddd; outline: none;">

                <label style="font-size:11px; font-weight:bold; color: #7f8c8d;">LINK DRIVE</label>
                <input type="text" id="f_rma_link" placeholder="Cole o link" value="${dados?.link_arquivo || ''}" style="padding: 10px; border-radius: 8px; border:1px solid #ddd; outline: none;">

                <label style="font-size:11px; font-weight:bold; color: #7f8c8d;">OBSERVAÇÕES</label>
                <textarea id="f_rma_obs" style="padding: 10px; height: 60px; border-radius: 8px; border:1px solid #ddd; resize:none; outline: none;">${dados?.observacoes || ''}</textarea>

                <button onclick="salvarRmaFirebase()" style="background: #2c3e50; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-weight:bold; margin-top:10px;">
                    <i class="fa-solid fa-floppy-disk"></i> SALVAR DADOS
                </button>
                
                ${dados ? `<button onclick="excluirRmaFirebase()" style="color:#e74c3c; background:none; border:none; cursor:pointer; font-size:11px; margin-top:5px; font-weight: bold;">EXCLUIR REGISTRO</button>` : ''}
            </div>
        </div>
    `;
}

async function salvarRmaFirebase() {
    const dados = {
        municipio: document.getElementById('f_rma_municipio').value,
        mes: document.getElementById('f_rma_mes').value,
        data_envio: document.getElementById('f_rma_data').value,
        link_arquivo: document.getElementById('f_rma_link').value,
        observacoes: document.getElementById('f_rma_obs').value,
        ano: ANO_VIGENTE_RMA
    };
    try {
        if (idRmaEdicao) await db.collection("controle_rma").doc(idRmaEdicao).update(dados);
        else await db.collection("controle_rma").add(dados);
        fecharRmaFormulario();
        verificarPendenciasRma();
    } catch (e) { alert("Erro ao salvar."); }
}

async function excluirRmaFirebase() {
    if (confirm("Excluir este registro?")) {
        await db.collection("controle_rma").doc(idRmaEdicao).delete();
        fecharRmaFormulario();
        verificarPendenciasRma();
    }
}

// Inicialização e vigilância contínua
setTimeout(verificarPendenciasRma, 2000);
document.addEventListener('click', function() {
    setTimeout(verificarPendenciasRma, 500);
});


function inicializarSistemaBackupDiscreto() {
    // 1. Verifica se já existe para não duplicar
    if (document.getElementById('btnBackupSistema')) return;

    // 2. CRITÉRIO DE TELA: Só aparece se estiver na página inicial 
    // Se o seu sistema muda a URL (ex: index.html), ajuste aqui.
    // Se não mudar, ele aparecerá sempre, mas bem pequeno como pediu.
    
    const btn = document.createElement('button');
    btn.id = 'btnBackupSistema';
    btn.innerHTML = '💾'; // Apenas o ícone para ser bem pequeno
    btn.title = 'Fazer Backup Geral'; // Texto aparece só ao passar o mouse
    
    // Estilo "Mini" e Discreto
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: '1000', 
        width: '35px',
        height: '35px',
        padding: '0',
        background: '#191a19',
        color: 'white',
        border: 'none',
        borderRadius: '50%', // Redondo para ocupar menos espaço
        cursor: 'pointer',
        fontSize: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: '0.3', // Quase invisível
        transition: 'all 0.3s'
    });

    // Interação de visibilidade
    btn.onmouseover = () => {
        btn.style.opacity = '1';
        btn.style.width = '140px'; // Expande ao passar o mouse
        btn.style.borderRadius = '20px';
        btn.innerHTML = 'Backup Banco de Dados';
    };
    
    btn.onmouseout = () => {
        btn.style.opacity = '0.3';
        btn.style.width = '35px'; // Volta a ser um botaozinho
        btn.style.borderRadius = '50%';
        btn.innerHTML = '💾';
    };

    btn.onclick = async () => {
        const colecoes = [
            'agenda_geral', 'contatos', 'controle_rma', 'judicial', 
            'judicial_advogada', 'judicial_desligados', 'judicial_nao_geral', 
            'judicial_periodicos', 'judicial_protetivas', 'judicial_respondidos', 
            'pacientes_paf', 'usuarios'
        ];
        
        if (!confirm("Iniciar backup completo das coleções?")) return;

        btn.style.background = '#e67e22';
        btn.innerText = '⌛';

        try {
            for (const nomeCol of colecoes) {
                const snapshot = await db.collection(nomeCol).get();
                if (snapshot.empty) continue;

                const dados = snapshot.docs.map(doc => ({ id_doc: doc.id, ...doc.data() }));
                const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const dataSimples = new Date().toLocaleDateString().replace(/\//g, '-');
                
                a.href = url;
                a.download = `BACKUP_${nomeCol}_${dataSimples}.json`;
                a.click();

                await new Promise(r => setTimeout(r, 1000));
            }
            alert("Backup concluído!");
        } catch (e) {
            alert("Erro no backup.");
        } finally {
            btn.style.background = '#121312';
            btn.innerHTML = '💾';
            btn.style.width = '35px';
        }
    };

    document.body.appendChild(btn);
}

// Inicialização
if (document.readyState === 'complete') {
    inicializarSistemaBackupDiscreto();
} else {
    window.addEventListener('load', inicializarSistemaBackupDiscreto);
}

// ==========================================
// MONITOR DE CONEXÃO COM A INTERNET (CREAS)
// ==========================================

function configurarMonitorConexao() {
    // 1. Injeta os estilos CSS do aviso no topo da página
    if (!document.getElementById('estilos-alerta-conexao')) {
        const estilos = document.createElement('style');
        estilos.id = 'estilos-alerta-conexao';
        estilos.innerHTML = `
            #alerta-conexao-creas {
                position: fixed;
                top: -60px; /* Começa escondido acima da tela */
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 14px;
                font-weight: 600;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                z-index: 11000; /* Fica acima de modais e overlays */
                display: flex;
                align-items: center;
                gap: 10px;
                transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s;
            }
            #alerta-conexao-creas.visivel {
                top: 0; /* Desce deslizando suavemente */
            }
            .icone-conexao-piscando {
                animation: piscarAlertaConexao 1s ease infinite alternate;
            }
            @keyframes piscarAlertaConexao {
                from { opacity: 0.4; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(estilos);
    }

    // 2. Cria o elemento HTML do alerta se ele não existir
    let painelAlerta = document.getElementById('alerta-conexao-creas');
    if (!painelAlerta) {
        painelAlerta = document.createElement('div');
        painelAlerta.id = 'alerta-conexao-creas';
        document.body.appendChild(painelAlerta);
    }

    // 3. Função que atualiza o visual baseado no estado da internet
    function atualizarStatusConexao() {
        if (navigator.onLine) {
            // Se estava offline e a internet voltou
            if (painelAlerta.classList.contains('visivel') && painelAlerta.style.background.includes('rgb(231, 76, 60)')) {
                painelAlerta.style.background = '#2ecc71'; // Verde de sucesso
                painelAlerta.style.color = '#ffffff';
                painelAlerta.innerHTML = '<span>🔄 Conexão restabelecida! Sincronizando dados...</span>';
                
                // Deixa o aviso verde por 3 segundos e depois esconde suavemente
                setTimeout(() => {
                    painelAlerta.classList.remove('visivel');
                }, 3000);
            }
        } else {
            // Se a internet caiu
            painelAlerta.style.background = '#e74c3c'; // Vermelho de atenção
            painelAlerta.style.color = '#ffffff';
            painelAlerta.innerHTML = '<span class="icone-conexao-piscando">⚠️</span> <span>Sem conexão com a internet. </span>';
            painelAlerta.classList.add('visivel');
        }
    }

    // 4. Fica escutando os eventos nativos do navegador
    window.addEventListener('online', atualizarStatusConexao);
    window.addEventListener('offline', atualizarStatusConexao);

    // Executa uma verificação inicial assim que o sistema abre
    if (!navigator.onLine) {
        atualizarStatusConexao();
    }
}

// Inicializa o monitor automaticamente ao carregar o script
configurarMonitorConexao();

// =================================================================
// SISTEMA DE LOGIN BLINDADO E REATIVO (FIREBASE AUTHENTICATION)
// =================================================================

function configurarSistemaLoginCREAS() {
    // 1. Injeta os estilos CSS da tela de Login na página
    if (!document.getElementById('estilos-tela-login')) {
        const estilos = document.createElement('style');
        estilos.id = 'estilos-tela-login';
        estilos.innerHTML = `
            #bloqueio-login-creas {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #2d3436;
                z-index: 20000; /* Fica à frente de absolutamente tudo */
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .card-login-creas {
                background: #ffffff;
                padding: 35px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                width: 100%;
                max-width: 400px;
                text-align: center;
            }
            .input-login-creas {
                width: 100%;
                padding: 12px;
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
            }
            .btn-login-creas {
                width: 100%;
                padding: 12px;
                background: #394046;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 15px;
                transition: background 0.2s;
            }
            .btn-login-creas:hover {
                background: #4f5357;
            }
            .btn-login-creas:disabled {
                background: #b2bec3;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(estilos);
    }

    // 2. Cria a estrutura HTML da tela de login se ela não existir
    let telaLogin = document.getElementById('bloqueio-login-creas');
    if (!telaLogin) {
        telaLogin = document.createElement('div');
        telaLogin.id = 'bloqueio-login-creas';
        // Começa escondida até o Firebase checar o estado do usuário
        telaLogin.style.display = 'none'; 
        telaLogin.innerHTML = `
            <div class="card-login-creas">
                <h2 style="margin-top:0; color:#2d3436; font-size:22px; margin-bottom:5px;">CREAS REGIONAL ALTO JEQUITINHONHA</h2>
                <p style="color:#636e72; font-size:14px; margin-bottom:25px;">Gestão Integrada </p>
                
                <form id="formulario-login-creas" onsubmit="event.preventDefault();">
                    <input type="email" id="login-email" class="input-login-creas" placeholder="E-mail funcional" required autocomplete="username">
                    <input type="password" id="login-senha" class="input-login-creas" placeholder="Senha de acesso" required autocomplete="current-password">
                    
                    <div id="erro-login-creas" style="color:#d63031; font-size:13px; font-weight:600; margin-top:10px; display:none;"></div>
                    
                    <button type="submit" id="btn-entrar-creas" class="btn-login-creas">Entrar no Sistema</button>
                </form>
            </div>
        `;
        document.body.appendChild(telaLogin);
    }

    // Captura os elementos internos da janela de login
    const form = document.getElementById('formulario-login-creas');
    const btnEntrar = document.getElementById('btn-entrar-creas');
    const txtErro = document.getElementById('erro-login-creas');

    // 3. Ação do Botão de Login (Chama a função nativa simplificada do Firebase)
    form.addEventListener('submit', async () => {
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        txtErro.style.display = 'none';
        btnEntrar.innerText = 'Autenticando...';
        btnEntrar.disabled = true;

        try {
            // Linha única que faz a mágica no Firebase:
            await firebase.auth().signInWithEmailAndPassword(email, senha);
            // Se der certo, o observador abaixo (onAuthStateChanged) vai rodar e liberar a tela automaticamente!
        } catch (erro) {
            console.error("Erro no login: ", erro.code);
            txtErro.style.display = 'block';
            
            // Tradução simples de erros comuns para a equipe
            if (erro.code === 'auth/wrong-password' || erro.code === 'auth/user-not-found') {
                txtErro.innerText = '⚠️ E-mail ou senha incorretos.';
            } else if (erro.code === 'auth/invalid-email') {
                txtErro.innerText = '⚠️ Formato de e-mail inválido.';
            } else {
                txtErro.innerText = '⚠️ Falha ao conectar. Verifique o acesso.';
            }
            
            btnEntrar.innerText = 'Entrar no Sistema';
            btnEntrar.disabled = false;
        }
    });

    // 4. O OBSERVADOR INTELIGENTE: Verifica em tempo real se o usuário está logado ou não
    firebase.auth().onAuthStateChanged((usuario) => {
        if (usuario) {
            // Usuário está validado! Esconde a tela de login e deixa usar o sistema
            telaLogin.style.display = 'none';
            console.log("Usuário autenticado com sucesso: ", usuario.email);
        } else {
            // Ninguém logado (ou clicou em sair). Bloqueia a tela mostrando o formulário
            telaLogin.style.display = 'flex';
            btnEntrar.innerText = 'Entrar no Sistema';
            btnEntrar.disabled = false;
            document.getElementById('login-senha').value = ''; // Limpa o campo de senha por segurança
        }
    });
}

// =================================================================
// SISTEMA DE LOGIN COM MENSAGEM DE BOAS-VINDAS (FIREBASE AUTH)
// =================================================================

function configurarSistemaLoginCREAS() {
    // 1. Injeta os estilos CSS da tela de Login na página
    if (!document.getElementById('estilos-tela-login')) {
        const estilos = document.createElement('style');
        estilos.id = 'estilos-tela-login';
        estilos.innerHTML = `
            #bloqueio-login-creas {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #2d3436;
                z-index: 20000;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .card-login-creas {
                background: #ffffff;
                padding: 35px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                width: 100%;
                max-width: 400px;
                text-align: center;
            }
            .input-login-creas {
                width: 100%;
                padding: 12px;
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
            }
            .btn-login-creas {
                width: 100%;
                padding: 12px;
                background: #424d55;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 15px;
                transition: background 0.2s;
            }
            .btn-login-creas:hover {
                background: #202221;
            }
            .btn-login-creas:disabled {
                background: #b2bec3;
                cursor: not-allowed;
            }
            
            /* Estilos para o Toast de Boas-Vindas Geral do Sistema */
            #toast-boas-vindas-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 25000;
            }
            .toast-boas-vindas {
                background: #1e272e;
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 6px 18px rgba(0,0,0,0.2);
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 12px;
                border-left: 5px solid #2ecc71;
                animation: slideInToast 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), fadeOutToast 0.5s 3.5s forwards;
            }
            @keyframes slideInToast { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes fadeOutToast { from { opacity: 1; } to { opacity: 0; transform: translateY(10px); } }
        `;
        document.head.appendChild(estilos);
    }

    // 2. Cria a estrutura HTML da tela de login se ela não existir
    let telaLogin = document.getElementById('bloqueio-login-creas');
    if (!telaLogin) {
        telaLogin = document.createElement('div');
        telaLogin.id = 'bloqueio-login-creas';
        telaLogin.style.display = 'none'; 
        telaLogin.innerHTML = `

            <div class="card-login-creas">
            <div class="header-logo-side">
                <img src="https://raw.githubusercontent.com/creasaltojequitinhonha-paf/sistema-paf-creas/main/logo_creas.png" alt="Logo CREAS">
            </div>
                <h2 style="margin-top:0; color:#2d3436; font-size:22px; margin-bottom:5px;">CREAS REGIONAL ALTO JEQUITINHONHA</h2>
                <p style="color:#636e72; font-size:14px; margin-bottom:25px;">Gestão Integrada </p>
                
                <form id="formulario-login-creas" onsubmit="event.preventDefault();">
                    <input type="email" id="login-email" class="input-login-creas" placeholder="E-mail funcional" required autocomplete="username">
                    <input type="password" id="login-senha" class="input-login-creas" placeholder="Senha de acesso" required autocomplete="current-password">
                    
                    <div id="erro-login-creas" style="color:#d63031; font-size:13px; font-weight:600; margin-top:10px; display:none;"></div>
                    
                    <button type="submit" id="btn-entrar-creas" class="btn-login-creas">Entrar no Sistema</button>
                </form>
            </div>
        `;
        document.body.appendChild(telaLogin);
    }

    // Garante que o container de Toasts de boas-vindas exista no body
    let toastContainer = document.getElementById('toast-boas-vindas-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-boas-vindas-container';
        document.body.appendChild(toastContainer);
    }

    const form = document.getElementById('formulario-login-creas');
    const btnEntrar = document.getElementById('btn-entrar-creas');
    const txtErro = document.getElementById('erro-login-creas');

    // 3. Ação do Botão de Login
    form.addEventListener('submit', async () => {
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        txtErro.style.display = 'none';
        btnEntrar.innerText = 'Autenticando...';
        btnEntrar.disabled = true;

        try {
            await firebase.auth().signInWithEmailAndPassword(email, senha);
        } catch (erro) {
            console.error("Erro no login: ", erro.code);
            txtErro.style.display = 'block';
            
            if (erro.code === 'auth/wrong-password' || erro.code === 'auth/user-not-found') {
                txtErro.innerText = '⚠️ E-mail ou senha incorretos.';
            } else if (erro.code === 'auth/invalid-email') {
                txtErro.innerText = '⚠️ Formato de e-mail inválido.';
            } else {
                txtErro.innerText = '⚠️ Falha ao conectar. Verifique o acesso.';
            }
            
            btnEntrar.innerText = 'Entrar no Sistema';
            btnEntrar.disabled = false;
        }
    });

    // Variável de controle para o toast não disparar repetidamente na mesma sessão
    let jaExibiuBoasVindas = false;

    // 4. O OBSERVADOR EM TEMPO REAL
    firebase.auth().onAuthStateChanged((usuario) => {
        if (usuario) {
            telaLogin.style.display = 'none';
            console.log("Usuário autenticado com sucesso: ", usuario.email);

            // Se acabou de logar e ainda não exibiu a mensagem nesta carga de página
            if (!jaExibiuBoasVindas) {
                // Tratamento de Texto: Extrai o nome antes do '@', troca pontos por espaços e capitaliza
                let nomeTratado = usuario.email.split('@')[0];
                nomeTratado = nomeTratado.replace(/[\._]/g, ' '); // Troca pontos ou underlines por espaço
                nomeTratado = nomeTratado.split(' ').map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join(' ');

                // Cria o Toast moderno de boas-vindas
                const novoToast = document.createElement('div');
                novoToast.className = 'toast-boas-vindas';
                novoToast.innerHTML = `
                    <div style="background: #2ecc71; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                        <i class="fa-solid fa-user-check"></i>
                    </div>
                    <div>
                        <span style="display: block; font-weight: bold; color: #ffffff;">Olá, ${nomeTratado}!</span>
                        <span style="font-size: 12px; color: #a4b0be;">Seja bem-vindo ao Gestão Integrada.</span>
                    </div>
                `;
                
                toastContainer.appendChild(novoToast);
                jaExibiuBoasVindas = true;

                // Remove o elemento do HTML após terminar a animação de saída
                setTimeout(() => {
                    novoToast.remove();
                }, 4000);
            }
        } else {
            telaLogin.style.display = 'flex';
            btnEntrar.innerText = 'Entrar no Sistema';
            btnEntrar.disabled = false;
            document.getElementById('login-senha').value = ''; 
            jaExibiuBoasVindas = false; // Reseta o controle ao deslogar
        }
    });
}

// Inicializa a segurança de forma automática ao carregar a página
configurarSistemaLoginCREAS();

// =================================================================
// FUNÇÃO DE LOGOUT COM MODAL MODERNO E PERSONALIZADO
// =================================================================
function fazerLogoutSistema() {
    // Remove qualquer modal de confirmação anterior que possa ter ficado preso
    const modalExistente = document.getElementById('modal-confirmar-sair');
    if (modalExistente) modalExistente.remove();

    // Injeta os estilos de transição e design do novo modal
    if (!document.getElementById('estilos-logout-moderno')) {
        const estilos = document.createElement('style');
        estilos.id = 'estilos-logout-moderno';
        estilos.innerHTML = `
            #modal-confirmar-sair {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(45, 52, 54, 0.75); /* Fundo escurecido suave */
                backdrop-filter: blur(4px); /* Efeito de desfoque no fundo */
                z-index: 30000;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeInLogout 0.2s ease-out;
                font-family: 'Inter', sans-serif;
            }
            .card-logout-moderno {
                background: #ffffff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
                width: 90%;
                max-width: 420px;
                text-align: center;
                transform: scale(0.9);
                animation: scaleUpLogout 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            .botoes-logout-container {
                display: flex;
                gap: 12px;
                margin-top: 25px;
                justify-content: center;
            }
            .btn-logout-acao {
                padding: 11px 24px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .btn-logout-confirmar {
                background: #d63031;
                color: white;
            }
            .btn-logout-confirmar:hover {
                background: #b81d22;
                box-shadow: 0 4px 12px rgba(214, 48, 49, 0.3);
            }
            .btn-logout-cancelar {
                background: #f1f2f6;
                color: #57606f;
            }
            .btn-logout-cancelar:hover {
                background: #dfe4ea;
                color: #2f3542;
            }
            @keyframes fadeInLogout { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUpLogout { to { transform: scale(1); } }
        `;
        document.head.appendChild(estilos);
    }

    // Cria a estrutura do modal customizado
    const painelModal = document.createElement('div');
    painelModal.id = 'modal-confirmar-sair';
    painelModal.innerHTML = `
        <div class="card-logout-moderno">
            <div style="width: 55px; height: 55px; background: #fff5f5; color: #d63031; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; font-size: 24px;">
                <i class="fa-solid fa-right-from-bracket"></i>
            </div>
            <h3 style="margin: 0 0 8px 0; color: #2d3436; font-size: 18px; font-weight: 700;">Encerrar Sessão?</h3>
            <p style="margin: 0; color: #636e72; font-size: 14px; line-height: 1.5;">Deseja realmente sair do sistema <strong>Gestão Integrada</strong>? Você precisará fazer login novamente para acessar os dados.</p>
            
            <div class="botoes-logout-container">
                <button id="logout-btn-cancelar" class="btn-logout-acao btn-logout-cancelar">
                    Cancelar
                </button>
                <button id="logout-btn-confirmar" class="btn-logout-acao btn-logout-confirmar">
                    <i class="fa-solid fa-check"></i> Sim, Sair
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(painelModal);

    // Escutas de evento para os novos botões do card
    document.getElementById('logout-btn-cancelar').addEventListener('click', () => {
        painelModal.remove();
    });

    document.getElementById('logout-btn-confirmar').addEventListener('click', () => {
        painelModal.remove();
        firebase.auth().signOut(); // Executa o encerramento no Firebase
    });

    // Fecha o modal caso o usuário clique na área escura de fora
    painelModal.addEventListener('click', (e) => {
        if (e.target.id === 'modal-confirmar-sair') {
            painelModal.remove();
        }
    });
}



function fecharModalJudicial() { document.getElementById('modalJudicialModerno').style.display = 'none'; }
function fecharModalNaoJudicial() { document.getElementById('modalNaoJudicialModerno').style.display = 'none'; }
function fecharModalCadastro() { document.getElementById('modalCadastroJudicial').style.display = 'none'; }
