var express = require("express");
var router = express.Router();
var UsuarioController = require("../controllers/usuarioController");

// router.post("/cadastrarUsuario", function (req, res) {
//     UsuarioController.cadastrarUsuario(req, res);
// });

// router.put("/editarUsuario/:idUsuario", function (req, res) {
//     UsuarioController.editarUsuario(req, res);
// });

router.delete("/removerUsuario/:idUsuario", function (req, res) {
    console.log("Rota para remover usuário chamada.");
    UsuarioController.removerUsuario(req, res);
});

router.delete("/removerAluno/:idUsuario", function (req, res) {
    console.log("Rota para remover aluno chamada.");
    UsuarioController.removerAluno(req, res);
});

module.exports = router;