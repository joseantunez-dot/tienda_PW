const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const { join } = require("node:path");

const host = "127.0.0.1";
const puerto = 3000;
const origen = `http://${host}:${puerto}`;

const productos = [
    { id: 1, nombre: "Cuaderno", precio: 85 },
    { id: 2, nombre: "Mochila", precio: 250 },
];
let siguienteId = 3;

const archivos = {
    "/": ["index.html", "text/html"],
    "/catalogo": ["catalogo.html", "text/html"],
    "/administracion": ["administracion.html", "text/html"],
    "/inicio.js": ["inicio.js", "text/javascript"],
    "/catalogo.js": ["catalogo.js", "text/javascript"],
    "/administracion.js": ["administracion.js", "text/javascript"],
    "/estilos.css": ["estilos.css", "text/css"],
};

function enviarJSON(respuesta, estado, datos) {
    respuesta.writeHead(estado, {
        "Content-Type": "application/json"
    });
    respuesta.end(JSON.stringify(datos));
}

async function servirArchivo(respuesta, archivo, tipo) {
    const contenido = await readFile(join(__dirname, "public", archivo));
    respuesta.writeHead(200, {
        "Content-Type": tipo + "; charset=utf-8"
    });
    respuesta.end(contenido);
}

async function leerJSON(peticion, respuesta) {
    const tipo = (peticion.headers["content-type"] || "")
        .split(";")[0].trim().toLowerCase();

    if (tipo !== "application/json") {
        enviarJSON(respuesta, 415, { error: "Envía los datos como application/json." });
        return null;
    }

    try {
        const fragmentos = [];
        let bytes = 0;

        for await (const fragmento of peticion) {
            bytes += fragmento.length;
            if (bytes > 16384) {
                enviarJSON(respuesta, 413, { error: "El cuerpo de la petición es demasiado grande." });
                return null;
            }
            fragmentos.push(fragmento);
        }

        return JSON.parse(Buffer.concat(fragmentos).toString("utf8"));
    } catch {
        enviarJSON(respuesta, 400, { error: "El cuerpo debe contener JSON válido." });
        return null;
    }
}

function esNombreValido(nombre) {
    return typeof nombre === "string" && nombre.trim().length > 0 && nombre.trim().length <= 100;
}

function esPrecioValido(precio) {
    return typeof precio === "number" && Number.isFinite(precio) && precio >= 0;
}

const servidor = createServer(async (peticion, respuesta) => {
    const { pathname } = new URL(peticion.url, origen);

    if (peticion.method === "POST" && pathname === "/api/productos") {
        const datos = await leerJSON(peticion, respuesta);
        if (!datos) return;

        if (!datos || !esNombreValido(datos.nombre) || !esPrecioValido(datos.precio)) {
            return enviarJSON(respuesta, 400, {
                error: "Escribe un nombre de 1 a 100 caracteres y un precio numérico mayor o igual a cero."
            });
        }

        const nuevoProducto = {
            id: siguienteId++,
            nombre: datos.nombre.trim(),
            precio: datos.precio
        };

        productos.push(nuevoProducto);
        return enviarJSON(respuesta, 201, nuevoProducto);
    }

    if (peticion.method === "GET" && pathname === "/api/productos") {
        return enviarJSON(respuesta, 200, productos);
    }

    const coincidencia = pathname.match(/^\/api\/productos\/([0-9]+)$/);

    if (coincidencia) {
        const id = Number(coincidencia[1]);
        const indice = productos.findIndex(p => p.id === id);

        if (indice === -1) {
            return enviarJSON(respuesta, 404, {
                error: "Producto no encontrado"
            });
        }

        if (peticion.method === "GET") {
            return enviarJSON(respuesta, 200, productos[indice]);
        }

        if (peticion.method === "PUT") {
            const datos = await leerJSON(peticion, respuesta);
            if (!datos) return;

            if (!datos || !esNombreValido(datos.nombre) || !esPrecioValido(datos.precio)) {
                return enviarJSON(respuesta, 400, {
                    error: "Escribe un nombre de 1 a 100 caracteres y un precio numérico mayor o igual a cero."
                });
            }

            productos[indice] = {
                id,
                nombre: datos.nombre.trim(),
                precio: datos.precio
            };

            return enviarJSON(respuesta, 200, productos[indice]);
        }

        if (peticion.method === "PATCH") {
            const datos = await leerJSON(peticion, respuesta);
            if (!datos) return;

            const tieneNombre = datos.nombre !== undefined;
            const tienePrecio = datos.precio !== undefined;

            if (!tieneNombre && !tienePrecio) {
                return enviarJSON(respuesta, 400, {
                    error: "Envía al menos el nombre o el precio para actualizar."
                });
            }

            if (tieneNombre && !esNombreValido(datos.nombre)) {
                return enviarJSON(respuesta, 400, {
                    error: "Escribe un nombre de 1 a 100 caracteres."
                });
            }

            if (tienePrecio && !esPrecioValido(datos.precio)) {
                return enviarJSON(respuesta, 400, {
                    error: "Escribe un precio numérico mayor o igual a cero."
                });
            }

            if (tieneNombre) productos[indice].nombre = datos.nombre.trim();
            if (tienePrecio) productos[indice].precio = datos.precio;

            return enviarJSON(respuesta, 200, productos[indice]);
        }

        if (peticion.method === "DELETE") {
            const [eliminado] = productos.splice(indice, 1);
            return enviarJSON(respuesta, 200, eliminado);
        }

        respuesta.setHeader("Allow", "GET, PUT, PATCH, DELETE");
        return enviarJSON(respuesta, 405, {
            error: "Método no permitido"
        });
    }

    if (pathname === "/api/productos") {
        respuesta.setHeader("Allow", "GET, POST");
        return enviarJSON(respuesta, 405, {
            error: "Método no permitido"
        });
    }

    if (Object.hasOwn(archivos, pathname)) {
        const [archivo, tipo] = archivos[pathname];

        try {
            return await servirArchivo(respuesta, archivo, tipo);
        } catch (error) {
            console.error(error.message);
            return enviarJSON(respuesta, 500, {
                error: "No se pudo abrir el archivo"
            });
        }
    }

    return enviarJSON(respuesta, 404, {
        error: "Ruta no encontrada"
    });
});

servidor.listen(puerto, host, () => {
    console.log(`Servidor disponible en ${origen}`);
});