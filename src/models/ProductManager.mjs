// Este código implementa un sistema para gestionar productos usando clases en JavaScript.
// Se utilizan archivos locales para el modelo de persistencia de datos.

//  para usar archivos locales
//const { loadProducts, saveProducts } = require("./fs.js"); // Importar funciones desde fs.js

//  nueva sintaxis import
//  Importar funciones loadProducts y saveProducts
import { loadProducts, saveProducts } from "../utils/fs.mjs";

// funcion de chatGPT para generar UUIDs que usaremos para identificar los productos mas adelante
/*
  Utiliza una expresión regular /[xy]/g para hacer coincidir cada caracter 'x' y 'y' en la cadena de plantilla del UUID.
  Para cada caracter coincidente, genera un dígito hexadecimal aleatorio (r) utilizando Math.random() y manipulación de bits (| 0).
  Para los caracteres 'x', utiliza el dígito aleatorio directamente.
  Para los caracteres 'y', aplica operaciones específicas de bits ((r & 0x3 | 0x8)) para asegurar que el UUID cumpla con la especificación de la versión 4 de UUID.
  Convierte cada dígito aleatorio en una cadena hexadecimal utilizando .toString(16) y devuelve la cadena UUID final.
*/
export function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8; // operador ternario
    return v.toString(16);
  });
}

// para validar los UUID generados
export function validateUUID(uuid) {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

// Example usage:
// const uuid = generateUUID();
// console.log(uuid); // Output: something like "3d16f03e-08b4-4c08-9e1d-78bfbf7b0ac5"

// clases con ES11
export class Product {
  // #variable es sintaxis de variables privadas
  #title; // name seria mejor pero asi lo pide la consigna
  #price;
  #description;
  #thumbnail;
  #code; // pésimo nombre de variable pero es lo que pide la consigna, es para un codigo de barra
  #stock;
  #id;

  // ya que javascript es un lenguaje horrible hay que cuidar de construir nuestro producto
  // de manera distinta si le pasamos un objeto a addProduct
  // sino llegamos a esto Product: [object Object], Price: undefined, Id: d437c6b2-fbbe-4c90-b9b3-12275ec1e015
  constructor(titleOrObj, price, description, thumbnail, code, stock) {
    if (typeof titleOrObj === "object") {
      const { title, price, description, thumbnail, code, stock } = titleOrObj;

      // checkear que creamos el producto con todos los parametros
      if (!title || !price || !description || !thumbnail || !code || !stock) {
        throw new Error("Faltan parámetros al crear el producto.");
      }

      this.#title = title;
      this.#price = price;
      this.#description = description;
      this.#thumbnail = thumbnail;
      this.#code = code;
      this.#stock = stock;
    } else {
      // checkear que creamos el producto con todos los parametros
      if (
        !titleOrObj ||
        !price ||
        !description ||
        !thumbnail ||
        !code ||
        !stock
      ) {
        throw new Error("Faltan parámetros al crear el producto.");
      }

      this.#title = titleOrObj;
      this.#price = price;
      this.#description = description;
      this.#thumbnail = thumbnail;
      this.#code = code;
      this.#stock = stock;
    }
    this.#id = generateUUID(); // generamos un id unico
    // alternativamente se podria guardar un id que referencia
    // la posicion en el arreglo de productos y se le asignaria el
    // id en la clase productManager, pero me parece mas robusta esta
    // solucion
  }

  getTitle() {
    return this.#title;
  }

  getPrice() {
    return this.#price;
  }

  getDescription() {
    return this.#description;
  }

  getThumbnail() {
    return this.#thumbnail;
  }

  getCode() {
    return this.#code;
  }

  getStock() {
    return this.#stock;
  }

  getId() {
    return this.#id;
  }

  // devuelve el producto en forma de objeto
  // importante para guardar la informacion en formato JSON
  getProductAsObject() {
    return {
      title: this.getTitle(),
      price: this.getPrice(),
      description: this.getDescription(),
      thumbnail: this.getThumbnail(),
      code: this.getCode(),
      stock: this.getStock(),
      id: this.getId(),
    };
  }

  printProduct() {
    console.log(
      // template literal
      `Title: ${this.#title}, Price: ${this.#price}, Id: ${this.#id}, Code: ${
        this.#code
      }`
    );
  }
}

export class ProductManager {
  #products;

  // dependency injection by constructor injection
  // pasamos un arreglo vacio donde se guardaran los productos en memoria
  constructor(products) {
    this.#products = products;
  }

  addProduct(product) {
    // si ya existe un producto con el codigo ingresado entonces return
    // La función some() es un método de los arrays en JavaScript
    // que comprueba si al menos un elemento del array cumple con una condición especificada.
    if (
      this.#products.some(
        // En JavaScript, el uso del prefijo # para marcar una variable
        // como privada es una característica sintáctica que proporciona
        // un indicador visual de que se espera que esa variable sea tratada
        // como privada. Sin embargo, en la práctica, estas variables privadas
        // aún pueden ser accedidas directamente desde fuera de la clase donde están definidas.
        // por lo tanto esto funciona aunque deberia tirar un error
        //  (productoExistente) => productoExistente.code == product.code

        // el codigo correcto es:
        (productoExistente) => productoExistente.getCode() === product.getCode()
      )
    ) {
      console.error("Ya existe un producto con este código.");
      return;
    }

    this.#products.push(product); // push agrega al final del arreglo
  }

  getProducts() {
    return this.#products;
  }

  getProductsAsObjects() {
    const productObjects = [];
    this.#products.forEach((product) => {
      productObjects.push(product.getProductAsObject());
    });

    return productObjects;
  }

  // funciones definidas en fs.mjs para almacenar en archivos locales
  async loadProducts() {
    // Cargar productos del archivo JSON
    const productsJSON = await loadProducts();

    const products = [];

    // convertir los objetos a productos de la clase Product
    productsJSON.forEach((productData) => {
      const product = new Product(
        productData.title,
        productData.price,
        productData.description,
        productData.thumbnail,
        productData.code,
        productData.stock
      );

      products.push(product);
    });
    this.#products = products;
  }

  async saveProducts() {
    // Guardar productos en el archivo JSON
    // importante pasar los productos como objetos
    await saveProducts(this.getProductsAsObjects());
  }

  // iteramos nuestro arreglo de productos para obtener todos los productos
  printProducts() {
    console.log("Estos son los productos almacenados:");
    this.#products.forEach((product) => {
      /*
      console.log(
        // template literal
        `Title: ${product.getTitle()}, Price: ${product.getPrice()}, Id: ${product.getId()}`
      );
      */
      product.printProduct();
    });
  }

  getProductById(productId) {
    const product = this.#products.find(
      (productoExistente) => productoExistente.getId() === productId
    );
    return product
      ? (console.log("Producto encontrado con id: ", productId), product)
      : console.error("No existe un producto con id: ", productId); // if product existe return else not found
  }

  deleteProduct(productId) {
    const productIndex = this.#products.findIndex(
      (productoExistente) => productoExistente.getId() === productId
    );

    if (productIndex === -1) {
      console.error(`No existe un producto con ID: ${productId}`);
      return;
    }

    // .splice es un método de arreglos que permite eliminar y/o insertar elementos en una posición específica.
    // elimina un producto a partir del indice productIndex, el 1 indica la cantidad de elementos a eliminar
    this.#products.splice(productIndex, 1);
    console.log(`Producto eliminado con ID: ${productId}`);
  }

  // update product espera un objeto updatedProductData que contiene los pares key: data
  updateProduct(productId, updatedProductData) {
    // buscamos si existe el producto con el id entregado
    const productIndex = this.#products.findIndex(
      (product) => product.getId() === productId
    );

    if (productIndex === -1) {
      console.error(`No existe un producto con ID: ${productId}`);
      return;
    }

    // verificamos si estamos asignando un código de producto que ya existe, igual que con addProduct
    if (
      this.#products.some(
        (productoExistente) =>
          productoExistente.getCode() === updatedProductData.code
      )
    ) {
      console.error(
        "No puedes asignar un código de producto que ya está en uso."
      );
      return;
    }

    // creamos un nuevo producto con los datos entregados
    // si no se pasan todos los parametros la clase Product va a devolver un error
    const updatedProduct = new Product(
      updatedProductData.title,
      updatedProductData.price,
      updatedProductData.description,
      updatedProductData.thumbnail,
      updatedProductData.code,
      updatedProductData.stock
    );

    // reemplazamos el producto en indice encontrado en el arreglo
    this.#products[productIndex] = updatedProduct;
    console.log(`Producto actualizado con ID: ${productId}`);
  }
}
