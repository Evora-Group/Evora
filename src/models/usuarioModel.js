var database = require("../database/config");

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
    return database.executar("DELETE FROM aluno WHERE ra = ?", [raAluno]);
}

// EDITAR ALUNO (Com Status)
async function editarAluno(ra, nome, email, nomeTurma, ativo) {
    console.log("Model: Iniciando edição do Aluno", ra);

    // 1. Descobrir ID da Turma
    var queryTurma = `SELECT id_turma FROM turma WHERE nome_sigla = '${nomeTurma}' LIMIT 1`;
    var resultadoTurma = await database.executar(queryTurma);

    if (resultadoTurma.length === 0) {
        throw "Turma não encontrada! Verifique o nome.";
    }

    var idNovaTurma = resultadoTurma[0].id_turma;

    // 2. Atualizar dados pessoais
    var queryAluno = `
        UPDATE aluno 
        SET nome = '${nome}', email = '${email}' 
        WHERE ra = ${ra};
    `;
    await database.executar(queryAluno);

    // 3. Atualizar Matrícula (Turma e Status Ativo/Bloqueado)
    var queryMatricula = `
        UPDATE matricula 
        SET fkTurma = ${idNovaTurma}, ativo = ${ativo} 
        WHERE fkAluno = ${ra};
    `;
    
    return database.executar(queryMatricula);
}

// EDITAR PROFESSOR (Com Disciplina e Status)
async function editarUsuario(id, nome, email, ativo, nomeTurma, nomeDisciplina) {
    console.log("Model: Editando Professor", id);

    // 1. Atualizar dados pessoais e status na tabela USUARIO
    var queryUsuario = `
        UPDATE usuario 
        SET nome = '${nome}', email = '${email}', ativo = ${ativo} 
        WHERE id_usuario = ${id};
    `;
    await database.executar(queryUsuario);

    // 2. Se vier turma e disciplina, atualizamos o vínculo de aula
    if (nomeTurma && nomeDisciplina) {
        // Busca IDs
        var queryBuscaIds = `
            SELECT 
                (SELECT id_turma FROM turma WHERE nome_sigla = '${nomeTurma}' LIMIT 1) as id_turma,
                (SELECT id_disciplina FROM disciplina WHERE nome = '${nomeDisciplina}' LIMIT 1) as id_disciplina;
        `;
        var resultadoIds = await database.executar(queryBuscaIds);
        
        var idTurma = resultadoIds[0].id_turma;
        var idDisciplina = resultadoIds[0].id_disciplina;

        if (idTurma && idDisciplina) {
            // Atualiza a tabela usuario_turma para este professor
            // OBS: Isso atualiza TODOS os vínculos desse professor para essa nova turma/disciplina
            // Se o professor der muitas aulas diferentes, a lógica precisaria ser mais complexa (delete + insert).
            // Para este cenário, vamos assumir update simples:
            var queryVinculo = `
                UPDATE usuario_turma 
                SET fkTurma = ${idTurma}, fkDisciplina = ${idDisciplina} 
                WHERE fkUsuario = ${id};
            `;
            return database.executar(queryVinculo);
        }
    }
    
    return "Professor atualizado (sem alteração de turma/disciplina inválida)";
}

async function cadastrarAluno(ra, nome, email, nomeTurma) {
    console.log("Model: Cadastrando Aluno", nome);

    var queryTurma = `SELECT id_turma FROM turma WHERE nome_sigla = '${nomeTurma}' LIMIT 1`;
    var resultadoTurma = await database.executar(queryTurma);

    if (resultadoTurma.length === 0) {
        throw "Turma não encontrada!";
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

    var queryUsuario = `
        INSERT INTO usuario (fkInstituicao, nome, email, senha_hash, cargo, ativo) 
        VALUES (${idInstituicao}, '${nome}', '${email}', '${senha}', 'Professor', 1);
    `;
    
    var resultadoUsuario = await database.executar(queryUsuario);
    var idNovoProfessor = resultadoUsuario.insertId; 

    var queryBuscaIds = `
        SELECT 
            (SELECT id_turma FROM turma WHERE nome_sigla = '${nomeTurma}' LIMIT 1) as id_turma,
            (SELECT id_disciplina FROM disciplina WHERE nome = '${nomeDisciplina}' LIMIT 1) as id_disciplina;
    `;
    
    var resultadoIds = await database.executar(queryBuscaIds);
    var dadosIds = resultadoIds[0];

    if (dadosIds.id_turma == null) throw "Turma não encontrada!";
    if (dadosIds.id_disciplina == null) throw "Disciplina não encontrada!";

    var queryVinculo = `
        INSERT INTO usuario_turma (fkUsuario, fkTurma, fkDisciplina, dia_semana) 
        VALUES (${idNovoProfessor}, ${dadosIds.id_turma}, ${dadosIds.id_disciplina}, 'A definir');
    `;

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