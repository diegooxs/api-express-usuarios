const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// Arreglo temporal, sin base de datos
let usuarios = [
  {
    id: 1,
    usuario: 'admin',
    password: '1234',
    rol: 'administrador'
  },
  {
    id: 2,
    usuario: 'diego',
    password: 'abcd',
    rol: 'usuario'
  },
  {
    id: 3,
    usuario: 'ana',
    password: 'pass123',
    rol: 'editor'
  }
];

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API básica en Express funcionando correctamente',
    endpoints: {
      getUsuarios: 'GET /usuarios',
      getUsuarioPorId: 'GET /usuarios/:id',
      crearUsuario: 'POST /usuarios',
      actualizarUsuario: 'PUT /usuarios/:id',
      eliminarUsuario: 'DELETE /usuarios/:id'
    }
  });
});

// GET sin parámetros
app.get('/usuarios', (req, res) => {
  res.status(200).json({
    mensaje: 'Listado de usuarios',
    total: usuarios.length,
    usuarios: usuarios
  });
});

// GET con parámetro
app.get('/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);

  const usuarioEncontrado = usuarios.find(u => u.id === id);

  if (!usuarioEncontrado) {
    return res.status(404).json({
      mensaje: 'Usuario no encontrado'
    });
  }

  res.status(200).json({
    mensaje: 'Usuario encontrado',
    usuario: usuarioEncontrado
  });
});

// POST
app.post('/usuarios', (req, res) => {
  const { usuario, password, rol } = req.body;

  if (!usuario || !password || !rol) {
    return res.status(400).json({
      mensaje: 'Faltan datos. Debes enviar usuario, password y rol'
    });
  }

  const existeUsuario = usuarios.find(u => u.usuario === usuario);

  if (existeUsuario) {
    return res.status(409).json({
      mensaje: 'Ese usuario ya existe'
    });
  }

  const nuevoId = usuarios.length > 0
    ? usuarios[usuarios.length - 1].id + 1
    : 1;

  const nuevoUsuario = {
    id: nuevoId,
    usuario: usuario,
    password: password,
    rol: rol
  };

  usuarios.push(nuevoUsuario);

  res.status(201).json({
    mensaje: 'Usuario creado correctamente',
    usuario: nuevoUsuario
  });
});

// PUT con parámetro
app.put('/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);
  const { usuario, password, rol } = req.body;

  const usuarioEncontrado = usuarios.find(u => u.id === id);

  if (!usuarioEncontrado) {
    return res.status(404).json({
      mensaje: 'Usuario no encontrado'
    });
  }

  if (!usuario || !password || !rol) {
    return res.status(400).json({
      mensaje: 'Faltan datos. Debes enviar usuario, password y rol'
    });
  }

  usuarioEncontrado.usuario = usuario;
  usuarioEncontrado.password = password;
  usuarioEncontrado.rol = rol;

  res.status(200).json({
    mensaje: 'Usuario actualizado correctamente',
    usuario: usuarioEncontrado
  });
});

// DELETE con parámetro
app.delete('/usuarios/:id', (req, res) => {
  const id = Number(req.params.id);

  const usuarioEncontrado = usuarios.find(u => u.id === id);

  if (!usuarioEncontrado) {
    return res.status(404).json({
      mensaje: 'Usuario no encontrado'
    });
  }

  usuarios = usuarios.filter(u => u.id !== id);

  res.status(200).json({
    mensaje: 'Usuario eliminado correctamente',
    usuarioEliminado: usuarioEncontrado,
    usuariosRestantes: usuarios
  });
});

// Se usa 0.0.0.0 para que se pueda acceder desde otra computadora de la red
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
