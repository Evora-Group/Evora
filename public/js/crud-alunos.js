function getClasseDesempenho(desempenho) {
    if (!desempenho) return 'p_status_atencao';
    const s = desempenho.toLowerCase();
    if (s.includes('aten')) return 'p_status_atencao';
    if (s.includes('regu')) return 'p_status_regular';
    if (s.includes('ótim') || s.includes('otim')) return 'p_status_otimo';
    return 'p_status_atencao';
}

function listarAlunosInstituicao() {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    fetch(`/instituicao/listarAlunosInstituicao/${fkInstituicao}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (resposta) {
                console.log("Dados recebidos: ", JSON.stringify(resposta));
                
                const listaAlunos = resposta;
                const qtdAlunos = listaAlunos.length;

                const elementosQtdAlunos = document.querySelectorAll(".qtd_alunos");
                elementosQtdAlunos.forEach(elemento => {
                    elemento.innerHTML = qtdAlunos;
                });

                const corpoTabela = document.getElementById("corpo_tabela_alunos");
                corpoTabela.innerHTML = '';

                listaAlunos.forEach(aluno => {
                    const classeDesempenho = getClasseDesempenho(aluno.desempenho);
                    
                    corpoTabela.innerHTML += `
                        <tr onclick="irParaAlunoEspecifico(${aluno.ra})">
                            <td>${aluno.ra}</td>
                            <td>${aluno.nome}</td>
                            <td>${aluno.email}</td>
                            <td>${aluno.turma}</td>
                            <td>${aluno.curso}</td>
                            <td>
                                <p class="${classeDesempenho}">
                                    ${aluno.desempenho ?? 'N/A'}
                                </p>
                            </td>
                            <td onclick="editarAluno(${aluno.ra}); event.stopPropagation();"><i class="fi fi-sr-pencil"></i></td>
                        </tr>
                    `;
                });

                atualizarKpiDesempenho(listaAlunos);
                buscarFrequenciaEAtualizarKpi(fkInstituicao);
            });
        } else {
            console.error("Erro ao listar alunos: ", resposta.status);
        }
    }).catch(function (erro) {
        console.error("Erro na requisição: ", erro);
    });
}

// Função que atualiza os contadores e a KPI de desempenho com base na lista local
function atualizarKpiDesempenho(listaAlunos) {
    const counts = { atencao: 0, regular: 0, otimo: 0 };
    listaAlunos.forEach(a => {
        const s = (a.desempenho || '').toLowerCase();
        if (s.includes('aten')) counts.atencao++;
        else if (s.includes('regu')) counts.regular++;
        else if (s.includes('ótim') || s.includes('otim')) counts.otimo++;
    });

    const total = listaAlunos.length || 1;
    
    const elAt = document.getElementById('count_atencao');
    const elReg = document.getElementById('count_regular');
    const elOti = document.getElementById('count_otimo');
    if (elAt) elAt.textContent = `${counts.atencao} atenção`;
    if (elReg) elReg.textContent = `${counts.regular} regular`;
    if (elOti) elOti.textContent = `${counts.otimo} ótimo`;

    const max = Math.max(counts.atencao, counts.regular, counts.otimo);
    const candidatos = [];
    if (counts.atencao === max) candidatos.push('atenção');
    if (counts.regular === max) candidatos.push('regular');
    if (counts.otimo === max) candidatos.push('ótimo');

    const ordemPrioridade = ['atenção', 'regular', 'ótimo'];
    let escolhido = 'N/A';
    for (let o of ordemPrioridade) {
        if (candidatos.includes(o)) { escolhido = o; break; }
    }

    const countEscolhido = (escolhido === 'atenção') ? counts.atencao :
                           (escolhido === 'regular') ? counts.regular :
                           (escolhido === 'ótimo') ? counts.otimo : 0;

    const kpiTexto = document.getElementById('kpi_texto_desempenho');
    if (kpiTexto) kpiTexto.textContent = `${countEscolhido} ${escolhido !== 'N/A' ? escolhido.toUpperCase() : ''}`;

    const progress = document.getElementById('progress_bar');
    if (progress) {
        const percent = Math.round((countEscolhido / total) * 100);
        progress.value = percent;
        progress.setAttribute('aria-valuenow', percent);
        
        progress.classList.remove('progress-atencao', 'progress-regular', 'progress-otimo');
        
        if (escolhido === 'atenção') {
            progress.classList.add('progress-atencao');
        } else if (escolhido === 'regular') {
            progress.classList.add('progress-regular');
        } else if (escolhido === 'ótimo') {
            progress.classList.add('progress-otimo');
        }
    }
}

async function buscarFrequenciaEAtualizarKpi(fkInstituicao) {

    try {
        const response = await fetch(`/aluno/kpiFreqInstituicao/${fkInstituicao}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error("Erro ao buscar KPI de frequência.");
            return;
        }

        const data = await response.json();
        console.log("KPI Freq:", data);

        const freq = data.frequenciaGeral || 0;
        const atencao = data.emAtencao || 0;

        // Atualiza os valores na tela
        const titulo = document.getElementById("h1_situacao");
        if (titulo) titulo.innerHTML = `${freq}%`;

        const footer = document.querySelector(".kpi_footer p");
        if (footer) footer.innerHTML = `${atencao} alunos em atenção por freq.`;

        // Atualiza o gráfico circular
        atualizarCircularProgress(freq);

    } catch (erro) {
        console.error("Erro KPI:", erro);
    }
}

function atualizarCircularProgress(porcentagem) {
    const circ = document.getElementById("circFreq");
    const txt = document.getElementById("freqText");

    if (!circ || !txt) return;

    let cor = "#2ecc71"; // verde
    if (porcentagem < 75) cor = "#f1c40f"; // amarelo
    if (porcentagem < 50) cor = "#e74c3c"; // vermelho

    circ.style.background = `conic-gradient(${cor} ${porcentagem * 3.6}deg, #e0e0e0 0deg)`;
}



function popularTurmasEdicao(fkInstituicao, turmaAtual) {
    console.log("Populando turmas para edição, turma atual: ", turmaAtual);
    const selectTurma = document.getElementById('select_turma_edicao');
    selectTurma.innerHTML = ''; // Limpa as opções existentes

    fetch(`/aluno/listarTurmas/${fkInstituicao}`, { method: "GET" })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                console.error("Erro ao carregar turmas.");
                return [];
            }
        })
        .then(turmas => {
            // Adiciona a opção padrão (hidden)
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.text = 'Selecione a Turma';
            defaultOption.disabled = true;
            defaultOption.hidden = true;
            selectTurma.appendChild(defaultOption);

            turmas.forEach(turma => {
                const option = document.createElement('option');
                // IMPORTANTE: o value deve ser o nome da turma, pois é o que será salvo/selecionado
                option.value = turma.nome_sigla; 
                option.text = turma.nome_sigla;
                
                // Seleciona a turma atual do aluno
                if (turma.nome_sigla === turmaAtual) { 
                    option.selected = true;
                }
                selectTurma.appendChild(option);
            });
            
            // Força a seleção do valor atual, caso o banco não retorne a turma atual
            selectTurma.value = turmaAtual;
            
        }).catch(err => {
            console.error("Erro na comunicação para listar turmas: ", err);
        });
}

// crud-alunos.js (Função editarAluno)

function editarAluno(raAluno) {
    console.log(`Iniciando edição do aluno com ra: ${raAluno}`);
    const fkInstituicao = sessionStorage.getItem("fkInstituicao"); // Corrigido para fkInstituicao (consistente com listarAlunos)
    console.log(`Buscando dados do aluno com ra: ${raAluno}`);

    // Abrir o modal ANTES ou no THEN, mas aqui já está correto.
    abrirModal('modal_editar_aluno');

    fetch(`/aluno/buscarPorRa/${raAluno}`, { 
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (aluno) {
                console.log("Dados do aluno para edição: ", aluno);

                // 1. Campos readonly (Ajuste no uso do ra e Instituicao)
                document.getElementById('input_ra_edicao').value = aluno.ra;
                document.getElementById('input_nome_edicao').value = aluno.nome;
                document.getElementById('input_email_edicao').value = aluno.email;
                document.getElementById('input_instituicao_edicao').value = aluno.instituicaoNome; 

                // 2. Preenchimento dinâmico do SELECT de Curso
                // É melhor popular os cursos com o ID do curso selecionado, se disponível
                popularCursosEdicao(fkInstituicao, aluno.idCurso); // Passando o ID do Curso (assumindo a correção do model)
                
                // 3. Preenchimento dinâmico do SELECT de Turma
                popularTurmasEdicao(fkInstituicao, aluno.turma);
                
                sessionStorage.setItem("raAlunoEmEdicao", aluno.ra);
            });
        } else {
            // ... (tratamento de erro)
        }
    }).catch(function (erro) {
        // ... (tratamento de erro)
    });
}

// crud-alunos.js (Função popularCursosEdicao - Corrigir o critério de seleção)

function popularCursosEdicao(fkInstituicao, idCursoAtual) { // Recebe o ID do curso atual
    console.log("Populando cursos para edição, ID do curso atual: ", idCursoAtual);
    const selectCurso = document.getElementById('select_curso_edicao');
    selectCurso.innerHTML = ''; 

    fetch(`/aluno/listarCursos/${fkInstituicao}`, { method: "GET" })
        .then(res => {
             // ... (tratamento de erro e resposta ok)
             if (res.ok) return res.json();
             else { console.error("Erro ao carregar cursos."); return []; }
        })
        .then(cursos => {
            // Adiciona a opção padrão (hidden)
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.text = 'Selecione o Curso';
            defaultOption.disabled = true;
            defaultOption.hidden = true;
            selectCurso.appendChild(defaultOption);

            cursos.forEach(curso => {
                const option = document.createElement('option');
                // O value deve ser o id do curso para o UPDATE futuro
                option.value = curso.id_curso; 
                option.text = curso.nome;
                
                // Seleciona o curso atual do aluno, comparando IDs (mais seguro)
                if (curso.id_curso === idCursoAtual) { // <--- CORREÇÃO AQUI!
                    option.selected = true;
                }
                selectCurso.appendChild(option);
            });
            
        }).catch(err => {
            console.error("Erro na comunicação para listar cursos: ", err);
        });
}

function popularTurmasCriar(fkInstituicao) {
    const dialog = document.getElementById('modal_criar_aluno');
    if (!dialog) return;
    const selectTurma = dialog.querySelector('#select_turma_criar');
    if (!selectTurma) return;
    selectTurma.innerHTML = '';

    fetch(`/aluno/listarTurmas/${fkInstituicao}`, { method: "GET" })
        .then(res => res.ok ? res.json() : [])
        .then(turmas => {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.text = 'Selecione a Turma';
            selectTurma.appendChild(defaultOption);

            turmas.forEach(t => {
                const option = document.createElement('option');
                option.value = t.nome_sigla;
                option.text = t.nome_sigla;
                selectTurma.appendChild(option);
            });

            selectTurma.value = '';
        }).catch(err => {
            console.error("Erro ao carregar turmas (criar):", err);
        });
}

function popularCursosCriar(fkInstituicao) {
    const dialog = document.getElementById('modal_criar_aluno');
    if (!dialog) return;
    const selectCurso = dialog.querySelector('#select_curso_criar');
    if (!selectCurso) return;
    selectCurso.innerHTML = '';

    fetch(`/aluno/listarCursos/${fkInstituicao}`, { method: "GET" })
        .then(res => res.ok ? res.json() : [])
        .then(cursos => {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.text = 'Selecione o Curso';
            selectCurso.appendChild(defaultOption);

            cursos.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id_curso;
                option.text = c.nome;
                selectCurso.appendChild(option);
            });

            selectCurso.value = '';
        }).catch(err => {
            console.error("Erro ao carregar cursos (criar):", err);
        });
}