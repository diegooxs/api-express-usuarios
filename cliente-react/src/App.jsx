import { useState } from 'react'
import './App.css'

// direccion de mi api
const url = 'http://localhost:3000'

function App() {
  // datos del login
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')

  // datos para crear un articulo
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')

  const [articulos, setArticulos] = useState([])
  const [mensaje, setMensaje] = useState('')

  // login: manda usuario y password y guarda el token
  async function iniciarSesion() {
    try {
      const respuesta = await fetch(url + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuario, password: password })
      })
      const datos = await respuesta.json()
      if (datos.token) {
        setToken(datos.token)
        setMensaje('Sesion iniciada. Token recibido.')
      } else {
        setMensaje(datos.mensaje)
      }
    } catch (error) {
      setMensaje('Error: ' + error.message + ' (puede ser el CORS)')
    }
  }

  // trae la lista de articulos (necesita el token)
  async function verArticulos() {
    try {
      const respuesta = await fetch(url + '/articulos', {
        headers: { Authorization: 'Bearer ' + token }
      })
      const datos = await respuesta.json()
      if (datos.articulos) {
        setArticulos(datos.articulos)
        setMensaje('Articulos: ' + datos.total)
      } else {
        setMensaje(datos.mensaje)
      }
    } catch (error) {
      setMensaje('Error: ' + error.message + ' (puede ser el CORS)')
    }
  }

  // agrega un articulo nuevo (necesita el token)
  async function agregarArticulo() {
    try {
      const respuesta = await fetch(url + '/articulos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          nombre: nombre,
          descripcion: nombre,
          precio: Number(precio),
          stock: Number(stock),
          categoria: 'general'
        })
      })
      const datos = await respuesta.json()
      setMensaje(datos.mensaje)
      verArticulos()
    } catch (error) {
      setMensaje('Error: ' + error.message + ' (puede ser el CORS)')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Practica JWT y CORS</h1>

      <h2>Login</h2>
      <p>
        Usuario: <input value={usuario} onChange={(e) => setUsuario(e.target.value)} />
      </p>
      <p>
        Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </p>
      <button onClick={iniciarSesion}>Iniciar sesion</button>

      <hr />

      <h2>Articulos</h2>
      <button onClick={verArticulos}>Ver articulos</button>
      <p>
        Nombre: <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </p>
      <p>
        Precio: <input value={precio} onChange={(e) => setPrecio(e.target.value)} />
      </p>
      <p>
        Stock: <input value={stock} onChange={(e) => setStock(e.target.value)} />
      </p>
      <button onClick={agregarArticulo}>Agregar articulo</button>

      <ul>
        {articulos.map((a) => (
          <li key={a._id}>{a.nombre} - precio: {a.precio} - stock: {a.stock}</li>
        ))}
      </ul>

      <hr />
      <p>Mensaje: {mensaje}</p>
    </div>
  )
}

export default App
