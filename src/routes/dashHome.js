const express = require("express");
const router = express.Router();

const dashHomeController = require("../controllers/dashHomeController");

// KPIs da home
router.get("/dadosHome/:idInstituicao", function (req, res){
    console.log("ID Instituição:", req.params.idInstituicao);
    dashHomeController.dadosHome(req,res);
    
});


// Top 5 cursos com maior risco de evasão 
router.get("/top5Evasao/:idInstituicao", function (req, res){
    console.log("ID Instituição:", req.params.idInstituicao);
    dashHomeController.top5Evasao(req,res);
    
});

// Novas matriculas
router.get("/novasMatriculas/:idInstituicao", function (req,res){
    console.log("ID Instituição:", req.params.idInstituicao);
    dashHomeController.novasMatriculas(req,res);
    
}); 

// Taxa de aprovação média
router.get("/taxaAprovacao/:idInstituicao", function (req,res){
    console.log("ID Instituição:", req.params.idInstituicao);
    dashHomeController.taxaAprovacao(req,res);
    
});


module.exports = router;


