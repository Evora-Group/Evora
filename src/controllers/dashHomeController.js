const dashModel = require("../models/dashHomeModel");

function totalAlunos(req, res) {
    const id = req.params.idInstituicao;
    dashModel.totalAlunos(id)
        .then(resultado => {
            // Suporta formato [rows, fields] ou rows
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
            let direcaoInatividade = ""; // Nova variável para lidar com a inatividade

            // --- Lógica para Variação Principal (Mudança Líquida) ---
            
            // Se não teve movimento no mês
            if (mudancaLiquida === 0) {
                variacao = 0;
                direcao = "equal";
            }
            // Se tinha alunos antes
            else if (totalAntesMes > 0) {
                variacao = Number((Math.abs(mudancaLiquida) / totalAntesMes * 100).toFixed(1));
                direcao = mudancaLiquida > 0 ? "up" : "down";
            }
            // Se não tinha alunos antes mas agora tem novas matrículas
            else if (totalAntesMes === 0 && novasMatriculas > 0) {
                variacao = 100;
                direcao = "up";
            }

            // --- Lógica Adicional para Inativações (Sua nova regra) ---
            
            if (inativacoes > 0) {
                // Cálculo do percentual de perda em comparação ao total ativo no mês passado
                if (totalAntesMes > 0) {
                    // Calculando o percentual de inativações (perda) sobre o total do mês anterior
                    variacaoInatividade = Number((inativacoes / totalAntesMes * 100).toFixed(1));
                } else if (inativacoes > 0) {
                    // Se não tinha alunos antes (totalAntesMes = 0) mas teve inativações,
                    // isso sugere que os alunos foram matriculados e inativados no mesmo mês.
                    // Neste caso, um valor de perda de 100% dos alunos que *poderiam* estar ativos
                    // pode ser considerado, mas para a sua regra específica (comparar com o mês passado),
                    // o totalAntesMes > 0 é o mais importante. Vamos manter em 0, focando na perda do mês passado.
                    // Poderíamos usar `variacaoInatividade = 100` se quiséssemos mostrar a perda total, 
                    // mas o foco é a comparação com o total **ativo mês passado**.
                    variacaoInatividade = 0; 
                }
                
                // Força a direção como "down" para inatividade (perda)
                direcaoInatividade = "down"; 

            } else {
                variacaoInatividade = 0;
                direcaoInatividade = "equal";
            }

            // O seu requisito é que a `variacao` seja em vermelho e seta down, e com o percentual de perda.
            // Para isso, faremos a `variacao` e a `direcao` **substituírem** os valores calculados
            // da `mudancaLiquida` APENAS SE HOUVER INATIVAÇÕES, conforme a sua regra.
            if (inativacoes > 0) {
                variacao = variacaoInatividade;
                direcao = direcaoInatividade; // Será "down"
            } 
            // Se não houver inativações, a lógica da mudancaLiquida (positiva ou negativa) 
            // será mantida como a variação principal.


            res.json({
                novasMatriculas: novasMatriculas,
                inativacoes: inativacoes,
                totalAntesMes: totalAntesMes,
                mudancaLiquida: mudancaLiquida,
                variacao: variacao, // Pode ser a perda (%) se houver inativação
                direcao: direcao    // Pode ser "down" se houver inativação
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
    taxaAbandono,
    novasMatriculas,
    top5Evasao,
    taxaAprovacao,
    comparativoAbaixoMedia,
    comparativoAbandono,
    comparativoNovasMatriculas,
    variacaoMatriculasDoMes

}
