// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicialización de variables
var app = express();

// Conexión con la Base de Datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err; // Si sucede un error el programa no seguirá ejecutandose. 

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'ONLINE');

});

// Creación de Rutas

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición recibida correctamente'
    });
});

// Escuchar peticiones y definir puerto
// \x1b[32m%s\x1b[0m para cambiar el segundo parametro del console.log a color VERDE
app.listen(3000, () => {
    console.log('Express en puerto 3000: \x1b[32m%s\x1b[0m', 'ONLINE');
});