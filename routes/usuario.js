var express = require('express');
var bcryptjs = require('bcryptjs');
var SEED = require('../config/config').SEED;
var jwt = require('jsonwebtoken');

var mdAuthentica = require('../middlewares/authentication');

var app = express();

var Usuario = require('../models/usuario');


// =============================================================
// Servicio GET para obtener todos los usuarios
// =============================================================

app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role').exec(
        (err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al extraerr usuarios',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
});


// =============================================================
// Validar TOKEN // Coloco esta función encima del resto que requiera validacion.
// =============================================================

// app.use('/', (req, res, next) => {

//     var token = req.query.token; // Extraigo el token del parametro de la request.... OJO se envía como opcional xxx?=token=asasasas

//     jwt.verify(token, SEED, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({
//                 ok: false,
//                 mensaje: 'Token inválido o expirado',
//                 errors: err
//             });
//         }

//         next(); // Esta función indica que si el token es válido puede continuar con el resto de las funciones.
//     });

// });


// =============================================================
// Actualizar usuario
// =============================================================

app.put('/:id', mdAuthentica.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body; // Body del request.

    Usuario.findById(id, (err, usuarioBD) => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });

        if (!usuarioBD)
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con id: ' + id + ' no existe',
                errors: { mensaje: 'El usuario con id: ' + id + ' no existe' }
            });


        usuarioBD.nombre = body.nombre;
        usuarioBD.email = body.email;
        usuarioBD.role = body.role;


        usuarioBD.save((err, usuarioSave) => {
            if (err)
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });

            usuarioSave.password = ':)';

            return res.status(200).json({
                ok: true,
                mensaje: 'Usuario actualizado correctamente',
                usuario: usuarioSave
            });

        });
    });
});

// =============================================================
// Borrar un usuario
// =============================================================

app.delete('/:id', mdAuthentica.verificaToken, (req, res) => {

    var id = req.params.id; // Obtengo el id de la request

    Usuario.findByIdAndRemove(id, (err, userDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario con id: ' + id,
                errors: err
            });
        }

        if (!userDeleted) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con el id: ' + id,
                errors: { mensaje: 'No existe un usuario con el id: ' + id }
            });
        }
        return res.status(200).json({
            ok: true,
            user: userDeleted
        });
    });
});

// =============================================================
// Servicio POST para crear un usuario
// =============================================================

// envío la f8unción "mdAuthentica.verificaToken" que se encarga de verificar el token antes de crear un usuario

app.post('/', mdAuthentica.verificaToken, (req, res) => {
    var body = req.body; // captura el body de la request (Es posible por bady-parse)

    // Asigno los valores de body a un nuevo objeto de tipo Usuario (MoOdelo)
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcryptjs.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });

    usuario.save((err, userSave) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            mensaje: 'Usuario creado',
            data: userSave,
            userLogged: req.usuario
        });
    });
});



module.exports = app;