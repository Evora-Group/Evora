
var instituicaoModel = require("../models/instituicaoModel");

function listarInstituicoes(req, res) {

    instituicaoModel.listarInstituicoes()
        .then(
            function (resultado) {
                
                res.json(resultado)

            }
        ).catch(function (erro) {
            console.log(erro);
            console.log(
                 "\nHouve um erro ao listar instituições! Erro: ",
                    erro.sqlMessage
            );
            res.status(500).json(erro.sqlMessage)
            
        });

};

function buscarInstituicao(req, res) {

    const nome = req.query.nome

    instituicaoModel.buscarInstituicao(nome)
        .then(
            function (resultado) {
                
                res.json(resultado)

            }
        ).catch(function (erro) {
            console.log(erro);
            console.log(
                 "\nHouve um erro ao buscar Instituição! Erro: ",
                    erro.sqlMessage
            );
            res.status(500).json(erro.sqlMessage)
            
        });

};

module.exports = {
    
    listarInstituicoes,
    buscarInstituicao

}