var database = require("../database/config")

function cadastrar(nome, email, senha, cargo, instuicao){

        var instrucaoSql = `
        INSERT INTO Usuario (nome, email, senha, cargo, fkInstituicao) VALUES ("${nome}","${email}", md5("${senha}"), "${cargo}" ,"${instuicao}" );    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);

}

module.exports = {
    cadastrar
}