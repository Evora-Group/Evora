var database = require("../database/config")
const bcrypt = require('bcrypt');

// Model com encriptacao do bcrypt
function cadastrar(nome, email, senha, cargo, instituicao) {
  
    // criptografa HASH entes de inserir no banco
    // Hash ANTES de inserir
    const saltRounds = 10; // Custo computacional (10-12 é recomendado)
    
    return bcrypt.hash(senha, saltRounds)
        .then((senhaHash) => {
            var instrucaoSql = `
                INSERT INTO Usuario (nome, email, senha, cargo, fkInstituicao) 
                VALUES (?, ?, ?, ?, ?);
            `;
            console.log("Executando cadastro para:", email);
            return database.executar(instrucaoSql, [nome, email, senhaHash, cargo, instituicao]);
        });
}


// Para LOGIN (comparar senhas)
function logar(email, senha) {
    var instrucaoSql = `
        SELECT idUsuario, nome, email, senha, cargo, fkInstituicao 
        FROM Usuario WHERE email = ?;
    `;
    
    return database.executar(instrucaoSql, [email])
        .then((resultados) => {

            if (resultados.length === 0) {
            
                return Promise.reject("Email não encontrado");
            
            }
            
            const usuario = resultados[0];
            
            // Compara senha fornecida com hash do banco
            return bcrypt.compare(senha, usuario.senha)
                .then((senhaCorreta) => {
                    if (senhaCorreta) {
                        // Remove senha do retorno (NUNCA envie hash para frontend)
                        delete usuario.senha;
                        return usuario;
                    } else {
                        return Promise.reject("Senha incorreta");
                    }
                });
        });
}

function validarEmail(email) {
    var instrucaoSql = `
        SELECT COUNT(*) as total FROM Usuario WHERE email = ?
    `;
    console.log("Executando validação de email:", email);
    return database.executar(instrucaoSql, [email]);
}

module.exports = {
    cadastrar,
    validarEmail,
    logar
}