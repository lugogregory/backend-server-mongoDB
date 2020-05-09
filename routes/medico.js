var express = require('express');
var mdAuthentica = require('../middlewares/authentication');


var app = express();

var Medico = require('../models/medico');


// =============================================================
// Servicio GET para obtener todos los Medicos
// =============================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // Si no viene el parametro "desde" la variable toma cero (0)
    desde = Number(desde); // parseo para convertirla a numero. 

    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde) // desde que posición quiero los registros
        .limit(5) // cantidad de registros por página
        .populate('usuario', 'nombre email') // POPULATE me sirve para traer toda la info del usuario (objeto) y No sólo el ID.
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al extraer medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        data: medicos,
                        total: conteo
                    });
                });
            });
});

// =============================================================
// Actualizar Medico
// =============================================================

app.put('/:id', mdAuthentica.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body; // Body del request.

    Medico.findById(id, (err, medicoBD) => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });

        if (!medicoBD)
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con id: ' + id + ' no existe',
                errors: { mensaje: 'El medico con id: ' + id + ' no existe' }
            });

        // Actualizo los campos
        medicoBD.nombre = body.nombre;
        medicoBD.usuario = req.usuario._id;
        medicoBD.hospital = body.hospital ? body.hospital : medicoBD.hospital;

        medicoBD.save((err, medicoSave) => {
            if (err)
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });

            return res.status(200).json({
                ok: true,
                mensaje: 'Medico actualizado correctamente',
                data: medicoSave,
                userLogged: req.usuario
            });
        });
    });
});

// =============================================================
// Borrar un Medico
// =============================================================

app.delete('/:id', mdAuthentica.verificaToken, (req, res) => {

    var id = req.params.id; // Obtengo el id de la request

    Medico.findByIdAndRemove(id, (err, medicoDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico con id: ' + id,
                errors: err
            });
        }

        if (!medicoDeleted) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con el id: ' + id,
                errors: { mensaje: 'No existe un medico con el id: ' + id }
            });
        }
        return res.status(200).json({
            ok: true,
            data: medicoDeleted,
            userLogged: req.usuario
        });
    });
});

// =============================================================
// Servicio POST para crear un Medico
// =============================================================

app.post('/', mdAuthentica.verificaToken, (req, res) => {
    var body = req.body; // captura el body de la request (Es posible por bady-parse)

    // Asigno los valores de body a un nuevo objeto
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoSave) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            mensaje: 'Medico creado',
            data: medicoSave,
            userLogged: req.usuario
        });
    });
});



module.exports = app;