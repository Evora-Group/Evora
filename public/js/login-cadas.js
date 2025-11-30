
    function listarInstituicoes() {
    var datalist = document.getElementById("instituicoes");

    fetch(`/instituicao/listarInstituicoes`)
        .then((resposta) => resposta.json())
        .then((instituicoes) => {
            
            // Limpa a lista antes de encher para não duplicar
            datalist.innerHTML = ""; 

            instituicoes.forEach(instituicao => {
                // AQUI ESTÁ A MUDANÇA: Adicionamos o data-id com o ID real do banco
                // Verifique se no seu banco vem como 'idInstituicao' ou 'id_instituicao'
                // Baseado no seu código anterior, parece ser idInstituicao
                datalist.innerHTML += `
                    <option value="${instituicao.nome}" data-id="${instituicao.id_instituicao}"></option>
                `;
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