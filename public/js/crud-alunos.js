// Função para listar usuários da instituição
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

                console.log("Quantidade de alunos: ", qtdAlunos);
                
                const elementosQtdAlunos = document.querySelectorAll(".qtd_alunos");
                elementosQtdAlunos.forEach(elemento => {
                    elemento.innerHTML = qtdAlunos;
                });

                const corpoTabela = document.getElementById("corpo_tabela_alunos");

                listaAlunos.forEach(aluno => {
                    
                      corpoTabela.innerHTML += `
                
                                 <tr onclick="irParaAlunoEspecifico(${aluno.RA})">
                                    <td>${aluno.RA}</td>
                                    <td>${aluno.nome}</td>
                                    <td>${aluno.email}</td>
                                    <td>${aluno.turma}</td>
                                    <td>${aluno.desempenho}</td>
                                    <td onclick="editarAluno(${aluno.RA}); event.stopPropagation();"><i class="fi fi-sr-pencil"></i></td>
                                </tr>

                `;
                });       
            });
        } else {
            console.error("Erro ao listar alunos: ", resposta.status);
        }
    }).catch(function (erro) {
        console.error("Erro na requisição: ", erro);
    });
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
                option.value = turma.nome; 
                option.text = turma.nome;
                
                // Seleciona a turma atual do aluno
                if (turma.nome === turmaAtual) { 
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
    console.log(`Iniciando edição do aluno com RA: ${raAluno}`);
    const fkInstituicao = sessionStorage.getItem("fkInstituicao"); // Corrigido para fkInstituicao (consistente com listarAlunos)
    console.log(`Buscando dados do aluno com RA: ${raAluno}`);

    // Abrir o modal ANTES ou no THEN, mas aqui já está correto.
    abrirModal('modal_editar_aluno');

    fetch(`/aluno/buscarPorRa/${raAluno}`, { 
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (aluno) {
                console.log("Dados do aluno para edição: ", aluno);

                // 1. Campos readonly (Ajuste no uso do RA e Instituicao)
                document.getElementById('input_ra_edicao').value = aluno.RA;
                document.getElementById('input_nome_edicao').value = aluno.nome;
                document.getElementById('input_email_edicao').value = aluno.email;
                document.getElementById('input_instituicao_edicao').value = aluno.instituicaoNome; 

                // 2. Preenchimento dinâmico do SELECT de Curso
                // É melhor popular os cursos com o ID do curso selecionado, se disponível
                popularCursosEdicao(fkInstituicao, aluno.idCurso); // Passando o ID do Curso (assumindo a correção do model)
                
                // 3. Preenchimento dinâmico do SELECT de Turma
                popularTurmasEdicao(fkInstituicao, aluno.turma);
                
                sessionStorage.setItem("raAlunoEmEdicao", aluno.RA);
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
                option.value = curso.idCurso; 
                option.text = curso.descricao;
                
                // Seleciona o curso atual do aluno, comparando IDs (mais seguro)
                if (curso.idCurso === idCursoAtual) { // <--- CORREÇÃO AQUI!
                    option.selected = true;
                }
                selectCurso.appendChild(option);
            });
            
        }).catch(err => {
            console.error("Erro na comunicação para listar cursos: ", err);
        });
}