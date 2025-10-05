var express = require("express");
var router = express.Router();

var instituicaoController = require("../controllers/instituicaoController");

router.get("/listarInstituicoes", function (req, res) {
    instituicaoController.listarInstituicoes(req, res)
})

router.get("/buscarInstituicao", function (req, res) {
    instituicaoController.buscarInstituicao(req, res)
})

module.exports = router;