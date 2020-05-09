var express = require('express');
var mdAuthentica = require('../middlewares/authentication');


var app = express();

var Hospital = require('../models/hospital');


// =============================================================
// Servicio GET para obtener todos los hospitales
// =============================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // Si no viene el parametro "desde" la variable toma cero (0)
    desde = Number(desde); // parseo para convertirla a numero. 

    Hospital.find({}, 'nombre img usuario')
        .skip(desde) // desde que posición quiero los registros
        .limit(5) // cantidad de registros por página
        .populate('usuario', 'nombre email') // POPULATE me sirve para traer toda la info del usuario (objeto) y No sólo el ID.
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al extraer hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        data: hospitales,
                        total: conteo
                    });
                });
            });
});

// =============================================================
// Actualizar hospital
// =============================================================

app.put('/:id', mdAuthentica.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body; // Body del request.

    Hospital.findById(id, (err, hospitalBD) => {
        if (err)
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });

        if (!hospitalBD)
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con id: ' + id + ' no existe',
                errors: { mensaje: 'El hospital con id: ' + id + ' no existe' }
            });

        // Actualizo los campos
        hospitalBD.nombre = body.nombre;
        hospitalBD.usuario = req.usuario._id;

        hospitalBD.save((err, hospitalSave) => {
            if (err)
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });

            return res.status(200).json({
                ok: true,
                mensaje: 'Hospital actualizado correctamente',
                data: hospitalSave,
                userLogged: req.usuario
            });
        });
    });
});

// =============================================================
// Borrar un Hospital
// =============================================================

app.delete('/:id', mdAuthentica.verificaToken, (req, res) => {

    var id = req.params.id; // Obtengo el id de la request

    Hospital.findByIdAndRemove(id, (err, hospitalDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital con id: ' + id,
                errors: err
            });
        }

        if (!hospitalDeleted) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con el id: ' + id,
                errors: { mensaje: 'No existe un hospital con el id: ' + id }
            });
        }
        return res.status(200).json({
            ok: true,
            data: hospitalDeleted,
            userLogged: req.usuario
        });
    });
});

// =============================================================
// Servicio POST para crear un hospital
// =============================================================

// envío la f8unción "mdAuthentica.verificaToken" que se encarga de verificar el token antes de crear un usuario

app.post('/', mdAuthentica.verificaToken, (req, res) => {
    var body = req.body; // captura el body de la request (Es posible por bady-parse)

    // Asigno los valores de body a un nuevo objeto
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
    });

    hospital.save((err, hospitalSave) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            mensaje: 'Hospital creado',
            data: hospitalSave,
            userLogged: req.usuario
        });
    });
});



module.exports = app;