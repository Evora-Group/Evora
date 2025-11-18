const database = require("../database/config") 


// KPI - Total alunos
function totalAlunos(fkInstituicao){
    const instrucaoSql = `SELECT * FROM aluno WHERE fkInstituicao = ?`;
    console.log("Buscando total de alunos da instituição");
    return database.executar(instrucaoSql, [fkInstituicao]);
}

// KPI - Alunos Abaixo da Média
// ajustar regra para saber a media estabelecida pela instituição
function alunosAbaixoMedia(){
    const instrucaoSql = `
    SELECT 
    (SUM(CASE WHEN nota < 6 THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS percentual_media_baixa
    FROM Desempenho
    WHERE fkInstituicao = ?`;
    console.log("Buscando percentual de alunos abaixo da média na instituição")
    return database.executar(instrucaoSql, [fkInstituicao]);
}


// KPI - Porcentagem taxa de abandono













