const filas = document.querySelector("#filas");
const estado = document.querySelector("#estado");
async function cargarCatalogo() {
try {
const respuesta = await fetch("/api/productos");
if (!respuesta.ok) throw new Error("Error HTTP");
const productos = await respuesta.json();
for (const { id, nombre, precio } of productos) {
const fila = filas.insertRow();
for (const valor of [id, nombre, precio]) {
fila.insertCell().textContent = valor;
}
}
estado.textContent = productos.length ? "" : "El catálogo está vacío.";
} catch {
estado.textContent = "No se pudo cargar el catálogo.";
}
}
cargarCatalogo();