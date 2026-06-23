// View do RMA: concentra templates HTML do módulo sem acessar Firestore.
(function () {
    const MESES_RMA = [
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

    function renderTelaPrincipal({ optionsAno, municipios, cidadeAtual }) {
        return `
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
                        ${municipios.map(cidade => `
                            <button onclick="filtrarCidadeRma('${cidade}')"
                                style="padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 11px; transition: all 0.2s;
                                ${cidadeAtual === cidade ? 'background: #2c3e50; color: white;' : 'background: transparent; color: #7f8c8d;'}">
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
    }

    function renderTabelaVazia(ano) {
        return `<tr><td colspan="6" style="padding: 40px; text-align: center; color: #95a5a6;">Nenhum registro encontrado para esta cidade em ${ano}.</td></tr>`;
    }

    function renderLinhaTabela(d) {
        const dataDisplay = (d.data_envio === '00/00/00' || d.data_envio === '00/00/0000')
            ? `<span style="color: #e74c3c; font-weight: bold;">${d.data_envio}</span>`
            : (d.data_envio || '-');

        const linkDoc = d.link_arquivo
            ? `<a href="${d.link_arquivo}" target="_blank" style="color: #0e7ceb; font-size: 18px;"><i class="fa-brands fa-google-drive"></i></a>`
            : '-';

        return `
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
    }

    function renderFormulario({ titulo, dados = null, cidadeAtual }) {
        return `
        <div style="background: white; width: 400px; border-radius: 12px; padding: 25px; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <span onclick="fecharRmaFormulario()" class="btn-fechar-rma-fino" style="position:absolute; right:20px; top:15px;"><i class="fa-solid fa-xmark"></i></span>
            <h3 style="text-align:center; margin-top:0; color: #2c3e50; border-bottom: 2px solid #f1f2f6; padding-bottom: 10px;">${titulo}</h3>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                <input type="hidden" id="f_rma_municipio" value="${dados?.municipio || cidadeAtual}">

                <label style="font-size:11px; font-weight:bold; color: #7f8c8d;">MÊS DE REFERÊNCIA</label>
                <select id="f_rma_mes" style="padding: 10px; border-radius: 8px; border:1px solid #ddd; outline: none;">
                    ${MESES_RMA.map(m =>
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

    window.rmaView = {
        renderTelaPrincipal,
        renderTabelaVazia,
        renderLinhaTabela,
        renderFormulario
    };
})();
