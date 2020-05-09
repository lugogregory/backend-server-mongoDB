var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' });

// usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }, crea una RELACIÓN directa con el usuario que lo creó.

module.exports = mongoose.model('Hospital', hospitalSchema);