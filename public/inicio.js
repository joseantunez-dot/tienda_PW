const modal = document.querySelector("#modal");
const formulario = document.querySelector("#consulta");
const campoId = document.querySelector("#producto-id");
const resultado = document.querySelector("#resultado");
const buscar = document.querySelector("#buscar");
document.querySelector("#abrir").addEventListener("click", () => {
modal.showModal();
});
document.querySelector("#cerrar").addEventListener("click", () => {
modal.close();
});
formulario.addEventListener("submit", async (evento) => {
evento.preventDefault();
const id = campoId.valueAsNumber;
buscar.disabled = true;
resultado.textContent = "Buscando…";
try {
const respuesta = await fetch(`/api/productos/${id}`);
if (respuesta.status === 404) {
resultado.textContent = "Producto no encontrado.";
return;
}
if (!respuesta.ok) throw new Error("Error HTTP");
const { nombre, precio } = await respuesta.json();
resultado.textContent = `ID ${id} · ${nombre} · $${precio} MXN`;
} catch {
resultado.textContent = "No se pudo consultar el producto.";
} finally {
buscar.disabled = false;
}
});