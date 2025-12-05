
var instituicaoModel = require("../models/instituicaoModel");

function listarInstituicoes(req, res) {
    instituicaoModel.listarInstituicoes()
        .then(function (resultado) {
            res.json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao listar instituições! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function buscarInstituicao(req, res) {
    const nome = req.query.nome;
    instituicaoModel.buscarInstituicao(nome)
        .then(function (resultado) {
            res.json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar Instituição! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}
function listarUsuariosInstituicao(req, res) {
    const idInstituicao = req.params.idInstituicao;
    const page = parseInt(req.query.page) || 1; 
    const limit = 10;
    const busca = req.query.busca || '';

    instituicaoModel.listarUsuariosInstituicao(idInstituicao, page, limit, busca)
        .then(function (resultados) {
            
            // Resultado 0: Os dados da tabela (filtrados)
            const usuarios = resultados[0];
            
            // Resultado 1: Total da busca (para calcular páginas 1, 2, 3...)
            const totalBusca = resultados[1][0].total_busca;
            
            // Resultado 2: KPIs Globais (Estáticos, ignoram a busca)
            const kpis = resultados[2][0];

            const totalPaginas = Math.ceil(totalBusca / limit);

            res.json({
                usuarios: usuarios,
                kpis: kpis, // Envia os KPIs fixos
                paginacao: {
                    paginaAtual: page,
                    totalPaginas: totalPaginas,
                    totalRegistros: totalBusca // Envia o total filtrado para a lógica de paginação
                }
            });
        }).catch(function (erro) {
            console.log("\nHouve um erro ao listar usuários! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}


function listarAlunosInstituicao(req, res) {
    var idInstituicao = req.params.idInstituicao;
    var page = parseInt(req.query.page) || 1;
    var limit = 14; 
    var offset = (page - 1) * limit;

    instituicaoModel.listarAlunosInstituicao(idInstituicao, limit, offset)
        .then(function (resultado) {
            var totalItems = resultado.totalItems;
            var totalPages = Math.ceil(totalItems / limit);

            res.json({
                data: resultado.data,
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems
                // Não enviamos mais KPIs aqui!
            });
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

// NOVO CONTROLLER
function obterKpisAlunos(req, res) {
    var idInstituicao = req.params.idInstituicao;
    
    instituicaoModel.obterKpisAlunos(idInstituicao)
        .then(function (resultado) {
            res.json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}
function listarCursosInstituicao(req, res) {
    const idInstituicao = req.params.idInstituicao;

    // paginação via query params: ?page=1&limit=15
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;
    const q = req.query.q || '';
    const professor = req.query.professor || '';
    const situacao = req.query.situacao || '';

    instituicaoModel.listarCursosInstituicao(idInstituicao, limit, offset, q, professor, situacao)
        .then(function (resultado) {
            // resultado: { total, cursos }
            res.json({
                cursos: resultado.cursos,
                total: resultado.total,
                page: page,
                limit: limit
            });
        }).catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao listar cursos da instituição! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function listarAlunosAlerta(req, res) {
    const idInstituicao = req.params.idInstituicao;
    const tipo = req.query.tipo || 'preocupante';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    instituicaoModel.listarAlunosAlerta(idInstituicao, tipo, limit, offset)
        .then(function (resultado) {
            res.json({
                alunos: resultado.alunos,
                total: resultado.total,
                page: page,
                limit: limit,
                tipo: tipo
            });
        }).catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao listar alertas de alunos! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function criarCurso(req, res) {
    const idInstituicao = req.params.idInstituicao;
    const curso = req.body;

    instituicaoModel.criarCurso(idInstituicao, curso)
        .then(function (resultado) {
            res.status(201).json({ message: 'Curso criado', insertId: resultado.insertId });
        }).catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao criar curso! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function editarCurso(req, res) {
    const idCurso = req.params.idCurso;
    const curso = req.body;

    instituicaoModel.editarCurso(idCurso, curso)
        .then(function (resultado) {
            res.json({ message: 'Curso atualizado' });
        }).catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao editar curso! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function deletarCurso(req, res) {
    const idCurso = req.params.idCurso;
    instituicaoModel.deletarCurso(idCurso)
        .then(function (resultado) {
            res.json({ message: 'Curso deletado' });
        }).catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao deletar curso! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function obterCurso(req, res) {
    const idCurso = req.params.idCurso;
    instituicaoModel.obterCursoPorId(idCurso)
        .then(function (resultado) {
            if (Array.isArray(resultado) && resultado.length > 0) {
                res.json(resultado[0]);
            } else {
                res.status(404).json({ message: 'Curso não encontrado' });
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao obter curso! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}


function listarTurmasInstituicao(req, res) {

    const idInstituicao = req.params.idInstituicao;

    instituicaoModel.listarTurmasInstituicao(idInstituicao)
        .then(
            function (resultado) {

                res.json(resultado)

            }
        ).catch(function (erro) {
            console.log(erro);
            console.log(
                "\nHouve um erro ao listar turmas da instituição! Erro: ",
                erro.sqlMessage
            );
            res.status(500).json(erro.sqlMessage)

        });

    }
    
    function listarDisciplinas(req, res) {
    var idInstituicao = req.params.idInstituicao;

    instituicaoModel.listarDisciplinasPorInstituicao(idInstituicao)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function obterCursoEspecifico(req, res) {
    const idCurso = req.params.idCurso;

    instituicaoModel.obterCursoEspecifico(idCurso)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(204).send("Curso não encontrado!");
            }
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function listarAlunosCurso(req, res) {
    const idCurso = req.params.idCurso;

    instituicaoModel.listarAlunosCurso(idCurso)
        .then(function (resultado) {
            res.status(200).json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function obterEstatisticasCurso(req, res) {
    const idCurso = req.params.idCurso;

    instituicaoModel.obterEstatisticasCurso(idCurso)
        .then(function (resultado) {
            res.status(200).json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function obterFrequenciaPorMesCurso(req, res) {
    const idCurso = req.params.idCurso;

    instituicaoModel.obterFrequenciaPorMesCurso(idCurso)
        .then(function (resultado) {
            res.status(200).json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    listarInstituicoes,
    buscarInstituicao,
    listarUsuariosInstituicao,
    listarAlunosInstituicao,
    listarCursosInstituicao, // versão paginada
    listarAlunosAlerta,
    criarCurso,
    editarCurso,
    deletarCurso,
    obterCurso,
    listarTurmasInstituicao,
    listarDisciplinas,
    obterCursoEspecifico,
    listarAlunosCurso,
    obterEstatisticasCurso,
    obterFrequenciaPorMesCurso,
    obterKpisAlunos
};
