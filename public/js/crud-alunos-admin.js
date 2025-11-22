function getClasseDesempenho(desempenho) {
    if (!desempenho) return "";
    switch (desempenho.toLowerCase()) {
        case "ótimo": return "p_status_otimo";
        case "regular": return "p_status_regular";
        case "atenção": return "p_status_atencao";
        default: return ""; 
    }
}

function listarAlunosInstituicao() {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) return console.error("Instituição não definida");

    fetch(`/instituicao/listarAlunosInstituicao/${fkInstituicao}`)
    .then(res => res.json())
    .then(listaAlunos => {
        console.log("Admin - Alunos carregados:", listaAlunos.length);
        
        const corpoTabela = document.getElementById("corpo_tabela_alunos");
        corpoTabela.innerHTML = "";

        // Preenche Tabela
        listaAlunos.forEach(aluno => {
            const classe = getClasseDesempenho(aluno.desempenho);
            corpoTabela.innerHTML += `
                <tr onclick="irParaAlunoEspecifico(${aluno.ra})" style="cursor: pointer;">
                    <td>${aluno.ra}</td>
                    <td>${aluno.nome}</td>
                    <td>${aluno.email}</td>
                    <td>${aluno.turma}</td>
                    <td>${aluno.curso}</td>
                    <td><p class="${classe}">${aluno.desempenho}</p></td>
                    <td onclick="event.stopPropagation(); editarAluno(${aluno.ra})">
                        <i class="fi fi-sr-pencil"></i>
                    </td>
                </tr>
            `;
        });

        // Atualiza os Cards do Topo (KPIs)
        atualizarKpisAdmin(listaAlunos);
    })
    .catch(err => console.error(err));
}

function atualizarKpisAdmin(lista) {
    let qtdOtimo = 0;
    let qtdRegular = 0;
    let qtdAtencao = 0;
    let somaFreq = 0;
    let alunosBaixaFreq = 0;

    lista.forEach(aluno => {
        // Contagem de Status
        const status = aluno.desempenho.toLowerCase();
        if(status === 'ótimo' || status === 'otimo') qtdOtimo++;
        else if(status === 'regular') qtdRegular++;
        else qtdAtencao++;

        // Soma Frequência
        let freq = Number(aluno.frequencia || 0);
        somaFreq += freq;
        if(freq < 75) alunosBaixaFreq++;
    });

    // 1. Atualiza Contadores Pequenos
    document.getElementById("count_otimo").innerHTML = `${qtdOtimo} ótimo`;
    document.getElementById("count_regular").innerHTML = `${qtdRegular} regular`;
    document.getElementById("count_atencao").innerHTML = `${qtdAtencao} atenção`;

    // 2. Define o Status Dominante
    let maiorQtd = Math.max(qtdOtimo, qtdRegular, qtdAtencao);
    let statusGeral = "REGULAR";
    let classeCorBarra = "p_status_regular"; // Cor padrão (Amarelo)

    if (maiorQtd === qtdOtimo) {
        statusGeral = "ÓTIMO";
        classeCorBarra = "p_status_otimo"; // Verde
    } 
    else if (maiorQtd === qtdAtencao) {
        statusGeral = "ATENÇÃO";
        classeCorBarra = "p_status_atencao"; // Vermelho
    }

    document.getElementById("kpi_texto_desempenho").innerHTML = `${maiorQtd} ${statusGeral}`;

    // 3. Atualiza a Barra de Progresso (Valor e Cor)
    const total = lista.length;
    // Calcula a % que o grupo dominante representa do total
    const porcentagemDominante = total > 0 ? (maiorQtd / total) * 100 : 0;
    
    const containerBarra = document.getElementById("barra_progresso_container");
    if(containerBarra) {
        // Recria a barra com o valor correto
        containerBarra.innerHTML = `
            <progress id="progress_bar" value="${porcentagemDominante}" max="100" class="${classeCorBarra}"> 
                ${porcentagemDominante.toFixed(0)}% 
            </progress>
        `;
        
        // Adiciona um texto auxiliar se quiser mostrar a % numérica
        // containerBarra.innerHTML += `<span style="font-size:12px">${porcentagemDominante.toFixed(0)}% da sala</span>`;
    }

    // 4. Atualiza Frequência Geral
    const mediaFreqGeral = total > 0 ? (somaFreq / total).toFixed(0) : 0;
    document.getElementById("kpi_texto_frequencia").innerHTML = `${mediaFreqGeral}%`;
    document.getElementById("texto_alunos_atencao_freq").innerHTML = `${alunosBaixaFreq} alunos com baixa freq.`;

    // Pinta o círculo
    const circulo = document.getElementById("circFreqGeral");
    if(circulo) {
        const graus = mediaFreqGeral * 3.6;
        circulo.style.background = `conic-gradient(#4d5bf9 ${graus}deg, #eef2f5 0deg)`;
    }
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