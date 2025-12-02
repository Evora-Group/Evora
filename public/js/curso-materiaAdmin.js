document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do curso específico
    carregarCursoEspecifico();

    // --- 1. Lógica dos Dropdowns ---
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');
    if (dropdownBtns) {
        dropdownBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const dropdown = btn.parentElement;
                dropdown.classList.toggle('open');
            });
        });
    }

    // --- 2. Configuração Global do Chart.js ---
    // Registra o plugin de DataLabels se ele estiver carregado
    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }
});

    // --- 3. Gráfico de Barras (barChart) ---
    /* Substituído pela função dinamica */
    const barCanvas = document.getElementById('barChart');
    if (barCanvas) {
        const barCtx = barCanvas.getContext('2d');
        const labelsBar = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro'];
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labelsBar,
                datasets: [{
                    label: 'Nota média',
                    data: [5, 2, 10, 4, 8, 7, 6, 4, 7, 5],
                    backgroundColor: 'blue',
                    borderWidth: 0
                }]
            },
            options: {
                animation: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 2, max: 10 }
                    },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { display: true },
                    datalabels: {
                        color: '#fff',
                        anchor: 'center',
                        align: 'center',
                        font: { weight: 'bold', size: 14 }
                    }
                }
            }
        });
    }

    // --- 4. Gráfico de Pizza (pieChart) ---
    const pieCanvas = document.getElementById('pieChart');
    if (pieCanvas) {
        const pieCtx = pieCanvas.getContext('2d');
        new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Situação NOK', 'Situação OK'],
                datasets: [{
                    data: [30, 70],
                    backgroundColor: ['blue', '#0ea5e9'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                animation: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: { usePointStyle: true, padding: 20 }
                    },
                    datalabels: {
                        formatter: (value) => value + '%',
                        color: '#fff',
                        font: { weight: 'bold', size: 16 }
                    }
                }
            }
        });
    }


function carregarCursoEspecifico() {
    // Pega o ID do curso da URL
    const params = new URLSearchParams(window.location.search);
    const idCurso = params.get('cursoId');

    if (!idCurso) {
        console.error('ID do curso não encontrado na URL');
        return;
    }

    // Carregar nome do curso e total de alunos
    fetch(`/instituicao/obterCursoEspecifico/${idCurso}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById('nome_cursoEspecifico').textContent = data.nome;
            document.getElementById('totalAlunos').textContent = data.total_alunos;
        })
        .catch(e => console.error('Erro ao obter curso específico:', e));

    // Carregar lista de alunos
    carregarAlunosCurso(idCurso);

    // Carregar estatísticas e gráficos
    carregarEstatisticasCurso(idCurso);
}

function carregarAlunosCurso(idCurso) {
    fetch(`/instituicao/listarAlunosCurso/${idCurso}`)
        .then(r => r.json())
        .then(alunos => {
            const tbody = document.querySelector('.corpo_tabela');
            const tbody_mobile = document.querySelector('.corpo_tabela_mobile')
            tbody.innerHTML = '';
            tbody_mobile.innerHTML = '';

            alunos.forEach(aluno => {
                const classeDesempenho = getClasseDesempenho(aluno.desempenho);
                tbody.innerHTML += `
                    <tr onclick="irParaAlunoEspecifico(${aluno.ra})">
                        <td>${aluno.ra}</td>
                        <td>${aluno.nome}</td>
                        <td>${aluno.email}</td>
                        <td>${aluno.turma}</td>
                        <td>
                            <p class="${classeDesempenho}">
                                ${aluno.desempenho}
                            </p>
                        </td>
                        <td></td>
                    </tr>
                `;
                tbody_mobile.innerHTML += `

                <tr onclick="irParaAlunoEspecifico(${aluno.ra})">
                     <td>
                                    <h3>${aluno.nome}</h3>
                                    <p>${aluno.email}</p>
                                    <p>${aluno.turma}</p>
                                </td>
                                <td>
                                    <p class="${classeDesempenho}">${aluno.desempenho}</p>
                                </td>

                </tr>

                `;
            });
        })
        .catch(e => console.error('Erro ao listar alunos do curso:', e));
}

function irParaAlunoEspecifico(raAluno) {
    sessionStorage.setItem("raAlunoDetalhe", raAluno);
    window.location.href = 'alunoEspecificoAdmin.html';
}

function getClasseDesempenho(desempenho) {
    if (!desempenho) return 'p_status_atencao';
    const s = desempenho.toLowerCase();
    if (s.includes('aten')) return 'p_status_atencao';
    if (s.includes('regu')) return 'p_status_regular';
    if (s.includes('ótim') || s.includes('otim')) return 'p_status_otimo';
    return 'p_status_atencao';
}

function carregarEstatisticasCurso(idCurso) {
    fetch(`/instituicao/obterEstatisticasCurso/${idCurso}`)
        .then(r => r.json())
        .then(stats => {
            if (stats && stats.length > 0) {
                const data = stats[0];
                
                // Dados para o gráfico de notas (anel)
                const totalAlunos = data.total_alunos || 1;
                const acima = data.alunos_acima_media || 0;
                const na_media = data.alunos_na_media || 0;
                const abaixo = data.alunos_abaixo_media || 0;

                // Desenhar gráfico de notas
                desenharGraficoNotas(acima, na_media, abaixo);

                // Carregar dados de frequência por mês
                carregarFrequenciaPorMes(idCurso);
            }
        })
        .catch(e => console.error('Erro ao obter estatísticas:', e));
}

function carregarFrequenciaPorMes(idCurso) {
    fetch(`/instituicao/obterFrequenciaPorMesCurso/${idCurso}`)
        .then(r => {
            if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
            return r.json();
        })
        .then(frequencias => {
            console.log('Frequências por mês recebidas:', frequencias);
            
            const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho'];
            const dadosFrequencia = new Array(7).fill(0);

            if (frequencias && Array.isArray(frequencias) && frequencias.length > 0) {
                // Mapear dados retornados para cada mês
                frequencias.forEach(freq => {
                    const indice = freq.mes - 1;
                    if (indice >= 0 && indice < 7) {
                        dadosFrequencia[indice] = parseFloat(freq.frequencia_media) || 0;
                    }
                });
            }

            console.log('Dados de frequência processados:', dadosFrequencia);
            
            // Desenhar gráfico com dados
            desenharGraficoFrequencia(dadosFrequencia);
        })
        .catch(e => {
            console.error('Erro ao obter frequência por mês:', e);
            // Desenha com zeros em caso de erro
            const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho'];
            desenharGraficoFrequencia(new Array(meses.length).fill(0));
        });
}

function desenharGraficoNotas(acima, na_media, abaixo) {
    const notasCanvas = document.getElementById('notasChart');
    if (!notasCanvas) return;

    // Destruir gráfico anterior se existir
    if (window.notasChartInstance) {
        window.notasChartInstance.destroy();
    }

    const dataNotas = {
        labels: [
            'NOTAS ACIMA DA MÉDIA',
            'NOTAS NA MÉDIA',
            'NOTAS ABAIXO DA MÉDIA'
        ],
        datasets: [{
            label: 'Distribuição de Notas',
            data: [acima, na_media, abaixo],
            backgroundColor: [
                '#2ecc71', // Verde
                '#f1c40f', // Amarelo
                '#e74c3c'  // Vermelho
            ],
            hoverOffset: 3
        }]
    };

    const configNotas = {
        type: 'doughnut',
        data: dataNotas,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
                datalabels: { display: false }
            }
        }
    };

    window.notasChartInstance = new Chart(notasCanvas, configNotas);
}

function desenharGraficoFrequencia(frequenciaMedia) {
    console.log('Desenhando gráfico de frequência com dados:', frequenciaMedia);
    
    const frequenciaCanvas = document.getElementById('frequenciaChart');
    if (!frequenciaCanvas) {
        console.error('Canvas frequenciaChart não encontrado!');
        return;
    }

    // Destruir gráfico anterior se existir
    if (window.frequenciaChartInstance) {
        window.frequenciaChartInstance.destroy();
    }

    // Dados de frequência por mês
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho'];
    
    // Se frequenciaMedia é um array (dados por mês), usar diretamente
    // Caso contrário, criar array com o mesmo valor para todos os meses
    let dadosFrequencia = Array.isArray(frequenciaMedia) 
        ? frequenciaMedia 
        : meses.map(() => frequenciaMedia);

    // Garantir que todos os valores são números válidos
    dadosFrequencia = dadosFrequencia.map(v => {
        const num = parseFloat(v);
        return isNaN(num) ? 0 : num;
    });

    console.log('Dados finais para o gráfico:', dadosFrequencia);

    try {
        const frequenciaCtx = frequenciaCanvas.getContext('2d');
        window.frequenciaChartInstance = new Chart(frequenciaCtx, {
            type: 'bar',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Frequência Média (%)',
                    data: dadosFrequencia,
                    backgroundColor: '#0ea5e9',
                    borderWidth: 0,
                    borderRadius: 4,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { callback: (value) => value + '%' }
                    },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: false
                    }
                }
            }
        });
        console.log('Gráfico de frequência criado com sucesso');
    } catch (error) {
        console.error('Erro ao criar gráfico de frequência:', error);
    }
}