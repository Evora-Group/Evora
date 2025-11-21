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



module.exports = {
    totalAlunos,
    alunosAbaixoMedia,
    taxaAbandono,
    novasMatriculas
}





