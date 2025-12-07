// Variáveis Globais
let paginaAtual = 1;
let totalPaginasGlobal = 1;
let cachePaginas = {}; // Cache local para armazenar páginas já carregadas
let termoPesquisaAtual = '';

// =================================================================================
// 1. FUNÇÃO PRINCIPAL: LISTAR ALUNOS (Com Cache e Prefetch)
// =================================================================================

let kpisCarregados = false; 

// 1. FUNÇÃO PRINCIPAL: LISTAR ALUNOS (Leve e Rápida)
function listarAlunosInstituicao(pagina = 1, termoPesquisa = '') {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    const containerPaginacao = document.getElementById('pagination_controls');
    
    // 1. ATUALIZA O FILTRO GLOBAL
    termoPesquisaAtual = termoPesquisa;

    // Chave de cache única: combina a página e o filtro
    const cacheKey = `${pagina}_${termoPesquisa}`; 

    // Lógica de Cache com Filtro
    if (cachePaginas[cacheKey]) {
        renderizarDados(cachePaginas[cacheKey]);
        prefetchPagina(pagina + 1, fkInstituicao, termoPesquisa);
        return;
    }

    if (containerPaginacao) containerPaginacao.style.opacity = '0.6';

    // 2. INCLUI O FILTRO NA URL DE BUSCA
    const urlBusca = `/instituicao/listarAlunosInstituicao/${fkInstituicao}?page=${pagina}&filtro=${termoPesquisa}`;

    fetch(urlBusca, { 
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (dados) {
                // Salva no Cache com a chave única
                cachePaginas[cacheKey] = dados;
                
                // Renderiza a Tabela
                renderizarDados(dados);
                
                if (containerPaginacao) containerPaginacao.style.opacity = '1';
                
                // Se não há filtro e é a primeira página, carrega KPIs
                if (termoPesquisa === '' && pagina === 1) {
                    // carregarKpisEmBackground deve ser sua função original
                    carregarKpisEmBackground(fkInstituicao); 
                }

                // Prefetch da PRÓXIMA página, mantendo o filtro
                prefetchPagina(pagina + 1, fkInstituicao, termoPesquisa);
            });
        }
    }).catch(console.error);
}

// 2. NOVA FUNÇÃO: CARREGAR KPIS (Com Cache de SessionStorage)
function carregarKpisEmBackground(idInstituicao) {
    console.log("Buscando KPIs atualizados na API...");

    // 'cache: no-store' garante que o navegador não use memória antiga
    fetch(`/instituicao/kpis/${idInstituicao}`, {
        method: "GET",
        cache: 'no-store', 
        headers: { "Content-Type": "application/json" }
    })
    .then(resposta => {
        if (resposta.ok) return resposta.json();
        throw new Error('Erro ao buscar KPIs');
    })
    .then(dados => {
        // Atualiza os gráficos na tela imediatamente
        atualizarKpiDesempenho(dados.kpiStats, 0);
        atualizarKpiFrequencia(dados.freqStats);
    })
    .catch(erro => {
        console.error("Erro ao carregar KPIs:", erro);
    });
}

// Função para renderizar os dados (separada para ser usada pelo cache)
function renderizarDados(dados) {
    const listaAlunos = dados.data || []; 
    const totalItems = dados.totalItems || 0;
    
    // Atualiza variáveis globais
    paginaAtual = dados.currentPage;
    totalPaginasGlobal = dados.totalPages || 1;

    // Renderiza Tabela
    const corpoTabela = document.getElementById("corpo_tabela_alunos");
    if (corpoTabela) {
        // Usamos um DocumentFragment para manipular o DOM apenas uma vez (Mais rápido)
        const fragment = document.createDocumentFragment();
        
        listaAlunos.forEach(aluno => {
            const tr = document.createElement('tr');
            tr.onclick = () => irParaAlunoEspecifico(aluno.ra);
            const classeDesempenho = getClasseDesempenho(aluno.desempenho);
            
            tr.innerHTML = `
                <td>${aluno.ra}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.email}</td>
                <td>${aluno.turma}</td>
                <td>${aluno.curso}</td>
                <td><p class="${classeDesempenho}">${aluno.desempenho ?? 'N/A'}</p></td>
                <td onclick="editarAluno(${aluno.ra}); event.stopPropagation();"><i class="fi fi-sr-pencil"></i></td>
            `;
            fragment.appendChild(tr);
        });
        
        corpoTabela.innerHTML = '';
        corpoTabela.appendChild(fragment);
    }

    // Renderiza Controles
    renderizarBotoesPaginacao(totalPaginasGlobal, paginaAtual);

    // Atualiza Totais e KPIs apenas se necessário (evita reflow)
    document.querySelectorAll(".qtd_alunos").forEach(el => {
        if (el.innerHTML != totalItems) el.innerHTML = totalItems;
    });

    // Se as KPIs vierem nulas no cache (pág 2+), mantemos a anterior ou recalculamos
    if (dados.kpiStats) {
        atualizarKpiDesempenho(dados.kpiStats, totalItems);
        atualizarKpiFrequencia(dados.freqStats);
    }
}

// Pré-carrega a próxima página sem travar a tela
// Pré-carrega a próxima página sem travar a tela
function prefetchPagina(proximaPagina, fkInstituicao, termoPesquisa = '') {
    // A variável totalPaginasGlobal é atualizada por renderizarDados
    if (proximaPagina > totalPaginasGlobal) return; 
    
    // Chave de cache com filtro
    const cacheKey = `${proximaPagina}_${termoPesquisa}`;
    if (cachePaginas[cacheKey]) return; 

    console.log(`[PREFETCH] Baixando página ${proximaPagina} (Filtro: ${termoPesquisa || 'Nenhum'}) em background...`);
    
    // Inclui o filtro na requisição
    const urlBusca = `/instituicao/listarAlunosInstituicao/${fkInstituicao}?page=${proximaPagina}&filtro=${termoPesquisa}`;

    fetch(urlBusca)
        .then(r => r.json())
        .then(dados => {
            cachePaginas[cacheKey] = dados; // Salva com a chave única
        });
}

// =================================================================================
// 2. PAGINAÇÃO COM BOTÕES OTIMIZADA
// =================================================================================
function renderizarBotoesPaginacao(totalPages, currentPage) {
    const container = document.getElementById('pagination_controls');
    if (!container) return;

    // Evita recriar o HTML se a paginação e o filtro não mudaram
    if (container.dataset.lastPage == currentPage && container.dataset.total == totalPages && container.dataset.filtro == termoPesquisaAtual) return;
    container.dataset.lastPage = currentPage;
    container.dataset.total = totalPages;
    // SALVA O FILTRO ATUAL
    container.dataset.filtro = termoPesquisaAtual; 

    container.innerHTML = ''; 

    const btnStyle = "padding: 5px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 6px; margin: 0 2px; color: #555; transition: background 0.1s;";
    const activeStyle = "padding: 5px 12px; border: 1px solid #6200ea; background: #6200ea; color: white; cursor: default; border-radius: 6px; margin: 0 2px;";

    const createBtn = (texto, pageTarget, isActive = false, isDisabled = false) => {
        const btn = document.createElement('button');
        btn.innerText = texto;
        btn.disabled = isDisabled;
        btn.style.cssText = isActive ? activeStyle : btnStyle;
        
        if (!isDisabled && !isActive) {
            // **MUDANÇA AQUI:** Passa o filtro atual!
            btn.onclick = () => listarAlunosInstituicao(pageTarget, termoPesquisaAtual); 
            btn.onmouseover = () => { btn.style.backgroundColor = "#f3f3f3"; };
            btn.onmouseout = () => { btn.style.backgroundColor = "white"; };
        }
        if (isDisabled) {
            btn.style.opacity = "0.5";
            btn.style.cursor = "not-allowed";
        }
        return btn;
    };

    // Botão Anterior
    container.appendChild(createBtn('❮', currentPage - 1, false, currentPage <= 1));

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        container.appendChild(createBtn('1', 1));
        if (startPage > 2) {
            const span = document.createElement('span');
            span.innerText = '...';
            span.style.padding = '5px';
            container.appendChild(span);
        }
    }

    for (let p = startPage; p <= endPage; p++) {
        container.appendChild(createBtn(p, p, p === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const span = document.createElement('span');
            span.innerText = '...';
            span.style.padding = '5px';
            container.appendChild(span);
        }
        container.appendChild(createBtn(totalPages, totalPages));
    }

    container.appendChild(createBtn('❯', currentPage + 1, false, currentPage >= totalPages));
}

// =================================================================================
// 3. AUXILIARES (KPI, FORMATAÇÃO, ETC)
// =================================================================================

function atualizarKpiFrequencia(stats) {
    if (!stats) return;
    const freqGeral = Math.round(Number(stats.frequencia_geral || 0));
    const alunosAtencao = Number(stats.kpi_atencao_freq || 0);

    const titulo = document.getElementById("h1_situacao");
    if (titulo) titulo.innerHTML = `${freqGeral}%`;

    const footer = document.querySelector(".kpi_footer p");
    if (footer) footer.innerHTML = `${alunosAtencao} alunos em atenção por freq.`;

    atualizarCircularProgress(freqGeral);
}

function atualizarCircularProgress(porcentagem) {
    const circ = document.getElementById("circFreq");
    if (!circ) return;
    
    let cor = "#2ecc71"; // Verde
    if (porcentagem < 75) cor = "#f1c40f"; // Amarelo
    if (porcentagem < 50) cor = "#e74c3c"; // Vermelho

    circ.style.background = `conic-gradient(${cor} ${porcentagem * 3.6}deg, #e0e0e0 0deg)`;
}

function atualizarKpiDesempenho(stats, totalTotal) {
    if (!stats) return;
    const countAtencao = Number(stats.kpi_atencao || 0);
    const countRegular = Number(stats.kpi_regular || 0);
    const countOtimo = Number(stats.kpi_otimo || 0);

    document.getElementById('count_atencao').textContent = `${countAtencao} atenção`;
    document.getElementById('count_regular').textContent = `${countRegular} regular`;
    document.getElementById('count_otimo').textContent = `${countOtimo} ótimo`;

    const max = Math.max(countAtencao, countRegular, countOtimo);
    let escolhido = 'N/A';
    if (countAtencao === max && max >= 0) escolhido = 'atenção';
    else if (countRegular === max && max >= 0) escolhido = 'regular';
    else if (countOtimo === max && max >= 0) escolhido = 'ótimo';

    const countEscolhido = (escolhido === 'atenção') ? countAtencao : (escolhido === 'regular') ? countRegular : (escolhido === 'ótimo') ? countOtimo : 0;

    const kpiTexto = document.getElementById('kpi_texto_desempenho');
    if (kpiTexto) kpiTexto.textContent = `${countEscolhido} ${escolhido !== 'N/A' ? escolhido.toUpperCase() : ''}`;

    const progress = document.getElementById('progress_bar');
    if (progress) {
        const totalValido = totalTotal > 0 ? totalTotal : 1;
        const percent = Math.round((countEscolhido / totalValido) * 100);
        progress.value = percent;
        progress.classList.remove('progress-atencao', 'progress-regular', 'progress-otimo');
        if (escolhido === 'atenção') progress.classList.add('progress-atencao');
        else if (escolhido === 'regular') progress.classList.add('progress-regular');
        else if (escolhido === 'ótimo') progress.classList.add('progress-otimo');
    }
}

function getClasseDesempenho(desempenho) {
    if (!desempenho) return 'p_status_atencao';
    const s = desempenho.toLowerCase();
    if (s.includes('aten')) return 'p_status_atencao';
    if (s.includes('regu')) return 'p_status_regular';
    if (s.includes('ótim') || s.includes('otim')) return 'p_status_otimo';
    return 'p_status_atencao';
}

// Funções de Modal e Filtro (Mantidas - adicione as que você já tem no arquivo)
function abrirModal(modalId) { const d = document.getElementById(modalId); if(d) d.showModal(); }
function fecharModal(modalId) { const d = document.getElementById(modalId); if(d) d.close(); }

// ... Coloque aqui suas funções de popularTurmas, criarAluno, editarAluno, etc. ...
// (Estou omitindo para não ficar gigante, mas mantenha as que já funcionam)

function popularTurmasCriar(fk) {
    const s = document.querySelector('#select_turma_criar');
    if(!s) return;
    fetch(`/aluno/listarTurmas/${fk}`).then(r=>r.json()).then(ts => {
        s.innerHTML = '<option value="">Selecione a Turma</option>';
        ts.forEach(t => s.innerHTML += `<option value="${t.nome_sigla}">${t.nome_sigla}</option>`);
    });
}
function popularCursosCriar(fk) {
    const s = document.querySelector('#select_curso_criar');
    if(!s) return;
    fetch(`/aluno/listarCursos/${fk}`).then(r=>r.json()).then(cs => {
        s.innerHTML = '<option value="">Selecione o Curso</option>';
        cs.forEach(c => s.innerHTML += `<option value="${c.id_curso}">${c.nome}</option>`);
    });
}
function buscarMockPorRa() {
    const val = document.getElementById("raCriar").value.trim();
    if(typeof alunosMockParaCriacao !== 'undefined') {
        return alunosMockParaCriacao.find(a => a.ra === val);
    }
    return null;
}
function criarAluno() {
    const ra = document.getElementById("raCriar").value;
    const turma = document.getElementById("select_turma_criar").value;
    const curso = document.getElementById("select_curso_criar").value;
    const mock = buscarMockPorRa();
    if(!ra || !turma || !curso || !mock) return alert("Preencha tudo");
    
    fetch("/aluno/criar", {
        method: "POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ra:mock.ra, nome:mock.nome, email:mock.email, telefone:mock.telefone, turma, fkCurso:curso })
    }).then(r=>{ if(r.ok){ alert("Sucesso"); location.reload(); }});
}

function popularTurmasEdicao(fkInstituicao, turmaAtual) {
    const selectTurma = document.getElementById('select_turma_edicao');
    if(!selectTurma) return;
    selectTurma.innerHTML = ''; 
    fetch(`/aluno/listarTurmas/${fkInstituicao}`, { method: "GET" })
        .then(res => res.ok ? res.json() : [])
        .then(turmas => {
            const defaultOption = document.createElement('option');
            defaultOption.value = ''; defaultOption.text = 'Selecione a Turma'; defaultOption.disabled = true; defaultOption.hidden = true;
            selectTurma.appendChild(defaultOption);
            turmas.forEach(turma => {
                const option = document.createElement('option');
                option.value = turma.nome_sigla; option.text = turma.nome_sigla;
                if (turma.nome_sigla === turmaAtual) option.selected = true;
                selectTurma.appendChild(option);
            });
            selectTurma.value = turmaAtual;
        });
}

function popularCursosEdicao(fkInstituicao, idCursoAtual) { 
    const selectCurso = document.getElementById('select_curso_edicao');
    if(!selectCurso) return;
    selectCurso.innerHTML = ''; 
    fetch(`/aluno/listarCursos/${fkInstituicao}`, { method: "GET" })
        .then(res => res.ok ? res.json() : [])
        .then(cursos => {
            const defaultOption = document.createElement('option');
            defaultOption.value = ''; defaultOption.text = 'Selecione o Curso'; defaultOption.disabled = true; defaultOption.hidden = true;
            selectCurso.appendChild(defaultOption);
            cursos.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso.id_curso; option.text = curso.nome;
                if (curso.id_curso === idCursoAtual) option.selected = true;
                selectCurso.appendChild(option);
            });
        });
}

function editarAluno(raAluno) {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao"); 
    abrirModal('modal_editar_aluno');
    fetch(`/aluno/buscarPorRa/${raAluno}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(resposta => {
        if (resposta.ok) {
            resposta.json().then(aluno => {
                document.getElementById('input_ra_edicao').value = aluno.ra;
                document.getElementById('input_nome_edicao').value = aluno.nome;
                document.getElementById('input_email_edicao').value = aluno.email;
                document.getElementById('input_instituicao_edicao').value = aluno.instituicaoNome; 
                popularCursosEdicao(fkInstituicao, aluno.idCurso);
                popularTurmasEdicao(fkInstituicao, aluno.turma);
                sessionStorage.setItem("raAlunoEmEdicao", aluno.ra);
            });
        }
    });
}

function confirmarEdicao() {
    const novoCurso = document.getElementById("select_curso_edicao").value;
    const novaTurma = document.getElementById("select_turma_edicao").value;
    const raAluno = sessionStorage.getItem("raAlunoEmEdicao");

    fetch(`/aluno/editar/${raAluno}`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ curso: novoCurso, turma: novaTurma }) 
    })
    .then(res => {
        if (res.ok) { 
            alert("Atualizado com sucesso!");
            // Apenas recarrega. Como a função de KPIs acima força a busca, 
            // os dados virão certos automaticamente.
            location.reload(); 
        } else { 
            alert("Erro ao atualizar."); 
        }
    })
    .catch(erro => console.error("Erro na edição:", erro));
}

function irParaAlunoEspecifico(raAluno) {
    sessionStorage.setItem("raAlunoDetalhe", raAluno);
    window.location.href = 'alunoEspecificoAdmin.html';
}

// Filtro Local
document.addEventListener("DOMContentLoaded", () => {
    const inp = document.getElementById("input_pesquisa");
    if(inp) {
        inp.addEventListener("keyup", () => {
            const val = inp.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const trs = document.querySelectorAll("#corpo_tabela_alunos tr");
            trs.forEach(tr => {
                const text = tr.innerText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                tr.style.display = text.includes(val) ? "" : "none";
            });
        });
    }
});
