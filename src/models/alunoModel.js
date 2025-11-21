var database = require("../database/config");

function buscarAlunoPorRa(raAluno) {
    console.log("ACESSANDO MODEL: buscando aluno por RA", raAluno);
    const instrucaoSql = `
        SELECT 
            a.RA, 
            a.nome, 
            a.email, 
            m.nomeTurma as turma, 
            c.descricao as cursoNome,
            c.idCurso as idCurso, -- Adicionado para popularCursosEdicao
            i.nome as instituicaoNome
        FROM Aluno a
        INNER JOIN Instituicao i ON a.fkInstituicao = i.idInstituicao
        INNER JOIN Matricula m ON a.RA = m.fkRA AND a.fkInstituicao = m.Aluno_fkInstituicao
        INNER JOIN Curso c ON m.Curso_fkCurso = c.idCurso -- <--- CORREÇÃO CHAVE AQUI!
        WHERE a.RA = ${raAluno};
    `;

    console.log("Executando busca de aluno de RA:", raAluno);
    return database.executar(instrucaoSql);
}

// função para o select de cursos
function listarCursosInstituicao(fkInstituicao) {
    console.log("ACESSANDO MODEL: listando cursos disponíveis da instituição", fkInstituicao);
    const instrucaoSql = `
        SELECT idCurso, descricao 
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
        SELECT DISTINCT nomeTurma AS nome 
        FROM Matricula m
        INNER JOIN Aluno a ON m.fkRA = a.RA AND m.Aluno_fkInstituicao = a.fkInstituicao
        WHERE a.fkInstituicao = ${fkInstituicao};
    `;

    console.log("Executando lista de turmas da instituicao:", fkInstituicao);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarAlunoPorRa,
    listarCursosInstituicao,
    listarTurmasInstituicao
}