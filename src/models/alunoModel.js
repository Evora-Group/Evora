var database = require("../database/config");

function buscarAlunoPorRa(raAluno) {
    console.log("ACESSANDO MODEL: buscando aluno por ra", raAluno);
    const instrucaoSql = `
        SELECT 
            a.ra,
            a.nome,
            a.email,
            t.nome_sigla AS turma,
            c.nome AS curso,
            c.id_curso AS idCurso,
            i.nome AS instituicaoNome
        FROM aluno a
        INNER JOIN matricula m ON a.ra = m.fkAluno
        INNER JOIN turma t ON m.fkTurma = t.id_turma
        INNER JOIN curso c ON t.fkCurso = c.id_curso
        INNER JOIN instituicao i ON c.fkInstituicao = i.id_instituicao
        WHERE a.ra = ${raAluno};`;

    console.log("Executando busca de aluno de ra:", raAluno);
    return database.executar(instrucaoSql);
}

// função para o select de cursos
function listarCursosInstituicao(fkInstituicao) {
    console.log("ACESSANDO MODEL: listando cursos disponíveis da instituição", fkInstituicao);
    const instrucaoSql = `
        SELECT id_curso, nome 
        FROM Curso 
        WHERE fkInstituicao = ${fkInstituicao};
    `;

    console.log("Executando lista de cursos da instituicao:", fkInstituicao);
    return database.executar(instrucaoSql);
}

// models/alunoModel.js (Adicione esta função)

function listarTurmasInstituicao(fkInstituicao) {
    console.log("ACESSANDO MODEL: listando turmas distintas da instituição", fkInstituicao);
    // Busca todas as turmas DISTINTAS cadastradas na tabela Matricula para a Instituição
    const instrucaoSql = `
        SELECT DISTINCT nome_sigla
        FROM turma t
        INNER JOIN Curso c ON t.fkCurso = c.id_curso 
        INNER JOIN Instituicao i ON c.fkInstituicao = i.id_instituicao
        WHERE c.fkInstituicao = ${fkInstituicao};
    `;

    console.log("Executando lista de turmas da instituicao:", fkInstituicao);
    return database.executar(instrucaoSql);
}

function buscarDesempenhoPorRa(raAluno, fkInstituicao) {
    console.log("ACESSANDO MODEL: Calculando desempenho (Notas e Frequência)", raAluno);
    
    // Esta query é complexa: ela pega as disciplinas do curso do aluno
    // e calcula a MÉDIA das notas na tabela 'avaliacao'
    // e a PORCENTAGEM de presença na tabela 'frequencia'
    const instrucaoSql = `
        SELECT 
            d.nome AS disciplina,
            TRUNCATE(IFNULL(AVG(av.nota), 0), 1) AS nota,
            TRUNCATE(IFNULL((SUM(f.presente) / COUNT(f.id_frequencia)) * 100, 0), 0) AS frequencia
        FROM matricula m
        JOIN turma t ON m.fkTurma = t.id_turma
        JOIN curso c ON t.fkCurso = c.id_curso
        JOIN grade_curricular gc ON c.id_curso = gc.fkCurso
        JOIN disciplina d ON gc.fkDisciplina = d.id_disciplina
        LEFT JOIN avaliacao av ON m.id_matricula = av.fkMatricula AND d.id_disciplina = av.fkDisciplina
        LEFT JOIN frequencia f ON m.id_matricula = f.fkMatricula AND d.id_disciplina = f.fkDisciplina
        WHERE m.fkAluno = ${raAluno} AND c.fkInstituicao = ${fkInstituicao}
        GROUP BY d.id_disciplina, d.nome;
    `;

    console.log("Executando query de desempenho...");
    return database.executar(instrucaoSql);
}


function buscarDadosGerais(raAluno) {
    console.log("ACESSANDO MODEL: Buscando KPIs gerais (Faltas, Presenças, Notas)");
    const instrucaoSql = `
        SELECT 
            (SELECT COUNT(*) FROM frequencia f 
             JOIN matricula m ON f.fkMatricula = m.id_matricula 
             WHERE m.fkAluno = ${raAluno} AND f.presente = 1) AS total_presencas,
             
            (SELECT COUNT(*) FROM frequencia f 
             JOIN matricula m ON f.fkMatricula = m.id_matricula 
             WHERE m.fkAluno = ${raAluno} AND f.presente = 0) AS total_faltas,
             
            (SELECT COUNT(*) FROM avaliacao a 
             JOIN matricula m ON a.fkMatricula = m.id_matricula 
             WHERE m.fkAluno = ${raAluno}) AS total_notas;
    `;
    return database.executar(instrucaoSql);
}

// Adicione no module.exports:
module.exports = {
    buscarAlunoPorRa,
    listarCursosInstituicao,
    listarTurmasInstituicao,
    buscarDesempenhoPorRa,
    buscarDadosGerais 
}