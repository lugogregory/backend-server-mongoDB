var SEED = require('../config/config').SEED;
var jwt = require('jsonwebtoken');


// =============================================================
// Validar TOKEN // La uso insertandola como 2do parámetro en las request que la necesiten.
// =============================================================

exports.verificaToken = function(req, res, next) {

    var token = req.query.token; // Extraigo el token del parametro de la request.... OJO se envía como opcional xxx?=token=asasasas

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token inválido o expirado',
                errors: err
            });
        }

        req.usuario = decoded.usuario; // Agrego al request el usuario que está autenticado, para tenerlo disponible en mi request hija.

        next(); // Esta función indica que si el token es válido puede continuar con el resto de las funciones.
    });
};