var database = require("../database/config");

function listarInstituicoes() {
    var instrucaoSql = `
        SELECT nome FROM Instituicao ORDER BY nome DESC;
    `;
    console.log("Executando listagem de instituições");
    return database.executar(instrucaoSql); 
}

function buscarInstituicao(nome) {
    var instrucaoSql = `
        SELECT id_instituicao FROM Instituicao WHERE nome = ? LIMIT 1;
    `;
    console.log("Executando busca de instituição:", nome);
    return database.executar(instrucaoSql, [nome]);
}

function listarUsuariosInstituicao(idInstituicao) {
//     var instrucaoSql = `SELECT 
//     U.*, 
//     I.nome AS nome_instituicao 
// FROM Usuario U
// INNER JOIN Instituicao I ON U.fkInstituicao = I.idInstituicao
// WHERE U.fkInstituicao = ?;
//     `;

    // var instrucaoSql = `SELECT * FROM Usuario WHERE fkInstituicao = ?;`;

    var instrucaoSql = `SELECT 
    u.idUsuario as id,
    u.nome,
    u.email,
    
    'Professor' as tipo,
    'N/A' as turma_curso,
    'N/A' as modalidade,
    i.nome as instituicao
FROM Usuario u
INNER JOIN Instituicao i ON u.fkInstituicao = i.idInstituicao
WHERE u.fkInstituicao = ? AND u.cargo = 'Professor'

UNION ALL

SELECT 
    a.RA as id,
    a.nome,
    a.email,
    'Aluno' as tipo,
    CONCAT(c.descricao, ' (', c.modalidade, ')') as turma_curso,
    c.modalidade,
    i.nome as instituicao
FROM Aluno a
INNER JOIN Instituicao i ON a.fkInstituicao = i.idInstituicao
INNER JOIN Matricula m ON a.RA = m.fkRA AND a.fkInstituicao = m.Aluno_fkInstituicao
INNER JOIN Curso c ON m.Curso_fkCurso = c.idCurso AND m.Curso_fkInstituicao = c.fkInstituicao
WHERE a.fkInstituicao = ?

ORDER BY tipo, nome;`;

    console.log("Executando listagem de usuários da instituição:", idInstituicao);
    return database.executar(instrucaoSql, [idInstituicao, idInstituicao]);
}

function listarAlunosInstituicao(idInstituicao) {

    var instrucaoSql = `
        SELECT 
            a.ra,
            a.nome,
            a.email,
            t.nome_sigla AS turma,
            c.nome AS curso,

            -- Média das notas
            (
                SELECT AVG(av.nota)
                FROM avaliacao av
                WHERE av.fkMatricula = m.id_matricula
            ) AS mediaNotas,

            -- Frequência em %
            (
                SELECT 
                    (SUM(CASE WHEN fr.presente = 1 THEN 1 ELSE 0 END) * 100.0) 
                    / COUNT(*)
                FROM frequencia fr
                WHERE fr.fkMatricula = m.id_matricula
            ) AS frequencia,

            -- Regra de desempenho (Ótimo / Regular / Atenção)
            CASE
                WHEN 
                    -- ÓTIMO
                    (SELECT AVG(av.nota)
                    FROM avaliacao av
                    WHERE av.fkMatricula = m.id_matricula) >= 7.5
                AND
                    (SELECT 
                        (SUM(CASE WHEN fr.presente = 1 THEN 1 ELSE 0 END) * 100.0)
                        / COUNT(*)
                    FROM frequencia fr 
                    WHERE fr.fkMatricula = m.id_matricula
                    ) >= 85
                THEN 'Ótimo'

                WHEN 
                    -- ATENÇÃO
                    (SELECT AVG(av.nota)
                    FROM avaliacao av
                    WHERE av.fkMatricula = m.id_matricula) < 6
                OR
                    (SELECT 
                        (SUM(CASE WHEN fr.presente = 1 THEN 1 ELSE 0 END) * 100.0)
                        / COUNT(*)
                    FROM frequencia fr 
                    WHERE fr.fkMatricula = m.id_matricula
                    ) < 75
                THEN 'Atenção'

                ELSE 
                    -- REGULAR
                    'Regular'
            END AS desempenho

        FROM aluno a
        INNER JOIN matricula m ON a.ra = m.fkAluno
        INNER JOIN turma t ON m.fkTurma = t.id_turma
        INNER JOIN curso c ON t.fkCurso = c.id_curso

        WHERE c.fkInstituicao = ${idInstituicao}
        ORDER BY a.nome;
        `;

    console.log("Executando listagem de alunos da instituição:", idInstituicao);
    return database.executar(instrucaoSql, [idInstituicao, idInstituicao]);
}

module.exports = {
    listarInstituicoes,
    buscarInstituicao,
    listarUsuariosInstituicao,
    listarAlunosInstituicao
}