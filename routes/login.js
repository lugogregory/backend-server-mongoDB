var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED; // Importo mi SEED para usar en la generación del token
var TOKEN_EXPIRED = require('../config/config').TOKEN_EXPIRED; // Importo el tiempo de expiración del token

var app = express();

var Usuario = require('../models/usuario');


// =============================================================
// Método para logearse
// =============================================================

app.post('/', (req, res) => {

    var body = req.body; // capturo el body de la request


    Usuario.findOne({ email: body.email }, (err, usuarioDB) => { // Busco un usuario que coincida con ese email "findOne", porque se supone que el campo es "unique"
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al hacer login',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email'
            });
        }

        if (!bcryptjs.compareSync(body.password, usuarioDB.password)) { // Comparo las contraseñas con el método para desencriptar
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password'
            });
        }

        // Generar el token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: TOKEN_EXPIRED }); //Estas son 4 horas.

        return res.status(200).json({
            ok: true,
            mensaje: 'Login correcto',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });
});



module.exports = app;