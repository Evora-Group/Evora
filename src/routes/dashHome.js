const express = require("express");
const router = express.Router();

const dashHomeController = require("../controllers/dashHomeController");

// KPI: Total de alunos
router.get("/totalAlunos/:idInstituicao", function (req, res) {
    dashHomeController.totalAlunos(req, res);
});

// KPI: Alunos abaixo da média
router.get("/alunosAbaixoMedia/:idInstituicao", function (req, res) {
    dashHomeController.alunosAbaixoMedia(req, res);
});

// KPI: Taxa de abandono
router.get("/totalAlunosInativos/:idInstituicao", function (req, res) {
    dashHomeController.totalAlunosInativos(req, res);
});

// KPI: Novas matrículas
router.get("/novasMatriculas/:idInstituicao", function (req, res) {
    dashHomeController.novasMatriculas(req, res);
});

// Gráfico: Top 5 cursos com maior risco de evasão
router.get("/top5Evasao/:idInstituicao", function (req, res) {
    dashHomeController.top5Evasao(req, res);
});

// Gráfico: Taxa média de aprovação
router.get("/taxaAprovacao/:idInstituicao", function (req, res) {
    dashHomeController.taxaAprovacao(req, res);
});

// // Comparativo do total de alunos (setinha verde/vermelha)
// router.get("/comparativoTotalAlunos/:idInstituicao", function (req, res) {
//     console.log("ID Instituição (comparativo):", req.params.idInstituicao);
//     dashHomeController.comparativoTotalAlunos(req, res);
// });


router.get("/comparativoAbaixoMedia/:idInstituicao", function (req, res) {
    dashHomeController.comparativoAbaixoMedia(req, res);
});

router.get("/comparativoRiscoContagem/:idInstituicao", function (req, res) {
    dashHomeController.comparativoRiscoContagem(req, res);
});

// Comparativo novas matrículas
router.get("/comparativoNovasMatriculas/:idInstituicao", function (req, res) {
    dashHomeController.comparativoNovasMatriculas(req, res);
});

router.get("/comparativoTotalAlunos/:idInstituicao", function (req, res) {
    dashHomeController.comparativoTotalAlunos(req, res);
});

// Nova rota: Variação de matrículas do mês (novas - inativações)
router.get("/variacaoMatriculasDoMes/:idInstituicao", function (req, res) {
    dashHomeController.variacaoMatriculasDoMes(req, res);
});

module.exports = router;
