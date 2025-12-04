const database = require("../database/config");


// KPI - Total alunos
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

// KPI - Total de Alunos com Matrícula Inativa
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

// KPI - Novas Matriculas
function novasMatriculas(fkInstituicao) {
    const instrucaoSql = `
        SELECT COUNT(*) AS novas_matriculas
        FROM matricula m
        JOIN turma t ON t.id_turma = m.fkTurma
        JOIN curso c ON c.id_curso = t.fkCurso
        WHERE c.fkInstituicao = ?
        AND m.data_matricula >= CASE 
            WHEN MONTH(NOW()) BETWEEN 1 AND 6 THEN DATE_FORMAT(NOW(), '%Y-01-01')
            ELSE DATE_FORMAT(NOW(), '%Y-07-01')
        END;
    `;
    return database.executar(instrucaoSql, [fkInstituicao]);
}



// Top 5 cursos com maior risco de evasão - grafico
// Critério cálculo: pega os alunos que possuem média abaixo de 6 e frequencia abaixo de 75 de acordo com seu curso
function top5Evasao(fkInstituicao) {
    const instrucaoSql = `
        SELECT 
            c.nome AS nomeCurso,
            COUNT(DISTINCT CASE 
                WHEN a.nota < 6 OR (f.total_presencas / f.total_aulas) < 0.75 
                THEN m.id_matricula 
            END) * 100 / COUNT(DISTINCT m.id_matricula) AS percentual
        FROM curso c
        JOIN turma t ON t.fkCurso = c.id_curso
        JOIN matricula m ON m.fkTurma = t.id_turma
        LEFT JOIN avaliacao a ON a.fkMatricula = m.id_matricula
        LEFT JOIN (
            SELECT fkMatricula, 
                   SUM(presente) AS total_presencas, 
                   COUNT(*) AS total_aulas
            FROM frequencia
            GROUP BY fkMatricula
        ) f ON f.fkMatricula = m.id_matricula
        WHERE c.fkInstituicao = ?
        AND (a.data_avaliacao >= DATE_SUB(NOW(), INTERVAL 30 DAY) OR a.data_avaliacao IS NULL)
        GROUP BY c.id_curso
        ORDER BY percentual DESC
        LIMIT 5;
    `;
    return database.executar(instrucaoSql, [fkInstituicao]);
}


// Taxa de aprovação média - grafico
function taxaAprovacao(fkInstituicao) {
    const instrucaoSql = `
        SELECT 
            (SUM(CASE WHEN a.nota >= 6 THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS percentualAprovacao
        FROM avaliacao a
        JOIN matricula m ON m.id_matricula = a.fkMatricula
        JOIN turma t ON t.id_turma = m.fkTurma
        JOIN curso c ON c.id_curso = t.fkCurso
        WHERE c.fkInstituicao = ?
        AND a.data_avaliacao >= DATE_SUB(NOW(), INTERVAL 30 DAY);
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
    
    // Passamos os parâmetros da instituição para as duas CTEs
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


// Comparativo de novas matrículas
function comparativoNovasMatriculas(fkInstituicao) {
    const instrucaoSql = `
        SELECT
            -- Semestre atual
            (SELECT COUNT(*) 
             FROM matricula m
             JOIN turma t ON m.fkTurma = t.id_turma
             JOIN curso c ON t.fkCurso = c.id_curso
             WHERE c.fkInstituicao = ?
               AND m.data_matricula >= CASE 
                   WHEN MONTH(NOW()) BETWEEN 1 AND 6 THEN DATE_FORMAT(NOW(), '%Y-01-01')
                   ELSE DATE_FORMAT(NOW(), '%Y-07-01')
               END
            ) AS atual,

            -- Semestre anterior
            (SELECT COUNT(*) 
             FROM matricula m
             JOIN turma t ON m.fkTurma = t.id_turma
             JOIN curso c ON t.fkCurso = c.id_curso
             WHERE c.fkInstituicao = ?
               AND m.data_matricula >= CASE 
                   WHEN MONTH(NOW()) BETWEEN 1 AND 6 THEN DATE_FORMAT(NOW(), '%Y-07-01')
                   ELSE DATE_FORMAT(NOW(), '%Y-01-01')
               END
               AND m.data_matricula < CASE 
                   WHEN MONTH(NOW()) BETWEEN 1 AND 6 THEN DATE_FORMAT(NOW(), '%Y-01-01')
                   ELSE DATE_FORMAT(NOW(), '%Y-07-01')
               END
            ) AS anterior
    `;

    return database.executar(instrucaoSql, [fkInstituicao, fkInstituicao]);
}

// Novo: calcula somente a variação do mês baseada em novas matrículas e inativações
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



