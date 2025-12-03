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
    
    console.log("Buscando total de alunos matriculados...");
    return database.executar(instrucaoSql, [fkInstituicao]);
}

function alunosAbaixoMedia(fkInstituicao) {
    const instrucaoSql = `
        SELECT 
            (SUM(CASE WHEN a.nota < 6 THEN 1 ELSE 0 END) / COUNT(*)) * 100 
            AS percentual_media_baixa
        FROM avaliacao a
        JOIN matricula m ON m.id_matricula = a.fkMatricula
        JOIN turma t ON t.id_turma = m.fkTurma
        JOIN curso c ON c.id_curso = t.fkCurso
        WHERE c.fkInstituicao = ?
        AND a.data_avaliacao >= CASE 
            WHEN MONTH(NOW()) BETWEEN 1 AND 6 THEN DATE_FORMAT(NOW(), '%Y-01-01')
            ELSE DATE_FORMAT(NOW(), '%Y-07-01')
        END;
    `;
    
    console.log("Buscando % de alunos abaixo da média no último mês");
    return database.executar(instrucaoSql, [fkInstituicao]);
}


// KPI - Porcentagem taxa de abandono
function taxaAbandono(fkInstituicao) {
    const instrucaoSql = `
        SELECT 
            (SUM(CASE WHEN m.ativo = 0 THEN 1 ELSE 0 END) / COUNT(*)) * 100 
            AS percentual_taxa_abandono
        FROM matricula m
        JOIN turma t ON t.id_turma = m.fkTurma
        JOIN curso c ON c.id_curso = t.fkCurso
        WHERE c.fkInstituicao = ?
        AND m.data_atualizacao_status >= CASE 
            WHEN MONTH(NOW()) BETWEEN 1 AND 6 THEN DATE_FORMAT(NOW(), '%Y-01-01')
            ELSE DATE_FORMAT(NOW(), '%Y-07-01')
        END;
    `;
    console.log("Buscando taxa de abandono no último mês");
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
    
    console.log("Buscando novas matrículas no último mês");
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

    console.log("Buscando Top 5 cursos com maior risco de evasão");
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
    
    console.log("Buscando taxa de aprovação média no último mês");
    return database.executar(instrucaoSql, [fkInstituicao]);
}


function comparativoTotalAlunos(fkInstituicao) {
    const instrucaoSql = `
        SELECT
            atual,
            anterior,
            CASE WHEN anterior = 0 THEN NULL
                 ELSE ROUND(((atual - anterior) / anterior) * 100, 1)
            END AS variacaoPercent
        FROM (
            SELECT
                (SELECT COUNT(DISTINCT a.ra)
                 FROM matricula m
                 JOIN turma t ON m.fkTurma = t.id_turma
                 JOIN curso c ON t.fkCurso = c.id_curso
                 JOIN aluno a ON a.ra = m.fkAluno
                 WHERE m.ativo = 1
                   AND c.fkInstituicao = ?
                   AND m.data_matricula >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
                   AND m.data_matricula <= LAST_DAY(CURRENT_DATE)
                ) AS atual,

                (SELECT COUNT(DISTINCT a.ra)
                 FROM matricula m
                 JOIN turma t ON m.fkTurma = t.id_turma
                 JOIN curso c ON t.fkCurso = c.id_curso
                 JOIN aluno a ON a.ra = m.fkAluno
                 WHERE m.ativo = 1
                   AND c.fkInstituicao = ?
                   AND m.data_matricula >= DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m-01')
                   AND m.data_matricula <= LAST_DAY(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
                ) AS anterior
        ) AS sub;
    `;
    console.log("Comparativo de total de alunos (mês atual vs anterior)...");
    return database.executar(instrucaoSql, [fkInstituicao, fkInstituicao]);
}

function comparativoAbaixoMedia(fkInstituicao) {
    const instrucaoSql = `
        SELECT
            -- Semestre atual
            (SELECT 
                (SUM(CASE WHEN a.nota < 6 THEN 1 ELSE 0 END) / COUNT(*)) * 100
             FROM avaliacao a
             JOIN matricula m ON m.id_matricula = a.fkMatricula
             JOIN turma t ON t.id_turma = m.fkTurma
             JOIN curso c ON t.fkCurso = c.id_curso
             WHERE c.fkInstituicao = ?
               AND a.data_avaliacao >= CASE 
                   WHEN MONTH(NOW()) BETWEEN 1 AND 6 THEN DATE_FORMAT(NOW(), '%Y-01-01')
                   ELSE DATE_FORMAT(NOW(), '%Y-07-01')
               END
            ) AS atual,

            -- Semestre anterior
            (SELECT 
                (SUM(CASE WHEN a.nota < 6 THEN 1 ELSE 0 END) / COUNT(*)) * 100
             FROM avaliacao a
             JOIN matricula m ON m.id_matricula = a.fkMatricula
             JOIN turma t ON t.id_turma = m.fkTurma
             JOIN curso c ON t.fkCurso = c.id_curso
             WHERE c.fkInstituicao = ?
               AND a.data_avaliacao >= CASE 
                   WHEN MONTH(NOW()) BETWEEN 1 AND 6 THEN DATE_FORMAT(NOW(), '%Y-07-01')
                   ELSE DATE_FORMAT(NOW(), '%Y-01-01')
               END
               AND a.data_avaliacao < CASE 
                   WHEN MONTH(NOW()) BETWEEN 1 AND 6 THEN DATE_FORMAT(NOW(), '%Y-01-01')
                   ELSE DATE_FORMAT(NOW(), '%Y-07-01')
               END
            ) AS anterior
    `;
    
    return database.executar(instrucaoSql, [fkInstituicao, fkInstituicao]);
}


function comparativoTaxaAbandono(fkInstituicao) {
    const instrucaoSql = `
        SELECT 
            ROUND(COALESCE(abandono_atual, 0) * 100.0 / NULLIF(total_atual, 0), 2) AS atual,
            ROUND(COALESCE(abandono_anterior, 0) * 100.0 / NULLIF(total_anterior, 0), 2) AS anterior
        FROM (
            SELECT
                -- Alunos que entraram no semestre atual e hoje estão inativos
                (SELECT COUNT(*) 
                 FROM matricula m
                 JOIN turma t ON m.fkTurma = t.id_turma
                 JOIN curso c ON t.fkCurso = c.id_curso
                 WHERE c.fkInstituicao = ?
                   AND m.data_matricula >= '2025-07-01'
                   AND m.ativo = 0) AS abandono_atual,

                -- Total de alunos que entraram no semestre atual
                (SELECT COUNT(*) 
                 FROM matricula m
                 JOIN turma t ON m.fkTurma = t.id_turma
                 JOIN curso c ON t.fkCurso = c.id_curso
                 WHERE c.fkInstituicao = ?
                   AND m.data_matricula >= '2025-07-01') AS total_atual,

                -- Alunos que entraram no semestre anterior e hoje estão inativos
                (SELECT COUNT(*) 
                 FROM matricula m
                 JOIN turma t ON m.fkTurma = t.id_turma
                 JOIN curso c ON t.fkCurso = c.id_curso
                 WHERE c.fkInstituicao = ?
                   AND m.data_matricula >= '2025-01-01'
                   AND m.data_matricula < '2025-07-01'
                   AND m.ativo = 0) AS abandono_anterior,

                -- Total de alunos do semestre anterior
                (SELECT COUNT(*) 
                 FROM matricula m
                 JOIN turma t ON m.fkTurma = t.id_turma
                 JOIN curso c ON t.fkCurso = c.id_curso
                 WHERE c.fkInstituicao = ?
                   AND m.data_matricula >= '2025-01-01'
                   AND m.data_matricula < '2025-07-01') AS total_anterior
        ) AS sub;
    `;

    return database.executar(instrucaoSql, [fkInstituicao, fkInstituicao, fkInstituicao, fkInstituicao]);
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



module.exports = {
    totalAlunos,
    alunosAbaixoMedia,
    taxaAbandono,
    novasMatriculas,
    top5Evasao,
    taxaAprovacao,
    comparativoTotalAlunos,
    comparativoAbaixoMedia,
    comparativoTaxaAbandono,
    comparativoNovasMatriculas
    
}



