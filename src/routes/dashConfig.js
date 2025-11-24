const express = require("express");
const router = express.Router();

const dashConfigController = require("../controllers/dashConfigController");



// rota para atualizar informações do usuario 
router.put("/atualizarUsuario/:idUsuario", function(req,res){
    console.log("ID USUARIO:", req.params.idUsuario);
    dashConfigController.atualizarUsuario(req,res);
})


module.exports = router;