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

function listarDesempenho(req, res) {
    var ra = req.params.ra;
    var fkInstituicao = req.params.fkInstituicao;

    alunoModel.buscarDesempenhoPorRa(ra, fkInstituicao)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.json(resultado);
            } else {
                res.status(204).send("Nenhum desempenho encontrado");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function listarDadosGerais(req, res) {
    var ra = req.params.ra;

    alunoModel.buscarDadosGerais(ra)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.json(resultado[0]); // Retorna o objeto direto
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);

        });
}

function editar(req, res) {
    const ra = req.params.ra;
    const { curso, turma } = req.body;

    alunoModel.editarAluno(ra, curso, turma)
        .then(() => res.json({ mensagem: "Aluno atualizado com sucesso!" }))
        .catch(erro => {
            console.error("Erro ao editar aluno:", erro);
            res.status(500).json(erro);
        });
}

function criar(req, res) {
    const { ra, nome, email, telefone, turma, fkCurso } = req.body;

    alunoModel.criarAluno(ra, nome, email, telefone || "")
        .then(() => alunoModel.criarMatricula(ra, turma, fkCurso))
        .then(() => res.status(201).json({ msg: "Aluno criado com sucesso" }))
        .catch(err => {
            console.error(err);
            res.status(500).json(err);
        });
}




module.exports = {
    buscarAlunoPorRa,
    listarCursos,
    listarTurmas,
    listarDesempenho,
    listarDadosGerais,
    editar,
    criar
}