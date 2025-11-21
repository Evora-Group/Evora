var database = require("../database/config");

function buscarAlunoPorRa(raAluno) {
    console.log("ACESSANDO MODEL: buscando aluno por ra", raAluno);
    const instrucaoSql = `
        SELECT 
            a.ra,
            a.nome,
            a.email,
            t.nome_sigla AS turma,
            c.nome AS curso,
            c.id_curso AS idCurso,
            i.nome AS instituicaoNome
        FROM aluno a
        INNER JOIN matricula m ON a.ra = m.fkAluno
        INNER JOIN turma t ON m.fkTurma = t.id_turma
        INNER JOIN curso c ON t.fkCurso = c.id_curso
        INNER JOIN instituicao i ON c.fkInstituicao = i.id_instituicao
        WHERE a.ra = ${raAluno};`;

    console.log("Executando busca de aluno de ra:", raAluno);
    return database.executar(instrucaoSql);
}

// função para o select de cursos
function listarCursosInstituicao(fkInstituicao) {
    console.log("ACESSANDO MODEL: listando cursos disponíveis da instituição", fkInstituicao);
    const instrucaoSql = `
        SELECT id_curso, nome 
        FROM Curso 
        WHERE fkInstituicao = ${fkInstituicao};
    `;

    console.log("Executando lista de cursos da instituicao:", fkInstituicao);
    return database.executar(instrucaoSql);
}

// models/alunoModel.js (Adicione esta função)

function listarTurmasInstituicao(fkInstituicao) {
    console.log("ACESSANDO MODEL: listando turmas distintas da instituição", fkInstituicao);
    // Busca todas as turmas DISTINTAS cadastradas na tabela Matricula para a Instituição
    const instrucaoSql = `
        SELECT DISTINCT nome_sigla
        FROM turma t
        INNER JOIN Curso c ON t.fkCurso = c.id_curso 
        INNER JOIN Instituicao i ON c.fkInstituicao = i.id_instituicao
        WHERE c.fkInstituicao = ${fkInstituicao};
    `;

    console.log("Executando lista de turmas da instituicao:", fkInstituicao);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarAlunoPorRa,
    listarCursosInstituicao,
    listarTurmasInstituicao
}