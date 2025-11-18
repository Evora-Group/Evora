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
                
                                 <tr onclick="irParaAluno('alunoEspecifico.html')">
                                    <td>${aluno.RA}</td>
                                    <td>${aluno.nome}</td>
                                    <td>${aluno.email}</td>
                                    <td>${aluno.turma}</td>
                                    <td>${aluno.desempenho}</td>
                                    <td onclick="abrirModal('modal_editar_aluno'); event.stopPropagation();"><i class="fi fi-sr-pencil"></i></td>
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