document.addEventListener('DOMContentLoaded', function() {
    
    const raAluno = sessionStorage.getItem("raAlunoDetalhe");
    const fkInstituicao = sessionStorage.getItem("fkInstituicao");
    const nomeProfessor = sessionStorage.getItem("nomeUsuario");

    if (!raAluno || !fkInstituicao) {
        alert("Nenhum aluno selecionado.");
        window.location.href = "dashAlunos.html";
        return;
    }

    if (nomeProfessor) {
        const h1 = document.getElementById("h1_nome_professor");
        if(h1) h1.innerHTML = nomeProfessor;
    }

    // 1. DADOS CADASTRAIS
    fetch(`/aluno/buscarPorRa/${raAluno}`)
        .then(res => res.json())
        .then(dados => {
            document.getElementById("aluno_nome").innerHTML = dados.nome;
            document.getElementById("ra_aluno").innerHTML = dados.ra;
            document.getElementById("email_aluno").innerHTML = dados.email;
            document.getElementById("turma_aluno").innerHTML = dados.turma;
            document.getElementById("curso_aluno").innerHTML = dados.curso;
        })
        .catch(err => console.error(err));

    // 2. DADOS GERAIS (Presenças, Faltas, Qtd Notas)
    fetch(`/aluno/geral/${raAluno}`)
        .then(res => res.json())
        .then(dados => {
            document.getElementById("dias_presencias").innerHTML = `${dados.total_presencas} Presenciais`;
            document.getElementById("dias_faltas").innerHTML = `${dados.total_faltas} Faltas`;
            document.getElementById("notas_registradas").innerHTML = `${dados.total_notas} notas registradas`;
        })
        .catch(err => console.error("Erro dados gerais:", err));

    // 3. DESEMPENHO E GRÁFICO
    fetch(`/aluno/desempenho/${raAluno}/${fkInstituicao}`)
        .then(res => {
            if (res.status === 204) return [];
            return res.json();
        })
        .then(lista => {
            plotarGraficoEAtualizarKpis(lista);
        })
        .catch(err => console.error(err));
});

function plotarGraficoEAtualizarKpis(dados) {
    const ctx = document.getElementById('meuGraficoDeLinha').getContext('2d');

    let labels = [];
    let dadosFreq = [];
    let dadosNota = [];
    let somaNota = 0;
    let somaFreq = 0;

    dados.forEach(reg => {
        labels.push(reg.disciplina);
        let nota = Number(reg.nota);
        let freq = Number(reg.frequencia);
        
        if(isNaN(nota)) nota = 0;
        if(isNaN(freq)) freq = 0;

        dadosFreq.push(freq);
        dadosNota.push(nota * 10);
        somaNota += nota;
        somaFreq += freq;
    });

    // --- CALCULA MÉDIAS E ATUALIZA TELA ---
    if (dados.length > 0) {
        let mediaNota = somaNota / dados.length;
        let mediaFreq = somaFreq / dados.length; 

        document.getElementById("h1_situacao_nota").innerHTML = mediaNota.toFixed(1); 
        document.getElementById("h1_situacao_frequencia").innerHTML = mediaFreq.toFixed(0) + "%";

        // 1. Atualiza o círculo de %
        atualizarCirculoFrequencia(mediaFreq);

        // 2. Atualiza o texto "Ótimo/Regular/Atenção" (NOVO!)
        atualizarStatusGeral(mediaNota, mediaFreq);

    } else {
        document.getElementById("h1_situacao_nota").innerHTML = "-"; 
        document.getElementById("h1_situacao_frequencia").innerHTML = "-";
        document.getElementById("status_desempenho").innerHTML = "Sem dados";
    }

    // Configuração do Gráfico
    if (window.meuGrafico) window.meuGrafico.destroy();
    window.meuGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Frequência',
                    data: dadosFreq,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgb(54, 162, 235)',
                    borderWidth: 3,
                    tension: 0.4
                },
                {
                    label: 'Nota',
                    data: dadosNota,
                    borderColor: 'rgb(173, 216, 230)',
                    backgroundColor: 'rgb(173, 216, 230)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { min: 0, max: 100 }
            }
        }
    });
}

// --- FUNÇÕES VISUAIS ---

function atualizarCirculoFrequencia(porcentagem) {
    const circulo = document.getElementById("circFreq");
    const graus = porcentagem * 3.6;
    const corPreenchida = "#4d5bf9"; 
    const corVazia = "#eef2f5"; 
    circulo.style.background = `conic-gradient(${corPreenchida} ${graus}deg, ${corVazia} 0deg)`;
}

// NOVA FUNÇÃO: Define se é Ótimo, Regular ou Atenção
function atualizarStatusGeral(mediaNota, mediaFreq) {
    const elementoStatus = document.getElementById("status_desempenho");
    
    // Remove as classes antigas para não acumular
    elementoStatus.classList.remove("p_status_otimo", "p_status_regular", "p_status_atencao");

    // Regra de Negócio
    if (mediaNota >= 8 && mediaFreq >= 75) {
        // Caso ÓTIMO
        elementoStatus.innerHTML = "Ótimo";
        elementoStatus.classList.add("p_status_otimo");
    } 
    else if (mediaNota >= 6 && mediaFreq >= 75) {
        // Caso REGULAR (Notas medianas, mas frequente)
        elementoStatus.innerHTML = "Regular";
        elementoStatus.classList.add("p_status_regular");
    } 
    else {
        // Caso ATENÇÃO (Nota baixa OU falta muito)
        elementoStatus.innerHTML = "Atenção";
        elementoStatus.classList.add("p_status_atencao");
    }
}