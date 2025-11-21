
const dashHomeModel = require("../models/dashHomeModel");



function dadosHome(req, res) {
    
    const idInstituicao = req.params.idInstituicao;

    dashHomeModel.dadosHome(idInstituicao)
        .then(function (resultado){
            res.json(resultado);
        })
        .catch(function (erro){
            console.log("\nHouve um erro ao buscar KPIs da home! Erro:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage)
        })

}

function top5Evasao(req, res){

     const idInstituicao = req.params.idInstituicao;

     dashHomeModel.top5Evasao(idInstituicao)
     .then(function (resultado){
        res.json(resultado);
     })
     .catch(function (erro){
        console.log("\nHouve um erro ao buscar Top 5 cursos com evasão! Erro:", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
     })
}


function taxaAprovacao(req, res) {

    const idInstituicao = req.params.idInstituicao;

    dashHomeModel.taxaAprovacao(idInstituicao)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log("\nHouve um erro ao buscar taxa de aprovação! Erro:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });

};

module.exports = {
    dadosHome,
    top5Evasao,
    taxaAprovacao
};

    