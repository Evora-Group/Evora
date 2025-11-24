const express = require("express");
const router = express.Router();

const dashHomeController = require("../controllers/dashHomeController");

// KPI: Total de alunos
router.get("/totalAlunos/:idInstituicao", function (req, res) {
    console.log("ID Instituição:", req.params.idInstituicao);
    dashHomeController.totalAlunos(req, res);
});

// KPI: Alunos abaixo da média
router.get("/alunosAbaixoMedia/:idInstituicao", function (req, res) {
    console.log("ID Instituição:", req.params.idInstituicao);
    dashHomeController.alunosAbaixoMedia(req, res);
});

// KPI: Taxa de abandono
router.get("/taxaAbandono/:idInstituicao", function (req, res) {
    console.log("ID Instituição:", req.params.idInstituicao);
    dashHomeController.taxaAbandono(req, res);
});

// KPI: Novas matrículas
router.get("/novasMatriculas/:idInstituicao", function (req, res) {
    console.log("ID Instituição:", req.params.idInstituicao);
    dashHomeController.novasMatriculas(req, res);
});

// Gráfico: Top 5 cursos com maior risco de evasão
router.get("/top5Evasao/:idInstituicao", function (req, res) {
    console.log("ID Instituição:", req.params.idInstituicao);
    dashHomeController.top5Evasao(req, res);
});

// Gráfico: Taxa média de aprovação
router.get("/taxaAprovacao/:idInstituicao", function (req, res) {
    console.log("ID Instituição:", req.params.idInstituicao);
    dashHomeController.taxaAprovacao(req, res);
});

// Comparativo do total de alunos (setinha verde/vermelha)
router.get("/comparativoTotalAlunos/:idInstituicao", function (req, res) {
    console.log("ID Instituição (comparativo):", req.params.idInstituicao);
    dashHomeController.comparativoTotalAlunos(req, res);
});


module.exports = router;
