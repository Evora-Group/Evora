var express = require("express");
var router = express.Router();
var alunoController = require("../controllers/alunoController");

router.get("/buscarPorRa/:ra", function (req, res) {
    alunoController.buscarAlunoPorRa(req, res);
});

router.get("/listarCursos/:fkInstituicao", function (req, res) {
    alunoController.listarCursos(req, res);
});

router.get("/listarTurmas/:fkInstituicao", function (req, res) {
    alunoController.listarTurmas(req, res);
});

router.get("/desempenho/:ra/:fkInstituicao", function (req, res) {
    alunoController.listarDesempenho(req, res);
});

router.get("/geral/:ra", function (req, res) {
    alunoController.listarDadosGerais(req, res);
});

module.exports = router;