

const dashConfigModel = require("../models/dashConfigModel");

function atualizarUsuario(req, res) {
    const idUsuario = req.params.idUsuario;
    const { nome, email, instituicao, cargo, senha } = req.body;

    if (!idUsuario) {
        return res.status(400).send("ID do usuário não enviado!");
    }

    dashConfigModel.atualizarUsuario(
        idUsuario,
        nome,
        email,
        instituicao,
        cargo,
        senha
    )
    .then(() => {
        return res.status(200).json({ mensagem: "Usuário atualizado com sucesso!" });
    })
    .catch((erro) => {
        console.error("Erro ao atualizar usuário:", erro);
        return res.status(500).json(erro);
    });
}

module.exports = {
    atualizarUsuario
};
