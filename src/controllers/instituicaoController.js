
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

function listarUsuariosInstituicao(req, res) {

    const idInstituicao = req.params.idInstituicao;

    instituicaoModel.listarUsuariosInstituicao(idInstituicao)
        .then(
            function (resultado) {
                
                res.json(resultado)

            }
        ).catch(function (erro) {
            console.log(erro);
            console.log(
                 "\nHouve um erro ao listar usuários da instituição! Erro: ",
                    erro.sqlMessage
            );
            res.status(500).json(erro.sqlMessage)
            
        });

}

function listarAlunosInstituicao(req, res) {

    const idInstituicao = req.params.idInstituicao;

    instituicaoModel.listarAlunosInstituicao(idInstituicao)
        .then(
            function (resultado) {
                
                res.json(resultado)

            }
        ).catch(function (erro) {
            console.log(erro);
            console.log(
                 "\nHouve um erro ao listar alunos da instituição para página de Alunos de Painel Professor! Erro: ",
                    erro.sqlMessage
            );
            res.status(500).json(erro.sqlMessage)
            
        });

}



module.exports = {
    
    listarInstituicoes,
    buscarInstituicao,
    listarUsuariosInstituicao,
    listarAlunosInstituicao

}