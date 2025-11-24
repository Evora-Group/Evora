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

function editarAluno(req, res) {
    var raAluno = req.params.idUsuario;
    var nome = req.body.nome;
    var email = req.body.email;
    var nomeTurma = req.body.turma; // Recebendo o nome da turma

    usuarioModel.editarAluno(raAluno, nome, email, nomeTurma)
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

    
    usuarioModel.editarUsuario(idUsuario, nome, email)
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
    var email = req.body.email; // O seu modal não tem campo email no create, vamos ter que adicionar ou gerar um
    var turma = req.body.turma;

    // Validação básica
    if (ra == undefined || nome == undefined || turma == undefined || email == undefined) {
        res.status(400).send("Sua requisição tem campos indefinidos!");
        return;
    }

    // Se o email não vier do front (o modal de criar atual não tem input email), 
    // podemos criar um provisório ou pedir para adicionar o input no HTML.
    // Vou assumir que você vai adicionar o input ou que ele venha como string vazia.
    // if (email == undefined) email = "";

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
    // Recuperando valores do corpo da requisição
    var nome = req.body.nome;
    var email = req.body.email;
    var senha = req.body.senha;
    var turma = req.body.turma; // Vem o Nome da turma (ex: "ADS A")
    var disciplina = req.body.disciplina; // Vem o Nome da disciplina (ex: "Banco de Dados")
    var idInstituicao = req.body.idInstituicao;

    // Validação básica
    if (nome == undefined || email == undefined || senha == undefined || turma == undefined || disciplina == undefined) {
        res.status(400).send("Todos os campos (Nome, Email, Senha, Turma, Disciplina) são obrigatórios!");
        return;
    }

    // Chama o Model passando os dados
    usuarioModel.cadastrarProfessor(nome, email, senha, turma, disciplina, idInstituicao)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao realizar o cadastro do professor! Erro: ", erro.sqlMessage);
                // Envia o erro exato para o front (ex: "Turma não encontrada")
                res.status(500).json(erro.sqlMessage || erro); 
            }
        );
}




module.exports = {
    removerUsuario,
    removerAluno,
    editarAluno,
    editarUsuario,
    cadastrarAluno,
    cadastrarProfessor
};