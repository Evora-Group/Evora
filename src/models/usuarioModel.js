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



async function editarAluno(ra, nome, email, nomeTurma) {
    console.log("Model: Iniciando edição do Aluno", ra);

    // PASSO 1: Descobrir o ID da turma baseada no nome (sigla) que veio do input
    // Ex: O usuário digitou "ADS2024A", precisamos do ID dela (ex: 50)
    var queryTurma = `SELECT id_turma FROM turma WHERE nome_sigla = '${nomeTurma}' LIMIT 1`;
    var resultadoTurma = await database.executar(queryTurma);

    // Validação: Se a turma não existir, paramos o processo
    if (resultadoTurma.length === 0) {
        throw "Turma não encontrada! Verifique se digitou o nome corretamente.";
    }

    var idNovaTurma = resultadoTurma[0].id_turma;

    // PASSO 2: Atualizar os dados pessoais do Aluno
    var queryAluno = `
        UPDATE aluno 
        SET nome = '${nome}', email = '${email}' 
        WHERE ra = ${ra};
    `;
    await database.executar(queryAluno);

    // PASSO 3: Atualizar a Matrícula para a nova turma
    // Atualizamos a FK turma onde a FK aluno é o RA que estamos editando
    var queryMatricula = `
        UPDATE matricula 
        SET fkTurma = ${idNovaTurma} 
        WHERE fkAluno = ${ra};
    `;
    
    return database.executar(queryMatricula);
}

function editarUsuario(id, nome, email) {
    console.log("Model: Editando Professor", id);
    var instrucao = `
        UPDATE usuario 
        SET nome = '${nome}', email = '${email}' 
        WHERE id_usuario = ${id};
    `;
    return database.executar(instrucao);
}



async function cadastrarAluno(ra, nome, email, nomeTurma) {
    console.log("Model: Cadastrando Aluno", nome);

    var queryTurma = `SELECT id_turma FROM turma WHERE nome_sigla = '${nomeTurma}' LIMIT 1`;
    var resultadoTurma = await database.executar(queryTurma);

    if (resultadoTurma.length === 0) {
        throw "Turma não encontrada! Verifique o nome da turma.";
    }

    var idTurma = resultadoTurma[0].id_turma;

    var queryAluno = `
        INSERT INTO aluno (ra, nome, email) 
        VALUES ('${ra}', '${nome}', '${email}');
    `;
    await database.executar(queryAluno);

    var queryMatricula = `
        INSERT INTO matricula (fkAluno, fkTurma, data_matricula, ativo) 
        VALUES ('${ra}', ${idTurma}, NOW(), 1);
    `;
    
    return database.executar(queryMatricula);
}



async function cadastrarProfessor(nome, email, senha, nomeTurma, nomeDisciplina, idInstituicao) {
    console.log("Model: Iniciando cadastro do Professor:", nome);

    // PASSO 1: Inserir o Usuário na tabela 'usuario'
    // OBS: Em produção, a senha deve ser criptografada (ex: MD5 ou SHA256)
    var queryUsuario = `
        INSERT INTO usuario (fkInstituicao, nome, email, senha_hash, cargo, ativo) 
        VALUES (${idInstituicao}, '${nome}', '${email}', '${senha}', 'Professor', 1);
    `;
    
    // Executa e pega o resultado para obter o ID gerado (insertId)
    var resultadoUsuario = await database.executar(queryUsuario);
    var idNovoProfessor = resultadoUsuario.insertId; 

    console.log("Usuário criado com ID:", idNovoProfessor);

    // PASSO 2: Descobrir o ID da Turma e da Disciplina baseados nos nomes passados
    // Fazemos duas subqueries num único SELECT para ser mais rápido
    var queryBuscaIds = `
        SELECT 
            (SELECT id_turma FROM turma WHERE nome_sigla = '${nomeTurma}' LIMIT 1) as id_turma,
            (SELECT id_disciplina FROM disciplina WHERE nome = '${nomeDisciplina}' LIMIT 1) as id_disciplina;
    `;
    
    var resultadoIds = await database.executar(queryBuscaIds);
    var dadosIds = resultadoIds[0];

    // Validação: Se não achou a turma ou a disciplina, cancelamos (lançamos erro)
    // Nota: O usuário inserido no passo 1 ficará no banco, mas sem vínculo de aula.
    if (dadosIds.id_turma == null) {
        throw "Turma não encontrada! Verifique o nome digitado.";
    }
    if (dadosIds.id_disciplina == null) {
        throw "Disciplina não encontrada! Verifique o nome digitado.";
    }

    // PASSO 3: Inserir o vínculo na tabela 'usuario_turma'
    var queryVinculo = `
        INSERT INTO usuario_turma (fkUsuario, fkTurma, fkDisciplina, dia_semana) 
        VALUES (${idNovoProfessor}, ${dadosIds.id_turma}, ${dadosIds.id_disciplina}, 'A definir');
    `;

    console.log("Criando vínculo na usuario_turma...");
    return database.executar(queryVinculo);
}


module.exports = {
    removerUsuario,
    removerAluno,
    editarAluno,
    editarUsuario,
    cadastrarAluno,
    cadastrarProfessor
};
