const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const Usuario = require('./models/Usuario');
const Cliente = require('./models/Cliente');
const Articulo = require('./models/Articulo');

const app = express();
const PORT = 3000;

// Clave secreta para firmar y verificar el token JWT
const JWT_SECRET = '12345';

// ======================================================
//  INTERRUPTOR DE CORS (practica de CORS)
//  false = SIN cors  -> el navegador BLOQUEA las peticiones
//                        que vengan de otro origen (ej: React en :5173)
//  true  = CON cors  -> el navegador PERMITE esas peticiones
//  Cambia este valor y REINICIA el servidor para ver el antes/despues.
//  (Postman NO aplica CORS, por eso siempre funciona en Postman)
// ======================================================
const USAR_CORS = false;

if (USAR_CORS) {
  app.use(cors()); // habilita CORS para cualquier origen (demo)
  console.log('CORS HABILITADO -> el navegador SI permite peticiones desde otro origen');
} else {
  console.log('CORS DESHABILITADO -> el navegador BLOQUEARA peticiones desde otro origen');
}

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

// Ruta principal pública
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API REST con Express, MongoDB, Mongoose y JWT funcionando',
    recursos: {
      login: '/login',
      usuarios: '/usuarios',
      clientes: '/clientes',
      articulos: '/articulos'
    }
  });
});

// Ruta de información pública
app.get('/info', (req, res) => {
  res.json({
    materia: 'Desarrollo de Servicios Web',
    practica: 'API REST con MongoDB, Mongoose, bcryptjs y JWT',
    descripcion: 'CRUD de usuarios, clientes y articulos con rutas protegidas por token',
    baseDatos: 'MongoDB',
    orm: 'Mongoose',
    seguridad: 'Password hasheado con bcryptjs y autenticacion con JWT',
    servidor: 'Ubuntu Server'
  });
});

/* ======================================================
   LOGIN CON JWT
====================================================== */

app.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        mensaje: 'Debes enviar usuario y password'
      });
    }

    // Buscar usuario en MongoDB
    const usuarioEncontrado = await Usuario.findOne({ usuario: usuario });

    if (!usuarioEncontrado) {
      return res.status(401).json({
        mensaje: 'Usuario o password incorrectos'
      });
    }

    // Comparar password enviada con password hasheada
    const passwordValido = await bcrypt.compare(password, usuarioEncontrado.password);

    if (!passwordValido) {
      return res.status(401).json({
        mensaje: 'Usuario o password incorrectos'
      });
    }

    // Crear token con tiempo de vida de 2 minutos
    const token = jwt.sign(
      {
        id: usuarioEncontrado._id,
        usuario: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol
      },
      JWT_SECRET,
      {
        expiresIn: '2m'
      }
    );

    res.status(200).json({
      mensaje: 'Inicio de sesion correcto',
      token: token,
      tipo: 'Bearer',
      expiraEn: '2 minutos'
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error en login',
      error: error.message
    });
  }
});

/* ======================================================
   MIDDLEWARE PARA VERIFICAR JWT
====================================================== */

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      mensaje: 'Token no proporcionado'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      mensaje: 'Formato de token invalido. Usa Bearer TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.usuario = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      mensaje: 'Token invalido o expirado',
      error: error.message
    });
  }
}

/* ======================================================
   CRUD USUARIOS
   NOTA:
   POST /usuarios queda público para poder crear usuarios.
   GET, PUT y DELETE quedan protegidos con JWT.
====================================================== */

// GET todos los usuarios - PROTEGIDO
app.get('/usuarios', verificarToken, async (req, res) => {
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

// GET usuario por ID - PROTEGIDO
app.get('/usuarios/:id', verificarToken, async (req, res) => {
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

// POST crear usuario con password hasheado - PÚBLICO
app.post('/usuarios', async (req, res) => {
  try {
    const { usuario, nombre, password, rol } = req.body;

    if (!usuario || !nombre || !password || !rol) {
      return res.status(400).json({
        mensaje: 'Faltan datos. Debes enviar usuario, nombre, password y rol'
      });
    }

    // Hashear/encriptar password antes de guardar
    const passwordHasheado = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      usuario: usuario,
      nombre: nombre,
      password: passwordHasheado,
      rol: rol
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

// PUT actualizar usuario con password hasheado - PROTEGIDO
app.put('/usuarios/:id', verificarToken, async (req, res) => {
  try {
    const { usuario, nombre, password, rol } = req.body;

    if (!usuario || !nombre || !password || !rol) {
      return res.status(400).json({
        mensaje: 'Faltan datos. Debes enviar usuario, nombre, password y rol'
      });
    }

    // Hashear/encriptar nueva password antes de actualizar
    const passwordHasheado = await bcrypt.hash(password, 10);

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      {
        usuario: usuario,
        nombre: nombre,
        password: passwordHasheado,
        rol: rol
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

// DELETE eliminar usuario - PROTEGIDO
app.delete('/usuarios/:id', verificarToken, async (req, res) => {
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
   TODAS LAS RUTAS ESTÁN PROTEGIDAS CON JWT
====================================================== */

// GET todos los clientes - PROTEGIDO
app.get('/clientes', verificarToken, async (req, res) => {
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

// GET cliente por ID - PROTEGIDO
app.get('/clientes/:id', verificarToken, async (req, res) => {
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

// POST crear cliente - PROTEGIDO
app.post('/clientes', verificarToken, async (req, res) => {
  try {
    const { nombre, correo, telefono, direccion } = req.body;

    if (!nombre || !correo || !telefono || !direccion) {
      return res.status(400).json({
        mensaje: 'Faltan datos. Debes enviar nombre, correo, telefono y direccion'
      });
    }

    const nuevoCliente = new Cliente({
      nombre: nombre,
      correo: correo,
      telefono: telefono,
      direccion: direccion
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

// PUT actualizar cliente - PROTEGIDO
app.put('/clientes/:id', verificarToken, async (req, res) => {
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
        nombre: nombre,
        correo: correo,
        telefono: telefono,
        direccion: direccion
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

// DELETE eliminar cliente - PROTEGIDO
app.delete('/clientes/:id', verificarToken, async (req, res) => {
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
   TODAS LAS RUTAS ESTÁN PROTEGIDAS CON JWT
====================================================== */

// GET todos los articulos - PROTEGIDO
app.get('/articulos', verificarToken, async (req, res) => {
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

// GET articulo por ID - PROTEGIDO
app.get('/articulos/:id', verificarToken, async (req, res) => {
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

// POST crear articulo - PROTEGIDO
app.post('/articulos', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria } = req.body;

    if (!nombre || !descripcion || precio === undefined || stock === undefined || !categoria) {
      return res.status(400).json({
        mensaje: 'Faltan datos. Debes enviar nombre, descripcion, precio, stock y categoria'
      });
    }

    const nuevoArticulo = new Articulo({
      nombre: nombre,
      descripcion: descripcion,
      precio: precio,
      stock: stock,
      categoria: categoria
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

// PUT actualizar articulo - PROTEGIDO
app.put('/articulos/:id', verificarToken, async (req, res) => {
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
        nombre: nombre,
        descripcion: descripcion,
        precio: precio,
        stock: stock,
        categoria: categoria
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

// DELETE eliminar articulo - PROTEGIDO
app.delete('/articulos/:id', verificarToken, async (req, res) => {
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
