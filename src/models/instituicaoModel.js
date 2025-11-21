var database = require("../database/config");

function listarInstituicoes() {
    var instrucaoSql = `
        SELECT nome FROM instituicao ORDER BY nome DESC;
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
    U.id_usuario AS id,
    U.nome,
    U.email,
    'Professor' AS tipo,
    -- Concatena todas as turmas que o professor está associado
    (
        SELECT GROUP_CONCAT(DISTINCT T.nome_sigla SEPARATOR ', ')
        FROM usuario_turma UT
        JOIN turma T ON UT.fkTurma = T.id_turma
        WHERE UT.fkUsuario = U.id_usuario
    ) AS turma,
    -- Concatena todos os cursos associados a essas turmas
    (
        SELECT GROUP_CONCAT(DISTINCT C.nome SEPARATOR ', ')
        FROM usuario_turma UT
        JOIN turma T ON UT.fkTurma = T.id_turma
        JOIN curso C ON T.fkCurso = C.id_curso
        WHERE UT.fkUsuario = U.id_usuario
    ) AS curso,
    I.nome AS instituicao,
    CASE
        WHEN U.ativo = 1 THEN 'liberado'
        ELSE 'bloqueado'
    END AS situacao
FROM
    usuario U
JOIN instituicao I ON U.fkInstituicao = I.id_instituicao
WHERE
    I.id_instituicao = ?
    AND U.cargo = 'Professor' -- Filtra explicitamente por professores, se houver outros cargos em 'usuario'

UNION ALL

SELECT
    A.ra AS id,
    A.nome,
    A.email,
    'Aluno' AS tipo,
    T.nome_sigla AS turma,
    C.nome AS curso,
    I.nome AS instituicao,
    CASE
        WHEN M.ativo = 1 THEN 'liberado'
        ELSE 'bloqueado'
    END AS situacao
FROM
    aluno A
JOIN matricula M ON A.ra = M.fkAluno
JOIN turma T ON M.fkTurma = T.id_turma
JOIN curso C ON T.fkCurso = C.id_curso
JOIN instituicao I ON C.fkInstituicao = I.id_instituicao
WHERE
    I.id_instituicao = ?

ORDER BY
    nome;`;

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