var express = require('express');
var fileUpload = require('express-fileupload');

// Importo los tipos (usuario, medicos, hospitales), para poder validar el parámetro recibido y las extensiones permitidas
var TIPOS = require('../config/config').TIPOS;
var EXT = require('../config/config').EXTENSIONES;

// File system, de Node, para remover archivos. 
var fs = require('fs');

// Importo los modelos
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');

var app = express();

// MiddleWare de la libreria "fileUpload"
app.use(fileUpload());

// Defino dos parámetros para poder construir el nombre del archivo a subir en el server.
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo; // recojo ambos parametros
    var id = req.params.id;

    if (TIPOS.indexOf(tipo) === -1) { // si el tipo (parametro) no se encuentra en el array
        return res.status(400).json({
            ok: false,
            mensaje: 'Los tipos válidos son: ' + TIPOS.join(', '),
            errors: { mensaje: 'Tipo de dato inválido' }
        });
    }

    if (!req.files) { // Si no contiene ningun archivo
        return res.status(400).json({
            ok: false,
            mensaje: 'Debe seleccionar una imagen',
            errors: { mensaje: 'Debe seleccionar una imagen' }
        });
    }

    var archivo = req.files.imagen; // 'imagen' es el nombre que le doy al parametro en el request.
    var nombreCortado = archivo.name.split('.'); // Dividir el nombre en array separados por '.'
    var extension = nombreCortado[nombreCortado.length - 1];

    if (EXT.indexOf(extension) === -1) { // si el tipo archivo no se encuentra en el array
        return res.status(400).json({
            ok: false,
            mensaje: 'Los tipos de archivos válidos son: ' + EXT.join(', '),
            errors: { mensaje: 'Tipo de dato inválido' }
        });
    }

    var nombreArch = `${id}-${new Date().getMilliseconds()}.${extension}`; // Genero el nombre del archivo ejem: 72717128972.112.jpg
    var path = `./uploads/${tipo}/${nombreArch}`; // Defino el path donde se almacena la imagen

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al subir la imagen al server',
                errors: { mensaje: 'Error al subir la imagen al server' }
            });
        }

        uploadImgType(tipo, id, nombreArch, res);
    });
});


// =============================================================
// Funcion que permite asignar la imagen a la entidad (usuario, medico, hospital)
// =============================================================

function uploadImgType(tipo, id, nombreArch, res) {

    var Modelo;

    switch (tipo) {
        case 'usuarios':
            Modelo = Usuario;
            break;
        case 'medicos':
            Modelo = Medico;
            break;
        case 'hospitales':
            Modelo = Hospital;
            break;
    }

    if (Modelo) {

        Modelo.findById(id, (err, entidad) => {

            if (err || !entidad) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El id de ' + tipo + ' no existe',
                    errors: { mensaje: 'id inválido' }
                });
            }

            var pathOld = '';

            console.log(entidad);

            if (entidad)
                pathOld = `./uploads/${tipo}/${entidad.img}`;

            if (fs.existsSync(pathOld)) // Si existe una imagen asociada a la enitdad la borro
                fs.unlinkSync(pathOld);

            entidad.img = nombreArch; // asigno nuevo nombre de imagen

            entidad.save((err, entidadUpdate) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar la imagen',
                        errors: { mensaje: 'Error al guardar la imagen' }
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen guardada con exito',
                    data: entidadUpdate
                });

            });
        });
    }

}

module.exports = app;