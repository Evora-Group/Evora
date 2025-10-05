var express = require("express");
var router = express.Router();

var userController = require("../controllers/userController");

router.post("/cadastrar", function (req, res) {
    userController.cadastrar(req,res);
});

router.post("/logar", function (req, res) {
    userController.logar(req,res);
});

router.get("/validarEmail", function (req, res) {
    userController.validarEmail(req,res);
});

module.exports = router;