function pass_part2() {
    const title = document.getElementById("h3_title_form");
    const subtitle = document.getElementById("span_title_form");
    const pass = document.getElementById("span_text_progress_pass");
    const complet = document.getElementById("span_text_progress_complet");
    const bar33 = document.getElementById("div_33percent");
    const bar67 = document.getElementById("div_67percent");
    const labelForm = document.getElementById("label_form");
    const divFuncaoInput = document.getElementById("div_funcao_input");
    const divBeneficios = document.getElementById("div_beneficios");
    const divFuncaoInput1 = document.getElementById("div_funcao_input_1");
    const divFuncaoInput2 = document.getElementById("div_funcao_input_2");

    title.innerText = "Sua função na educação";
    subtitle.innerText = "Isso nos ajuda a personalizar sua experiência";
    pass.innerText = "Passo 2 de 3";
    complet.innerText = "67% completo";
    bar33.style.display = "none";
    bar67.style.display = "block";
    labelForm.innerText = "Qual é a sua função?";

    // Substitui o input por um select
    divFuncaoInput.innerHTML = `
        <label for="select_funcao" id="label_form">Qual é a sua função?</label><br>
        <select id="select_funcao" name="funcao">
            <option value="" disabled selected>Selecione sua função na instituição</option>
            <option value="diretor">Diretor(a) / Reitor(a)</option>
            <option value="coordenador_pedagogico">Coordenador(a) Pedagógico</option>
            <option value="coordenador_curso">Coordenador(a) de Curso</option>
            <option value="professor">Professor(a)</option>
            <option value="analista">Analista Educacional(a)</option>
            <option value="secretario">Secretário(a) Acadêmico(a)</option>
            <option value="administrador">Administrador(a)</option>
            <option value="pesquisador">Pesquisador(a)</option>
            <option value="estudante">Estudante(a)</option>
            <option value="outro">Outro</option>
        </select><br>
    `;

    // Exibe benefícios da Évora
    divFuncaoInput1.style.display = "none";
    divFuncaoInput2.style.display = "none";
    divBeneficios.style.display = "flex";
    divBeneficios.innerHTML = `
        <div class="beneficios_descricao">
            <h5>Benefícios da sua conta Évora</h5><br>
            <ul>
                <li>Dashboard personalizado com métricas relevantes para sua função</li>
                <li>Relatórios automáticos de permanência estudantil</li>
                <li>Alertas integilentes sobre riscos de evasão</li>
                <li>Acesso a biblioteca de recursos educacionais</li>
            </ul>
        </div>
    `;
}