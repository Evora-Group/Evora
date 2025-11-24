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


// Comparativo do total de alunos (para a setinha)
function comparativoTotalAlunos(req, res) {
    const id = req.params.idInstituicao;

    dashModel.comparativoTotalAlunos(id)
        .then(resultado => {
            const atual    = resultado[0].alunos_mes_atual || 0;
            const anterior = resultado[0].alunos_mes_anterior || 0;

            let variacao = 0;
            let direcao  = "equal";

            // Só calcula se tinha alunos no mês anterior
            if (anterior > 0) {
                variacao = ((atual - anterior) / anterior) * 100;
                
                if (variacao > 0) {
                    direcao = "up";     // cresceu
                } else if (variacao < 0) {
                    direcao = "down";   // diminuiu
                } else {
                    direcao = "equal";  // ficou igual
                }
            }
            // Se anterior == 0 → não calcula nada → fica 0% (melhor opção)

            res.json({
                totalAtual: atual,
                variacao:   Number(variacao.toFixed(2)),  // ex: 8.45 ou -3.20
                direcao:    direcao                       // "up", "down" ou "equal"
            });
        })
        .catch(erro => {
            console.error("Erro no comparativo total alunos:", erro);
            res.status(500).json({ erro: "Erro ao calcular variação" });
        });
}

module.exports = {
    totalAlunos,
    alunosAbaixoMedia,
    taxaAbandono,
    novasMatriculas,
    top5Evasao,
    taxaAprovacao,
    comparativoTotalAlunos
};
