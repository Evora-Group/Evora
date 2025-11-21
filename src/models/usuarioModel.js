var database = require("../database/config")

// Função para remover Usuário (Professor/Admin)
async function removerUsuario(idUsuario) {
    console.log("Model: Iniciando remoção do usuário ID:", idUsuario);
   
    await database.executar("DELETE FROM usuario_turma WHERE fkUsuario = ?", [idUsuario]);

    return database.executar("DELETE FROM usuario WHERE id_usuario = ?", [idUsuario]);
}

// Função para remover Aluno
async function removerAluno(raAluno) {
    console.log("Model: Iniciando remoção do aluno RA:", raAluno);

    
    var idsMatriculas = await database.executar("SELECT id_matricula FROM matricula WHERE fkAluno = ?", [raAluno]);

   
    if (idsMatriculas.length > 0) {
      
        var listaIds = idsMatriculas.map(m => m.id_matricula).join(',');

       
        await database.executar(`DELETE FROM frequencia WHERE fkMatricula IN (${listaIds})`);

        await database.executar(`DELETE FROM avaliacao WHERE fkMatricula IN (${listaIds})`);

        await database.executar("DELETE FROM matricula WHERE fkAluno = ?", [raAluno]);
    }

    // PASSO 2: Finalmente, remove o aluno da tabela principal
    return database.executar("DELETE FROM aluno WHERE ra = ?", [raAluno]);
}


module.exports = {
    removerUsuario,
    removerAluno
};
