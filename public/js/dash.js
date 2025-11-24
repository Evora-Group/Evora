
// Puxa e insere o nome do usuário para todos os elementos com a classe "nome-usuario"
function puxarNomeUsuario() {
  const nomeUsuario = sessionStorage.getItem("nomeUsuario");
    const elementoNomeUsuario = document.querySelectorAll(".nome-usuario");

    elementoNomeUsuario.forEach(element => {
        element.innerHTML = nomeUsuario;
    },);

};


// Função para listar usuários da instituição
function listarUsuariosInstituicao() {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    fetch(`/instituicao/listarUsuariosInstituicao/${fkInstituicao}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (resposta) {
                console.log("Dados recebidos: ", JSON.stringify(resposta));
                
                const listaUsuarios = resposta;
                const qtdUsuarios = listaUsuarios.length;
                
                const listaProfessores = listaUsuarios.filter(usuario => usuario.tipo === "Professor");
                const qtdProfessores = listaProfessores.length;

                const listaAlunos = listaUsuarios.filter(usuario => usuario.tipo === "Aluno");
                const qtdAlunos = listaAlunos.length;

                const listaBloqueados = listaUsuarios.filter(usuario => usuario.situacao === "bloqueado");
                const qtdBloqueados = listaBloqueados.length;
                
                const listaLiberados = listaUsuarios.filter(usuario => usuario.situacao === "liberado");
                const qtdLiberados = listaLiberados.length;


                console.log("Quantidade de usuários: ", qtdUsuarios);
                console.log("Quantidade de professores: ", qtdProfessores);
                console.log("Quantidade de alunos: ", qtdAlunos);
                
                const elementosQtdUsuarios = document.querySelectorAll(".qtd_usuarios");
                elementosQtdUsuarios.forEach(elemento => {
                    elemento.innerHTML = qtdUsuarios;
                });
                
                const elementosQtdProfessores = document.querySelectorAll(".qtd_professores");
                elementosQtdProfessores.forEach(elemento => {
                    elemento.innerHTML = qtdProfessores;
                });
                
                const elementosQtdAlunos = document.querySelectorAll(".qtd_alunos");
                elementosQtdAlunos.forEach(elemento => {
                    elemento.innerHTML = qtdAlunos;
                });

                const elementosQtdBloqueados = document.querySelectorAll(".qtd_bloqueados");
                elementosQtdBloqueados.forEach(elemento => {
                    elemento.innerHTML = qtdBloqueados;
                });

                const elementosQtdLiberados = document.querySelectorAll(".qtd_liberados");
                elementosQtdLiberados.forEach(elemento => {
                    elemento.innerHTML = qtdLiberados;
                }); 

                const progressBarSituacao = document.getElementById("progress_bar_situacao");
                const porcentagemLiberados = (qtdLiberados / qtdUsuarios) * 100;
                progressBarSituacao.innerHTML = `
                    <progress id="progress_bar" value="${porcentagemLiberados}" max="100"> ${porcentagemLiberados}% </progress>
                `;

                const corpoTabela = document.getElementById("corpo_tabela_usuarios");

                listaUsuarios.forEach(usuario => {
                    
                      corpoTabela.innerHTML += `
                
                                <tr>
                                    <td>${usuario.id}</td>
                                    <td>${usuario.nome}</td>
                                    <td>${usuario.email}</td>
                                    <td>${usuario.tipo}</td>
                                    <td>${usuario.turma}</td>
                                    <td>${usuario.instituicao}</td>
                                    <td>
                                        <p class="p_status_${usuario.situacao}">${usuario.situacao}</p>
                                    </td>
                                    <td onclick="definirVisitante(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.tipo}', '${usuario.turma}', '${usuario.curso}', '${usuario.instituicao}', '${usuario.situacao}'); abrirModal('modal_editar_usuario'); listarInstituicoes()"><i class="fi fi-sr-pencil"></i></td>
                                    <td onclick="definirVisitante(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.tipo}', '${usuario.turma}', '${usuario.curso}', '${usuario.instituicao}', '${usuario.situacao}'), abrirModal('modal_remover_usuario')"><i class="fi fi-sr-trash"></i>
                                    </td>
                                </tr>

                `; // Limpa o conteúdo existente na tabela
    

                });

                          
            });
        } else {
            console.error("Erro ao listar usuários: ", resposta.status);
        }
    }).catch(function (erro) {
        console.error("Erro na requisição: ", erro);
    });
}   

function listarCursos() {

    const fkInstituicao = sessionStorage.getItem("fkInstituicao");

    console.log("ID da Instituição para listar cursos: ", fkInstituicao);

    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (resposta) {
                console.log("Dados recebidos: ", JSON.stringify(resposta));
                
                const listaCursos = resposta;

                const datalist = document.getElementById("cursos");
                datalist.innerHTML = "";

                listaCursos.forEach(curso => {
                    datalist.innerHTML += `
                        <option value="${curso.nome}">${curso.nome}</option>
                    `;
                }); 

            });
        } else {
            console.error("Erro ao listar cursos: ", resposta.status);
        }
    }).catch(function (erro) {
        console.error("Erro na requisição: ", erro);
    });

};

function listarTurmas() {

    const fkInstituicao = sessionStorage.getItem("fkInstituicao");

    console.log("ID da Instituição para listar turmas: ", fkInstituicao);

    fetch(`/instituicao/listarTurmasInstituicao/${fkInstituicao}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (resposta) {
                console.log("Dados recebidos: ", JSON.stringify(resposta));
                
                const listaTurmas = resposta;

                const datalists = document.querySelectorAll(".turmas_datalist");
                
                datalists.forEach(datalist => {
                    
                datalist.innerHTML = "";

                listaTurmas.forEach(turma => {
                    datalist.innerHTML += `
                        <option value="${turma.nome_sigla}">${turma.nome_sigla}</option>
                    `;
                }); 

                });



            });
        } else {
            console.error("Erro ao listar turmas: ", resposta.status);
        }
    }).catch(function (erro) {
        console.error("Erro na requisição: ", erro);
    });
}

    function listarDisciplinas() {
    // 1. Pega o ID da instituição salvo na sessão (Login)
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");

    if (!fkInstituicao) {
        console.error("ID da instituição não encontrado na sessão!");
        return;
    }

    // 2. Faz a requisição para a rota que criamos
    // Ajuste a URL '/instituicao/listarDisciplinas' conforme seu arquivo de rotas
    fetch(`/instituicao/listarDisciplinas/${fkInstituicao}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (listaDisciplinas) {
                console.log("Disciplinas recebidas: ", listaDisciplinas);

                // 3. Pega o elemento datalist pelo ID
                const datalist = document.getElementById("lista_disciplinas");
                
                // Limpa a lista atual para não duplicar
                datalist.innerHTML = "";

                // 4. Cria uma <option> para cada disciplina retornada do banco
                listaDisciplinas.forEach(disciplina => {
                    datalist.innerHTML += `
                        <option value="${disciplina.nome}">${disciplina.nome}</option>
                    `;
                });
            });
        } else {
            console.error("Nenhuma disciplina encontrada ou erro na API.");
        }
    })
    .catch(function (erro) {
        console.error("Erro na requisição: ", erro);
    });
}