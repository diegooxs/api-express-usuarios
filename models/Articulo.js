const mongoose = require('mongoose');

const articuloSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const Articulo = mongoose.model('Articulo', articuloSchema);

module.exports = Articulo;
