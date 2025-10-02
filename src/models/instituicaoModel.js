var database = require("../database/config")

function listarInstituicoes() {

    var instrucaoSql = 
    `
    SELECT nome FROM Instituicao ORDER BY nome DESC;    
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);

}

function buscarInstituicao(nome) {

    var instrucaoSql = 
    `
    SELECT idInstituicao FROM Instituicao WHERE nome = "${nome}" LIMIT 1;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);

}


module.exports = {

    listarInstituicoes,
    buscarInstituicao

}