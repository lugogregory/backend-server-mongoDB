// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicialización de variables
var app = express();

// Config parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importo Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Conexión con la Base de Datos
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, res) => {

    if (err) throw err; // Si sucede un error el programa no seguirá ejecutandose. 

    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'ONLINE');

});


// Uso de rutas importadas
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes); // Cuando te soliciten la ruta '/', usas la indicada en el archivo appRoutes


// Escuchar peticiones y definir puerto
// \x1b[32m%s\x1b[0m para cambiar el segundo parametro del console.log a color VERDE
app.listen(3000, () => {
    console.log('Express en puerto 3000: \x1b[32m%s\x1b[0m', 'ONLINE');
});