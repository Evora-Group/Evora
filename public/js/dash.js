
// Puxa e insere o nome do usuário para todos os elementos com a classe "nome-usuario"
function puxarNomeUsuario() {
  const nomeUsuario = sessionStorage.getItem("nomeUsuario");
    const elementoNomeUsuario = document.querySelectorAll(".nome-usuario");

    elementoNomeUsuario.forEach(element => {
        element.innerHTML = nomeUsuario;
    },);

};


// let listaUsuariosGlobal = [];

// function listarUsuariosInstituicao() {
//     const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    
//     fetch(`/instituicao/listarUsuariosInstituicao/${fkInstituicao}`, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json"
//         }
//     }).then(function (resposta) {
//         if (resposta.ok) {
//             resposta.json().then(function (resposta) {
//                 console.log("Dados recebidos: ", JSON.stringify(resposta));
                
//                 // 2. Salva os dados na variável global
//                 listaUsuariosGlobal = resposta;

//                 // --- Lógica dos KPIs (Total, Professores, Alunos, etc) ---
//                 // Mantemos isso aqui para calcular com base no TOTAL, não no filtro
//                 atualizarKPIs(listaUsuariosGlobal);

//                 // 3. Chama a função que desenha a tabela passando a lista completa
//                 renderizarTabela(listaUsuariosGlobal);
                          
//             });
//         } else {
//             console.error("Erro ao listar usuários: ", resposta.status);
//         }
//     }).catch(function (erro) {
//         console.error("Erro na requisição: ", erro);
//     });
// }   

// // Nova função apenas para desenhar a tabela (reutilizável)
// function renderizarTabela(lista) {
//     const corpoTabela = document.getElementById("corpo_tabela_usuarios");
//     corpoTabela.innerHTML = ""; // Limpa a tabela antes de preencher

//     lista.forEach(usuario => {

//         if (usuario.tipo === 'Professor'){ 
//             tdStatus = `<td>
//                     <p class="p_status_${usuario.situacao}">${usuario.situacao}</p>
//                 </td>`
//         }else{
//             tdStatus = `<td>
//                     <p>N/A</p>
//             </td>`
//         }


//         corpoTabela.innerHTML += `
//             <tr>
//                 <td>${usuario.id}</td>
//                 <td>${usuario.nome}</td>
//                 <td>${usuario.email}</td>
//                 <td>${usuario.tipo}</td>
//                 <td>${usuario.turma}</td>
//                 <td>${usuario.curso}</td>
//                 ${tdStatus}
//                 <td onclick="definirVisitante(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.tipo}', '${usuario.turma}', '${usuario.curso}', '${usuario.instituicao}', '${usuario.situacao}'); abrirModal('modal_editar_usuario'); listarInstituicoes()"><i class="fi fi-sr-pencil"></i></td>
//                 <td onclick="definirVisitante(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.tipo}', '${usuario.turma}', '${usuario.curso}', '${usuario.instituicao}', '${usuario.situacao}'), abrirModal('modal_remover_usuario')"><i class="fi fi-sr-trash"></i>
//                 </td>
//             </tr>
//         `;
//     });
// }

// // Nova função de Pesquisa
// function filtrarUsuarios() {
//     // Pega o valor digitado e transforma em minúsculo
//     const termo = document.getElementById('barra_pesquisa').value.toLowerCase();

//     // Filtra a lista global
//     const listaFiltrada = listaUsuariosGlobal.filter(usuario => {
//         // Verifica se o termo está no ID ou no NOME
//         // Converte ID para string para poder usar .includes()
//         return usuario.id.toString().includes(termo) || 
//                usuario.nome.toLowerCase().includes(termo);
//     });

//     // Redesenha a tabela apenas com os filtrados
//     renderizarTabela(listaFiltrada);
// }

// // Função auxiliar para organizar os KPIs (retirei da listarUsuariosInstituicao para ficar limpo)
// function atualizarKPIs(listaUsuarios) {
//     const qtdUsuarios = listaUsuarios.length;
    
//     const listaProfessores = listaUsuarios.filter(usuario => usuario.tipo === "Professor");
//     const qtdProfessores = listaProfessores.length;

//     const listaAlunos = listaUsuarios.filter(usuario => usuario.tipo === "Aluno");
//     const qtdAlunos = listaAlunos.length;

//     const listaBloqueados = listaUsuarios.filter(usuario => usuario.situacao === "bloqueado" && usuario.tipo === "Professor");
//     const qtdBloqueados = listaBloqueados.length;
    
//     const listaLiberados = listaUsuarios.filter(usuario => usuario.situacao === "liberado" && usuario.tipo === "Professor");
//     const qtdLiberados = listaLiberados.length;

//     // Atualiza o HTML dos KPIs
//     document.querySelectorAll(".qtd_usuarios").forEach(el => el.innerHTML = qtdUsuarios);
//     document.querySelectorAll(".qtd_professores").forEach(el => el.innerHTML = qtdProfessores);
//     document.querySelectorAll(".qtd_alunos").forEach(el => el.innerHTML = qtdAlunos);
//     document.querySelectorAll(".qtd_bloqueados").forEach(el => el.innerHTML = qtdBloqueados);
//     document.querySelectorAll(".qtd_liberados").forEach(el => el.innerHTML = qtdLiberados); 

//     const progressBarSituacao = document.getElementById("progress_bar_situacao");

//     progressBarSituacao.innerHTML = `
//         <progress id="progress_bar" value="${qtdLiberados}" max="${qtdBloqueados + qtdLiberados}"></progress>
//     `;
// }

// Variável para controlar o estado da pesquisa
let termoBuscaAtual = "";

// Alteramos a função para receber a página
function listarUsuariosInstituicao(pagina = 1) {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    
    // Constrói URL com parametros
    const url = `/instituicao/listarUsuariosInstituicao/${fkInstituicao}?page=${pagina}&busca=${termoBuscaAtual}`;

    fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (dados) {
                console.log("Dados recebidos: ", dados);
                
                // 1. Renderiza a Tabela (apenas os 10 itens recebidos)
                renderizarTabela(dados.usuarios);

                // 2. Atualiza os KPIs (usando os dados calculados no banco)
                atualizarKPIs(dados.kpis);

                // 3. Monta os botões de paginação
                renderizarControlesPaginacao(dados.paginacao);
            });
        } else {
            console.error("Erro ao listar usuários.");
        }
    }).catch(erro => console.error("Erro na requisição: ", erro));
}

// Renderiza a tabela (Mantive sua lógica, apenas limpei um pouco)
function renderizarTabela(lista) {
    const corpoTabela = document.getElementById("corpo_tabela_usuarios");
    corpoTabela.innerHTML = "";

    if(lista.length === 0) {
        corpoTabela.innerHTML = "<tr><td colspan='9'>Nenhum usuário encontrado.</td></tr>";
        return;
    }

    lista.forEach(usuario => {
        let classeStatus = usuario.situacao === 'liberado' ? 'p_status_liberado' : 'p_status_bloqueado';
        let siglaStatus = usuario.situacao === 'liberado' ? 'L' : 'B';
        
        let tdStatus = `<td><p class="${classeStatus}">${siglaStatus}</p></td>`;

        corpoTabela.innerHTML += `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.tipo}</td>
                <td>${usuario.turma || '-'}</td>
                <td>${usuario.curso || '-'}</td>
                ${tdStatus}
                <td onclick="definirVisitante(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.tipo}', '${usuario.turma}', '${usuario.curso}', '${usuario.instituicao}', '${usuario.situacao}'); abrirModal('modal_editar_usuario'); listarInstituicoes()"><i class="fi fi-sr-pencil"></i></td>
                <td onclick="definirVisitante(${usuario.id}, '${usuario.nome}', '${usuario.email}', '${usuario.tipo}', '${usuario.turma}', '${usuario.curso}', '${usuario.instituicao}', '${usuario.situacao}'); abrirModal('modal_remover_usuario')"><i class="fi fi-sr-trash"></i></td>
            </tr>
        `;
    });
}

// Atualiza os números do dashboard
function atualizarKPIs(stats) {
    // Agora pegamos direto do objeto stats vindo do back-end
    if(!stats) return;

    document.querySelectorAll(".qtd_usuarios").forEach(el => el.innerHTML = stats.total_geral);
    document.querySelectorAll(".qtd_professores").forEach(el => el.innerHTML = stats.qtd_professores);
    document.querySelectorAll(".qtd_alunos").forEach(el => el.innerHTML = stats.qtd_alunos);
    document.querySelectorAll(".qtd_bloqueados").forEach(el => el.innerHTML = stats.qtd_bloqueados);
    document.querySelectorAll(".qtd_liberados").forEach(el => el.innerHTML = stats.qtd_liberados);

    const progressBar = document.getElementById("progress_bar");
    if(progressBar) {
        progressBar.value = stats.qtd_liberados;
        progressBar.max = stats.total_geral; // ou bloqueados + liberados
    }
}

// Função NOVA para criar os botões "Anterior 1 2 3 Próximo"
function renderizarControlesPaginacao(paginacao) {
    const container = document.getElementById("paginacao_container");
    container.innerHTML = "";

    const atual = paginacao.paginaAtual;
    const total = paginacao.totalPaginas;

    // Botão Anterior
    const btnPrev = document.createElement("button");
    btnPrev.innerHTML = "<";
    btnPrev.className = "btn_paginacao";
    btnPrev.disabled = atual === 1;
    btnPrev.onclick = () => listarUsuariosInstituicao(atual - 1);
    container.appendChild(btnPrev);

    // Lógica para mostrar número limitado de botões (ex: mostra 5 páginas próximas)
    let inicio = Math.max(1, atual - 2);
    let fim = Math.min(total, atual + 2);

    for (let i = inicio; i <= fim; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        btn.className = `btn_paginacao ${i === atual ? 'active' : ''}`;
        btn.onclick = () => listarUsuariosInstituicao(i);
        container.appendChild(btn);
    }

    // Botão Próximo
    const btnNext = document.createElement("button");
    btnNext.innerHTML = ">";
    btnNext.className = "btn_paginacao";
    btnNext.disabled = atual === total;
    btnNext.onclick = () => listarUsuariosInstituicao(atual + 1);
    container.appendChild(btnNext);
}

// Função de Pesquisa (Agora chama o back-end!)
function filtrarUsuarios() {
    const input = document.getElementById('barra_pesquisa');
    termoBuscaAtual = input.value;
    
    // Reinicia na página 1 ao pesquisar
    listarUsuariosInstituicao(1);
}


function listarCursos() {

    const fkInstituicao = sessionStorage.getItem("fkInstituicao");

    console.log("ID da Instituição para listar cursos: ", fkInstituicao);

    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (resposta) {
        if (resposta.ok) {
            resposta.json().then(function (resposta) {
                console.log("Dados recebidos: ", JSON.stringify(resposta));
                
                const listaCursos = resposta;

                const datalist = document.getElementById("cursos");
                datalist.innerHTML = "";

                listaCursos.forEach(curso => {
                    datalist.innerHTML += `
                        <option value="${curso.nome}">${curso.nome}</option>
                    `;
                }); 

            });
        } else {
            console.error("Erro ao listar cursos: ", resposta.status);
        }
    }).catch(function (erro) {
        console.error("Erro na requisição: ", erro);
    });

};

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

// =====================================================
// FUNÇÕES PARA dashCursoAdmin.html (Listagem de Cursos)
// =====================================================

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

            // Elementos Desktop
            const container = document.getElementById('cursos_lista');
            const semMsg = document.getElementById('sem_cursos_msg');
            const cabecalho = document.querySelector('.cabecalho');
            const tituloLista = document.getElementById('container_course');
            const pagination = document.getElementById('pagination_controls');

            // 1. ADICIONADO: Captura o elemento Mobile
            const container_mobile = document.getElementById('cursos_lista_mobile');

            // Limpezas iniciais
            if (container) container.innerHTML = '';
            
            // 2. ADICIONADO: Limpa o container mobile antes de preencher
            if (container_mobile) container_mobile.innerHTML = '';

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
                // Preenche Desktop
                if (container) {
                    container.innerHTML += `
                    <div class="curso_row">
                        <div class="coluna_cursos"><a class="link" href="dashCursoEspecificoAdmin.html?cursoId=${c.id}"><p>${c.nome}</p></a></div>
                        <div class="coluna_quantidade"><p>${c.quantidade_alunos}</p></div>
                        <div class="coluna_descricao"><p>${c.descricao}</p></div>
                        <div class="coluna_modalidade"><p>${c.modalidade}</p></div>
                    </div>`;
                }

                // 3. ADICIONADO: Preenche Mobile com todas as informações
                if (container_mobile) {
                    container_mobile.innerHTML += `
                        <a class="link" href="dashCursoEspecificoAdmin.html?cursoId=${c.id}">
                            <div class="curso_card_mobile">
                                <div class="curso_card_header">
                                    <h3>${c.nome}</h3>
                                    <span class="badge_modalidade">${c.modalidade}</span>
                                </div>
                                <div class="curso_card_info">
                                    <div class="info_item">
                                        <span class="info_label">Alunos</span>
                                        <span class="info_value">${c.quantidade_alunos}</span>
                                    </div>
                                    <div class="info_item info_descricao">
                                        <span class="info_label">Descrição</span>
                                        <span class="info_value">${c.descricao || 'Sem descrição'}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    `;
                }
            });

            if (pagination) renderPaginationWithHandler(pagination, total, perPage, currentPage, (p) => listarCursosInstituicao(p, perPage, q, professor, situacao));
        }).catch(e => console.error('Erro ao listar cursos paginados', e));
}


function listarCursosInstituicaoParaProfessor(page = 1, limit = 15, q = '', professor = '', situacao = '') {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) return;

    // 1. Organiza os parâmetros da URL de forma limpa
    const params = new URLSearchParams({
        page: page,
        limit: limit,
        q: q,
        professor: professor,
        situacao: situacao
    });

    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}?${params.toString()}`)
        .then(r => r.json())
        .then(data => {
            // Extração de dados
            const cursos = data.cursos || [];
            const total = data.total || 0;
            const currentPage = data.page || page;
            const perPage = data.limit || limit;

            // 2. Seleção de Elementos DOM
            const el = {
                listaDesktop: document.getElementById('cursos_lista'),
                listaMobile: document.getElementById('cursos_lista_mobile'),
                msgVazio: document.getElementById('sem_cursos_msg'),
                cabecalho: document.querySelector('.cabecalho'),
                titulo: document.getElementById('container_course'),
                paginacao: document.getElementById('pagination_controls')
            };

            // Limpeza inicial
            if (el.listaDesktop) el.listaDesktop.innerHTML = '';
            if (el.listaMobile) el.listaMobile.innerHTML = '';

            // 3. Cenário: Nenhum curso encontrado
            if (!cursos.length) {
                if (el.msgVazio) {
                    el.msgVazio.style.display = 'block';
                    el.msgVazio.innerText = 'Não há cursos na sua instituição';
                }
                if (el.cabecalho) el.cabecalho.style.display = 'none';
                if (el.titulo) el.titulo.style.display = 'none';
                if (el.paginacao) el.paginacao.innerHTML = '';
                return; 
            }

            // 4. Cenário: Cursos encontrados (Reset de visibilidade)
            if (el.msgVazio) el.msgVazio.style.display = 'none';
            if (el.cabecalho) el.cabecalho.style.display = ''; // Volta ao padrão do CSS (flex/block)
            if (el.titulo) el.titulo.style.display = '';

            // 5. Montagem do HTML (Performance: Monta a string primeiro, insere depois)
            let htmlDesktop = '';
            let htmlMobile = '';

            cursos.forEach(c => {
                // Template Desktop
                htmlDesktop += `
                    <div class="curso_row">
                        <div class="coluna_cursos">
                            <a class="link" href="dashCursoEspecifico.html?cursoId=${c.id}">
                                <p>${c.nome}</p>
                            </a>
                        </div>
                        <div class="coluna_quantidade"><p>${c.quantidade_alunos}</p></div>
                        <div class="coluna_descricao"><p>${c.descricao}</p></div>
                        <div class="coluna_modalidade"><p>${c.modalidade}</p></div>
                    </div>`;

                // Template Mobile com todas as informações
                htmlMobile += `
                    <a class="link" href="dashCursoEspecifico.html?cursoId=${c.id}">
                        <div class="curso_card_mobile">
                            <div class="curso_card_header">
                                <h3>${c.nome}</h3>
                                <span class="badge_modalidade">${c.modalidade}</span>
                            </div>
                            <div class="curso_card_info">
                                <div class="info_item">
                                    <span class="info_label">Alunos</span>
                                    <span class="info_value">${c.quantidade_alunos}</span>
                                </div>
                                <div class="info_item info_descricao">
                                    <span class="info_label">Descrição</span>
                                    <span class="info_value">${c.descricao || 'Sem descrição'}</span>
                                </div>
                            </div>
                        </div>
                    </a>`;
            });

            // Inserção no DOM
            if (el.listaDesktop) el.listaDesktop.innerHTML = htmlDesktop;
            if (el.listaMobile) el.listaMobile.innerHTML = htmlMobile;

            // 6. Configuração da Paginação
            // Nota: Corrigi a chamada recursiva para chamar 'listarCursosInstituicaoParaProfessor'
            if (el.paginacao) {
                renderPaginationWithHandler(
                    el.paginacao, 
                    total, 
                    perPage, 
                    currentPage, 
                    (p) => listarCursosInstituicaoParaProfessor(p, perPage, q, professor, situacao)
                );
            }

        }).catch(e => console.error('Erro ao listar cursos (Professor):', e));
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

    container.appendChild(makeBtn('Prev', currentPage <= 1, () => onPage(currentPage - 1)));

    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
        start = Math.max(1, end - maxButtons + 1);
    }

    if (start > 1) {
        container.appendChild(makeBtn('1', false, () => onPage(1)));
        if (start > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 8px';
            container.appendChild(ellipsis);
        }
    }

    for (let p = start; p <= end; p++) {
        container.appendChild(makeBtn(String(p), false, () => onPage(p), p === currentPage));
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 8px';
            container.appendChild(ellipsis);
        }
        container.appendChild(makeBtn(String(totalPages), false, () => onPage(totalPages)));
    }

    container.appendChild(makeBtn('Next', currentPage >= totalPages, () => onPage(currentPage + 1)));
}

// =====================================================
// FUNÇÕES PARA dashAlertaAdmin.html (Alertas)
// =====================================================

function switchAlerta(tipo) {
    const tabPreocupante = document.getElementById('tab_preocupante');
    const tabAtencao = document.getElementById('tab_atencao');
    
    if (tabPreocupante && tabAtencao) {
        if (tipo === 'preocupante') {
            tabPreocupante.classList.add('active-tab');
            tabAtencao.classList.remove('active-tab');
        } else {
            tabAtencao.classList.add('active-tab');
            tabPreocupante.classList.remove('active-tab');
        }
    }
    listarAlunosAlerta(tipo, 1, 15);
}

function listarAlunosAlerta(tipo = 'preocupante', page = 1, limit = 15) {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) return;

    fetch(`/instituicao/listarAlunosAlerta/${fkInstituicao}?tipo=${tipo}&page=${page}&limit=${limit}`)
        .then(r => r.json())
        .then(data => {
            const alunos = data.alunos || [];
            const total = data.total || 0;
            const currentPage = data.page || page;
            const perPage = data.limit || limit;
            const container = document.getElementById('alertas_lista');
            const semMsg = document.getElementById('sem_alertas_msg');
            const pagination = document.getElementById('pagination_controls_alertas');

            if (container) container.innerHTML = '';
            if (!alunos.length) {
                if (semMsg) { semMsg.style.display = 'block'; semMsg.innerText = 'não há alunos em alerta na sua instituição'; }
                if (pagination) pagination.innerHTML = '';
                return;
            }
            if (semMsg) semMsg.style.display = 'none';

            alunos.forEach(a => {
                if (!container) return;
                container.innerHTML += `
                <div class="dados_linha">
                    <div class="coluna_aluno"><p>${a.nome}</p></div>
                    <div class="coluna_turma"><p>${a.turma || '-'}</p></div>
                    <div class="coluna_descricao"><p>${a.descricao || '-'}</p></div>
                    <div class="coluna_nota"><p>${parseFloat(a.media_nota).toFixed(1)}</p></div>
                    <div class="coluna_presenca"><p>${parseFloat(a.frequencia).toFixed(1)}%</p></div>
                </div>`;
            });

            if (pagination) renderPaginationWithHandler(pagination, total, perPage, currentPage, (p) => listarAlunosAlerta(tipo, p, perPage));
        }).catch(e => console.error('Erro ao listar alertas', e));
}

// =====================================================
// FUNÇÕES PARA dash_admin_cursos.html (CRUD de Cursos)
// =====================================================

function listarCursosAdmin(page = 1, limit = 15) {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) return;

    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}?page=${page}&limit=${limit}`)
        .then(r => r.json())
        .then(data => {
            const cursos = data.cursos || [];
            const total = data.total || 0;
            const currentPage = data.page || page;
            const perPage = data.limit || limit;
            const corpoTabela = document.querySelector('.corpo_tabela');
            const pagination = document.getElementById('pagination_controls');

            if (corpoTabela) corpoTabela.innerHTML = '';

            cursos.forEach(c => {
                if (!corpoTabela) return;
                const nomeInstituicao = sessionStorage.getItem("nomeInstituicao") || '-';
                const profAlocados = c.num_professores > 0 ? `${c.num_professores} professor(es)` : 'Nenhum';
                corpoTabela.innerHTML += `
                <tr>
                    <td>${c.id_curso}</td>
                    <td>${c.nome}</td>
                    <td>${nomeInstituicao}</td>
                    <td>${profAlocados}</td>
                    <td onclick="abrirModalEditar(${c.id_curso})"><i class="fi fi-sr-pencil"></i></td>
                    <td onclick="abrirModalRemover(${c.id_curso})"><i class="fi fi-sr-trash"></i></td>
                </tr>`;
            });

            if (pagination) renderPaginationWithHandler(pagination, total, perPage, currentPage, (p) => listarCursosAdmin(p, perPage));
        }).catch(e => console.error('Erro ao listar cursos admin', e));
}

function atualizarKPIsAdmin() {
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    if (!fkInstituicao) return;

    fetch(`/instituicao/listarCursosInstituicao/${fkInstituicao}?page=1&limit=1000`)
        .then(r => r.json())
        .then(data => {
            const cursos = data.cursos || [];
            const total = cursos.length;
            const h1Situacao = document.getElementById('h1_situacao');
            if (h1Situacao) h1Situacao.innerText = total;

            // Preencher progress bars
            const divProgressBars = document.querySelector('.div_progress_bars');
            if (divProgressBars) {
                divProgressBars.innerHTML = '';
                cursos.slice(0, 4).forEach(c => {
                    divProgressBars.innerHTML += `
                    <div class="div_progress_bar">
                        <div class="div_cursos_progress_bar">
                            <div class="progress_bar">
                                <div class="indicadores">
                                    <p>${c.quantidade_alunos} Alunos</p>
                                    <p>${c.num_professores} Professores</p>
                                </div>
                                <progress class="progress_instituicao" value="${c.quantidade_alunos}" max="100">${c.quantidade_alunos}%</progress>
                            </div>
                            <p>${c.id_curso} - ${c.nome}</p>
                        </div>
                    </div>`;
                });
            }
        }).catch(e => console.error('Erro ao atualizar KPIs admin', e));
}

function abrirModalEditar(idCurso) {
    fetch(`/instituicao/obterCurso/${idCurso}`)
        .then(r => r.json())
        .then(curso => {
            const modal = document.getElementById('modal_editar_curso');
            if (!modal) return;
            const form = modal.querySelector('form');
            if (form) {
                form.querySelector('[name="nome"]').value = curso.nome || '';
                form.querySelector('[name="descricao"]').value = curso.descricao || '';
                form.querySelector('[name="modalidade"]').value = curso.modalidade || '';
                form.querySelector('[name="duracao_semestres"]').value = curso.duracao_semestres || '';
            }
            modal.dataset.cursoId = idCurso;
            modal.showModal();
        }).catch(e => console.error('Erro ao obter curso', e));
}

function salvarEdicaoCurso() {
    const modal = document.getElementById('modal_editar_curso');
    if (!modal) return;
    const idCurso = modal.dataset.cursoId;
    const form = modal.querySelector('form');
    const dados = {
        nome: form.querySelector('[name="nome"]').value,
        descricao: form.querySelector('[name="descricao"]').value,
        modalidade: form.querySelector('[name="modalidade"]').value,
        duracao_semestres: form.querySelector('[name="duracao_semestres"]').value
    };

    fetch(`/instituicao/editarCurso/${idCurso}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    }).then(r => {
        if (r.ok) {
            modal.close();
            listarCursosAdmin(1, 15);
            atualizarKPIsAdmin();
        }
    }).catch(e => console.error('Erro ao editar curso', e));
}

function abrirModalRemover(idCurso) {
    const modal = document.getElementById('modal_remover_usuario');
    if (!modal) return;
    modal.dataset.cursoId = idCurso;
    modal.showModal();
}

function confirmarRemocaoCurso() {
    const modal = document.getElementById('modal_remover_usuario');
    if (!modal) return;
    const idCurso = modal.dataset.cursoId;

    fetch(`/instituicao/deletarCurso/${idCurso}`, { method: 'DELETE' })
        .then(r => {
            if (r.ok) {
                modal.close();
                listarCursosAdmin(1, 15);
                atualizarKPIsAdmin();
            }
        }).catch(e => console.error('Erro ao deletar curso', e));
}

function criarNovoCurso() {
    const modal = document.getElementById('modal_criar_curso');
    if (!modal) return;
    
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    
    // Pegando os valores pelos IDs específicos
    const nome = document.getElementById('nome_curso').value.trim();
    const descricao = document.getElementById('descricao_curso').value.trim();
    const modalidade = document.getElementById('modalidade_curso').value;
    const duracao = document.getElementById('duracao_curso').value;
    
    // Validação básica
    if (!nome) {
        alert('Por favor, digite o nome do curso.');
        return;
    }
    
    const dados = {
        nome: nome,
        descricao: descricao || null,
        modalidade: modalidade || null,
        duracao_semestres: duracao ? parseInt(duracao) : null
    };
    
    console.log('Criando curso com dados:', dados);

    fetch(`/instituicao/criarCurso/${fkInstituicao}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    }).then(r => {
        if (r.ok) {
            alert('Curso criado com sucesso!');
            modal.close();
            // Limpar formulário
            document.getElementById('nome_curso').value = '';
            document.getElementById('descricao_curso').value = '';
            document.getElementById('modalidade_curso').value = '';
            document.getElementById('duracao_curso').value = '';
            listarCursosAdmin(1, 15);
            atualizarKPIsAdmin();
        } else {
            r.json().then(err => {
                alert('Erro ao criar curso: ' + (err.message || err));
            });
        }
    }).catch(e => {
        console.error('Erro ao criar curso', e);
        alert('Erro ao criar curso. Verifique o console.');
    });
}