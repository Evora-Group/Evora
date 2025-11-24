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

router.get("/listarTurmasInstituicao/:idInstituicao", function (req, res) {
    instituicaoController.listarTurmasInstituicao(req, res)
})

router.get("/listarDisciplinas/:idInstituicao", function (req, res) {
    instituicaoController.listarDisciplinas(req, res);
});

module.exports = router;