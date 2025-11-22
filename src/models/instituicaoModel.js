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
    console.log("ACESSANDO MODEL INSTITUIÇÃO: Listando alunos com status calculado...");

    const instrucaoSql = `
        SELECT 
            base.ra,
            base.nome,
            base.email,
            base.turma,
            base.curso,
            base.media_nota,
            base.frequencia,
            CASE 
                WHEN media_nota >= 8 AND frequencia >= 75 THEN 'Ótimo'
                WHEN media_nota >= 6 AND frequencia >= 75 THEN 'Regular'
                ELSE 'Atenção'
            END AS desempenho
        FROM (
            SELECT 
                a.ra,
                a.nome,
                a.email,
                t.nome_sigla AS turma,
                c.nome AS curso,
                
                -- Cálculo da Média de Notas (Se não tiver nota, assume 0)
                (SELECT IFNULL(AVG(av.nota), 0) 
                 FROM avaliacao av 
                 JOIN matricula m2 ON av.fkMatricula = m2.id_matricula 
                 WHERE m2.fkAluno = a.ra) AS media_nota,
                 
                -- Cálculo da Frequência % (Se não tiver aula, assume 0)
                (SELECT IFNULL((SUM(f.presente) / COUNT(f.id_frequencia)) * 100, 0) 
                 FROM frequencia f 
                 JOIN matricula m3 ON f.fkMatricula = m3.id_matricula 
                 WHERE m3.fkAluno = a.ra) AS frequencia
                 
            FROM aluno a
            JOIN matricula m ON a.ra = m.fkAluno
            JOIN turma t ON m.fkTurma = t.id_turma
            JOIN curso c ON t.fkCurso = c.id_curso
            WHERE c.fkInstituicao = ${idInstituicao}
        ) AS base;
    `;

    return database.executar(instrucaoSql);
}

module.exports = {
    listarInstituicoes,
    buscarInstituicao,
    listarUsuariosInstituicao,
    listarAlunosInstituicao
}