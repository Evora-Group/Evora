
// Puxa e insere o nome do usuário para todos os elementos com a classe "nome-usuario"
function puxarNomeUsuario() {
    const nomeUsuario = sessionStorage.getItem("nomeUsuario");
    document.querySelectorAll(".nome-usuario").forEach(el => el.innerHTML = nomeUsuario);
};

let listaUsuariosGlobal = [];

function listarUsuariosInstituicao() {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) return;
    fetch(`/instituicao/listarUsuariosInstituicao/${fkInstituicao}`)
        .then(r => r.json())
        .then(lista => {
            listaUsuariosGlobal = lista;
            atualizarKPIs(listaUsuariosGlobal);
            renderizarTabela(listaUsuariosGlobal);
        }).catch(e => console.error("Erro ao listar usuários", e));
}

// Desenha tabela de usuários (Professor/Aluno)
function renderizarTabela(lista) {
    const corpoTabela = document.getElementById("corpo_tabela_usuarios");
    if (!corpoTabela) return;
    corpoTabela.innerHTML = "";
    lista.forEach(usuario => {
        const statusCell = usuario.tipo === 'Professor'
            ? `<p class="p_status_${usuario.situacao}">${usuario.situacao}</p>`
            : `<p>N/A</p>`;
        corpoTabela.innerHTML += `
        <tr>
            <td>${usuario.id}</td>
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>${usuario.tipo}</td>
            <td>${usuario.turma || '-'}</td>
            <td>${usuario.curso || '-'}</td>
            <td>${statusCell}</td>
            <td onclick="definirVisitante(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.tipo}', '${usuario.turma}', '${usuario.curso}', '${usuario.instituicao}', '${usuario.situacao}'); abrirModal('modal_editar_usuario'); listarInstituicoes()"><i class="fi fi-sr-pencil"></i></td>
            <td onclick="definirVisitante(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.tipo}', '${usuario.turma}', '${usuario.curso}', '${usuario.instituicao}', '${usuario.situacao}'); abrirModal('modal_remover_usuario')"><i class="fi fi-sr-trash"></i></td>
        </tr>`;
    });
}

function filtrarUsuarios() {
    const termo = (document.getElementById('barra_pesquisa')?.value || '').toLowerCase();
    const filtrada = listaUsuariosGlobal.filter(u => u.id.toString().includes(termo) || u.nome.toLowerCase().includes(termo));
    renderizarTabela(filtrada);
}

function atualizarKPIs(lista) {
    const qtdUsuarios = lista.length;
    const professores = lista.filter(u => u.tipo === 'Professor');
    const alunos = lista.filter(u => u.tipo === 'Aluno');
    const liberados = professores.filter(u => u.situacao === 'liberado');
    const bloqueados = professores.filter(u => u.situacao === 'bloqueado');

    const setAll = (sel, val) => document.querySelectorAll(sel).forEach(el => el.innerHTML = val);
    setAll('.qtd_usuarios', qtdUsuarios);
    setAll('.qtd_professores', professores.length);
    setAll('.qtd_alunos', alunos.length);
    setAll('.qtd_liberados', liberados.length);
    setAll('.qtd_bloqueados', bloqueados.length);
    const pb = document.getElementById('progress_bar_situacao');
    if (pb) pb.innerHTML = `<progress id="progress_bar" value="${liberados.length}" max="${liberados.length + bloqueados.length}"></progress>`;
}

// Paginação e filtros para cursos (admin)
function listarCursosInstituicao(page = 1, limit = 15, q = '', professor = '', situacao = '') {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) return;
    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';
    const profParam = professor ? `&professor=${encodeURIComponent(professor)}` : '';
    const sitParam = situacao ? `&situacao=${encodeURIComponent(situacao)}` : '';
    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}?page=${page}&limit=${limit}${qParam}${profParam}${sitParam}`)
        .then(r => r.json())
        .then(data => {
            const cursos = data.cursos || [];
            const total = data.total || 0;
            const currentPage = data.page || page;
            const perPage = data.limit || limit;
            const container = document.getElementById('cursos_lista');
            const semMsg = document.getElementById('sem_cursos_msg');
            const cabecalho = document.querySelector('.cabecalho');
            const tituloLista = document.getElementById('container_course');
            const pagination = document.getElementById('pagination_controls');
            if (container) container.innerHTML = '';
            if (!cursos.length) {
                if (semMsg) { semMsg.style.display = 'block'; semMsg.innerText = 'não há cursos na sua instituição'; }
                if (cabecalho) cabecalho.style.display = 'none';
                if (tituloLista) tituloLista.style.display = 'none';
                if (pagination) pagination.innerHTML = '';
                return;
            }
            if (semMsg) semMsg.style.display = 'none';
            if (cabecalho) cabecalho.style.display = '';
            if (tituloLista) tituloLista.style.display = '';
            cursos.forEach(c => {
                if (!container) return;
                container.innerHTML += `
                <div class="curso_row">
                    <div class="coluna_cursos"><a class="link" href="dashCursoEspecificoAdmin.html?cursoId=${c.id}"><p>${c.nome}</p></a></div>
                    <div class="coluna_quantidade"><p>${c.quantidade_alunos}</p></div>
                    <div class="coluna_descricao"><p>${c.descricao}</p></div>
                    <div class="coluna_modalidade"><p>${c.modalidade}</p></div>
                </div>`;
            });
            if (pagination) renderPaginationWithHandler(pagination, total, perPage, currentPage, (p) => listarCursosInstituicao(p, perPage, q, professor, situacao));
        }).catch(e => console.error('Erro ao listar cursos paginados', e));
}

function renderPaginationWithHandler(container, totalItems, perPage, currentPage, onPage) {
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    container.innerHTML = '';
    
    const makeBtn = (txt, disabled, onClick, current = false) => {
        const b = document.createElement('button');
        b.innerText = txt;
        b.disabled = disabled;
        if (onClick && !disabled) b.onclick = onClick;
        if (current) b.classList.add('current');
        return b;
    };
    
    // Botão Prev
    container.appendChild(makeBtn('Prev', currentPage <= 1, () => onPage(currentPage - 1)));
    
    // Números de página
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    
    // Ajustar se não temos botões suficientes
    if (end - start < maxButtons - 1) {
        start = Math.max(1, end - maxButtons + 1);
    }
    
    // Mostrar primeira página se não estiver visível
    if (start > 1) {
        container.appendChild(makeBtn('1', false, () => onPage(1)));
        if (start > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 8px';
            container.appendChild(ellipsis);
        }
    }
    
    // Páginas do meio
    for (let p = start; p <= end; p++) {
        container.appendChild(makeBtn(String(p), false, () => onPage(p), p === currentPage));
    }
    
    // Mostrar última página se não estiver visível
    if (end < totalPages) {
        if (end < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 8px';
            container.appendChild(ellipsis);
        }
        container.appendChild(makeBtn(String(totalPages), false, () => onPage(totalPages)));
    }
    
    // Botão Next
    container.appendChild(makeBtn('Next', currentPage >= totalPages, () => onPage(currentPage + 1)));
}

// Datalist simples (orig main) – obtém cursos sem paginação relevante (usa wrapper do model)
function listarCursosDatalist() {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) return;
    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}?page=1&limit=100`)
        .then(r => r.json())
        .then(data => {
            const cursos = data.cursos || [];
            const dl = document.getElementById('cursos');
            if (!dl) return;
            dl.innerHTML='';
            cursos.forEach(c => dl.innerHTML += `<option value="${c.nome}">${c.nome}</option>`);
        }).catch(e => console.error('Erro listar cursos datalist', e));
}

function listarTurmas() {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) return;
    fetch(`/instituicao/listarTurmasInstituicao/${fkInstituicao}`)
        .then(r=>r.json())
        .then(lista => {
            const datalists = document.querySelectorAll('.turmas_datalist');
            datalists.forEach(dl => { dl.innerHTML=''; lista.forEach(t => dl.innerHTML += `<option value="${t.nome_sigla}">${t.nome_sigla}</option>`); });
        }).catch(e => console.error('Erro listar turmas', e));
}

function listarDisciplinas() {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) return;
    fetch(`/instituicao/listarDisciplinas/${fkInstituicao}`)
        .then(r=>r.json())
        .then(lista => {
            const dl = document.getElementById('lista_disciplinas');
            if (!dl) return; dl.innerHTML='';
            lista.forEach(d => dl.innerHTML += `<option value="${d.nome}">${d.nome}</option>`);
        }).catch(e => console.error('Erro listar disciplinas', e));
}

// Alertas
function switchAlerta(tipo) {
    const tabPre = document.getElementById('tab_preocupante');
    const tabAt = document.getElementById('tab_atencao');
    if (!tabPre || !tabAt) return;
    if (tipo === 'preocupante') { tabPre.classList.add('active-tab'); tabAt.classList.remove('active-tab'); }
    else { tabAt.classList.add('active-tab'); tabPre.classList.remove('active-tab'); }
    listarAlunosAlerta(tipo,1,15);
}

function listarAlunosAlerta(tipo='preocupante', page=1, limit=15) {
    const fkInstituicao = sessionStorage.getItem('fkInstituicao');
    if (!fkInstituicao) return;
    fetch(`/instituicao/listarAlunosAlerta/${fkInstituicao}?tipo=${tipo}&page=${page}&limit=${limit}`)
        .then(r=>r.json())
        .then(data => {
            const alunos = data.alunos || [];
            const total = data.total || 0;
            const currentPage = data.page || page;
            const perPage = data.limit || limit;
            const container = document.getElementById('alertas_lista');
            const semMsg = document.getElementById('sem_alertas_msg');
            const cabecalho = document.querySelector('.tabela-alertas .cabecalho');
            const pagination = document.getElementById('pagination_controls_alertas');
            if (container) container.innerHTML='';
            if (!alunos.length) { if (semMsg) semMsg.style.display='block'; if (cabecalho) cabecalho.style.display='none'; if (pagination) pagination.innerHTML=''; return; }
            if (semMsg) semMsg.style.display='none'; if (cabecalho) cabecalho.style.display='';
            alunos.forEach(a => { if (!container) return; container.innerHTML += `
            <div class="dados_linha">
                <div class="coluna_alunos"><p>${a.nome}</p></div>
                <div class="coluna_turma"><p>${a.turma}</p></div>
                <div class="coluna_descricao"><p>${a.descricao || '-'}</p></div>
                <div class="coluna_freq"><p>${Number(a.media_nota).toFixed(2)}</p></div>
                <div class="coluna_presenca"><p>${Number(a.frequencia).toFixed(0)}%</p></div>
            </div>`; });
            if (pagination) renderPaginationWithHandler(pagination, total, perPage, currentPage, (p)=>listarAlunosAlerta(tipo,p,perPage));
        }).catch(e=>console.error('Erro listar alertas', e));
}

// Admin Cursos CRUD
let _selectedCursoId = null;

function listarCursosAdmin(page=1, limit=15, q='', professor='', situacao='') {
    const tbody = document.querySelector('.corpo_tabela');
    const fkInstituicao = sessionStorage.getItem('fkInstituicao');
    if (!fkInstituicao || !tbody) return;
    const qP = q?`&q=${encodeURIComponent(q)}`:'';
    const profP = professor?`&professor=${encodeURIComponent(professor)}`:'';
    const sitP = situacao?`&situacao=${encodeURIComponent(situacao)}`:'';
    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}?page=${page}&limit=${limit}${qP}${profP}${sitP}`)
        .then(r=>r.json())
        .then(data => {
            const cursos = data.cursos||[]; const total=data.total||0; const perPage=data.limit||limit; const currentPage=data.page||page;
            tbody.innerHTML='';
            const nomeInstituicao = sessionStorage.getItem('nomeInstituicao')||'-';
            cursos.forEach(c => {
                const tr=document.createElement('tr');
                tr.innerHTML=`<td>${c.id}</td><td>${c.nome}</td><td>${nomeInstituicao}</td><td>-</td><td><p class="p_status_liberado">Liberado</p></td><td><i class="fi fi-sr-pencil btn-edit" data-id="${c.id}" title="Editar"></i></td><td><i class="fi fi-sr-trash btn-delete" data-id="${c.id}" title="Remover"></i></td>`;
                tbody.appendChild(tr);
            });
            document.querySelectorAll('.btn-edit').forEach(b=> b.onclick=e=> abrirEditarCurso(e.currentTarget.getAttribute('data-id')));
            document.querySelectorAll('.btn-delete').forEach(b=> b.onclick=e=> abrirRemoverCurso(e.currentTarget.getAttribute('data-id')));
            const pagination = document.getElementById('pagination_controls');
            if (pagination) renderPaginationWithHandler(pagination, total, perPage, currentPage, (p)=>listarCursosAdmin(p, perPage, q, professor, situacao));
        }).catch(e=>console.error('Erro listar cursos admin', e));
}

function criarCursoFromModal() {
    const fkInstituicao = sessionStorage.getItem('fkInstituicao');
    if (!fkInstituicao) return alert('Instituição não identificada.');
    const nomeInput = document.querySelector('#modal_criar_curso [name="nome_curso"]');
    const descricaoInput = document.querySelector('#modal_criar_curso [name="descricao"]');
    const modalidadeInput = document.querySelector('#modal_criar_curso [name="modalidade"]');
    const duracaoInput = document.querySelector('#modal_criar_curso [name="duracao_semestres"]');
    const curso = { nome: nomeInput?.value.trim()||'', descricao: descricaoInput?.value.trim()||'', modalidade: modalidadeInput?.value.trim()||'', duracao_semestres: duracaoInput?.value?Number(duracaoInput.value):null };
    if (!curso.nome) return alert('Informe o nome do curso.');
    fetch(`/instituicao/criarCurso/${fkInstituicao}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(curso) })
        .then(r => { if(!r.ok) throw new Error('Erro ao criar curso'); fecharModal('modal_criar_curso'); listarCursosAdmin(1,15); })
        .catch(e => { console.error(e); alert('Não foi possível criar o curso.'); });
}

function abrirEditarCurso(id) {
    _selectedCursoId = id;
    fetch(`/instituicao/obterCurso/${id}`)
        .then(r=>r.json())
        .then(data => {
            const row = Array.isArray(data) && data.length ? data[0] : data;
            if (!row) return alert('Curso não encontrado');
            ['nome','descricao','modalidade','duracao_semestres'].forEach(campo => {
                const el = document.querySelector(`#modal_editar_curso [name="${campo}"]`);
                if (el) el.value = row[campo] || '';
            });
            abrirModal('modal_editar_curso');
        }).catch(e=>console.error(e));
}

function salvarEdicaoCurso() {
    if (!_selectedCursoId) return alert('Nenhum curso selecionado.');
    const id = _selectedCursoId;
    const nome = document.querySelector('#modal_editar_curso [name="nome"]');
    const descricao = document.querySelector('#modal_editar_curso [name="descricao"]');
    const modalidade = document.querySelector('#modal_editar_curso [name="modalidade"]');
    const duracao = document.querySelector('#modal_editar_curso [name="duracao_semestres"]');
    const curso = { nome: nome?.value.trim()||'', descricao: descricao?.value.trim()||'', modalidade: modalidade?.value.trim()||'', duracao_semestres: duracao?.value?Number(duracao.value):null };
    if (!curso.nome) return alert('Informe o nome do curso.');
    fetch(`/instituicao/editarCurso/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(curso) })
        .then(r=>{ if(!r.ok) throw new Error('Erro ao salvar curso'); fecharModal('modal_editar_curso'); listarCursosAdmin(1,15); })
        .catch(e=>{ console.error(e); alert('Não foi possível salvar alterações.'); });
}

function abrirRemoverCurso(id) { _selectedCursoId = id; abrirModal('modal_remover_usuario'); }
function confirmarRemoverCurso() {
    if (!_selectedCursoId) return alert('Nenhum curso selecionado.');
    fetch(`/instituicao/deletarCurso/${_selectedCursoId}`, { method:'DELETE' })
        .then(r=>{ if(!r.ok) throw new Error('Erro ao deletar curso'); fecharModal('modal_remover_usuario'); listarCursosAdmin(1,15); })
        .catch(e=>{ console.error(e); alert('Não foi possível deletar o curso.'); });
}

// KPIs do topo (cursos + usuários)
function atualizarTopKPIs() {
    const fkInstituicao = sessionStorage.getItem('fkInstituicao');
    if (!fkInstituicao) return;
    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}?page=1&limit=8`)
        .then(r=>r.json())
        .then(data => {
            const totalCursos = data.total || 0;
            const cursos = data.cursos || [];
            const h1 = document.getElementById('h1_situacao'); if (h1) h1.innerText = totalCursos;
            const barras = document.querySelector('.div_progress_bars');
            if (barras) { barras.innerHTML=''; cursos.slice(0,4).forEach(c => {
                const alunosCount = c.quantidade_alunos || 0; const progresso = Math.min(100, Math.round(alunosCount));
                barras.innerHTML += `
                <div class="div_progress_bar">
                    <div class="div_cursos_progress_bar">
                        <div class="progress_bar">
                            <div class="indicadores">
                                <p>${alunosCount} Alunos</p>
                                <p>- Professores</p>
                            </div>
                            <progress class="progress_instituicao" value="${progresso}" max="100">${progresso}%</progress>
                        </div>
                        <p>${String(c.id).padStart(6,'0')} - ${c.nome}</p>
                    </div>
                </div>`; }); }
        }).catch(e=>console.error('Erro KPIs cursos', e));

    fetch(`/instituicao/listarUsuariosInstituicao/${fkInstituicao}`)
        .then(r=>r.json())
        .then(lista => {
            if (!Array.isArray(lista)) return;
            const liberados = lista.filter(u=>u.situacao==='liberado').length;
            const bloqueados = lista.filter(u=>u.situacao==='bloqueado').length;
            const kpiFooters = document.querySelectorAll('.kpi_footer .p_titulo_kpi');
            if (kpiFooters.length>=2) { kpiFooters[0].innerHTML = `<strong>${liberados} Liberado</strong>`; kpiFooters[1].innerHTML = `<strong>${bloqueados} Bloqueado</strong>`; }
        }).catch(e=>console.error('Erro KPIs usuarios', e));
}

// Auto init
document.addEventListener('DOMContentLoaded', () => {
    const isAdminCursos = !!document.querySelector('.corpo_tabela');
    if (isAdminCursos) {
        const criarBtn = document.querySelector('#modal_criar_curso #btnEnviarDialog'); if (criarBtn) criarBtn.onclick = criarCursoFromModal;
        const salvarBtn = document.querySelector('#modal_editar_curso #btnEnviarDialog'); if (salvarBtn) salvarBtn.onclick = salvarEdicaoCurso;
        const confirmarRem = document.querySelector('#div_excluir_usuario'); if (confirmarRem) confirmarRem.onclick = confirmarRemoverCurso;
        const searchInput = document.querySelector('.input_pesquisa');
        if (searchInput) {
            if (!document.getElementById('btn_search_cursos')) {
                const btn=document.createElement('button'); btn.id='btn_search_cursos'; btn.type='button'; btn.className='div_criar_usuario'; btn.style.width='40px'; btn.style.minWidth='40px'; btn.style.padding='6px'; btn.style.marginLeft='8px'; btn.setAttribute('aria-label','Pesquisar cursos'); btn.innerHTML='<i class="fi fi-sr-search" aria-hidden="true"></i>';
                searchInput.parentNode.insertBefore(btn, searchInput.nextSibling);
                btn.onclick = () => { const q=searchInput.value.trim(); const professorVal=document.getElementById('filter_professor_text')?.value.trim()||''; const situacaoVal=document.getElementById('filter_situacao_select')?.value||''; listarCursosAdmin(1,15,q,professorVal,situacaoVal); };
            }
            searchInput.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); const q=searchInput.value.trim(); const professorVal=document.getElementById('filter_professor_text')?.value.trim()||''; const situacaoVal=document.getElementById('filter_situacao_select')?.value||''; listarCursosAdmin(1,15,q,professorVal,situacaoVal); }});
        }
        // inicia listagem e KPIs
        listarCursosAdmin(1,15);
        atualizarTopKPIs();
    }
});

function renderPagination(container, totalItems, perPage, currentPage) {
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    container.innerHTML = '';

    const prev = document.createElement('button');
    prev.innerText = '‹ Prev';
    prev.className = 'page-btn';
    prev.disabled = currentPage <= 1;
    prev.onclick = () => listarCursosInstituicao(currentPage - 1, perPage);
    if (prev.disabled) prev.classList.add('current');
    container.appendChild(prev);

    // show a few page numbers around current page
    const maxButtons = 7;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start < maxButtons - 1) {
        start = Math.max(1, end - maxButtons + 1);
    }

    for (let p = start; p <= end; p++) {
        const btn = document.createElement('button');
        btn.innerText = p;
        btn.className = 'page-btn';
        if (p === currentPage) {
            btn.disabled = true;
            btn.classList.add('current');
        } else {
            btn.onclick = () => listarCursosInstituicao(p, perPage);
        }
        container.appendChild(btn);
    }

    const next = document.createElement('button');
    next.innerText = 'Next ›';
    next.className = 'page-btn';
    next.disabled = currentPage >= totalPages;
    next.onclick = () => listarCursosInstituicao(currentPage + 1, perPage);
    if (next.disabled) next.classList.add('current');
    container.appendChild(next);
}

// Versão genérica de paginação que aceita callback para mudança de página
function renderPaginationWithHandler(container, totalItems, perPage, currentPage, onPage) {
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    container.innerHTML = '';

    const prev = document.createElement('button');
    prev.innerText = '‹ Prev';
    prev.className = 'page-btn';
    prev.disabled = currentPage <= 1;
    prev.onclick = () => onPage(Math.max(1, currentPage - 1));
    if (prev.disabled) prev.classList.add('current');
    container.appendChild(prev);

    const maxButtons = 7;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start < maxButtons - 1) {
        start = Math.max(1, end - maxButtons + 1);
    }

    for (let p = start; p <= end; p++) {
        const btn = document.createElement('button');
        btn.innerText = p;
        btn.className = 'page-btn';
        if (p === currentPage) {
            btn.disabled = true;
            btn.classList.add('current');
        } else {
            btn.onclick = () => onPage(p);
        }
        container.appendChild(btn);
    }

    const next = document.createElement('button');
    next.innerText = 'Next ›';
    next.className = 'page-btn';
    next.disabled = currentPage >= totalPages;
    next.onclick = () => onPage(Math.min(totalPages, currentPage + 1));
    if (next.disabled) next.classList.add('current');
    container.appendChild(next);
}

// Alterna a tab de alerta (ativa visualmente e chama a listagem)
function switchAlerta(tipo) {
    const tabPre = document.getElementById('tab_preocupante');
    const tabAt = document.getElementById('tab_atencao');
    if (tipo === 'preocupante') {
        tabPre.classList.add('active-tab');
        tabAt.classList.remove('active-tab');
    } else {
        tabAt.classList.add('active-tab');
        tabPre.classList.remove('active-tab');
    }
    // Acessibilidade: marcar o botão ativo com aria-current
    try {
        const btnPre = tabPre.querySelector('button');
        const btnAt = tabAt.querySelector('button');
        if (btnPre) btnPre.removeAttribute('aria-current');
        if (btnAt) btnAt.removeAttribute('aria-current');
        if (tipo === 'preocupante' && btnPre) btnPre.setAttribute('aria-current', 'true');
        if (tipo === 'atencao' && btnAt) btnAt.setAttribute('aria-current', 'true');
    } catch (e) {
        // ignore
    }

    listarAlunosAlerta(tipo, 1, 15);
}

// Lista alunos em alerta (preocupante / atencao) com paginação
function listarAlunosAlerta(tipo = 'preocupante', page = 1, limit = 15) {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) {
        console.warn('fkInstituicao não encontrado no sessionStorage.');
        return;
    }

    fetch(`/instituicao/listarAlunosAlerta/${fkInstituicao}?tipo=${tipo}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                const alunos = data.alunos || [];
                const total = data.total || 0;
                const currentPage = data.page || page;
                const perPage = data.limit || limit;

                const container = document.getElementById('alertas_lista');
                const semMsg = document.getElementById('sem_alertas_msg');
                const cabecalho = document.querySelector('.tabela-alertas .cabecalho');
                const pagination = document.getElementById('pagination_controls_alertas');

                if (container) container.innerHTML = '';

                if (!alunos || alunos.length === 0) {
                    if (semMsg) semMsg.style.display = 'block';
                    if (cabecalho) cabecalho.style.display = 'none';
                    if (pagination) pagination.innerHTML = '';
                    return;
                }

                if (semMsg) semMsg.style.display = 'none';
                if (cabecalho) cabecalho.style.display = '';

                alunos.forEach(a => {
                    if (!container) return;
                    container.innerHTML += `
                        <div class="dados_linha">
                            <div class="coluna_alunos"><p>${a.nome}</p></div>
                            <div class="coluna_turma"><p>${a.turma}</p></div>
                            <div class="coluna_descricao"><p>${a.descricao || '-'}</p></div>
                            <div class="coluna_freq"><p>${Number(a.media_nota).toFixed(2)}</p></div>
                            <div class="coluna_presenca"><p>${Number(a.frequencia).toFixed(0)}%</p></div>
                        </div>
                    `;
                });

                if (pagination) {
                    renderPaginationWithHandler(pagination, total, perPage, currentPage, (p) => listarAlunosAlerta(tipo, p, perPage));
                }

            });
        } else {
            console.error('Erro ao listar alertas:', res.status);
        }
    }).catch(function (err) {
        console.error('Erro na requisição de alertas:', err);
    });
}

// -----------------------
// Admin Cursos (CRUD) JS
// -----------------------

function atualizarKPIsAdmin() {
    const fkInstituicao = sessionStorage.getItem('fkInstituicao');
    
    if (!fkInstituicao) return;

    // KPIs são atualizados pela função atualizarTopKPIs() que mostra os cursos com barras de progresso
    atualizarTopKPIs();
}

function listarCursosAdmin(page = 1, limit = 15, q = '', professor = '', situacao = '') {
    const tbody = document.querySelector('.corpo_tabela');
    const fkInstituicao = sessionStorage.getItem('fkInstituicao');
    
    if (!fkInstituicao) {
        console.error('fkInstituicao não encontrado. Faça login primeiro.');
        return;
    }

    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';
    const profParam = professor ? `&professor=${encodeURIComponent(professor)}` : '';
    const sitParam = situacao ? `&situacao=${encodeURIComponent(situacao)}` : '';
    
    const url = `/instituicao/listarCursosInstituicao/${fkInstituicao}?page=${page}&limit=${limit}${qParam}${profParam}${sitParam}`;
    
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('Erro ao listar cursos');
            return res.json();
        })
        .then(data => {
            const cursos = data.cursos || [];
            const total = data.total || 0;
            const perPage = data.limit || limit;
            const currentPage = data.page || page;

            if (!tbody) return;
            
            tbody.innerHTML = '';

            if (cursos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum curso encontrado</td></tr>';
                return;
            }

            const nomeInstituicao = sessionStorage.getItem('nomeInstituicao') || '-';

            cursos.forEach(c => {
                const tr = document.createElement('tr');
                // Buscar professores para este curso (se houver campo no retorno)
                const numProfs = c.num_professores || 0;
                tr.innerHTML = `
                    <td>${c.id_curso || c.id}</td>
                    <td>${c.nome}</td>
                    <td>${nomeInstituicao}</td>
                    <td>${numProfs > 0 ? numProfs : '-'}</td>
                    <td><i class="fi fi-sr-pencil btn-edit" data-id="${c.id_curso || c.id}" title="Editar"></i></td>
                    <td><i class="fi fi-sr-trash btn-delete" data-id="${c.id_curso || c.id}" title="Remover"></i></td>
                `;

                tbody.appendChild(tr);
            });

            // attach handlers
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.onclick = (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    abrirEditarCurso(id);
                };
            });
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.onclick = (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    abrirRemoverCurso(id);
                };
            });

            // render pagination if container exists
            const pagination = document.getElementById('pagination_controls');
            if (pagination) {
                renderPaginationWithHandler(pagination, total, perPage, currentPage, (p) => listarCursosAdmin(p, perPage, q, professor, situacao));
            }
        })
        .catch(err => {
            console.error('ERRO na requisição:', err);
            alert('Erro ao carregar cursos: ' + err.message);
        });
}

function criarCursoFromModal() {
    const fkInstituicao = sessionStorage.getItem('fkInstituicao');
    if (!fkInstituicao) return alert('Instituição não identificada.');

    const nomeInput = document.querySelector('#modal_criar_curso [name="nome_curso"]');
    const descricaoInput = document.querySelector('#modal_criar_curso [name="descricao"]');
    const modalidadeInput = document.querySelector('#modal_criar_curso [name="modalidade"]');
    const duracaoInput = document.querySelector('#modal_criar_curso [name="duracao_semestres"]');

    const curso = {
        nome: nomeInput ? nomeInput.value.trim() : '',
        descricao: descricaoInput ? descricaoInput.value.trim() : '',
        modalidade: modalidadeInput ? modalidadeInput.value.trim() : '',
        duracao_semestres: duracaoInput && duracaoInput.value ? Number(duracaoInput.value) : null
    };

    if (!curso.nome) return alert('Informe o nome do curso.');

    fetch(`/instituicao/criarCurso/${fkInstituicao}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curso)
    }).then(res => {
        if (!res.ok) throw new Error('Erro ao criar curso');
        fecharModal('modal_criar_curso');
        listarCursosAdmin(1, 15);
    }).catch(err => {
        console.error(err);
        alert('Não foi possível criar o curso.');
    });
}

function abrirEditarCurso(id) {
    _selectedCursoId = id;
    fetch(`/instituicao/obterCurso/${id}`)
        .then(res => res.json())
        .then(rows => {
            const data = Array.isArray(rows) && rows.length ? rows[0] : rows;
            if (!data) return alert('Curso não encontrado');

            const nome = document.querySelector('#modal_editar_curso [name="nome"]');
            const descricao = document.querySelector('#modal_editar_curso [name="descricao"]');
            const modalidade = document.querySelector('#modal_editar_curso [name="modalidade"]');
            const duracao = document.querySelector('#modal_editar_curso [name="duracao_semestres"]');

            if (nome) nome.value = data.nome || '';
            if (descricao) descricao.value = data.descricao || '';
            if (modalidade) modalidade.value = data.modalidade || '';
            if (duracao) duracao.value = data.duracao_semestres || '';

            abrirModal('modal_editar_curso');
        }).catch(err => console.error(err));
}

function salvarEdicaoCurso() {
    if (!_selectedCursoId) return alert('Nenhum curso selecionado.');
    const id = _selectedCursoId;

    const nome = document.querySelector('#modal_editar_curso [name="nome"]');
    const descricao = document.querySelector('#modal_editar_curso [name="descricao"]');
    const modalidade = document.querySelector('#modal_editar_curso [name="modalidade"]');
    const duracao = document.querySelector('#modal_editar_curso [name="duracao_semestres"]');

    const curso = {
        nome: nome ? nome.value.trim() : '',
        descricao: descricao ? descricao.value.trim() : '',
        modalidade: modalidade ? modalidade.value.trim() : '',
        duracao_semestres: duracao && duracao.value ? Number(duracao.value) : null
    };

    if (!curso.nome) return alert('Informe o nome do curso.');

    fetch(`/instituicao/editarCurso/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curso)
    }).then(res => {
        if (!res.ok) throw new Error('Erro ao salvar curso');
        fecharModal('modal_editar_curso');
        listarCursosAdmin(1, 15);
    }).catch(err => {
        console.error(err);
        alert('Não foi possível salvar alterações.');
    });
}

function abrirRemoverCurso(id) {
    _selectedCursoId = id;
    abrirModal('modal_remover_usuario');
}

function confirmarRemoverCurso() {
    if (!_selectedCursoId) return alert('Nenhum curso selecionado.');
    const id = _selectedCursoId;

    fetch(`/instituicao/deletarCurso/${id}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao deletar curso');
            fecharModal('modal_remover_usuario');
            listarCursosAdmin(1, 15);
        }).catch(err => {
            console.error(err);
            alert('Não foi possível deletar o curso.');
        });
}

// Auto-init when on admin cursos page: attach modal confirm buttons
document.addEventListener('DOMContentLoaded', function () {
    const isAdminCursos = !!document.querySelector('.corpo_tabela');
    if (!isAdminCursos) return;

    // wire create modal submit
    const criarBtn = document.querySelector('#modal_criar_curso #btnEnviarDialog');
    if (criarBtn) criarBtn.onclick = criarCursoFromModal;

    // wire edit modal save (there may be an element with that id)
    const salvarBtn = document.querySelector('#modal_editar_curso #btnEnviarDialog');
    if (salvarBtn) salvarBtn.onclick = salvarEdicaoCurso;

    // wire remove confirm
    const confirmarRemover = document.querySelector('#div_excluir_usuario');
    if (confirmarRemover) confirmarRemover.onclick = confirmarRemoverCurso;

    // attach search UI (inject search button next to existing search input)
    const searchInput = document.querySelector('.input_pesquisa');
    if (searchInput) {
        // create search button if not present
        if (!document.getElementById('btn_search_cursos')) {
            const btn = document.createElement('button');
            btn.id = 'btn_search_cursos';
            btn.type = 'button';
            btn.className = 'div_criar_usuario';
            btn.style.width = '40px';
            btn.style.minWidth = '40px';
            btn.style.padding = '6px';
            btn.style.marginLeft = '8px';
            btn.setAttribute('aria-label', 'Pesquisar cursos');
            btn.innerHTML = '<i class="fi fi-sr-search" aria-hidden="true"></i>';
            // insert after search input
            searchInput.parentNode.insertBefore(btn, searchInput.nextSibling);
            btn.onclick = () => {
                const q = searchInput.value.trim();
                listarCursosAdmin(1, 15, q);
            };
        }

        // Enter key triggers search
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = searchInput.value.trim();
                listarCursosAdmin(1, 15, q);
            }
        });
    }

    // initial list (no query)
    listarCursosAdmin(1, 15);
    // update top KPIs
    atualizarTopKPIs();
});

function listarTurmas() {

    const fkInstituicao = sessionStorage.getItem("fkInstituicao");

    console.log("ID da Instituição para listar turmas: ", fkInstituicao);

    fetch(`/instituicao/listarTurmasInstituicao/${fkInstituicao}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (resposta) {
                console.log("Dados recebidos: ", JSON.stringify(resposta));
                
                const listaTurmas = resposta;

                const datalists = document.querySelectorAll(".turmas_datalist");
                
                datalists.forEach(datalist => {
                    
                datalist.innerHTML = "";

                listaTurmas.forEach(turma => {
                    datalist.innerHTML += `
                        <option value="${turma.nome_sigla}">${turma.nome_sigla}</option>
                    `;
                }); 

                });



            });
        } else {
            console.error("Erro ao listar turmas: ", resposta.status);
        }
    }).catch(function (erro) {
        console.error("Erro na requisição: ", erro);
    });
}

    function listarDisciplinas() {
    // 1. Pega o ID da instituição salvo na sessão (Login)
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");

    if (!fkInstituicao) {
        console.error("ID da instituição não encontrado na sessão!");
        return;
    }

    // 2. Faz a requisição para a rota que criamos
    // Ajuste a URL '/instituicao/listarDisciplinas' conforme seu arquivo de rotas
    fetch(`/instituicao/listarDisciplinas/${fkInstituicao}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (listaDisciplinas) {
                console.log("Disciplinas recebidas: ", listaDisciplinas);

                // 3. Pega o elemento datalist pelo ID
                const datalist = document.getElementById("lista_disciplinas");
                
                // Limpa a lista atual para não duplicar
                datalist.innerHTML = "";

                // 4. Cria uma <option> para cada disciplina retornada do banco
                listaDisciplinas.forEach(disciplina => {
                    datalist.innerHTML += `
                        <option value="${disciplina.nome}">${disciplina.nome}</option>
                    `;
                });
            });
        } else {
            console.error("Nenhuma disciplina encontrada ou erro na API.");
        }
    })
    .catch(function (erro) {
        console.error("Erro na requisição: ", erro);
    });
}