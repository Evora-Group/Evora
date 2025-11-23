
// Puxa e insere o nome do usuário para todos os elementos com a classe "nome-usuario"
function puxarNomeUsuario() {
  const nomeUsuario = sessionStorage.getItem("nomeUsuario");
    const elementoNomeUsuario = document.querySelectorAll(".nome-usuario");

    elementoNomeUsuario.forEach(element => {
        element.innerHTML = nomeUsuario;
    },);

};


// Função para listar usuários da instituição
function listarUsuariosInstituicao() {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    fetch(`/instituicao/listarUsuariosInstituicao/${fkInstituicao}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (resposta) {
                console.log("Dados recebidos: ", JSON.stringify(resposta));
                
                const listaUsuarios = resposta;
                const qtdUsuarios = listaUsuarios.length;
                
                const listaProfessores = listaUsuarios.filter(usuario => usuario.tipo === "Professor");
                const qtdProfessores = listaProfessores.length;

                const listaAlunos = listaUsuarios.filter(usuario => usuario.tipo === "Aluno");
                const qtdAlunos = listaAlunos.length;

                const listaBloqueados = listaUsuarios.filter(usuario => usuario.situacao === "bloqueado");
                const qtdBloqueados = listaBloqueados.length;
                
                const listaLiberados = listaUsuarios.filter(usuario => usuario.situacao === "liberado");
                const qtdLiberados = listaLiberados.length;


                console.log("Quantidade de usuários: ", qtdUsuarios);
                console.log("Quantidade de professores: ", qtdProfessores);
                console.log("Quantidade de alunos: ", qtdAlunos);
                
                const elementosQtdUsuarios = document.querySelectorAll(".qtd_usuarios");
                elementosQtdUsuarios.forEach(elemento => {
                    elemento.innerHTML = qtdUsuarios;
                });
                
                const elementosQtdProfessores = document.querySelectorAll(".qtd_professores");
                elementosQtdProfessores.forEach(elemento => {
                    elemento.innerHTML = qtdProfessores;
                });
                
                const elementosQtdAlunos = document.querySelectorAll(".qtd_alunos");
                elementosQtdAlunos.forEach(elemento => {
                    elemento.innerHTML = qtdAlunos;
                });

                const elementosQtdBloqueados = document.querySelectorAll(".qtd_bloqueados");
                elementosQtdBloqueados.forEach(elemento => {
                    elemento.innerHTML = qtdBloqueados;
                });

                const elementosQtdLiberados = document.querySelectorAll(".qtd_liberados");
                elementosQtdLiberados.forEach(elemento => {
                    elemento.innerHTML = qtdLiberados;
                }); 

                const progressBarSituacao = document.getElementById("progress_bar_situacao");
                const porcentagemLiberados = (qtdLiberados / qtdUsuarios) * 100;
                progressBarSituacao.innerHTML = `
                    <progress id="progress_bar" value="${porcentagemLiberados}" max="100"> ${porcentagemLiberados}% </progress>
                `;

                const corpoTabela = document.getElementById("corpo_tabela_usuarios");

                listaUsuarios.forEach(usuario => {
                    
                      corpoTabela.innerHTML += `
                
                                <tr>
                                    <td>${usuario.id}</td>
                                    <td>${usuario.nome}</td>
                                    <td>${usuario.email}</td>
                                    <td>${usuario.tipo}</td>
                                    <td>${usuario.turma}</td>
                                    <td>${usuario.instituicao}</td>
                                    <td>
                                        <p class="p_status_${usuario.situacao}">${usuario.situacao}</p>
                                    </td>
                                    <td onclick="abrirModal('modal_editar_usuario')"><i class="fi fi-sr-pencil"></i>
                                    </td>
                                    <td onclick="abrirModal('modal_remover_usuario'), definirVisitante(${usuario.id},'${usuario.tipo}')"><i class="fi fi-sr-trash"></i>
                                    </td>
                                </tr>

                `; // Limpa o conteúdo existente na tabela
    

                });


            

                          
            });
        } else {
            console.error("Erro ao listar usuários: ", resposta.status);
        }
    }).catch(function (erro) {
        console.error("Erro na requisição: ", erro);
    });
}   

// Função para listar cursos da instituição
function listarCursosInstituicao(page = 1, limit = 15, q = '', professor = '', situacao = '') {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) {
        console.warn('fkInstituicao não encontrado no sessionStorage.');
        return;
    }

    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';
    const profParam = professor ? `&professor=${encodeURIComponent(professor)}` : '';
    const sitParam = situacao ? `&situacao=${encodeURIComponent(situacao)}` : '';
    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}?page=${page}&limit=${limit}${qParam}${profParam}${sitParam}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (data) {
                console.log("Cursos recebidos: ", data);
                const cursos = data.cursos || [];
                const total = data.total || 0;
                const currentPage = data.page || page;
                const perPage = data.limit || limit;

                const container = document.getElementById('cursos_lista');
                const semCursosMsg = document.getElementById('sem_cursos_msg');
                const cabecalho = document.querySelector('.cabecalho');
                const tituloLista = document.getElementById('container_course');
                const pagination = document.getElementById('pagination_controls');

                if (container) container.innerHTML = '';

                if (!cursos || cursos.length === 0) {
                    if (semCursosMsg) {
                        semCursosMsg.style.display = 'block';
                        semCursosMsg.innerText = 'não há cursos na sua instituição';
                    }
                    if (cabecalho) cabecalho.style.display = 'none';
                    if (tituloLista) tituloLista.style.display = 'none';
                    if (pagination) pagination.innerHTML = '';
                    return;
                }

                // existem cursos: garantir que cabeçalho e título estão visíveis e mensagem escondida
                if (semCursosMsg) semCursosMsg.style.display = 'none';
                if (cabecalho) cabecalho.style.display = '';
                if (tituloLista) tituloLista.style.display = '';

                cursos.forEach(curso => {
                    if (!container) return;
                    container.innerHTML += `
                        <div class="curso_row">
                            <div class="coluna_cursos">
                                <a class="link" href="dashCursoEspecificoAdmin.html?cursoId=${curso.id}"><p>${curso.nome}</p></a>
                            </div>
                            <div class="coluna_quantidade">
                                <p>${curso.quantidade_alunos}</p>
                            </div>
                            <div class="coluna_descricao">
                                <p>${curso.descricao}</p>
                            </div>
                            <div class="coluna_modalidade">
                                <p>${curso.modalidade}</p>
                            </div>
                        </div>
                    `;
                });

                // render pagination controls (usa handler para mudar páginas)
                if (pagination) {
                    renderPaginationWithHandler(pagination, total, perPage, currentPage, (p) => listarCursosInstituicao(p, perPage, q, professor, situacao));
                }

            });
        } else {
            console.error("Erro ao listar cursos: ", resposta.status);
        }
    }).catch(function (erro) {
        console.error("Erro na requisição de cursos: ", erro);
    });
}

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

let _selectedCursoId = null;

function listarCursosAdmin(page = 1, limit = 15, q = '', professor = '', situacao = '') {
    const tbody = document.querySelector('.corpo_tabela');
    const fkInstituicao = sessionStorage.getItem('fkInstituicao');
    if (!fkInstituicao) return;

    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';
    const profParam = professor ? `&professor=${encodeURIComponent(professor)}` : '';
    const sitParam = situacao ? `&situacao=${encodeURIComponent(situacao)}` : '';
    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}?page=${page}&limit=${limit}${qParam}${profParam}${sitParam}`)
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

            const nomeInstituicao = sessionStorage.getItem('nomeInstituicao') || '-';

            cursos.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${c.id}</td>
                    <td>${c.nome}</td>
                    <td>${nomeInstituicao}</td>
                    <td>-</td>
                    <td><p class="p_status_liberado">Liberado</p></td>
                    <td><i class="fi fi-sr-pencil btn-edit" data-id="${c.id}" title="Editar"></i></td>
                    <td><i class="fi fi-sr-trash btn-delete" data-id="${c.id}" title="Remover"></i></td>
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
            if (pagination) renderPaginationWithHandler(pagination, total, perPage, currentPage, (p) => listarCursosAdmin(p, perPage, q, professor, situacao));
        })
        .catch(err => console.error(err));
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
                const professorVal = document.getElementById('filter_professor_text') ? document.getElementById('filter_professor_text').value.trim() : '';
                const situacaoVal = document.getElementById('filter_situacao_select') ? document.getElementById('filter_situacao_select').value : '';
                listarCursosAdmin(1, 15, q, professorVal, situacaoVal);
            };
        }

        // Enter key triggers search
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = searchInput.value.trim();
                const professorVal = document.getElementById('filter_professor_text') ? document.getElementById('filter_professor_text').value.trim() : '';
                const situacaoVal = document.getElementById('filter_situacao_select') ? document.getElementById('filter_situacao_select').value : '';
                listarCursosAdmin(1, 15, q, professorVal, situacaoVal);
            }
        });
    }

    // Inject compact filter icon next to search input and create popover
    if (searchInput) {
        // create filter toggle button
        if (!document.getElementById('btn_filter_toggle')) {
            const filterBtn = document.createElement('button');
            filterBtn.id = 'btn_filter_toggle';
            filterBtn.type = 'button';
            filterBtn.className = 'filter-icon';
            filterBtn.setAttribute('aria-label', 'Filtros');
            filterBtn.innerHTML = '<i class="fi fi-sr-filter" aria-hidden="true"></i>';

            // insert after search input
            searchInput.parentNode.insertBefore(filterBtn, searchInput.nextSibling);

            // create popover container
            const pop = document.createElement('div');
            pop.id = 'filter_popover';
            pop.className = 'filter-popover';
            pop.style.display = 'none';
            document.body.appendChild(pop);

            // move existing filtro-lista into popover (if present) and ensure it's visible
            const existing = document.querySelector('.filtro-lista');
            if (existing) {
                pop.appendChild(existing);
                try { existing.style.display = 'block'; } catch(e) { existing.removeAttribute && existing.removeAttribute('style'); }
            }

            // create a small badge to indicate active filters
            const badge = document.createElement('span');
            badge.className = 'filter-badge';
            badge.style.display = 'none';
            filterBtn.appendChild(badge);

            // make popover focusable for keyboard handling
            pop.tabIndex = -1;

            // helper: read current filter inputs and return an object and active count
            function readFilters() {
                const chkP = document.getElementById('filter_professor');
                const chkS = document.getElementById('filter_situacao');
                const professorVal = (chkP && chkP.checked) ? (document.getElementById('filter_professor_text') ? document.getElementById('filter_professor_text').value.trim() : '') : '';
                const situacaoVal = (chkS && chkS.checked) ? (document.getElementById('filter_situacao_select') ? document.getElementById('filter_situacao_select').value : '') : '';
                const active = ((professorVal && professorVal.length) ? 1 : 0) + ((situacaoVal && situacaoVal.length) ? 1 : 0);
                return { professor: professorVal || '', situacao: situacaoVal || '', active };
            }

            // update badge visual
            function updateFilterBadge() {
                const f = readFilters();
                if (f.active > 0) {
                    badge.innerText = f.active > 1 ? String(f.active) : '';
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }

            // open/close toggle
            filterBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (pop.style.display === 'none') {
                    const rect = filterBtn.getBoundingClientRect();
                    pop.style.left = (rect.left) + 'px';
                    pop.style.top = (rect.bottom + 8) + 'px';
                    pop.style.display = 'block';
                    // focus popover for keyboard
                    setTimeout(() => pop.focus(), 10);
                } else {
                    pop.style.display = 'none';
                }
            });

            // close when clicking outside
            document.addEventListener('click', function (e) {
                if (!pop.contains(e.target) && e.target !== filterBtn) {
                    pop.style.display = 'none';
                }
            });

            // prevent clicks inside popover from closing
            pop.addEventListener('click', function (e) { e.stopPropagation(); });

            // wire apply/clear inside the popover (elements come from moved .filtro-lista)
            function applyFiltersAndClose() {
                const q = searchInput ? searchInput.value.trim() : '';
                const f = readFilters();
                listarCursosAdmin(1, 15, q, f.professor, f.situacao);
                pop.style.display = 'none';
                updateFilterBadge();
            }

            function clearFiltersAndClose() {
                if (searchInput) searchInput.value = '';
                const pf = document.getElementById('filter_professor_text'); if (pf) pf.value = '';
                const fs = document.getElementById('filter_situacao_select'); if (fs) fs.value = '';
                const chkP = document.getElementById('filter_professor'); if (chkP) chkP.checked = false;
                const chkS = document.getElementById('filter_situacao'); if (chkS) chkS.checked = false;
                const profControls = document.getElementById('filter_professor_controls'); if (profControls) profControls.style.display = 'none';
                const sitControls = document.getElementById('filter_situacao_controls'); if (sitControls) sitControls.style.display = 'none';
                listarCursosAdmin(1, 15);
                pop.style.display = 'none';
                updateFilterBadge();
            }

            // key handling: Enter applies, Esc closes
            pop.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    pop.style.display = 'none';
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    applyFiltersAndClose();
                }
            });

            // initial badge state
            updateFilterBadge();

            // wire buttons if present (they exist inside moved .filtro-lista)
            setTimeout(() => {
                const btnApplyLocal = document.getElementById('btn_apply_filters');
                const btnClearLocal = document.getElementById('btn_clear_filters');
                if (btnApplyLocal) btnApplyLocal.onclick = applyFiltersAndClose;
                if (btnClearLocal) btnClearLocal.onclick = clearFiltersAndClose;
            }, 20);
        }
    }

    // wire filter controls show/hide
    const chkProf = document.getElementById('filter_professor');
    const profControls = document.getElementById('filter_professor_controls');
    if (chkProf && profControls) {
        chkProf.addEventListener('change', function () { profControls.style.display = this.checked ? 'block' : 'none'; });
    }
    const chkSit = document.getElementById('filter_situacao');
    const sitControls = document.getElementById('filter_situacao_controls');
    if (chkSit && sitControls) {
        chkSit.addEventListener('change', function () { sitControls.style.display = this.checked ? 'block' : 'none'; });
    }

    

    // initial list (no query)
    listarCursosAdmin(1, 15);
    // update top KPIs
    atualizarTopKPIs();
});

// Atualiza os KPIs no topo da página de cursos (total cursos, liberados/bloqueados, cursos em destaque)
function atualizarTopKPIs() {
    const fkInstituicao = sessionStorage.getItem('fkInstituicao');
    if (!fkInstituicao) return;

    // buscar cursos (para total e top cursos)
    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}?page=1&limit=8`)
        .then(res => res.json())
        .then(data => {
            const totalCursos = data.total || 0;
            const cursos = data.cursos || [];

            const h1Situacao = document.getElementById('h1_situacao');
            if (h1Situacao) h1Situacao.innerText = totalCursos;

            // preencher barras de progresso com os top cursos
            const barrasContainer = document.querySelector('.div_progress_bars');
            if (barrasContainer) {
                barrasContainer.innerHTML = '';
                const nomeInstituicao = sessionStorage.getItem('nomeInstituicao') || '-';

                cursos.slice(0,4).forEach(c => {
                    const div = document.createElement('div');
                    div.className = 'div_progress_bar';
                    const alunosCount = c.quantidade_alunos || 0;
                    const professoresCount = '-';
                    const progresso = Math.min(100, Math.round(alunosCount));

                    div.innerHTML = `
                        <div class="div_cursos_progress_bar">
                            <div class="progress_bar">
                                <div class="indicadores">
                                    <p>${alunosCount} Alunos</p>
                                    <p>${professoresCount} Professores</p>
                                </div>
                                <progress class="progress_instituicao" value="${progresso}" max="100"> ${progresso}% </progress>
                            </div>
                            <p>${String(c.id).padStart(6,'0')} - ${c.nome}</p>
                        </div>
                    `;
                    barrasContainer.appendChild(div);
                });
            }
        })
        .catch(err => console.error('Erro ao atualizar KPIs (cursos):', err));

    // buscar usuários para calcular alunos/professores e liberado/bloqueado
    fetch(`/instituicao/listarUsuariosInstituicao/${fkInstituicao}`)
        .then(res => res.json())
        .then(lista => {
            if (!Array.isArray(lista)) return;

            const qtdUsuarios = lista.length;
            const qtdProfessores = lista.filter(u => u.tipo === 'Professor').length;
            const qtdAlunos = lista.filter(u => u.tipo === 'Aluno').length;
            const qtdLiberados = lista.filter(u => u.situacao === 'liberado').length;
            const qtdBloqueados = lista.filter(u => u.situacao === 'bloqueado').length;

            // Atualiza textos no topo
            // primeiro bloco: total cursos já atualizado; agora atualizar liberado/bloqueado
            try {
                const kpiFooters = document.querySelectorAll('.kpi_footer .p_titulo_kpi');
                if (kpiFooters && kpiFooters.length >= 2) {
                    kpiFooters[0].innerHTML = `<strong>${qtdLiberados} Liberado</strong>`;
                    kpiFooters[1].innerHTML = `<strong>${qtdBloqueados} Bloqueado</strong>`;
                }
            } catch (e) { }

            // segundo painel: número de alunos e professores
            try {
                const indicadores = document.querySelectorAll('.div_cursos_progress_bar .indicadores');
                // Se houver indicadores existentes, atualiza o primeiro conjunto de textos principais
                if (indicadores && indicadores.length > 0) {
                    indicadores.forEach(ind => {
                        const ps = ind.querySelectorAll('p');
                        if (ps[0]) ps[0].innerText = `${qtdAlunos} Alunos`;
                        if (ps[1]) ps[1].innerText = `${qtdProfessores} Professores`;
                    });
                } else {
                    // fallback: tentar atualizar qualquer elemento com class 'indicadores'
                    const primeiroIndicador = document.querySelector('.indicadores');
                    if (primeiroIndicador) {
                        const ps = primeiroIndicador.querySelectorAll('p');
                        if (ps[0]) ps[0].innerText = `${qtdAlunos} Alunos`;
                        if (ps[1]) ps[1].innerText = `${qtdProfessores} Professores`;
                    }
                }
            } catch (e) { }
        })
        .catch(err => console.error('Erro ao atualizar KPIs (usuarios):', err));
}