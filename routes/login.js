var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED; // Importo mi SEED para usar en la generación del token
var TOKEN_EXPIRED = require('../config/config').TOKEN_EXPIRED; // Importo el tiempo de expiración del token

var app = express();

var Usuario = require('../models/usuario');


// =============================================================
// Autenticación con Google
// =============================================================

var CLIENT_ID = require('../config/config').CLIENT_ID; // Id de Google Sign-In

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };

}

app.post('/google', async(req, res) => {

    var token = req.body.token; // Recojo del body de la request el token del usuario

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token inválido'
            });
        });


    // Procedo a colocar la lógica para DAR de ALTA al usuario si éste no existe. 

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear usuario google',
                errors: { mensaje: 'Error al crear usuario google' }
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe realizar la auntenticación normal',
                    errors: { mensaje: 'Debe realizar la auntenticación normal' }
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: TOKEN_EXPIRED }); //Estas son 4 horas.

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Login correcto',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            var usuario = new Usuario();

            usuario.nombre = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.password = ':)';
            usuario.google = true;

            usuario.save((err, usuarioSave) => {

                if (err)
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al crear usuario google',
                        errors: { mensaje: 'Error al crear usuario google' }
                    });

                var token = jwt.sign({ usuario: usuarioSave }, SEED, { expiresIn: TOKEN_EXPIRED }); //Estas son 4 horas.

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Login correcto',
                    usuario: usuarioSave,
                    token: token,
                    id: usuarioSave._id
                });
            });
        }
    });
});


// =============================================================
// Autenticación normal
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