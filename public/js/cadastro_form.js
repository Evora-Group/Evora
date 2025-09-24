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
    const divTitleBottom = document.getElementById("div_title_bottom");

    divTitleBottom.style.display = "none";
    title.innerText = "Sua função na educação";
    subtitle.innerText = "Isso nos ajuda a personalizar sua experiência";
    pass.innerText = "Passo 2 de 3";
    complet.innerText = "67% completo";
    bar33.style.display = "none";
    bar67.style.display = "block";
    bar67.style.width = "33%";
        setTimeout(() => {
            bar67.style.width = "67%";
        }, 50);
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

    // Troca a função do botão para pass_part3
    const btnRight = document.getElementById("btn_right");
    btnRight.onclick = pass_part3;
}

function pass_part3() {
    const title = document.getElementById("h3_title_form");
    const subtitle = document.getElementById("span_title_form");
    const pass = document.getElementById("span_text_progress_pass");
    const complet = document.getElementById("span_text_progress_complet");
    const bar33 = document.getElementById("div_33percent");
    const bar67 = document.getElementById("div_67percent");
    const bar100 = document.getElementById("div_100percent");
    const divFuncaoInput = document.getElementById("div_funcao_input");
    const divBeneficios = document.getElementById("div_beneficios");
    const divFuncaoInput1 = document.getElementById("div_funcao_input_1");
    const divFuncaoInput2 = document.getElementById("div_funcao_input_2");
    const divTitleBottom = document.getElementById("div_title_bottom");

    // Atualiza textos
    title.innerText = "Segurança da conta";
    subtitle.innerText = "Crie uma senha segura para proteger sua conta";
    pass.innerText = "Passo 3 de 3";
    complet.innerText = "100% completo";

    // Esconde barras anteriores
    if (bar33) bar33.style.display = "none";
    if (bar67) bar67.style.display = "none";

    // Mostra e preenche a barra 100%
    if (bar100) {
        bar100.style.display = "block";
        bar100.style.width = "0";
        setTimeout(() => {
            bar100.style.width = "100%";
        }, 50);
    }

    // Esconde campos anteriores
    if (divFuncaoInput1) divFuncaoInput1.style.display = "none";
    if (divFuncaoInput2) divFuncaoInput2.style.display = "none";
    if (divBeneficios) divBeneficios.style.display = "none";
    if (divTitleBottom) divTitleBottom.style.display = "none";

    // Troca o conteúdo de divFuncaoInput para senha e confirmação
    divFuncaoInput.innerHTML = `
        <div class="div_label_input">
            <label for="senha" id="label_senha">Criar senha</label><br>
            <input type="password" id="senha" name="senha" placeholder="Crie uma senha"><br><br>
        </div>
        <div class="div_label_input">
            <label for="confirma_senha" id="label_confirma_senha">Confirmar senha</label><br>
            <input type="password" id="confirma_senha" name="confirma_senha" placeholder="Repita a senha"><br><br>
        </div>
        <div class="div_termos" display:flex>
            <input type="checkbox" id="aceito_termos" name="aceito_termos">
            <label for="aceito_termos">Concordo com os Termos e Política de privacidade da Évora</label>
        </div>
        <div class="div_aviso">
            <strong>Importante:</strong> A Évora é projetada para dados educacionais agregados. Não colete informações pessoais sensíveis de estudantes sem as devidas autorizações.
        </div>
    `;
}