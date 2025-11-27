
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
        fetch(`/instituicao/buscarInstituicao?nome=${encodeURIComponent(nomeInstituicao)}`)
            .then((resposta) => resposta.json())
            .then((instituicoes) => {
                if (Array.isArray(instituicoes) && instituicoes.length > 0) {
                    // Backend retorna id_instituicao (snake case)
                    const id = instituicoes[0].id_instituicao;
                    if (id) {
                        instituicaoVar = id;
                        sessionStorage.setItem('fkInstituicao', id);
                    } else {
                        console.warn('Identificador da instituição não encontrado no retorno:', instituicoes[0]);
                    }
                } else {
                    console.warn('Instituição não encontrada para nome:', nomeInstituicao);
                }
            })
            .catch(err => console.error('Erro ao buscar instituição:', err));
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