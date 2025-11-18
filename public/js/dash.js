
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
                                        <p class="p_status_bloqueado">Bloqueado</p>
                                    </td>
                                    <td onclick="abrirModal('modal_editar_usuario')"><i class="fi fi-sr-pencil"></i>
                                    </td>
                                    <td onclick="abrirModal('modal_remover_usuario')"><i class="fi fi-sr-trash"></i>
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