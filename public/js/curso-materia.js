    document.querySelectorAll('.dropdown-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dropdown = btn.parentElement;
      dropdown.classList.toggle('open');
        });
    });


    Chart.register(ChartDataLabels);

    const barCtx = document.getElementById('barChart').getContext('2d');
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
                    ticks: {
                        stepSize: 2,
                        max: 10
                    }
                },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { display: true },
                datalabels: {
                    color: '#fff',
                    anchor: 'center',
                    align: 'center',
                    font: {
                        weight: 'bold',
                        size: 14
                    }
                }
            }
        }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
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
                    position: 'right', // Posição da legenda
                    labels: {
                        usePointStyle: true, // Usa pontos ao invés de quadrados na legenda
                        padding: 20 // Espaçamento entre itens da legenda
                    }
                },
                datalabels: { // Plugin para mostrar as porcentagens
                    formatter: (value, ctx) => {
                        return value + '%';
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 16
                    }
                }
            }
        }
    });