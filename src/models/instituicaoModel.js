var database = require("../database/config");

function listarAlunosInstituicao(idInstituicao, limit, offset, filtro) {
    
    let condicaoBusca = "";
    
    if (filtro) {
        
        const filtroLowerCase = filtro.toLowerCase();

        // 1. Definição das Subconsultas (Nota e Frequência)
        const subqueryMediaNota = `(SELECT AVG(av.nota) FROM avaliacao av WHERE av.fkMatricula = m.id_matricula)`;
        // CORREÇÃO DA FREQUÊNCIA: Soma Presenças (presente=1) / Total Aulas * 100
        const subqueryMediaFrequencia = `(
            (SELECT SUM(CASE WHEN f.presente = 1 THEN 1 ELSE 0 END) FROM frequencia f WHERE f.fkMatricula = m.id_matricula) 
            / (SELECT COUNT(f.id_frequencia) FROM frequencia f WHERE f.fkMatricula = m.id_matricula) 
            * 100
        )`;
        
        // 2. Tradução dos Termos de Desempenho para Condições SQL
        
        // Regras para SQL:
        const STATUS_OTIMO = `(${subqueryMediaNota} >= 8 AND ${subqueryMediaFrequencia} >= 75)`;
        
        // ATENÇÃO: (Nota < 6) OU (Freq < 75) OU (Dados NULOS)
        const STATUS_ATENCAO = `(
            ${subqueryMediaNota} < 6 OR 
            ${subqueryMediaFrequencia} < 75 OR 
            ${subqueryMediaNota} IS NULL OR 
            ${subqueryMediaFrequencia} IS NULL
        )`;
        
        // REGULAR: (6 <= Nota < 8) E (Freq >= 75)
        const STATUS_REGULAR = `(
            ${subqueryMediaNota} >= 6 AND 
            ${subqueryMediaNota} < 8 AND 
            ${subqueryMediaFrequencia} >= 75
        )`;
        
        let filtroDesempenho = '';
        let isDesempenhoFilter = false; 

        // Tenta traduzir o termo para uma condição de desempenho
        if (filtroLowerCase === 'ótimo' || filtroLowerCase === 'excelente') {
            filtroDesempenho = STATUS_OTIMO;
            isDesempenhoFilter = true;
        } else if (filtroLowerCase === 'atenção' || filtroLowerCase === 'baixo' || filtroLowerCase === 'nulo') {
            filtroDesempenho = STATUS_ATENCAO;
            isDesempenhoFilter = true;
        } else if (filtroLowerCase === 'regular') {
            filtroDesempenho = STATUS_REGULAR;
            isDesempenhoFilter = true;
        } 
        
        // 3. CONDIÇÃO GERAL (Decide se filtra por Desempenho OU por Nome/RA)
        condicaoBusca = ` AND (`;

        if (isDesempenhoFilter) {
            // Se o usuário digitou 'atencao' ou 'ótimo', filtra APENAS pela condição de desempenho
            condicaoBusca += filtroDesempenho;
        } else {
            // Caso contrário (é um Nome ou RA), filtra por LIKE
            // Nota: Adicione `replace(/'/g, "''")` se for usar o LIKE diretamente sem parâmetros preparados.
            condicaoBusca += `
                a.nome LIKE '%${filtro}%' OR 
                a.ra LIKE '%${filtro}%'
            `;
        }
        
        condicaoBusca += `)`; // Fecha o AND principal
    }

    // 4. Query da Lista (INCLUI media_frequencia no SELECT)
    var instrucaoSql = `
        SELECT 
            a.ra, a.nome, a.email, t.nome_sigla AS turma, c.nome AS curso,
            (SELECT AVG(av.nota) FROM avaliacao av WHERE av.fkMatricula = m.id_matricula) as media_notas,
            (
                (SELECT SUM(CASE WHEN f.presente = 1 THEN 1 ELSE 0 END) FROM frequencia f WHERE f.fkMatricula = m.id_matricula) 
                / (SELECT COUNT(f.id_frequencia) FROM frequencia f WHERE f.fkMatricula = m.id_matricula) 
                * 100
            ) as media_frequencia 
        FROM aluno a
        INNER JOIN matricula m ON a.ra = m.fkAluno
        INNER JOIN turma t ON m.fkTurma = t.id_turma
        INNER JOIN curso c ON t.fkCurso = c.id_curso
        WHERE c.fkInstituicao = ${idInstituicao}
        AND m.ativo = 1
        ${condicaoBusca}
        LIMIT ${limit} OFFSET ${offset};
    `;

    // 5. Query do Total (APLICA A MESMA CONDICAO DE BUSCA)
    var instrucaoTotal = `
        SELECT COUNT(a.ra) as total 
        FROM aluno a
        JOIN matricula m ON a.ra = m.fkAluno
        JOIN turma t ON m.fkTurma = t.id_turma
        JOIN curso c ON t.fkCurso = c.id_curso
        WHERE c.fkInstituicao = ${idInstituicao}
        AND m.ativo = 1
        ${condicaoBusca}; 
    `;

    // 6. Execução e Tratamento
    return Promise.all([
        database.executar(instrucaoSql),
        database.executar(instrucaoTotal)
    ]).then(function (resultados) {
        
        const tratarAlunos = (lista) => {
            return lista.map(aluno => {
                let status = 'Regular';
                const mediaNota = parseFloat(aluno.media_notas);
                const mediaFreq = parseFloat(aluno.media_frequencia);

                // Lógica de Desempenho no Frontend (Para renderizar o status)
                if ((!mediaNota && mediaNota !== 0) || 
                    (!mediaFreq && mediaFreq !== 0) || 
                    mediaNota < 6 || 
                    mediaFreq < 75) {
                    status = 'Atenção';
                } 
                else if (mediaNota >= 8 && mediaFreq >= 75) {
                    status = 'Ótimo';
                }

                return { 
                    ...aluno, 
                    desempenho: status 
                };
            });
        };

        return {
            data: tratarAlunos(resultados[0]),
            totalItems: resultados[1][0].total
        };
    });
}

// NOVA FUNÇÃO: Executa apenas os cálculos pesados
function obterKpisAlunos(idInstituicao) {
    // 3. KPI Desempenho (CORRIGIDO: Trata NULL como 0)
    var instrucaoKpiNotas = `
        SELECT 
            SUM(CASE WHEN sub.media < 6 THEN 1 ELSE 0 END) as kpi_atencao,
            SUM(CASE WHEN sub.media >= 6 AND sub.media < 8 THEN 1 ELSE 0 END) as kpi_regular,
            SUM(CASE WHEN sub.media >= 8 THEN 1 ELSE 0 END) as kpi_otimo
        FROM (
            SELECT 
                -- COALESCE garante que se a média for NULL (aluno novo), vire 0
                COALESCE(AVG(av.nota), 0) as media 
            FROM matricula m
            JOIN turma t ON m.fkTurma = t.id_turma
            JOIN curso c ON t.fkCurso = c.id_curso
            LEFT JOIN avaliacao av ON av.fkMatricula = m.id_matricula
            WHERE c.fkInstituicao = ${idInstituicao}
            AND m.ativo = 1
            GROUP BY m.id_matricula
        ) as sub;
    `;

    // 4. KPI Frequência (CORRIGIDO: Usa LEFT JOIN e trata NULL como 0)
    var instrucaoKpiFreq = `
        SELECT 
            ROUND(AVG(sub.freq), 0) as frequencia_geral,
            COUNT(CASE WHEN sub.freq < 75 THEN 1 END) as kpi_atencao_freq
        FROM (
            SELECT 
                -- Se não tiver chamada (COUNT = 0), define frequência como 0
                COALESCE(
                    (SUM(CASE WHEN f.presente = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(f.id_frequencia), 0)) * 100, 
                0) as freq
            FROM matricula m
            JOIN turma t ON m.fkTurma = t.id_turma
            JOIN curso c ON t.fkCurso = c.id_curso
            -- LEFT JOIN para incluir alunos sem chamada registrada
            LEFT JOIN frequencia f ON f.fkMatricula = m.id_matricula
            WHERE c.fkInstituicao = ${idInstituicao}
            AND m.ativo = 1
            GROUP BY m.id_matricula
        ) as sub;
    `;

    return Promise.all([
        database.executar(instrucaoKpiNotas),
        database.executar(instrucaoKpiFreq)
    ]).then(function (resultados) {
        return {
            kpiStats: resultados[0][0],
            freqStats: resultados[1][0] || { frequencia_geral: 0, kpi_atencao_freq: 0 }
        };
    });
}

function listarInstituicoes() { return database.executar(`SELECT id_instituicao, nome FROM instituicao ORDER BY nome DESC;`); }
function buscarInstituicao(nome) { return database.executar(`SELECT id_instituicao FROM instituicao WHERE nome = ? LIMIT 1;`, [nome]); }


function listarUsuariosInstituicao(idInstituicao, page = 1, limit = 10, busca = '') {
    const offset = (page - 1) * limit;
    
    // Filtro APENAS para a busca e paginação
    let filtroBusca = '';
    if (busca) {
        filtroBusca = `WHERE nome LIKE '%${busca}%' OR id LIKE '%${busca}%'`;
    }

    // 1. QUERY DE DADOS (Tabela) - Usa o Filtro
    const instrucaoSql = `
        SELECT * FROM (
            SELECT 
                U.id_usuario AS id, U.nome, U.email, 'Professor' AS tipo, 
                (SELECT GROUP_CONCAT(DISTINCT T.nome_sigla SEPARATOR ', ') FROM usuario_turma UT JOIN turma T ON UT.fkTurma = T.id_turma WHERE UT.fkUsuario = U.id_usuario) AS turma, 
                (SELECT GROUP_CONCAT(DISTINCT C.nome SEPARATOR ', ') FROM usuario_turma UT JOIN turma T ON UT.fkTurma = T.id_turma JOIN curso C ON T.fkCurso = C.id_curso WHERE UT.fkUsuario = U.id_usuario) AS curso, 
                I.nome AS instituicao, CASE WHEN U.ativo = 1 THEN 'liberado' ELSE 'bloqueado' END AS situacao 
            FROM usuario U JOIN instituicao I ON U.fkInstituicao = I.id_instituicao 
            WHERE I.id_instituicao = ${idInstituicao} AND U.cargo = 'Professor'
            UNION ALL 
            SELECT 
                A.ra AS id, A.nome, A.email, 'Aluno' AS tipo, T.nome_sigla AS turma, C.nome AS curso, I.nome AS instituicao, CASE WHEN M.ativo = 1 THEN 'liberado' ELSE 'bloqueado' END AS situacao 
            FROM aluno A JOIN matricula M ON A.ra = M.fkAluno JOIN turma T ON M.fkTurma = T.id_turma JOIN curso C ON T.fkCurso = C.id_curso JOIN instituicao I ON C.fkInstituicao = I.id_instituicao 
            WHERE I.id_instituicao = ${idInstituicao}
        ) AS TabelaUnificada
        ${filtroBusca} 
        ORDER BY tipo DESC, nome ASC
        LIMIT ${limit} OFFSET ${offset};
    `;

    // 2. QUERY PARA PAGINAÇÃO - Usa o Filtro
    // Serve para saber quantas páginas gerar baseado no que o usuário pesquisou
    const instrucaoTotalBusca = `
        SELECT COUNT(*) as total_busca FROM (
             SELECT U.nome, U.id_usuario as id FROM usuario U WHERE U.fkInstituicao = ${idInstituicao} AND U.cargo = 'Professor'
             UNION ALL
             SELECT A.nome, A.ra as id FROM aluno A JOIN matricula M ON A.ra = M.fkAluno JOIN turma T ON M.fkTurma = T.id_turma JOIN curso C ON T.fkCurso = C.id_curso WHERE C.fkInstituicao = ${idInstituicao}
        ) AS TabelaBusca
        ${filtroBusca};
    `;

    // 3. QUERY PARA KPIS (DASHBOARD) - NÃO Usa o Filtro (Sempre traz o total real)
    const instrucaoKpisGlobal = `
        SELECT 
            COUNT(*) as total_geral,
            SUM(CASE WHEN tipo = 'Professor' THEN 1 ELSE 0 END) as qtd_professores,
            SUM(CASE WHEN tipo = 'Aluno' THEN 1 ELSE 0 END) as qtd_alunos,
            SUM(CASE WHEN situacao = 'bloqueado' THEN 1 ELSE 0 END) as qtd_bloqueados,
            SUM(CASE WHEN situacao = 'liberado' THEN 1 ELSE 0 END) as qtd_liberados
        FROM (
             SELECT 'Professor' as tipo, CASE WHEN U.ativo = 1 THEN 'liberado' ELSE 'bloqueado' END AS situacao
             FROM usuario U WHERE U.fkInstituicao = ${idInstituicao} AND U.cargo = 'Professor'
             UNION ALL
             SELECT 'Aluno' as tipo, CASE WHEN M.ativo = 1 THEN 'liberado' ELSE 'bloqueado' END AS situacao
             FROM aluno A JOIN matricula M ON A.ra = M.fkAluno JOIN turma T ON M.fkTurma = T.id_turma JOIN curso C ON T.fkCurso = C.id_curso WHERE C.fkInstituicao = ${idInstituicao}
        ) AS TabelaKpi;
    `;

    return Promise.all([
        database.executar(instrucaoSql),
        database.executar(instrucaoTotalBusca),
        database.executar(instrucaoKpisGlobal)
    ]);
}



function listarCursosInstituicao(idInstituicao, limit, offset, q, professor, situacao) {
    limit = limit ? parseInt(limit) : 15; offset = offset ? parseInt(offset) : 0;
    let whereExtra = ''; let paramsCount = [idInstituicao]; let paramsSelect = [idInstituicao];
    if (q && q.trim()) {
        if (/^\d+$/.test(q.trim())) { whereExtra += ' AND (C.id_curso = ? OR C.nome LIKE ?)'; paramsCount.push(q.trim(), '%'+q.trim()+'%'); paramsSelect.push(q.trim(), '%'+q.trim()+'%'); }
        else { whereExtra += ' AND (C.nome LIKE ?)'; paramsCount.push('%'+q.trim()+'%'); paramsSelect.push('%'+q.trim()+'%'); }
    }
    if (professor && professor.trim()) { whereExtra += ' AND EXISTS(SELECT 1 FROM turma T JOIN usuario_turma UT ON T.id_turma = UT.fkTurma JOIN usuario U ON UT.fkUsuario = U.id_usuario WHERE T.fkCurso = C.id_curso AND U.cargo = "Professor" AND U.nome LIKE ?)'; paramsCount.push('%'+professor.trim()+'%'); paramsSelect.push('%'+professor.trim()+'%'); }
    if (situacao && situacao.trim()) {
        if (situacao === 'liberado') whereExtra += ' AND EXISTS(SELECT 1 FROM turma T2 JOIN usuario_turma UT2 ON T2.id_turma = UT2.fkTurma JOIN usuario U2 ON UT2.fkUsuario = U2.id_usuario WHERE T2.fkCurso = C.id_curso AND U2.cargo = "Professor")';
        else if (situacao === 'bloqueado') whereExtra += ' AND NOT EXISTS(SELECT 1 FROM turma T2 JOIN usuario_turma UT2 ON T2.id_turma = UT2.fkTurma JOIN usuario U2 ON UT2.fkUsuario = U2.id_usuario WHERE T2.fkCurso = C.id_curso AND U2.cargo = "Professor")';
    }
    var countSql = `SELECT COUNT(*) AS total FROM curso C WHERE C.fkInstituicao = ? ${whereExtra}`;
    var selectSql = `SELECT C.id_curso AS id, C.id_curso, C.nome, IFNULL(C.descricao, '-') AS descricao, IFNULL(C.modalidade, '-') AS modalidade, C.duracao_semestres, (SELECT IFNULL(COUNT(DISTINCT M.fkAluno), 0) FROM turma T JOIN matricula M ON T.id_turma = M.fkTurma WHERE T.fkCurso = C.id_curso) AS quantidade_alunos, (SELECT IFNULL(COUNT(DISTINCT UT.fkUsuario), 0) FROM turma T2 JOIN usuario_turma UT ON T2.id_turma = UT.fkTurma JOIN usuario U ON UT.fkUsuario = U.id_usuario WHERE T2.fkCurso = C.id_curso AND U.cargo = 'Professor') AS num_professores FROM curso C WHERE C.fkInstituicao = ? ${whereExtra} ORDER BY C.nome LIMIT ? OFFSET ?;`;
    return database.executar(countSql, paramsCount).then(c => { var t = (c && c.length) ? c[0].total : 0; paramsSelect.push(limit, offset); return database.executar(selectSql, paramsSelect).then(r => ({ total: t, cursos: r })); });
}

function listarCursosInstituicaoSimples(id) { return listarCursosInstituicao(id, 100, 0, '', '', ''); }
function listarTurmasInstituicao(id) { return database.executar(`SELECT t.id_turma, t.nome_sigla, t.ano, t.semestre, t.periodo, c.nome AS nome_curso FROM turma t JOIN curso c ON t.fkCurso = c.id_curso WHERE c.fkInstituicao = ? ORDER BY t.ano DESC, t.semestre DESC, t.nome_sigla;`, [id]); }
function listarDisciplinasPorInstituicao(id) { return database.executar(`SELECT nome FROM disciplina WHERE fkInstituicao = ? ORDER BY nome ASC;`, [id]); }

function listarAlunosAlerta(id, tipo, limit, offset) {
    const baseSql = `SELECT a.ra, a.nome, a.email, t.nome_sigla AS turma, c.nome AS curso, (SELECT IFNULL(AVG(av.nota), 0) FROM avaliacao av JOIN matricula m2 ON av.fkMatricula = m2.id_matricula WHERE m2.fkAluno = a.ra) AS media_nota, (SELECT IFNULL((SUM(f.presente) / COUNT(f.id_frequencia)) * 100, 0) FROM frequencia f JOIN matricula m3 ON f.fkMatricula = m3.id_matricula WHERE m3.fkAluno = a.ra) AS frequencia FROM aluno a JOIN matricula m ON a.ra = m.fkAluno JOIN turma t ON m.fkTurma = t.id_turma JOIN curso c ON t.fkCurso = c.id_curso WHERE c.fkInstituicao = ? AND m.ativo = 1`;
    let filtro = (tipo === 'preocupante') ? 'WHERE base.media_nota < 6 AND base.frequencia < 75' : (tipo === 'atencao' ? 'WHERE (base.media_nota >= 5 AND base.media_nota < 6) OR (base.frequencia >= 70 AND base.frequencia < 75)' : 'WHERE 1=0');
    return database.executar(`SELECT COUNT(*) AS total FROM (${baseSql}) AS base ${filtro}`, [id]).then(c => { var t = (c&&c.length)?c[0].total:0; return database.executar(`SELECT base.*, CASE WHEN base.media_nota < 6 AND base.frequencia < 75 THEN 'Média e presença baixas' WHEN base.media_nota < 6 THEN 'Média baixa' WHEN base.frequencia < 75 THEN 'Presença baixa' ELSE '-' END AS descricao FROM (${baseSql}) AS base ${filtro} ORDER BY base.nome LIMIT ? OFFSET ?`, [id, limit, offset]).then(a => ({total: t, alunos: a})); });
}

function criarCurso(id, c) { return database.executar(`INSERT INTO curso (fkInstituicao, nome, descricao, modalidade, duracao_semestres) VALUES (?, ?, ?, ?, ?)`, [id, c.nome, c.descricao||null, c.modalidade||null, c.duracao_semestres||null]); }
function editarCurso(id, c) { return database.executar(`UPDATE curso SET nome=?, descricao=?, modalidade=?, duracao_semestres=? WHERE id_curso=?`, [c.nome, c.descricao||null, c.modalidade||null, c.duracao_semestres||null, id]); }
async function deletarCurso(id) { await database.executar(`DELETE av FROM avaliacao av INNER JOIN matricula m ON av.fkMatricula=m.id_matricula INNER JOIN turma t ON m.fkTurma=t.id_turma WHERE t.fkCurso=?`, [id]); await database.executar(`DELETE f FROM frequencia f INNER JOIN matricula m ON f.fkMatricula=m.id_matricula INNER JOIN turma t ON m.fkTurma=t.id_turma WHERE t.fkCurso=?`, [id]); await database.executar(`DELETE m FROM matricula m INNER JOIN turma t ON m.fkTurma=t.id_turma WHERE t.fkCurso=?`, [id]); await database.executar(`DELETE ut FROM usuario_turma ut INNER JOIN turma t ON ut.fkTurma=t.id_turma WHERE t.fkCurso=?`, [id]); await database.executar(`DELETE FROM turma WHERE fkCurso=?`, [id]); await database.executar(`DELETE FROM grade_curricular WHERE fkCurso=?`, [id]); return database.executar(`DELETE FROM curso WHERE id_curso=?`, [id]); }
function obterCursoPorId(id) { return database.executar(`SELECT id_curso AS id, fkInstituicao, nome, IFNULL(descricao,'') AS descricao, IFNULL(modalidade,'') AS modalidade, IFNULL(duracao_semestres,0) AS duracao_semestres FROM curso WHERE id_curso = ? LIMIT 1`, [id]); }
function obterCursoEspecifico(id) { return database.executar(`SELECT c.id_curso, c.nome, (SELECT COUNT(DISTINCT m.fkAluno) FROM turma t2 JOIN matricula m ON t2.id_turma = m.fkTurma WHERE t2.fkCurso = c.id_curso) AS total_alunos FROM curso c WHERE c.id_curso = ?`, [id]); }
function listarAlunosCurso(id) { return database.executar(`SELECT DISTINCT a.ra, a.nome, a.email, t.nome_sigla AS turma, c.nome AS curso, (SELECT IFNULL(AVG(av.nota), 0) FROM avaliacao av JOIN matricula m2 ON av.fkMatricula = m2.id_matricula WHERE m2.fkAluno = a.ra) AS media_nota, (SELECT IFNULL((SUM(f.presente) / COUNT(f.id_frequencia)) * 100, 0) FROM frequencia f JOIN matricula m3 ON f.fkMatricula = m3.id_matricula WHERE m3.fkAluno = a.ra) AS frequencia, CASE WHEN (SELECT AVG(av.nota) FROM avaliacao av JOIN matricula m2 ON av.fkMatricula = m2.id_matricula WHERE m2.fkAluno = a.ra) >= 8 AND (SELECT (SUM(f.presente) / COUNT(f.id_frequencia)) * 100 FROM frequencia f JOIN matricula m3 ON f.fkMatricula = m3.id_matricula WHERE m3.fkAluno = a.ra) >= 75 THEN 'Ótimo' WHEN (SELECT AVG(av.nota) FROM avaliacao av JOIN matricula m2 ON av.fkMatricula = m2.id_matricula WHERE m2.fkAluno = a.ra) >= 6 AND (SELECT (SUM(f.presente) / COUNT(f.id_frequencia)) * 100 FROM frequencia f JOIN matricula m3 ON f.fkMatricula = m3.id_matricula WHERE m3.fkAluno = a.ra) >= 75 THEN 'Regular' ELSE 'Atenção' END AS desempenho FROM aluno a JOIN matricula m ON a.ra = m.fkAluno JOIN turma t ON m.fkTurma = t.id_turma JOIN curso c ON t.fkCurso = c.id_curso WHERE c.id_curso = ? ORDER BY a.nome ASC`, [id]); }
function obterEstatisticasCurso(id) { return database.executar(`SELECT COUNT(DISTINCT m.fkAluno) AS total_alunos, (SELECT COUNT(*) FROM (SELECT a.ra FROM aluno a JOIN matricula m2 ON a.ra = m2.fkAluno JOIN turma t2 ON m2.fkTurma = t2.id_turma WHERE t2.fkCurso = ${id} HAVING (SELECT AVG(av.nota) FROM avaliacao av JOIN matricula m3 ON av.fkMatricula = m3.id_matricula WHERE m3.fkAluno = a.ra) >= 8) AS above_avg) AS alunos_acima_media, (SELECT COUNT(*) FROM (SELECT a.ra FROM aluno a JOIN matricula m2 ON a.ra = m2.fkAluno JOIN turma t2 ON m2.fkTurma = t2.id_turma WHERE t2.fkCurso = ${id} HAVING (SELECT AVG(av.nota) FROM avaliacao av JOIN matricula m3 ON av.fkMatricula = m3.id_matricula WHERE m3.fkAluno = a.ra) >= 6 AND (SELECT AVG(av.nota) FROM avaliacao av JOIN matricula m3 ON av.fkMatricula = m3.id_matricula WHERE m3.fkAluno = a.ra) < 8) AS at_avg) AS alunos_na_media, (SELECT COUNT(*) FROM (SELECT a.ra FROM aluno a JOIN matricula m2 ON a.ra = m2.fkAluno JOIN turma t2 ON m2.fkTurma = t2.id_turma WHERE t2.fkCurso = ${id} HAVING (SELECT AVG(av.nota) FROM avaliacao av JOIN matricula m3 ON av.fkMatricula = m3.id_matricula WHERE m3.fkAluno = a.ra) < 6) AS below_avg) AS alunos_abaixo_media, IFNULL(AVG((SELECT IFNULL((SUM(f.presente) / COUNT(f.id_frequencia)) * 100, 0) FROM frequencia f WHERE f.fkMatricula = m.id_matricula)), 0) AS frequencia_media FROM matricula m JOIN turma t ON m.fkTurma = t.id_turma WHERE t.fkCurso = ?`, [id]); }

function obterFrequenciaPorMesCurso(id) {
    return database.executar(
        `SELECT 
            MONTH(f.data_aula) AS mes,
            ROUND(AVG(f.presente) * 100, 2) AS frequencia_media
         FROM frequencia f
         JOIN matricula m ON f.fkMatricula = m.id_matricula
         JOIN turma t ON m.fkTurma = t.id_turma
         WHERE t.fkCurso = ?
           AND MONTH(f.data_aula) BETWEEN 6 AND 12
         GROUP BY MONTH(f.data_aula)
         ORDER BY MONTH(f.data_aula) ASC`,
        [id]
    );
}


module.exports = {
    listarInstituicoes, buscarInstituicao, listarUsuariosInstituicao,
    listarAlunosInstituicao, obterKpisAlunos, 
    listarCursosInstituicao, listarAlunosAlerta, criarCurso, editarCurso, deletarCurso, obterCursoPorId,
    listarTurmasInstituicao, listarDisciplinasPorInstituicao, listarCursosInstituicaoSimples,
    obterCursoEspecifico, listarAlunosCurso, obterEstatisticasCurso, obterFrequenciaPorMesCurso
};