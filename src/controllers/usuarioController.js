var usuarioModel = require("../models/usuarioModel");

function removerUsuario(req, res) {

    var idUsuario = req.params.idUsuario;

    usuarioModel
        .removerUsuario(idUsuario)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro)
            console.log(
                "\nHouve um erro ao remover o usuário! Erro: ",
                erro.sqlMessage
            );
            res.status(500).json(erro.sqlMessage)
        })

};

function removerAluno(req, res) {

    console.log("Entrou na controller para remover aluno.");
    var idUsuario = req.params.idUsuario;

    usuarioModel
        .removerAluno(idUsuario)
        .then(function (resultado) {
            res.json(resultado);
            console.log("Aluno removido com sucesso.");
        })
        .catch(function (erro) {
            console.log(erro)
            console.log(
                "\nHouve um erro ao remover o aluno! Erro: ",
                erro.sqlMessage
            );
            res.status(500).json(erro.sqlMessage)
        })

};






module.exports = {
    removerUsuario,
    removerAluno
};