document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Recuperar dados da Sessão
    const raAluno = sessionStorage.getItem("raAlunoDetalhe");
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    const nomeProfessor = sessionStorage.getItem("nomeUsuario");

    // Validar se tem acesso
    if (!raAluno || !fkInstituicao) {
        alert("Nenhum aluno selecionado. Voltando para a lista.");
        window.location.href = "dashAlunos.html";
        return;
    }

    // Atualizar nome do professor no Header
    if (nomeProfessor) {
        document.getElementById("h1_nome_professor").innerHTML = nomeProfessor;
    }

    // 2. FETCH PARA DADOS CADASTRAIS (Card lateral)
    fetch(`/aluno/buscarPorRa/${raAluno}`)
        .then(res => {
            if(res.ok) return res.json();
            throw new Error("Erro ao buscar dados do aluno");
        })
        .then(dados => {
            // Agora o HTML tem o ID correto "aluno_nome"
            document.getElementById("aluno_nome").innerHTML = dados.nome;
            document.getElementById("ra_aluno").innerHTML = dados.ra;
            document.getElementById("email_aluno").innerHTML = dados.email;
            document.getElementById("turma_aluno").innerHTML = dados.turma;
            document.getElementById("curso_aluno").innerHTML = dados.curso;
        })
        .catch(err => console.error("Erro dados aluno:", err));


    // 3. FETCH PARA DADOS DE DESEMPENHO (Gráfico e KPIs)
    fetch(`/aluno/desempenho/${raAluno}/${fkInstituicao}`)
        .then(res => {
            if (res.status === 204) return []; 
            if (res.ok) return res.json();
            throw new Error("Erro ao buscar desempenho");
        })
        .then(listaDesempenho => {
            console.log("Dados do Gráfico:", listaDesempenho);
            plotarGraficoEAtualizarKpis(listaDesempenho);
        })
        .catch(err => console.error("Erro desempenho:", err));

});

function plotarGraficoEAtualizarKpis(dados) {
    const ctx = document.getElementById('meuGraficoDeLinha').getContext('2d');

    let labelsDisciplinas = [];
    let dadosFrequencia = [];
    let dadosNota = [];
    
    let somaNota = 0;
    let somaFreq = 0;

    dados.forEach(registro => {
        labelsDisciplinas.push(registro.disciplina);
        dadosFrequencia.push(registro.frequencia);
        
        // Multiplicamos nota por 10 para o gráfico
        dadosNota.push(registro.nota * 10); 

        somaNota += registro.nota;
        somaFreq += registro.frequencia;
    });

    // --- Atualizar KPIs (Médias) ---
    if (dados.length > 0) {
        let mediaNota = somaNota / dados.length;
        let mediaFreq = somaFreq / dados.length;

        document.getElementById("h1_situacao_nota").innerHTML = mediaNota.toFixed(1); 
        document.getElementById("h1_situacao_frequencia").innerHTML = mediaFreq.toFixed(0) + "%";
    } else {
        document.getElementById("h1_situacao_nota").innerHTML = "-"; 
        document.getElementById("h1_situacao_frequencia").innerHTML = "-";
    }

    // --- Configuração do Gráfico ---
    const dataConfig = {
        labels: labelsDisciplinas,
        datasets: [
            {
                label: 'Frequência',
                data: dadosFrequencia,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgb(54, 162, 235)',
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: 'rgb(54, 162, 235)',
                tension: 0.4,
                fill: false,
            },
            {
                label: 'Nota',
                data: dadosNota, 
                borderColor: 'rgb(173, 216, 230)',
                backgroundColor: 'rgb(173, 216, 230)',
                borderWidth: 2,
                pointRadius: 6,
                pointBackgroundColor: 'rgb(173, 216, 230)',
                tension: 0.4,
                fill: false,
            }
        ]
    };

    const config = {
        type: 'line',
        data: dataConfig,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.dataset.label === 'Nota') {
                                label += (context.parsed.y / 10).toFixed(1);
                            } else {
                                label += context.parsed.y + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { font: { size: 14 }, color: 'rgb(100, 100, 100)' }
                },
                y: {
                    min: 0,
                    max: 100,
                    ticks: { stepSize: 25, font: { size: 14 }, color: 'rgb(100, 100, 100)' },
                    grid: { color: 'rgba(200, 200, 200, 0.5)', drawBorder: false }
                }
            }
        }
    };

    new Chart(ctx, config);
}
