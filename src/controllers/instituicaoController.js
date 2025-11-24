
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

function listarCursosInstituicao(req, res) {

    const idInstituicao = req.params.idInstituicao;

    instituicaoModel.listarCursosInstituicao(idInstituicao)
        .then(
            function (resultado) {

                res.json(resultado)

            }
        ).catch(function (erro) {
            console.log(erro);
            console.log(
                "\nHouve um erro ao listar cursos da instituição! Erro: ",
                erro.sqlMessage
            );
            res.status(500).json(erro.sqlMessage)

        });
}

function listarTurmasInstituicao(req, res) {

    const idInstituicao = req.params.idInstituicao;

    instituicaoModel.listarTurmasInstituicao(idInstituicao)
        .then(
            function (resultado) {

                res.json(resultado)

            }
        ).catch(function (erro) {
            console.log(erro);
            console.log(
                "\nHouve um erro ao listar turmas da instituição! Erro: ",
                erro.sqlMessage
            );
            res.status(500).json(erro.sqlMessage)

        });

    }
    
    function listarDisciplinas(req, res) {
    var idInstituicao = req.params.idInstituicao;

    instituicaoModel.listarDisciplinasPorInstituicao(idInstituicao)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {

    listarInstituicoes,
    buscarInstituicao,
    listarUsuariosInstituicao,
    listarAlunosInstituicao,
    listarCursosInstituicao,
    listarTurmasInstituicao,
    listarDisciplinas

}