// En Node.js, se utiliza el módulo fs (file system) para leer y escribir archivos en el sistema local.

// Librería fs.promises para operaciones de archivos con promesas
//const fs = require("fs").promises;
import fs from "fs/promises";

// Ruta del archivo JSON |
//                       v

//  primera opción, legacy, aunque no deprecada
//const path = require("path");

//  segunda opcion, funciona al correr $ node ProductManager.js, pero al usar npm necesitamos configurar un ES module
//  y __dirname no esta definido en el scope de un ES module
//import path from "path";
//const filePath = path.join(__dirname, "products.json");

// tercera opción, usando import.meta.url, no es tan intuitiva, pero es la correcta
// const filePath = new URL("products.json", import.meta.url).pathname;
// /directorio/con/el/codigo/products.json
// console.log(filePath);

// cuarta opción, para usar una carpeta data ubicada en el mismo nivel que nuestro src
const dataPath = new URL("../../data/", import.meta.url);
const filePath = new URL("products.json", dataPath).pathname;

// Función para guardar productos en el archivo local
// export para poder usar la función en el archivo principal
export async function saveProducts(products) {
  try {
    // Convertir lista de productos a JSON
    const productsJSON = JSON.stringify(products, null, 2);
    // null indica que no se hagan transformaciones al pasar por stringify
    // 2 controla el formateo de los datos, con 2 espacios por nivel, para que el archivo sea legible por humanos

    // Escribir JSON en el archivo especificado
    await fs.writeFile(filePath, productsJSON);
  } catch (error) {
    // Manejar errores durante la escritura del archivo
    console.error("Error al guardar productos:", error);
  }
}

// Función para cargar productos del archivo JSON
export async function loadProducts() {
  try {
    // Leer contenido del archivo JSON
    const productsJSON = await fs.readFile(filePath, "utf8");
    // importante especificar la codificación de caracteres del archivo, utf8

    // Convertir JSON a lista de productos
    return JSON.parse(productsJSON);
  } catch (error) {
    // Manejar errores durante la lectura del archivo o si no existe
    if (error.code === "ENOENT") {
      console.warn("Archivo de productos no encontrado. Se crea uno nuevo.");
      await saveProducts([]); // Crear archivo vacío
      return [];
    } else {
      console.error("Error al cargar productos:", error);
      return [];
    }
  }
}
