var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:nombre', (req, res, next) => {

    var tipo = req.params.tipo; // Extraido los parametros
    var nombreImg = req.params.nombre;

    var pathImg = path.resolve(__dirname, `../uploads/${tipo}/${nombreImg}`);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        var pathNoImg = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImg);
    }
});

module.exports = app;