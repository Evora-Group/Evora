const database = require("../database/config") 


// KPI - Total alunos
function totalAlunos(fkInstituicao) {
    const instrucaoSql = `
        SELECT COUNT(DISTINCT a.ra) AS TotalAlunos
        FROM aluno a
        JOIN matricula m ON m.fkAluno = a.ra
        JOIN turma t ON t.id_turma = m.fkTurma
        JOIN curso c ON c.id_curso = t.fkCurso
        WHERE c.fkInstituicao = ?
        AND a.data_cadastro >= DATE_SUB(NOW(), INTERVAL 30 DAY);
    `;
    
    console.log("Buscando total de alunos no último mês");
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
        AND a.data_avaliacao >= DATE_SUB(NOW(), INTERVAL 30 DAY);
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
        AND m.data_atualizacao_status >= DATE_SUB(NOW(), INTERVAL 30 DAY);
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
        AND m.data_matricula >= DATE_SUB(NOW(), INTERVAL 30 DAY);
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
    const sql = `
        SELECT 
            -- Hoje: todos com ativo = 1
            (SELECT COUNT(*) FROM matricula m 
             JOIN turma t ON m.fkTurma = t.id_turma 
             JOIN curso c ON t.fkCurso = c.id_curso 
             WHERE c.fkInstituicao = ? AND m.ativo = 1) AS alunos_mes_atual,

            --,  -- Mês passado: todos que estavam ativos ANTES do dia 1 deste mês
            (SELECT COUNT(*) FROM matricula m 
             JOIN turma t ON m.fkTurma = t.id_turma 
             JOIN curso c ON t.fkCurso = c.id_curso 
             WHERE c.fkInstituicao = ? 
               AND m.ativo = 1
               AND (m.data_atualizacao_status < DATE_FORMAT(CURDATE(), '%Y-%m-01') 
                 OR m.data_atualizacao_status IS NULL)) AS alunos_mes_anterior;
    `;
    return database.executar(sql, [fkInstituicao, fkInstituicao]);
}


module.exports = {
    totalAlunos,
    alunosAbaixoMedia,
    taxaAbandono,
    novasMatriculas,
    top5Evasao,
    taxaAprovacao,
    comparativoTotalAlunos
    
}





