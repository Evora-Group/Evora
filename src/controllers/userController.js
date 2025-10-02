var userModel = require("../models/userModel");

function cadastrar(req, res){

    var email = req.body.emailServer
    var nome = req.body.nomeServer
    var senha = req.body.senhaServer
    var cargo = req.body.cargoServer
    var instuicao = req.body.instuicaoServer

    userModel
        .cadastrar(nome, email, senha, cargo, instuicao)
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

module.exports = {
    
    cadastrar

}