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
        WHERE a.ra = ${raAluno};
        `;

    console.log("Executando busca de aluno de ra:", raAluno);
    return database.executar(instrucaoSql);
}

function buscarFrequenciaGeral(idUsuario) {
    const sql = `
        SELECT 
            a.ra,
            a.nome AS nomeAluno,
            COUNT(f.id_frequencia) AS totalAulas,
            SUM(f.presente) AS presencas,
            (SUM(f.presente) / COUNT(f.id_frequencia)) * 100 AS frequencia
        FROM usuario u
        JOIN instituicao i 
            ON i.id_instituicao = u.fkInstituicao
        JOIN curso c 
            ON c.fkInstituicao = i.id_instituicao
        JOIN turma t 
            ON t.fkCurso = c.id_curso
        JOIN matricula m 
            ON m.fkTurma = t.id_turma
        JOIN aluno a 
            ON a.ra = m.fkAluno
        LEFT JOIN frequencia f 
            ON f.fkMatricula = m.id_matricula
        WHERE u.id_usuario = ${idUsuario}
        
        GROUP BY a.ra, a.nome;
    `;
    return database.executar(sql);
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
    console.log("ACESSANDO MODEL: Buscando KPIs gerais (Faltas, Presenças, Notas, Médias)");
    
    const instrucaoSql = `
        SELECT 
            -- Contagens (já existiam)
            (SELECT COUNT(*) FROM frequencia f 
             JOIN matricula m ON f.fkMatricula = m.id_matricula 
             WHERE m.fkAluno = ${raAluno} AND f.presente = 1) AS total_presencas,
             
            (SELECT COUNT(*) FROM frequencia f 
             JOIN matricula m ON f.fkMatricula = m.id_matricula 
             WHERE m.fkAluno = ${raAluno} AND f.presente = 0) AS total_faltas,
             
            (SELECT COUNT(*) FROM avaliacao a 
             JOIN matricula m ON a.fkMatricula = m.id_matricula 
             WHERE m.fkAluno = ${raAluno}) AS total_notas,

            -- Média Geral (Igual da Lista de Admin)
            (SELECT IFNULL(AVG(nota), 0) FROM avaliacao a 
             JOIN matricula m ON a.fkMatricula = m.id_matricula 
             WHERE m.fkAluno = ${raAluno}) AS media_geral,

            -- Frequência Geral % (Igual da Lista de Admin)
            (SELECT IFNULL((SUM(presente) / COUNT(id_frequencia)) * 100, 0) 
             FROM frequencia f 
             JOIN matricula m ON f.fkMatricula = m.id_matricula 
             WHERE m.fkAluno = ${raAluno}) AS frequencia_geral;
    `;
    return database.executar(instrucaoSql);
}

// Adicione no module.exports:
function editarAluno(ra, novoCurso, novaTurma) {
    // novoCurso => id do curso (number/string que representa number)
    // novaTurma => nome_sigla da turma (string)
    const instrucao = `
        UPDATE matricula
        SET fkTurma = (
            SELECT id_turma
            FROM turma
            WHERE nome_sigla = '${novaTurma}'
              AND fkCurso = ${novoCurso}
            LIMIT 1
        )
        WHERE fkAluno = ${ra};
    `;

    console.log("Executando SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function criarAluno(ra, nome, email, telefone) {
    const instrucao = `
        INSERT INTO aluno (ra, nome, email, telefone)
        VALUES ('${ra}', '${nome}', '${email}', '${telefone}');
    `;

    console.log("Executando SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function criarMatricula(ra, turma, fkCurso) {
    const instrucao = `

         INSERT INTO matricula (fkAluno, fkTurma, data_matricula, ativo, data_atualizacao_status)
            VALUES (
                '${ra}',  -- sem aspas para não perder zeros à esquerda
                (
                    SELECT t.id_turma
                    FROM turma t
                    JOIN curso c ON c.id_curso = t.fkCurso
                    WHERE t.nome_sigla = '${turma}'
                    AND c.id_curso = '${fkCurso}'
                    LIMIT 1
                ),
                CURDATE(),
                1,
                NOW()
            );

    `;

    console.log("Executando SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function kpiFreqInstituicao(idInstituicao) {
    const instrucaoSql = `
        SELECT 
    ROUND(AVG(freqAluno.freq_percentual), 0) AS frequenciaGeral,
    SUM(CASE WHEN freqAluno.freq_percentual < 75 THEN 1 ELSE 0 END) AS emAtencao
FROM (
    SELECT
        a.ra,
        (SUM(f.presente) / COUNT(f.id_frequencia)) * 100 AS freq_percentual
    FROM aluno a
        JOIN matricula m ON m.fkAluno = a.ra
        JOIN turma t ON t.id_turma = m.fkTurma
        JOIN curso c ON c.id_curso = t.fkCurso
        JOIN frequencia f ON f.fkMatricula = m.id_matricula
    WHERE c.fkInstituicao = ${idInstituicao}
    
    GROUP BY a.ra
) AS freqAluno;

    `;

    return database.executar(instrucaoSql);
}



module.exports = {
    buscarAlunoPorRa,
    buscarFrequenciaGeral,
    listarCursosInstituicao,
    listarTurmasInstituicao,
    buscarDesempenhoPorRa,
    buscarDadosGerais,
    editarAluno,
    criarAluno,
    criarMatricula,
    kpiFreqInstituicao
}