var userModel = require("../models/userModel");

function cadastrar(req, res){

    var email = req.body.emailServer
    var nome = req.body.nomeServer
    var senha = req.body.senhaServer
    var cargo = req.body.cargoServer
    var instituicao = req.body.instituicaoServer

    userModel
        .cadastrar(nome, email, senha, cargo, instituicao)
        .then(function(resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro)
            console.log(
					"\nHouve um erro ao realizar o cadastro! Erro: ",
					erro.sqlMessage
				);
            res.status(500).json(erro.sqlMessage)
        })

}


function logar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    
    // Validação básica
    if (!email || !senha) {
        res.status(400).json({ erro: "Email e senha são obrigatórios" });
        return;
    }
    
    userModel.logar(email, senha)
        .then((usuario) => {
            res.status(200).json(usuario);
        })
        .catch((erro) => {
            console.log("Erro no login:", erro);
            
            // Tratamento melhor do erro
            const mensagemErro = typeof erro === 'string' ? erro : "Credenciais inválidas";
            res.status(401).json({ erro: mensagemErro });
        });
}
function validarEmail(req, res) {
    var email = req.query.email;
    
    userModel
        .validarEmail(email)
        .then((resultado) => {

            const emailExiste = resultado[0].total > 0;
            
            res.status(200).json({ 
                existe: emailExiste
            });
        
        })
        
        .catch((erro) => {
        
            console.log(erro);
            console.log("\nHouve um erro ao validar email! Erro: ", erro.sqlMessage);
            res.status(500).json({ 
                erro: erro.sqlMessage,
                existe: null
            });
        
        });
}

module.exports = {
    
    cadastrar,
    validarEmail,
    logar

}