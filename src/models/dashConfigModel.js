var database = require("../database/config");

function atualizarUsuario(idUsuario, nome, email, instituicao, cargo, senhaHash) {
    const instrucaoSql = `
        UPDATE usuario 
        SET 
            nome = COALESCE(?, nome),
            email = COALESCE(?, email),
            fkInstituicao = COALESCE(?, fkInstituicao),
            cargo = COALESCE(?, cargo),
            senha_hash = COALESCE(?, senha_hash)
        WHERE id_usuario = ?;
    `;

    return database.executar(instrucaoSql, [
        nome ?? null,
        email ?? null,
        instituicao ?? null,
        cargo ?? null,
        senhaHash ?? null,
        idUsuario
    ]);
}

module.exports = {
    atualizarUsuario
};
