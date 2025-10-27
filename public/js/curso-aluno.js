        const ctx = document.getElementById('mixChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
                datasets: [
                    { label: 'Notas', data: [50, 35, 70, 35, 60, 65, 80], backgroundColor: '#1d4ed8', borderRadius: 6, barThickness: 16, borderSkipped: false },
                    { label: 'Frequência', data: [105, 70, 85, 55, 95, 40, 100], backgroundColor: '#f59e0b', borderRadius: 6, barThickness: 16, borderSkipped: false }
                ]
            },
            options: {
                animation: false,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'top', align: 'end', labels: { boxWidth: 10 } }, tooltip: { enabled: true } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(2,79,255,.06)' } }, x: { grid: { display: false } } }
            }
        });

        // Tabs
        (function () {
            const tabButtons = document.querySelectorAll('#tabs .tab');
            const panels = document.querySelectorAll('.tab-panel');
            tabButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    tabButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    panels.forEach(p => p.classList.remove('active'));
                    const target = document.querySelector(btn.dataset.target);
                    if (target) target.classList.add('active');
                });
            });
        })();