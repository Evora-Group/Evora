var express = require("express");
var router = express.Router();

var instituicaoController = require("../controllers/instituicaoController");

router.get("/listarInstituicoes", function (req, res) {
    instituicaoController.listarInstituicoes(req, res)
})

router.get("/buscarInstituicao", function (req, res) {
    instituicaoController.buscarInstituicao(req, res)
})

router.get("/listarUsuariosInstituicao/:idInstituicao", function (req, res) {
    instituicaoController.listarUsuariosInstituicao(req, res)
})

router.get("/listarAlunosInstituicao/:idInstituicao", function (req, res) {
    instituicaoController.listarAlunosInstituicao(req, res)
})

router.get("/listarCursosInstituicao/:idInstituicao", function (req, res) {
    instituicaoController.listarCursosInstituicao(req, res)
})

router.get("/listarAlunosAlerta/:idInstituicao", function (req, res) {
    instituicaoController.listarAlunosAlerta(req, res)
})

// CRUD de cursos
router.post('/criarCurso/:idInstituicao', function (req, res) {
    instituicaoController.criarCurso(req, res);
});

router.put('/editarCurso/:idCurso', function (req, res) {
    instituicaoController.editarCurso(req, res);
});

router.delete('/deletarCurso/:idCurso', function (req, res) {
    instituicaoController.deletarCurso(req, res);
});

router.get('/obterCurso/:idCurso', function (req, res) {
    instituicaoController.obterCurso(req, res);
})

router.get("/listarTurmasInstituicao/:idInstituicao", function (req, res) {
    instituicaoController.listarTurmasInstituicao(req, res)
})

router.get("/listarDisciplinas/:idInstituicao", function (req, res) {
    instituicaoController.listarDisciplinas(req, res);
});

module.exports = router;