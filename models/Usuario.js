const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
