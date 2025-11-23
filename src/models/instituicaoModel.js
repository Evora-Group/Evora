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

function listarCursosInstituicao(idInstituicao, limit, offset, q, professor, situacao) {
    console.log("Executando listagem de cursos da instituição:", idInstituicao, "limit:", limit, "offset:", offset, "q:", q, "professor:", professor, "situacao:", situacao);

    // construir filtros SQL a partir de q (nome/id), professor (nome) e situacao (liberado/bloqueado)
    let whereExtra = '';
    let paramsCount = [idInstituicao];
    let paramsSelect = [idInstituicao];

    if (q && q.trim() !== '') {
        const isNumeric = /^\d+$/.test(q.trim());
        if (isNumeric) {
            whereExtra += ' AND (C.id_curso = ? OR C.nome LIKE ?)';
            paramsCount.push(q.trim());
            paramsCount.push('%' + q.trim() + '%');
            paramsSelect.push(q.trim());
            paramsSelect.push('%' + q.trim() + '%');
        } else {
            whereExtra += ' AND (C.nome LIKE ?)';
            paramsCount.push('%' + q.trim() + '%');
            paramsSelect.push('%' + q.trim() + '%');
        }
    }

    if (professor && professor.trim() !== '') {
        // courses that have at least one professor with matching name
        whereExtra += ' AND EXISTS(SELECT 1 FROM turma T JOIN usuario_turma UT ON T.id_turma = UT.fkTurma JOIN usuario U ON UT.fkUsuario = U.id_usuario WHERE T.fkCurso = C.id_curso AND U.cargo = "Professor" AND U.nome LIKE ?)';
        paramsCount.push('%' + professor.trim() + '%');
        paramsSelect.push('%' + professor.trim() + '%');
    }

    if (situacao && situacao.trim() !== '') {
        if (situacao === 'liberado') {
            whereExtra += ' AND EXISTS(SELECT 1 FROM turma T2 JOIN usuario_turma UT2 ON T2.id_turma = UT2.fkTurma JOIN usuario U2 ON UT2.fkUsuario = U2.id_usuario WHERE T2.fkCurso = C.id_curso AND U2.cargo = "Professor")';
        } else if (situacao === 'bloqueado') {
            whereExtra += ' AND NOT EXISTS(SELECT 1 FROM turma T2 JOIN usuario_turma UT2 ON T2.id_turma = UT2.fkTurma JOIN usuario U2 ON UT2.fkUsuario = U2.id_usuario WHERE T2.fkCurso = C.id_curso AND U2.cargo = "Professor")';
        }
    }

    var countSql = `SELECT COUNT(*) AS total FROM curso C WHERE C.fkInstituicao = ? ${whereExtra}`;

    var selectSql = `
        SELECT
            C.id_curso AS id,
            C.nome,
            IFNULL(C.descricao, '-') AS descricao,
            IFNULL(C.modalidade, '-') AS modalidade,
            (
                SELECT IFNULL(COUNT(DISTINCT M.fkAluno), 0)
                FROM turma T
                JOIN matricula M ON T.id_turma = M.fkTurma
                WHERE T.fkCurso = C.id_curso
            ) AS quantidade_alunos
        FROM curso C
        WHERE C.fkInstituicao = ?
        ${whereExtra}
        ORDER BY C.nome
        LIMIT ? OFFSET ?;
    `;

    return database.executar(countSql, paramsCount)
        .then(function (countResult) {
            var total = 0;
            if (Array.isArray(countResult) && countResult.length > 0) {
                total = countResult[0].total;
            }
            paramsSelect.push(limit);
            paramsSelect.push(offset);
            return database.executar(selectSql, paramsSelect)
                .then(function (cursos) {
                    return { total: total, cursos: cursos };
                });
        });
}

module.exports = {
    listarInstituicoes,
    buscarInstituicao,
    listarUsuariosInstituicao,
    listarAlunosInstituicao,
    listarCursosInstituicao,
    listarAlunosAlerta,
    criarCurso,
    editarCurso,
    deletarCurso,
    obterCursoPorId
}

function listarAlunosAlerta(idInstituicao, tipo, limit, offset) {
    console.log("Listando alertas de alunos:", idInstituicao, tipo, limit, offset);

    // Base SQL que computa média e frequência por aluno
    const baseSql = `
        SELECT 
            a.ra,
            a.nome,
            a.email,
            t.nome_sigla AS turma,
            c.nome AS curso,
            (SELECT IFNULL(AVG(av.nota), 0) FROM avaliacao av JOIN matricula m2 ON av.fkMatricula = m2.id_matricula WHERE m2.fkAluno = a.ra) AS media_nota,
            (SELECT IFNULL((SUM(f.presente) / COUNT(f.id_frequencia)) * 100, 0) FROM frequencia f JOIN matricula m3 ON f.fkMatricula = m3.id_matricula WHERE m3.fkAluno = a.ra) AS frequencia
        FROM aluno a
        JOIN matricula m ON a.ra = m.fkAluno
        JOIN turma t ON m.fkTurma = t.id_turma
        JOIN curso c ON t.fkCurso = c.id_curso
        WHERE c.fkInstituicao = ?
    `;

    // Condições para os tipos
    let filtro = '';
    if (tipo === 'preocupante') {
        filtro = 'WHERE base.media_nota < 6 AND base.frequencia < 75';
    } else if (tipo === 'atencao') {
        // Atenção: próximos dos limites (definição: média entre 5 e <6 OR frequência entre 70 e <75)
        filtro = 'WHERE (base.media_nota >= 5 AND base.media_nota < 6) OR (base.frequencia >= 70 AND base.frequencia < 75)';
    } else {
        // default: retorna vazio
        filtro = 'WHERE 1 = 0';
    }

    const countSql = `SELECT COUNT(*) AS total FROM ( ${baseSql} ) AS base ${filtro}`;

    const selectSql = `
        SELECT base.*, 
            CASE 
                WHEN base.media_nota < 6 AND base.frequencia < 75 THEN 'Média e presença baixas'
                WHEN base.media_nota < 6 THEN 'Média baixa'
                WHEN base.frequencia < 75 THEN 'Presença baixa'
                ELSE '-'
            END AS descricao
        FROM ( ${baseSql} ) AS base
        ${filtro}
        ORDER BY base.nome
        LIMIT ? OFFSET ?;
    `;

    return database.executar(countSql, [idInstituicao])
        .then(function (countResult) {
            var total = 0;
            if (Array.isArray(countResult) && countResult.length > 0) {
                total = countResult[0].total;
            }
            return database.executar(selectSql, [idInstituicao, limit, offset])
                .then(function (alunos) {
                    return { total: total, alunos: alunos };
                });
        });
}

// === CRUD de Curso ===
function criarCurso(idInstituicao, curso) {
    console.log('Model: criando curso para instituicao', idInstituicao, curso);
    var instrucaoSql = `
        INSERT INTO curso (fkInstituicao, nome, descricao, modalidade, duracao_semestres)
        VALUES (?, ?, ?, ?, ?);
    `;
    return database.executar(instrucaoSql, [idInstituicao, curso.nome, curso.descricao || null, curso.modalidade || null, curso.duracao_semestres || null]);
}

function editarCurso(idCurso, curso) {
    console.log('Model: editando curso', idCurso, curso);
    var instrucaoSql = `
        UPDATE curso SET nome = ?, descricao = ?, modalidade = ?, duracao_semestres = ? WHERE id_curso = ?;
    `;
    return database.executar(instrucaoSql, [curso.nome, curso.descricao || null, curso.modalidade || null, curso.duracao_semestres || null, idCurso]);
}

function deletarCurso(idCurso) {
    console.log('Model: deletando curso', idCurso);
    var instrucaoSql = `DELETE FROM curso WHERE id_curso = ?;`;
    return database.executar(instrucaoSql, [idCurso]);
}

function obterCursoPorId(idCurso) {
    console.log('Model: obtendo curso por id', idCurso);
    var instrucaoSql = `SELECT id_curso AS id, fkInstituicao, nome, IFNULL(descricao,'') AS descricao, IFNULL(modalidade,'') AS modalidade, IFNULL(duracao_semestres,0) AS duracao_semestres FROM curso WHERE id_curso = ? LIMIT 1;`;
    return database.executar(instrucaoSql, [idCurso]);
}