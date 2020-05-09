var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// =============================================================
// Buscar en una colección especifica
// =============================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda; // captura el parámetro de la busqueda
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i'); // "i" indica que NO tome en cuenta mayusculas y minusculas, Insensitive.

    var promesa;

    switch (tabla) {
        case 'hospital':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'medico':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda válidos son: hospital, medico y usuario.',
                errors: { mensaje: 'propiedad coleccion/tabla incorrecta' }
            });
            break;
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data // Al colocar la variable "tabla" así --> [tabla] hago referencia al valor interno de la variable
        });
    });
});


// =============================================================
// Buscar en todas las tablas
// =============================================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda; // captura el parámetro de la busqueda
    var regex = new RegExp(busqueda, 'i'); // "i" indica que NO tome en cuenta mayusculas y minusculas, Insensitive.

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2],
        });
    });
});

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }]) // "or" me permite buscar en diferentes campos de la tabla
            .exec((err, data) => {
                if (err)
                    reject('Error en: ' + busqueda);
                resolve(data);
            });
    });
}

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex }, (err, data) => {
            if (err)
                reject('Error en: ' + busqueda);
            resolve(data);
        });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email role') // Extraigo el objeto de usuario y hospital con "POPULATE"
            .populate('hospital', 'nombre')
            .exec((err, data) => {
                if (err)
                    reject('Error en: ' + busqueda);
                resolve(data);
            });
    });
}

module.exports = app;