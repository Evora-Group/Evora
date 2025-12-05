const dashModel = require("../models/dashHomeModel");

function totalAlunos(req, res) {
    const id = req.params.idInstituicao;
    dashModel.totalAlunos(id)
        .then(resultado => {
            const rows = Array.isArray(resultado) && Array.isArray(resultado[0]) ? resultado[0] : resultado;
            const row = Array.isArray(rows) ? rows[0] : rows;
            res.json(row || {});
        })
        .catch(erro => res.status(500).json(erro));
}

function alunosAbaixoMedia(req, res) {
    const id = req.params.idInstituicao;
    dashModel.alunosAbaixoMedia(id)
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro));
}

function totalAlunosInativos(req, res) {
    const id = req.params.idInstituicao;
    dashModel.totalAlunosInativos(id)
        .then(resultado => {
            res.json(resultado[0]); 
        })
        .catch(erro => res.status(500).json(erro));
}

function novasMatriculas(req, res) {
    const id = req.params.idInstituicao;
    dashModel.novasMatriculas(id)
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro));
}

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

function comparativoAbaixoMedia(req, res) {
    const id = req.params.idInstituicao;

    dashModel.comparativoAbaixoMedia(id)
        .then(resultado => {
            const novosAlerta = parseInt(resultado[0].atualMes_novosAlerta || 0);
            const melhorias = parseInt(resultado[0].anteriorMes_melhorias || 0); 
            let variacao = novosAlerta + melhorias; 
            let direcao = "equal";

            if (variacao > 0) {
                direcao = "up";
            } else if (variacao < 0) {
                direcao = "down";
            }

            res.json({
                variacao: variacao, 
                direcao: direcao
            });
        })
        .catch(erro => {
            console.error("Erro comparativo alunos abaixo da média:", erro);
            res.status(500).json({ erro: "Erro ao calcular comparativo" });
        });
}

function comparativoRiscoContagem(req, res) { 
    const id = req.params.idInstituicao;

    dashModel.comparativoRiscoContagem(id) 
        .then(resultado => {
            const novosEmRisco = parseInt(resultado[0].novos_em_risco || 0);
            const melhorias = parseInt(resultado[0].alunos_que_melhoraram || 0); 
            let variacao = novosEmRisco + melhorias; 
            let direcao = "equal";

            if (variacao > 0) {
                direcao = "up";
            } else if (variacao < 0) {
                direcao = "down";
            }

            res.json({
                variacao: variacao, 
                direcao: direcao
            });
        })
        .catch(erro => {
            console.error("Erro comparativo de risco (contagem):", erro);
            res.status(500).json({ erro: "Erro ao calcular comparativo" });
        });
}

function comparativoNovasMatriculas(req, res) {
    const id = req.params.idInstituicao;

    dashModel.comparativoNovasMatriculas(id) 
        .then(resultado => {
            const atualNum = parseFloat(resultado[0].atualMes_novasMatriculas || 0);
            const anteriorNum = parseFloat(resultado[0].anteriorMes_novasMatriculas || 0);

            let variacao = 0;
            let direcao = "equal";

            if (anteriorNum > 0) {
                let diff = atualNum - anteriorNum;
                
                if (diff < 0) {
                    diff = 0;
                }

                variacao = (diff / anteriorNum) * 100;
                
                direcao = variacao > 0 ? "up" : "equal";
                
            } else if (atualNum > 0) {
                variacao = 100;
                direcao = "up";
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

function variacaoMatriculasDoMes(req, res) {
    const id = req.params.idInstituicao;

    dashModel.variacaoMatriculasDoMes(id)
        .then(resultado => {
            const rows = Array.isArray(resultado) && Array.isArray(resultado[0]) ? resultado[0] : resultado;
            const data = Array.isArray(rows) ? rows[0] : rows;

            const novasMatriculas = Number(data?.novas_matriculas || 0);
            const inativacoes = Number(data?.inativacoes || 0);
            const totalAntesMes = Number(data?.total_antes_mes || 0);
            const mudancaLiquida = Number(data?.mudanca_liquida || 0);

            let variacao = 0;
            let direcao = "equal";
            let variacaoInatividade = 0;
            let direcaoInatividade = "";

            if (mudancaLiquida === 0) {
                variacao = 0;
                direcao = "equal";
            }
            else if (totalAntesMes > 0) {
                variacao = Number((Math.abs(mudancaLiquida) / totalAntesMes * 100).toFixed(1));
                direcao = mudancaLiquida > 0 ? "up" : "down";
            }
            else if (totalAntesMes === 0 && novasMatriculas > 0) {
                variacao = 100;
                direcao = "up";
            }
            
            if (inativacoes > 0) {
                if (totalAntesMes > 0) {
                    variacaoInatividade = Number((inativacoes / totalAntesMes * 100).toFixed(1));
                } else if (inativacoes > 0) {
                    variacaoInatividade = 0; 
                }
                direcaoInatividade = "down"; 

            } else {
                variacaoInatividade = 0;
                direcaoInatividade = "equal";
            }
            if (inativacoes > 0) {
                variacao = variacaoInatividade;
                direcao = direcaoInatividade; 
            } 


            res.json({
                novasMatriculas: novasMatriculas,
                inativacoes: inativacoes,
                totalAntesMes: totalAntesMes,
                mudancaLiquida: mudancaLiquida,
                variacao: variacao, 
                direcao: direcao    
            });
        })
        .catch(erro => {
            console.error("Erro variação matrículas do mês:", erro);
            res.status(500).json({ erro: "Erro ao calcular variação" });
        });
}


module.exports = {
    totalAlunos,
    alunosAbaixoMedia,
    totalAlunosInativos,
    novasMatriculas,
    top5Evasao,
    taxaAprovacao,
    comparativoAbaixoMedia,
    comparativoRiscoContagem,
    comparativoNovasMatriculas,
    variacaoMatriculasDoMes

}
