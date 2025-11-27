var usuarioModel = require("../models/usuarioModel");

function removerUsuario(req, res) {
    var idUsuario = req.params.idUsuario;

    usuarioModel.removerUsuario(idUsuario)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function removerAluno(req, res) {
    var idUsuario = req.params.idUsuario;

    usuarioModel.removerAluno(idUsuario)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function editarAluno(req, res) {
    var raAluno = req.params.idUsuario;
    var nome = req.body.nome;
    var email = req.body.email;
    var nomeTurma = req.body.turma;
    var ativo = req.body.ativo; // Novo campo recebido (1 ou 0)

    usuarioModel.editarAluno(raAluno, nome, email, nomeTurma, ativo)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).send(erro); 
        });
}

function editarUsuario(req, res) {
    var idUsuario = req.params.idUsuario;
    var nome = req.body.nome;
    var email = req.body.email;
    var ativo = req.body.ativo;         // Novo campo (1 ou 0)
    var nomeTurma = req.body.turma;     // Novo campo (para atualizar onde ele dá aula)
    var nomeDisciplina = req.body.disciplina; // Novo campo

    usuarioModel.editarUsuario(idUsuario, nome, email, ativo, nomeTurma, nomeDisciplina)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function cadastrarAluno(req, res) {
    var ra = req.body.ra;
    var nome = req.body.nome;
    var email = req.body.email; 
    var turma = req.body.turma;

    if (ra == undefined || nome == undefined || turma == undefined || email == undefined) {
        res.status(400).send("Sua requisição tem campos indefinidos!");
        return;
    }

    usuarioModel.cadastrarAluno(ra, nome, email, turma)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage || erro);
        });
}

function cadastrarProfessor(req, res) {
    var nome = req.body.nome;
    var email = req.body.email;
    var senha = req.body.senha;
    var turma = req.body.turma; 
    var disciplina = req.body.disciplina; 
    var idInstituicao = req.body.idInstituicao;

    if (nome == undefined || email == undefined || senha == undefined || turma == undefined || disciplina == undefined) {
        res.status(400).send("Todos os campos são obrigatórios!");
        return;
    }

    usuarioModel.cadastrarProfessor(nome, email, senha, turma, disciplina, idInstituicao)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage || erro); 
        });
}

module.exports = {
    removerUsuario,
    removerAluno,
    editarAluno,
    editarUsuario,
    cadastrarAluno,
    cadastrarProfessor
};