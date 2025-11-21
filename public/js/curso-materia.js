document.addEventListener('DOMContentLoaded', function() {

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

    // --- 3. Gráfico de Barras (barChart) ---
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

    // --- 5. NOVO Gráfico de Anel (notasChart) ---
    const notasCanvas = document.getElementById('notasChart');
    if (notasCanvas) {
        // Defina os dados e as cores
        const dataNotas = {
            labels: [
                'NOTAS ACIMA DA MÉDIA',
                'NOTAS NA MÉDIA',
                'NOTAS ABAIXO DA MÉDIA',
                'OUTRAS'
            ],
            datasets: [{
                label: 'Distribuição de Notas',
                data: [15, 30, 45, ], // Seus dados aqui
                backgroundColor: [
                    '#00FF00', // Verde
                    '#1F78B4', // Azul
                    '#ff3300ff' // Vermelho
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
                    // Desabilita legenda padrão (pois usamos a customizada HTML)
                    legend: { display: false },
                    tooltip: { enabled: true },
                    // Desabilita datalabels neste gráfico específico para ficar limpo como a imagem
                    datalabels: { display: false } 
                }
            }
        };

        new Chart(notasCanvas, configNotas);
    }
});

const frequenciaCanvas = document.getElementById('frequenciaChart');
    
    if (frequenciaCanvas) {
        const frequenciaCtx = frequenciaCanvas.getContext('2d');
        new Chart(frequenciaCtx, {
            type: 'bar',
            data: {
                labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho'],
                datasets: [{
                    label: 'Frequência',
                    data: [50, 20, 98, 40, 80, 100, 20],
                    backgroundColor: 'blue',
                    borderWidth: 0,
                    borderRadius: 4,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Essencial para o CSS controlar a altura
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
                        color: 'white',
                        anchor: 'end',
                        align: 'bottom',
                        formatter: (value) => value + '%',
                        font: { weight: 'bold' }
                    }
                }
            }
        });
    }