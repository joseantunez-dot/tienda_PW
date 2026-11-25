const formulario = document.querySelector("#alta-producto");
const nombre = document.querySelector("#nombre");
const precio = document.querySelector("#precio");
const guardar = document.querySelector("#guardar");
const mensaje = document.querySelector("#mensaje");

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (guardar.disabled) return;

    const producto = {
        nombre: nombre.value.trim(),
        precio: precio.valueAsNumber,
    };

    if (!producto.nombre || !Number.isFinite(producto.precio) || producto.precio < 0) {
        mensaje.textContent = "Escribe un nombre y un precio válido.";
        return;
    }

    guardar.disabled = true;
    mensaje.textContent = "Guardando…";

    try {
        const respuesta = await fetch("/api/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto),
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.error || "No se pudo agregar el producto.";
            return;
        }

        mensaje.textContent = `Producto agregado. ID ${datos.id} · ${datos.nombre} · $${datos.precio} MXN`;
        formulario.reset();
        nombre.focus();
    } catch {
        mensaje.textContent = "No se pudo confirmar el guardado. Revisa el catálogo antes de volver a enviar.";
    } finally {
        guardar.disabled = false;
    }
});

const formularioPut = document.querySelector("#editar-producto");
const putId = document.querySelector("#put-id");
const putNombre = document.querySelector("#put-nombre");
const putPrecio = document.querySelector("#put-precio");
const btnPut = document.querySelector("#btn-put");
const mensajePut = document.querySelector("#mensaje-put");

formularioPut.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (btnPut.disabled) return;

    const id = putId.valueAsNumber;
    const producto = {
        nombre: putNombre.value.trim(),
        precio: putPrecio.valueAsNumber,
    };

    if (!Number.isInteger(id) || id < 1 || !producto.nombre || !Number.isFinite(producto.precio) || producto.precio < 0) {
        mensajePut.textContent = "Escribe un ID, un nombre y un precio válido.";
        return;
    }

    btnPut.disabled = true;
    mensajePut.textContent = "Reemplazando…";

    try {
        const respuesta = await fetch(`/api/productos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto),
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensajePut.textContent = datos.error || "No se pudo reemplazar el producto.";
            return;
        }

        mensajePut.textContent = `Producto reemplazado. ID ${datos.id} · ${datos.nombre} · $${datos.precio} MXN`;
        formularioPut.reset();
    } catch {
        mensajePut.textContent = "No se pudo confirmar la actualización. Revisa el catálogo antes de volver a enviar.";
    } finally {
        btnPut.disabled = false;
    }
});

const formularioPatch = document.querySelector("#actualizar-parcial");
const patchId = document.querySelector("#patch-id");
const patchNombre = document.querySelector("#patch-nombre");
const patchPrecio = document.querySelector("#patch-precio");
const btnPatch = document.querySelector("#btn-patch");
const mensajePatch = document.querySelector("#mensaje-patch");

formularioPatch.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (btnPatch.disabled) return;

    const id = patchId.valueAsNumber;
    const cambios = {};

    if (patchNombre.value.trim() !== "") {
        cambios.nombre = patchNombre.value.trim();
    }

    if (patchPrecio.value !== "") {
        if (!Number.isFinite(patchPrecio.valueAsNumber) || patchPrecio.valueAsNumber < 0) {
            mensajePatch.textContent = "Escribe un precio válido mayor o igual a cero.";
            return;
        }
        cambios.precio = patchPrecio.valueAsNumber;
    }

    if (!Number.isInteger(id) || id < 1) {
        mensajePatch.textContent = "Escribe un ID válido.";
        return;
    }

    if (Object.keys(cambios).length === 0) {
        mensajePatch.textContent = "Escribe al menos un nuevo nombre o un nuevo precio.";
        return;
    }

    btnPatch.disabled = true;
    mensajePatch.textContent = "Actualizando…";

    try {
        const respuesta = await fetch(`/api/productos/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cambios),
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensajePatch.textContent = datos.error || "No se pudo actualizar el producto.";
            return;
        }

        mensajePatch.textContent = `Producto actualizado. ID ${datos.id} · ${datos.nombre} · $${datos.precio} MXN`;
        formularioPatch.reset();
    } catch {
        mensajePatch.textContent = "No se pudo confirmar la actualización. Revisa el catálogo antes de volver a enviar.";
    } finally {
        btnPatch.disabled = false;
    }
});

const formularioDelete = document.querySelector("#eliminar-producto");
const deleteId = document.querySelector("#delete-id");
const btnDelete = document.querySelector("#btn-delete");
const mensajeDelete = document.querySelector("#mensaje-delete");

formularioDelete.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (btnDelete.disabled) return;

    const id = deleteId.valueAsNumber;

    if (!Number.isInteger(id) || id < 1) {
        mensajeDelete.textContent = "Escribe un ID válido.";
        return;
    }

    btnDelete.disabled = true;
    mensajeDelete.textContent = "Eliminando…";

    try {
        const respuesta = await fetch(`/api/productos/${id}`, {
            method: "DELETE",
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensajeDelete.textContent = datos.error || "No se pudo eliminar el producto.";
            return;
        }

        mensajeDelete.textContent = `Producto eliminado. ID ${datos.id} · ${datos.nombre} · $${datos.precio} MXN`;
        formularioDelete.reset();
    } catch {
        mensajeDelete.textContent = "No se pudo confirmar la eliminación. Revisa el catálogo antes de volver a enviar.";
    } finally {
        btnDelete.disabled = false;
    }
});