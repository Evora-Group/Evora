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

module.exports = {
    listarInstituicoes,
    buscarInstituicao
}