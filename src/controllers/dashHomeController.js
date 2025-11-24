const dashModel = require("../models/dashHomeModel");

function totalAlunos(req, res) {
    const id = req.params.idInstituicao;
    dashModel.totalAlunos(id)
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro));
}

function alunosAbaixoMedia(req, res) {
    const id = req.params.idInstituicao;
    dashModel.alunosAbaixoMedia(id)
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro));
}

function taxaAbandono(req, res) {
    const id = req.params.idInstituicao;
    dashModel.taxaAbandono(id)
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro));
}

function novasMatriculas(req, res) {
    const id = req.params.idInstituicao;
    dashModel.novasMatriculas(id)
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro));
}

//=============================================//
//==========Gráficos==========================//

function top5Evasao(req, res) {
    const id = req.params.idInstituicao;
    dashModel.top5Evasao(id)
        .then(resultado => res.json(resultado))
        .catch(erro => res.status(500).json(erro));
}

function taxaAprovacao(req, res) {
    const id = req.params.idInstituicao;
    dashModel.taxaAprovacao(id)
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro));
}


function comparativoTotalAlunos(req, res) {
    const id = req.params.idInstituicao;

    dashModel.comparativoTotalAlunos(id)
        .then(resultado => {
            const atualNum = parseFloat(resultado[0].atual || 0);
            const anteriorNum = parseFloat(resultado[0].anterior || 0);

            let variacao = 0;
            let direcao = "equal";

            if (anteriorNum > 0) {
                variacao = ((atualNum - anteriorNum) / anteriorNum) * 100;
                direcao = variacao > 0 ? "up" : variacao < 0 ? "down" : "equal";
            }

            res.json({
                atual: atualNum,
                variacao: Number(variacao.toFixed(1)),
                direcao: direcao
            });
        })
        .catch(erro => {
            console.error("Erro comparativo total alunos:", erro);
            res.status(500).json({ erro: "Erro ao calcular comparativo" });
        });
}


function comparativoAbaixoMedia(req, res) {
    const id = req.params.idInstituicao;

    dashModel.comparativoAbaixoMedia(id)
        .then(resultado => {
            const atualNum = parseFloat(resultado[0].atual || 0);
            const anteriorNum = parseFloat(resultado[0].anterior || 0);

            let variacao = 0;
            let direcao = "equal";

            if (anteriorNum > 0) {
                variacao = ((atualNum - anteriorNum) / anteriorNum) * 100;
                direcao = variacao > 0 ? "up" : variacao < 0 ? "down" : "equal";
            }

            res.json({
                atual: Number(atualNum.toFixed(1)),
                variacao: Number(variacao.toFixed(1)),
                direcao: direcao
            });
        })
        .catch(erro => {
            console.error("Erro comparativo alunos abaixo da média:", erro);
            res.status(500).json({ erro: "Erro ao calcular comparativo" });
        });
}


function comparativoAbandono(req, res) {
    const id = req.params.idInstituicao;

    dashModel.comparativoTaxaAbandono(id)
        .then(resultado => {
            const atualNum = parseFloat(resultado[0].atual || 0);
            const anteriorNum = parseFloat(resultado[0].anterior || 0);

            let variacao = 0;
            let direcao = "equal";

            if (anteriorNum > 0) {
                variacao = ((atualNum - anteriorNum) / anteriorNum) * 100;
                direcao = variacao > 0 ? "up" : variacao < 0 ? "down" : "equal";
            }

            res.json({
                atual: Number(atualNum.toFixed(1)),
                variacao: Number(variacao.toFixed(1)),
                direcao: direcao
            });
        })
        .catch(erro => {
            console.error("Erro comparativo taxa de abandono:", erro);
            res.status(500).json({ erro: "Erro ao calcular comparativo" });
        });
}


function comparativoNovasMatriculas(req, res) {
    const id = req.params.idInstituicao;

    dashModel.comparativoNovasMatriculas(id)
        .then(resultado => {
            const atualNum = parseFloat(resultado[0].atual || 0);
            const anteriorNum = parseFloat(resultado[0].anterior || 0);

            let variacao = 0;
            let direcao = "equal";

            if (anteriorNum > 0) {
                variacao = ((atualNum - anteriorNum) / anteriorNum) * 100;
                direcao = variacao > 0 ? "up" : variacao < 0 ? "down" : "equal";
            }

            res.json({
                atual: atualNum,
                variacao: Number(variacao.toFixed(1)),
                direcao: direcao
            });
        })
        .catch(erro => {
            console.error("Erro comparativo novas matrículas:", erro);
            res.status(500).json({ erro: "Erro ao calcular comparativo" });
        });
}


module.exports = {
    totalAlunos,
    alunosAbaixoMedia,
    taxaAbandono,
    novasMatriculas,
    top5Evasao,
    taxaAprovacao,
    comparativoTotalAlunos,
    comparativoAbaixoMedia,
    comparativoAbandono,
    comparativoNovasMatriculas
};
