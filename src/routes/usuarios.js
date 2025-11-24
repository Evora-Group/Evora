var express = require("express");
var router = express.Router();
var UsuarioController = require("../controllers/usuarioController");

// router.post("/cadastrarUsuario", function (req, res) {
//     UsuarioController.cadastrarUsuario(req, res);
// });

router.put("/editarUsuario/:idUsuario", function (req, res) {
    UsuarioController.editarUsuario(req, res);
});

router.put("/editarAluno/:idUsuario", function (req, res) {
    UsuarioController.editarAluno(req, res);
});

router.delete("/removerUsuario/:idUsuario", function (req, res) {
    console.log("Rota para remover usuário chamada.");
    UsuarioController.removerUsuario(req, res);
});

router.delete("/removerAluno/:idUsuario", function (req, res) {
    console.log("Rota para remover aluno chamada.");
    UsuarioController.removerAluno(req, res);
});

router.post("/cadastrarAluno", function (req, res) {
    UsuarioController.cadastrarAluno(req, res);
});

router.post("/cadastrarProfessor", function (req, res) {
    UsuarioController.cadastrarProfessor(req, res);
});


module.exports = router;