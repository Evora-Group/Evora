const express = require("express");
const router = express.Router();

const dashHomeController = require("../controllers/dashHomeController");

router.get("/totalAlunos/:idInstituicao", function (req, res) {
    dashHomeController.totalAlunos(req, res);
});

router.get("/alunosAbaixoMedia/:idInstituicao", function (req, res) {
    dashHomeController.alunosAbaixoMedia(req, res);
});

router.get("/totalAlunosInativos/:idInstituicao", function (req, res) {
    dashHomeController.totalAlunosInativos(req, res);
});

router.get("/novasMatriculas/:idInstituicao", function (req, res) {
    dashHomeController.novasMatriculas(req, res);
});

router.get("/top5Evasao/:idInstituicao", function (req, res) {
    dashHomeController.top5Evasao(req, res);
});

router.get("/taxaAprovacao/:idInstituicao", function (req, res) {
    dashHomeController.taxaAprovacao(req, res);
});


router.get("/comparativoAbaixoMedia/:idInstituicao", function (req, res) {
    dashHomeController.comparativoAbaixoMedia(req, res);
});

router.get("/comparativoRiscoContagem/:idInstituicao", function (req, res) {
    dashHomeController.comparativoRiscoContagem(req, res);
});

router.get("/comparativoNovasMatriculas/:idInstituicao", function (req, res) {
    dashHomeController.comparativoNovasMatriculas(req, res);
});

router.get("/comparativoTotalAlunos/:idInstituicao", function (req, res) {
    dashHomeController.comparativoTotalAlunos(req, res);
});

router.get("/variacaoMatriculasDoMes/:idInstituicao", function (req, res) {
    dashHomeController.variacaoMatriculasDoMes(req, res);
});

module.exports = router;
