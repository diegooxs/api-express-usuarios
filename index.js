const express = require('express');
const mongoose = require('mongoose');

const Usuario = require('./models/Usuario');
const Cliente = require('./models/Cliente');
const Articulo = require('./models/Articulo');

const app = express();
const PORT = 3000;

// Middleware para leer JSON
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/proyecto_api')
  .then(() => {
    console.log('Conectado correctamente a MongoDB');
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB:', error.message);
  });

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API REST con Express, MongoDB y Mongoose funcionando',
    recursos: {
      usuarios: '/usuarios',
      clientes: '/clientes',
      articulos: '/articulos'
    }
  });
});

// Ruta de información
app.get('/info', (req, res) => {
  res.json({
    materia: 'Desarrollo de Servicios Web',
    practica: 'API REST con MongoDB y Mongoose',
    descripcion: 'CRUD de usuarios, clientes y articulos',
    baseDatos: 'MongoDB',
    orm: 'Mongoose',
    servidor: 'Ubuntu Server'
  });
});

/* ======================================================
   CRUD USUARIOS
====================================================== */

// GET todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();

    res.status(200).json({
      mensaje: 'Listado de usuarios',
      total: usuarios.length,
      usuarios: usuarios
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener usuarios',
      error: error.message
    });
  }
});

// GET usuario por ID
app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Usuario encontrado',
      usuario: usuario
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'ID de usuario invalido',
      error: error.message
    });
  }
});

// POST crear usuario
app.post('/usuarios', async (req, res) => {
  try {
    const { usuario, nombre, password, rol } = req.body;

    if (!usuario || !nombre || !password || !rol) {
      return res.status(400).json({
        mensaje: 'Faltan datos. Debes enviar usuario, nombre, password y rol'
      });
    }

    const nuevoUsuario = new Usuario({
      usuario,
      nombre,
      password,
      rol
    });

    const usuarioGuardado = await nuevoUsuario.save();

    res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      usuario: usuarioGuardado
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: 'Ese usuario ya existe'
      });
    }

    res.status(500).json({
      mensaje: 'Error al crear usuario',
      error: error.message
    });
  }
});

// PUT actualizar usuario
app.put('/usuarios/:id', async (req, res) => {
  try {
    const { usuario, nombre, password, rol } = req.body;

    if (!usuario || !nombre || !password || !rol) {
      return res.status(400).json({
        mensaje: 'Faltan datos. Debes enviar usuario, nombre, password y rol'
      });
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      {
        usuario,
        nombre,
        password,
        rol
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Usuario actualizado correctamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: 'Ese usuario ya existe'
      });
    }

    res.status(400).json({
      mensaje: 'Error al actualizar usuario',
      error: error.message
    });
  }
});

// DELETE eliminar usuario
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuarioEliminado) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Usuario eliminado correctamente',
      usuarioEliminado: usuarioEliminado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al eliminar usuario',
      error: error.message
    });
  }
});

/* ======================================================
   CRUD CLIENTES
====================================================== */

// GET todos los clientes
app.get('/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find();

    res.status(200).json({
      mensaje: 'Listado de clientes',
      total: clientes.length,
      clientes: clientes
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener clientes',
      error: error.message
    });
  }
});

// GET cliente por ID
app.get('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Cliente encontrado',
      cliente: cliente
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'ID de cliente invalido',
      error: error.message
    });
  }
});

// POST crear cliente
app.post('/clientes', async (req, res) => {
  try {
    const { nombre, correo, telefono, direccion } = req.body;

    if (!nombre || !correo || !telefono || !direccion) {
      return res.status(400).json({
        mensaje: 'Faltan datos. Debes enviar nombre, correo, telefono y direccion'
      });
    }

    const nuevoCliente = new Cliente({
      nombre,
      correo,
      telefono,
      direccion
    });

    const clienteGuardado = await nuevoCliente.save();

    res.status(201).json({
      mensaje: 'Cliente creado correctamente',
      cliente: clienteGuardado
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: 'Ese correo ya esta registrado'
      });
    }

    res.status(500).json({
      mensaje: 'Error al crear cliente',
      error: error.message
    });
  }
});

// PUT actualizar cliente
app.put('/clientes/:id', async (req, res) => {
  try {
    const { nombre, correo, telefono, direccion } = req.body;

    if (!nombre || !correo || !telefono || !direccion) {
      return res.status(400).json({
        mensaje: 'Faltan datos. Debes enviar nombre, correo, telefono y direccion'
      });
    }

    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        correo,
        telefono,
        direccion
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!clienteActualizado) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Cliente actualizado correctamente',
      cliente: clienteActualizado
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: 'Ese correo ya esta registrado'
      });
    }

    res.status(400).json({
      mensaje: 'Error al actualizar cliente',
      error: error.message
    });
  }
});

// DELETE eliminar cliente
app.delete('/clientes/:id', async (req, res) => {
  try {
    const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);

    if (!clienteEliminado) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Cliente eliminado correctamente',
      clienteEliminado: clienteEliminado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al eliminar cliente',
      error: error.message
    });
  }
});

/* ======================================================
   CRUD ARTICULOS
====================================================== */

// GET todos los articulos
app.get('/articulos', async (req, res) => {
  try {
    const articulos = await Articulo.find();

    res.status(200).json({
      mensaje: 'Listado de articulos',
      total: articulos.length,
      articulos: articulos
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener articulos',
      error: error.message
    });
  }
});

// GET articulo por ID
app.get('/articulos/:id', async (req, res) => {
  try {
    const articulo = await Articulo.findById(req.params.id);

    if (!articulo) {
      return res.status(404).json({
        mensaje: 'Articulo no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Articulo encontrado',
      articulo: articulo
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'ID de articulo invalido',
      error: error.message
    });
  }
});

// POST crear articulo
app.post('/articulos', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria } = req.body;

    if (!nombre || !descripcion || precio === undefined || stock === undefined || !categoria) {
      return res.status(400).json({
        mensaje: 'Faltan datos. Debes enviar nombre, descripcion, precio, stock y categoria'
      });
    }

    const nuevoArticulo = new Articulo({
      nombre,
      descripcion,
      precio,
      stock,
      categoria
    });

    const articuloGuardado = await nuevoArticulo.save();

    res.status(201).json({
      mensaje: 'Articulo creado correctamente',
      articulo: articuloGuardado
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al crear articulo',
      error: error.message
    });
  }
});

// PUT actualizar articulo
app.put('/articulos/:id', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria } = req.body;

    if (!nombre || !descripcion || precio === undefined || stock === undefined || !categoria) {
      return res.status(400).json({
        mensaje: 'Faltan datos. Debes enviar nombre, descripcion, precio, stock y categoria'
      });
    }

    const articuloActualizado = await Articulo.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        descripcion,
        precio,
        stock,
        categoria
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!articuloActualizado) {
      return res.status(404).json({
        mensaje: 'Articulo no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Articulo actualizado correctamente',
      articulo: articuloActualizado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al actualizar articulo',
      error: error.message
    });
  }
});

// DELETE eliminar articulo
app.delete('/articulos/:id', async (req, res) => {
  try {
    const articuloEliminado = await Articulo.findByIdAndDelete(req.params.id);

    if (!articuloEliminado) {
      return res.status(404).json({
        mensaje: 'Articulo no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Articulo eliminado correctamente',
      articuloEliminado: articuloEliminado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al eliminar articulo',
      error: error.message
    });
  }
});

// Levantar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
