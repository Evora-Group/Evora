
    function listarInstituicoes() {

        var datalist = document.getElementById("instituicoes")

        fetch(`/instituicao/listarInstituicoes`)
            .then((resposta) => resposta.json())
            .then((instituicoes) => {

                instituicoes.forEach(instituicao => {

                    datalist.innerHTML += `
                
                <option value="${instituicao.nome}">${instituicao.nome}</option>

                `

                });

            })

    }

    function buscarInstituicao(nomeInstituicao){

         fetch(`/instituicao/buscarInstituicao?nome=${nomeInstituicao}`)
            .then((resposta) => resposta.json())
            .then((instituicoes) => {

                instituicaoVar = instituicoes[0].idInstituicao;

                });

    }

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