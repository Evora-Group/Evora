var alunoModel = require("../models/alunoModel");

function buscarAlunoPorRa(req, res) {
    const raAluno = req.params.ra;

    // Chamar a função do Model para buscar no banco de dados
    alunoModel.buscarAlunoPorRa(raAluno)
        .then(function (resultado) {
            if (resultado.length > 0) {
                // Retorna apenas o primeiro resultado, pois o RA deve ser único
                res.json(resultado[0]); 
            } else {
                res.status(404).send("Aluno não encontrado");
            }
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function listarCursos(req, res) {
    const fkInstituicao = req.params.fkInstituicao;

    alunoModel.listarCursosInstituicao(fkInstituicao)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum curso encontrado");
            }
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function listarTurmas(req, res) {
    const fkInstituicao = req.params.fkInstituicao;

    alunoModel.listarTurmasInstituicao(fkInstituicao)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhuma turma encontrada");
            }
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    buscarAlunoPorRa,
    listarCursos,
    listarTurmas
}