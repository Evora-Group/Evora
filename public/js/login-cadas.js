
    function listarInstituicoes() {
    var datalist = document.getElementById("instituicoes");

    fetch(`/instituicao/listarInstituicoes`)
        .then((resposta) => resposta.json())
        .then((instituicoes) => {

            // ADICIONE ESTA LINHA AQUI:
            console.log("O que veio do banco:", instituicoes);
            
            datalist.innerHTML = ""; // Limpa a lista

            instituicoes.forEach(instituicao => {
                // Tenta pegar o ID de todas as formas possíveis (snake_case ou camelCase)
                let idReal = instituicao.id_instituicao || instituicao.idInstituicao || instituicao.ID_INSTITUICAO;

                if (idReal) {
                    datalist.innerHTML += `
                        <option value="${instituicao.nome}" data-id="${idReal}"></option>
                    `;
                } else {
                    console.error("ID não encontrado para a escola: ", instituicao.nome);
                }
            });
        })
        .catch((erro) => {
            console.log("#ERRO: " + erro);
        });
}

    // function buscarInstituicao(nomeInstituicao){

    //      fetch(`/instituicao/buscarInstituicao?nome=${nomeInstituicao}`)
    //         .then((resposta) => resposta.json())
    //         .then((instituicoes) => {

    //             instituicaoVar = instituicoes[0].idInstituicao;

    //             });

    // }

function validarEmail(email) {
    
    return fetch(`/user/validarEmail?email=${email}`)
        .then((resposta) => resposta.json()) 
        .then((dados) => {
    
            console.log(dados);
            return dados.existe;
    
        })
        .catch((erro) => {
    
            console.log("Erro ao validar email:", erro);
            return false; 
    
        });
}