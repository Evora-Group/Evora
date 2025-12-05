const database = require("../database/config");

function totalAlunos(fkInstituicao) {
    const instrucaoSql = `
        SELECT COUNT(DISTINCT a.ra) AS TotalAlunos
        FROM aluno a
        INNER JOIN matricula m 
            ON a.ra = m.fkAluno
        INNER JOIN turma t 
            ON m.fkTurma = t.id_turma
        INNER JOIN curso c 
            ON t.fkCurso = c.id_curso
        WHERE m.ativo = 1
        AND c.fkInstituicao = ?;
    `;
    return database.executar(instrucaoSql, [fkInstituicao]);
}

function alunosAbaixoMedia(fkInstituicao) {
    const instrucaoSql = `

        SELECT
            IF(COUNT(sub.fkAluno) = 0, 
            0, 
            SUM(CASE WHEN sub.media_geral_aluno < 6 THEN 1 ELSE 0 END) / COUNT(sub.fkAluno) * 100
            ) AS percentual_media_baixa
        FROM (
            SELECT
                m.fkAluno,
                AVG(a.nota) AS media_geral_aluno  -- Renomeado para refletir que é a média geral
            FROM avaliacao a
            JOIN matricula m ON m.id_matricula = a.fkMatricula
            JOIN turma t ON t.id_turma = m.fkTurma
            JOIN curso c ON c.id_curso = t.fkCurso
            WHERE 
                c.fkInstituicao = ? 
                AND m.ativo = 1 
            GROUP BY 
                m.fkAluno
        ) AS sub;
    `;
    return database.executar(instrucaoSql, [fkInstituicao]);
}

function totalAlunosInativos(fkInstituicao) {
    const instrucaoSql = `
        SELECT 
            COUNT(m.id_matricula) AS total_alunos_inativos
        FROM matricula m
        JOIN turma t ON t.id_turma = m.fkTurma
        JOIN curso c ON c.id_curso = t.fkCurso
        WHERE 
            c.fkInstituicao = ? 
            AND m.ativo = 0; -- Filtra apenas matrículas inativas
    `;
    return database.executar(instrucaoSql, [fkInstituicao]);
}

function novasMatriculas(fkInstituicao) {
    const instrucaoSql = `
        SELECT COUNT(*) AS novas_matriculas
        FROM matricula m
        JOIN turma t ON t.id_turma = m.fkTurma
        JOIN curso c ON c.id_curso = t.fkCurso
        WHERE c.fkInstituicao = ?
        AND YEAR(m.data_matricula) = YEAR(NOW())
        AND MONTH(m.data_matricula) = MONTH(NOW());
    `;
    return database.executar(instrucaoSql, [fkInstituicao]);
}

function top5Evasao(fkInstituicao) {
    const instrucaoSql = `  
        SELECT 
            c.nome AS nomeCurso,
            COALESCE(
                (
                    -- NUMERADOR: Conta matrículas ATIVAS com frequência média < 75%
                    COUNT(DISTINCT CASE 
                        WHEN m.ativo = 1 AND f_aluno.freq_media < 0.75 
                        THEN m.id_matricula 
                    END) * 100.0
                ) 
                / NULLIF(
                    -- DENOMINADOR: Total de alunos ATIVOS no curso
                    COUNT(DISTINCT CASE WHEN m.ativo = 1 THEN m.id_matricula END), 
                0), 
            0) AS percentual
        FROM 
            curso c
        LEFT JOIN 
            turma t ON t.fkCurso = c.id_curso
        LEFT JOIN 
            matricula m ON m.fkTurma = t.id_turma
        LEFT JOIN (
            -- Subconsulta: Calcula a frequência média GERAL por aluno (apenas para matrículas existentes)
            SELECT 
                fkMatricula, 
                SUM(presente) / COUNT(*) AS freq_media
            FROM 
                frequencia
            GROUP BY 
                fkMatricula
        ) f_aluno ON f_aluno.fkMatricula = m.id_matricula
        WHERE 
            c.fkInstituicao = ? 
        GROUP BY 
            c.id_curso, c.nome
        ORDER BY 
            percentual DESC
        LIMIT 3;
    `;
    return database.executar(instrucaoSql, [fkInstituicao]);
}

function taxaAprovacao(fkInstituicao) {
    const instrucaoSql = `
        SELECT
            -- 1. Calcula o percentual: (Aprovados * 100) / Total de Alunos Ativos
            COALESCE(
                (SUM(CASE WHEN t2.avg_nota >= 6 AND t3.avg_freq >= 0.75 THEN 1 ELSE 0 END) * 100.0)
                / NULLIF(COUNT(m.id_matricula), 0),
            0) AS percentualAprovacao
        FROM
            matricula m
        JOIN
            turma t1 ON t1.id_turma = m.fkTurma
        JOIN
            curso c ON c.id_curso = t1.fkCurso
        LEFT JOIN (
            -- T2: Subconsulta para calcular a Média de Notas (AVG(nota)) por aluno
            SELECT
                fkMatricula,
                AVG(nota) AS avg_nota
            FROM
                avaliacao
            GROUP BY
                fkMatricula
        ) AS t2 ON t2.fkMatricula = m.id_matricula
        LEFT JOIN (
            -- T3: Subconsulta para calcular a Média de Frequência (SUM(presente) / COUNT(*)) por aluno
            SELECT
                fkMatricula,
                (SUM(presente) / COUNT(id_frequencia)) AS avg_freq
            FROM
                frequencia
            GROUP BY
                fkMatricula
        ) AS t3 ON t3.fkMatricula = m.id_matricula
        WHERE
            c.fkInstituicao = ?  -- Filtra pela instituição
            AND m.ativo = 1;     -- Filtra por Matrículas Ativas
    `;
    return database.executar(instrucaoSql, [fkInstituicao]);
}

function comparativoAbaixoMedia(fkInstituicao) {
    const instrucaoSql = `
        WITH 
        media_mes_atual AS (
            SELECT
                m.fkAluno,
                AVG(a.nota) AS media_aluno
            FROM avaliacao a
            JOIN matricula m ON m.id_matricula = a.fkMatricula
            JOIN curso c ON c.id_curso = (SELECT fkCurso FROM turma WHERE id_turma = m.fkTurma)
            WHERE c.fkInstituicao = ? 
              AND m.ativo = 1 
              AND a.data_avaliacao >= DATE_FORMAT(NOW(), '%Y-%m-01')
              AND a.data_avaliacao <= LAST_DAY(NOW())
            GROUP BY m.fkAluno
        ),
        media_mes_anterior AS (
            SELECT
                m.fkAluno,
                AVG(a.nota) AS media_aluno
            FROM avaliacao a
            JOIN matricula m ON m.id_matricula = a.fkMatricula
            JOIN curso c ON c.id_curso = (SELECT fkCurso FROM turma WHERE id_turma = m.fkTurma)
            WHERE c.fkInstituicao = ? 
              AND m.ativo = 1 
              AND a.data_avaliacao >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
              AND a.data_avaliacao <= LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 MONTH))
            GROUP BY m.fkAluno
        )
        SELECT
            -- 1. Alunos NOVOS EM ALERTA (abaixo da média AGORA, mas NÃO no mês anterior)
            (
                SELECT COUNT(t1.fkAluno)
                FROM media_mes_atual t1
                LEFT JOIN media_mes_anterior t2 ON t1.fkAluno = t2.fkAluno
                WHERE 
                    t1.media_aluno < 6  -- Está abaixo da média no mês atual
                    AND (t2.fkAluno IS NULL OR t2.media_aluno >= 6) -- OU não tinha avaliação, OU estava acima no mês anterior
            ) AS atualMes_novosAlerta,

            -- 2. Alunos que MELHORARAM (abaixo da média no Mês Anterior, mas NÃO AGORA)
            (
                SELECT COUNT(t1.fkAluno) * -1 -- Usamos *-1 para indicar que é uma "melhoria" (valor negativo)
                FROM media_mes_anterior t1
                LEFT JOIN media_mes_atual t2 ON t1.fkAluno = t2.fkAluno
                WHERE 
                    t1.media_aluno < 6 -- Estava abaixo da média no mês anterior
                    AND (t2.fkAluno IS NULL OR t2.media_aluno >= 6) -- E não está mais abaixo (saiu da lista ou não teve avaliações)
            ) AS anteriorMes_melhorias;
    `;
    
    return database.executar(instrucaoSql, [fkInstituicao, fkInstituicao]);
}

function comparativoRiscoContagem(fkInstituicao) { 
    const instrucaoSql = `
        WITH 
        -- Alunos ATIVOS e sua frequência média no MÊS ATUAL
        frequencia_mes_atual AS (
            SELECT
                m.fkAluno,
                AVG(f.presente) AS media_frequencia -- Usando a coluna 'presente'
            FROM frequencia f
            JOIN matricula m ON m.id_matricula = f.fkMatricula
            JOIN turma t ON t.id_turma = m.fkTurma
            JOIN curso c ON t.fkCurso = c.id_curso
            WHERE c.fkInstituicao = ? 
              AND m.ativo = 1 
              AND f.data_aula >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
              AND f.data_aula <= LAST_DAY(CURRENT_DATE())
            GROUP BY m.fkAluno
        ),
        -- Alunos ATIVOS e sua frequência média no MÊS ANTERIOR
        frequencia_mes_anterior AS (
            SELECT
                m.fkAluno,
                AVG(f.presente) AS media_frequencia -- Usando a coluna 'presente'
            FROM frequencia f
            JOIN matricula m ON m.id_matricula = f.fkMatricula
            JOIN turma t ON t.id_turma = m.fkTurma
            JOIN curso c ON t.fkCurso = c.id_curso
            WHERE c.fkInstituicao = ? 
              AND m.ativo = 1 
              AND f.data_aula >= DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), '%Y-%m-01')
              AND f.data_aula <= LAST_DAY(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
            GROUP BY m.fkAluno
        )
        SELECT
            -- 1. NOVOS EM RISCO: (Risco AGORA: < 0.75) E (NÃO estavam em risco ANTES: >= 0.75 ou sem dados)
            (
                SELECT COUNT(t1.fkAluno)
                FROM frequencia_mes_atual t1
                LEFT JOIN frequencia_mes_anterior t2 ON t1.fkAluno = t2.fkAluno
                WHERE 
                    t1.media_frequencia < 0.75  
                    AND (t2.fkAluno IS NULL OR t2.media_frequencia >= 0.75) 
            ) AS novos_em_risco,

            -- 2. ALUNOS QUE MELHORARAM: (Risco ANTES: < 0.75) E (NÃO estão em risco AGORA: >= 0.75 ou sem dados)
            (
                SELECT COUNT(t1.fkAluno) * -1 -- Valor negativo para indicar melhoria (saída da zona de risco)
                FROM frequencia_mes_anterior t1
                LEFT JOIN frequencia_mes_atual t2 ON t1.fkAluno = t2.fkAluno
                WHERE 
                    t1.media_frequencia < 0.75 
                    AND (t2.fkAluno IS NULL OR t2.media_frequencia >= 0.75) 
            ) AS alunos_que_melhoraram;
    `;
    
    return database.executar(instrucaoSql, [fkInstituicao, fkInstituicao]);
}

function comparativoNovasMatriculas(fkInstituicao) {
    const instrucaoSql = `
        SELECT
            -- Mês atual
            (SELECT COUNT(*) 
             FROM matricula m
             JOIN turma t ON m.fkTurma = t.id_turma
             JOIN curso c ON t.fkCurso = c.id_curso
             WHERE c.fkInstituicao = ?
               AND YEAR(m.data_matricula) = YEAR(NOW())
               AND MONTH(m.data_matricula) = MONTH(NOW())
            ) AS atualMes_novasMatriculas,

            -- Mês anterior
            (SELECT COUNT(*) 
             FROM matricula m
             JOIN turma t ON m.fkTurma = t.id_turma
             JOIN curso c ON t.fkCurso = c.id_curso
             WHERE c.fkInstituicao = ?
               AND YEAR(m.data_matricula) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
               AND MONTH(m.data_matricula) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
            ) AS anteriorMes_novasMatriculas;
    `;

    return database.executar(instrucaoSql, [fkInstituicao, fkInstituicao]);
}

function variacaoMatriculasDoMes(fkInstituicao) {
    const instrucaoSql = `
        SELECT
            novas_matriculas,
            inativacoes,
            (total_antes_mes + inativacoes) AS total_antes_mes,
            (novas_matriculas - inativacoes) AS mudanca_liquida
        FROM (
            SELECT
                -- Novas matrículas neste mês
                (SELECT COUNT(*)
                 FROM matricula m
                 JOIN turma t ON m.fkTurma = t.id_turma
                 JOIN curso c ON t.fkCurso = c.id_curso
                 WHERE c.fkInstituicao = ?
                   AND m.ativo = 1
                   AND m.data_matricula >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
                   AND m.data_matricula <= LAST_DAY(CURRENT_DATE)
                ) AS novas_matriculas,

                -- Inativações neste mês (alunos que foram desativados)
                (SELECT COUNT(*)
                 FROM matricula m
                 JOIN turma t ON m.fkTurma = t.id_turma
                 JOIN curso c ON t.fkCurso = c.id_curso
                 WHERE c.fkInstituicao = ?
                   AND m.ativo = 0
                   AND m.data_atualizacao_status >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
                   AND m.data_atualizacao_status <= LAST_DAY(CURRENT_DATE)
                ) AS inativacoes,

                -- Total de alunos que estavam ativos ANTES deste mês
                (SELECT COUNT(DISTINCT a.ra)
                 FROM matricula m
                 JOIN turma t ON m.fkTurma = t.id_turma
                 JOIN curso c ON t.fkCurso = c.id_curso
                 JOIN aluno a ON a.ra = m.fkAluno
                 WHERE m.ativo = 1
                   AND c.fkInstituicao = ?
                ) AS total_antes_mes
        ) AS sub;
    `;
    return database.executar(instrucaoSql, [fkInstituicao, fkInstituicao, fkInstituicao]);
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



