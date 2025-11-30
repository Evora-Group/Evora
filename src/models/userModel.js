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
                INSERT INTO usuario (nome, email, senha_hash, cargo, fkInstituicao, ativo) 
                VALUES (?, ?, ?, ?, ?, 1);
            `;
            console.log("Executando cadastro para:", email);
            return database.executar(instrucaoSql, [nome, email, senhaHash, cargo, instituicao]);
        });
}


// Para LOGIN (comparar senhas)
function logar(email, senha) {
    var instrucaoSql = `
       SELECT 
        u.id_usuario,
        u.nome,
        u.email,
        u.senha_hash,
        u.cargo,
        u.fkInstituicao,
        i.nome AS nomeInstituicao
    FROM usuario u
    JOIN instituicao i ON i.id_instituicao = u.fkInstituicao
    WHERE u.email = ?;`
    
    return database.executar(instrucaoSql, [email])
        .then((resultados) => {

            if (resultados.length === 0) {
            
                return Promise.reject("Email não encontrado");
            
            }
            
            const usuario = resultados[0];
            
            // Compara senha fornecida com hash do banco
            return bcrypt.compare(senha, usuario.senha_hash)
                .then((senhaCorreta) => {
                    if (senhaCorreta) {
                        // Remove senha do retorno (NUNCA envie hash para frontend)
                        delete usuario.senha_hash;
                        return usuario;
                    } else {
                        return Promise.reject("Senha incorreta");
                    }
                });
        });
}

function validarEmail(email) {
    var instrucaoSql = `
        SELECT COUNT(*) as total FROM usuario WHERE email = ?
    `;
    console.log("Executando validação de email:", email);
    return database.executar(instrucaoSql, [email]);
}

module.exports = {
    cadastrar,
    validarEmail,
    logar
}