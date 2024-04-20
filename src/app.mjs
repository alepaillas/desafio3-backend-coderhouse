// Importamos el módulo express para crear nuestra aplicación web
import express from "express";
// Importamos el gestor de productos desde el archivo ProductManager.mjs
import {
  Product,
  ProductManager,
  validateUUID,
} from "./models/ProductManager.mjs";

// Creamos una nueva instancia de la aplicación express
const app = express();
// Definimos el puerto en el que se ejecutará el servidor, utilizando el puerto definido en las variables de entorno si está disponible, de lo contrario, utilizamos el puerto 8080 por defecto
const PORT = process.env.PORT || 8080;
// Definimos el límite predeterminado de productos a devolver
const DEFAULT_LIMIT = 10;

// Función asincrónica para cargar los productos al iniciar el servidor
async function loadProducts() {
  // Creamos un array vacío para almacenar los productos en memoria
  const products = [];
  // Creamos una nueva instancia del gestor de productos y le pasamos el array de productos
  // Este patrón se llama dependency injection by constructor injection
  const manager = new ProductManager(products);
  // Cargamos los productos de nuestro JSON de productos llamando al método loadProducts del gestor
  await manager.loadProducts();
  // Imprimimos el arreglo de productos para facilitarle la correción a nuestro tutor
  manager.printProducts();
  // Devolvemos el gestor de productos cargado para usarlo en main
  return manager;
}

// Función principal que se encarga de definir las rutas y escuchar las peticiones en el servidor
async function main(manager) {
  // Definimos una ruta GET para obtener la lista de productos
  app.get("/products", async (req, res) => {
    try {
      // Obtenemos el límite de productos a devolver del parámetro de consulta 'limit', o utilizamos el límite predeterminado si no se proporciona
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;

      // Verificamos si el límite es un número válido y mayor o igual a cero
      if (limit < 0 || Number.isNaN(limit)) {
        // Si el límite no es válido, devolvemos un error 400 con un mensaje de error
        return res.status(400).json({ error: "Invalid limit parameter" });
      }

      // Obtenemos todos los productos como objetos del gestor de productos
      const products = await manager.getProductsAsObjects();
      // Limitamos la cantidad de productos a devolver utilizando el límite especificado
      const limitedProducts = products.slice(0, limit);
      // Enviamos la lista de productos limitada como respuesta
      res.json(limitedProducts);
    } catch (error) {
      // Si se produce un error, lo registramos en la consola y devolvemos un error 500 con un mensaje de error
      console.error("Error getting products:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Definimos la ruta para devolver un producto por ID (UUID)
  app.get("/products/:pid", async (req, res) => {
    try {
      // Extraemos el Id de los request parameters
      const productId = req.params.pid;

      // Validamos si la busqueda es por UUID, si no, nos ahorramos la lógica siguiente
      if (!validateUUID(productId)) {
        return res
          .status(400)
          .json({ error: "Invalid product ID format (expecting UUID)" });
      }

      // Conseguimos nuestro producto del manager
      const product = await manager.getProductById(productId);

      // Si no se encuentra, devuelve 404
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Convertimos nuestro producto de la clase Product a un objeto
      const productJSON = product.getProductAsObject();

      // Devolvemos el producto como JSON
      res.json(productJSON);
    } catch (error) {
      // En caso de un error más genérico
      console.error("Error getting product:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Escuchamos las solicitudes en el puerto definido y mostramos un mensaje en la consola cuando el servidor esté listo
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

// Función para inicializar la aplicación
async function initializeApp() {
  try {
    // Cargamos los productos
    const manager = await loadProducts();
    // Ejecutamos la función principal pasando el gestor de productos cargado
    await main(manager);
    // Mostramos un mensaje cuando se completen las tareas de inicio
    console.log("Tareas de inicio completadas.");
  } catch (error) {
    // Si se produce un error durante la inicialización, lo registramos en la consola y salimos del proceso con un código de error
    console.error("Error inicializando la aplicación:", error);
    process.exit(1);
  }
}

// Llamamos a la función para inicializar la aplicación
initializeApp();
