
// Puxa e insere o nome do usuário para todos os elementos com a classe "nome-usuario"
function puxarNomeUsuario() {
  const nomeUsuario = sessionStorage.getItem("nomeUsuario");
    const elementoNomeUsuario = document.querySelectorAll(".nome-usuario");

    elementoNomeUsuario.forEach(element => {
        element.innerHTML = nomeUsuario;
    },);

};


let listaUsuariosGlobal = [];

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
                
                // 2. Salva os dados na variável global
                listaUsuariosGlobal = resposta;

                // --- Lógica dos KPIs (Total, Professores, Alunos, etc) ---
                // Mantemos isso aqui para calcular com base no TOTAL, não no filtro
                atualizarKPIs(listaUsuariosGlobal);

                // 3. Chama a função que desenha a tabela passando a lista completa
                renderizarTabela(listaUsuariosGlobal);
                          
            });
        } else {
            console.error("Erro ao listar usuários: ", resposta.status);
        }
    }).catch(function (erro) {
        console.error("Erro na requisição: ", erro);
    });
}   

// Nova função apenas para desenhar a tabela (reutilizável)
function renderizarTabela(lista) {
    const corpoTabela = document.getElementById("corpo_tabela_usuarios");
    corpoTabela.innerHTML = ""; // Limpa a tabela antes de preencher

    lista.forEach(usuario => {

        if (usuario.tipo === 'Professor'){ 
            tdStatus = `<td>
                    <p class="p_status_${usuario.situacao}">${usuario.situacao}</p>
                </td>`
        }else{
            tdStatus = `<td>
                    <p>N/A</p>
            </td>`
        }


        corpoTabela.innerHTML += `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.tipo}</td>
                <td>${usuario.turma}</td>
                <td>${usuario.curso}</td>
                ${tdStatus}
                <td onclick="definirVisitante(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.tipo}', '${usuario.turma}', '${usuario.curso}', '${usuario.instituicao}', '${usuario.situacao}'); abrirModal('modal_editar_usuario'); listarInstituicoes()"><i class="fi fi-sr-pencil"></i></td>
                <td onclick="definirVisitante(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.tipo}', '${usuario.turma}', '${usuario.curso}', '${usuario.instituicao}', '${usuario.situacao}'), abrirModal('modal_remover_usuario')"><i class="fi fi-sr-trash"></i>
                </td>
            </tr>
        `;
    });
}

// Nova função de Pesquisa
function filtrarUsuarios() {
    // Pega o valor digitado e transforma em minúsculo
    const termo = document.getElementById('barra_pesquisa').value.toLowerCase();

    // Filtra a lista global
    const listaFiltrada = listaUsuariosGlobal.filter(usuario => {
        // Verifica se o termo está no ID ou no NOME
        // Converte ID para string para poder usar .includes()
        return usuario.id.toString().includes(termo) || 
               usuario.nome.toLowerCase().includes(termo);
    });

    // Redesenha a tabela apenas com os filtrados
    renderizarTabela(listaFiltrada);
}

// Função auxiliar para organizar os KPIs (retirei da listarUsuariosInstituicao para ficar limpo)
function atualizarKPIs(listaUsuarios) {
    const qtdUsuarios = listaUsuarios.length;
    
    const listaProfessores = listaUsuarios.filter(usuario => usuario.tipo === "Professor");
    const qtdProfessores = listaProfessores.length;

    const listaAlunos = listaUsuarios.filter(usuario => usuario.tipo === "Aluno");
    const qtdAlunos = listaAlunos.length;

    const listaBloqueados = listaUsuarios.filter(usuario => usuario.situacao === "bloqueado" && usuario.tipo === "Professor");
    const qtdBloqueados = listaBloqueados.length;
    
    const listaLiberados = listaUsuarios.filter(usuario => usuario.situacao === "liberado" && usuario.tipo === "Professor");
    const qtdLiberados = listaLiberados.length;

    // Atualiza o HTML dos KPIs
    document.querySelectorAll(".qtd_usuarios").forEach(el => el.innerHTML = qtdUsuarios);
    document.querySelectorAll(".qtd_professores").forEach(el => el.innerHTML = qtdProfessores);
    document.querySelectorAll(".qtd_alunos").forEach(el => el.innerHTML = qtdAlunos);
    document.querySelectorAll(".qtd_bloqueados").forEach(el => el.innerHTML = qtdBloqueados);
    document.querySelectorAll(".qtd_liberados").forEach(el => el.innerHTML = qtdLiberados); 

    const progressBarSituacao = document.getElementById("progress_bar_situacao");

    progressBarSituacao.innerHTML = `
        <progress id="progress_bar" value="${qtdLiberados}" max="${qtdBloqueados + qtdLiberados}"></progress>
    `;
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