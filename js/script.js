document.addEventListener("DOMContentLoaded", function () {
    const carrito = [];
    const carritoCount = document.getElementById("carritoCount");
    const catalogo = document.getElementById("catalogo");
    const marcasContainer = document.getElementById("marcasContainer");
    const modelosContainer = document.getElementById("modelos");
    const piezasModal = document.getElementById("piezasModal");
    const carritoModal = document.getElementById("carritoModal");

    // Función para abrir y cerrar modales
    function abrirModal(modal) {
        modal.style.display = "block";
    }

    function cerrarModal(modal) {
        modal.style.display = "none";
    }

    // Abrir el modal de Carrito
    document.getElementById("abrirCarrito").addEventListener("click", function () {
        abrirModal(carritoModal);
    });

    // Cerrar el modal de Carrito
    document.getElementById("cerrarModal").addEventListener("click", function () {
        cerrarModal(carritoModal);
    });

    // Cerrar el modal de Piezas
    document.getElementById("cerrarPiezas").addEventListener("click", function () {
        cerrarModal(piezasModal);
    });

    // Mostrar el carrito desde el modal de piezas
    document.getElementById("verCarritoDesdePiezas").addEventListener("click", function () {
        cerrarModal(piezasModal);  // Cerrar modal de piezas
        abrirModal(carritoModal);  // Abrir modal de carrito
    });

    // Mostrar las piezas desde el modal de carrito
    document.getElementById("verPiezasDesdeCarrito").addEventListener("click", function () {
        cerrarModal(carritoModal);  // Cerrar modal de carrito
        abrirModal(piezasModal);  // Abrir modal de piezas
    });

    // Manejar la lógica de selección de piezas
    fetch('/data/productos.json')
        .then(response => response.json())
        .then(data => {
            // Cargar las marcas en la página
            const marcas = Array.from(new Set(data.map(producto => producto.marca)));

            marcas.forEach(marca => {
                const marcaDiv = document.createElement("div");
                marcaDiv.classList.add("marca");
                marcaDiv.innerHTML = ` 
                    <img src="images/logos/${marca.toLowerCase()}.png" alt="${marca}" />
                    <button class="seleccionarMarca" data-marca="${marca}">${marca}</button>
                `;
                marcasContainer.appendChild(marcaDiv);
            });

            // Manejar la selección de la marca
            document.querySelectorAll('.seleccionarMarca').forEach(button => {
                button.addEventListener('click', (e) => {
                    const marcaSeleccionada = e.target.getAttribute('data-marca');
                    mostrarModelos(marcaSeleccionada, data);
                });
            });

            function mostrarModelos(marca, productos) {
                modelosContainer.innerHTML = '';
                catalogo.innerHTML = '';
                piezasModal.style.display = "block";  // Abrir el modal de piezas

                // Esconder los botones para ver otras opciones
                document.getElementById("verCarritoDesdePiezas").style.display = 'none';

                const modelos = Array.from(new Set(productos.filter(producto => producto.marca === marca)
                    .map(producto => producto.modelo)));

                modelos.forEach(modelo => {
                    const modeloDiv = document.createElement("div");
                    modeloDiv.classList.add("modelo");
                    modeloDiv.innerHTML = ` 
                        <img src="images/modelos/${marca.toLowerCase()}_${modelo.toLowerCase()}.png" alt="${modelo}" />
                        <button class="seleccionarModelo" data-modelo="${modelo}">${modelo}</button>
                    `;
                    modelosContainer.appendChild(modeloDiv);
                });

                // Manejar la selección de modelo
                document.querySelectorAll('.seleccionarModelo').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const modeloSeleccionado = e.target.getAttribute('data-modelo');
                        mostrarPiezas(marca, modeloSeleccionado, productos);
                    });
                });
            }

            function mostrarPiezas(marca, modelo, productos) {
                // Filtrar solo las piezas que corresponden al modelo seleccionado
                const piezas = productos.filter(producto => producto.marca === marca && producto.modelo === modelo);
                catalogo.innerHTML = '';  // Limpiar el catálogo

                // Mostrar las piezas para el modelo seleccionado
                if (piezas.length > 0) {
                    piezas.forEach(producto => {
                        const divProducto = document.createElement("div");
                        divProducto.classList.add("producto");
                        divProducto.innerHTML = ` 
                            <h3>${producto.marca} ${producto.modelo}</h3>
                            <p>${producto.producto}</p>
                            <p>Precio: $${producto.precio}</p>
                            <img src="images/productos/${producto.imagen}" alt="${producto.producto}" />
                            <button class="agregarCarrito" data-id="${producto.producto}" data-precio="${producto.precio}">Agregar al carrito</button>
                        `;
                        catalogo.appendChild(divProducto);
                    });

                    // Agregar funcionalidad de añadir al carrito
                    document.querySelectorAll('.agregarCarrito').forEach(button => {
                        button.addEventListener('click', (e) => {
                            const productoId = e.target.getAttribute('data-id');
                            const precio = parseFloat(e.target.getAttribute('data-precio'));
                            carrito.push({ id: productoId, precio: precio });
                            actualizarCarrito();
                        });
                    });
                } else {
                    // Si no hay piezas para el modelo seleccionado, mostrar un mensaje
                    catalogo.innerHTML = `<p>No se encontraron piezas para este modelo.</p>`;
                }
            }
        });

    // Función para actualizar el carrito
    function actualizarCarrito() {
        carritoCount.textContent = carrito.length;

        const carritoList = document.getElementById("carritoList");
        carritoList.innerHTML = '';

        let total = 0;
        carrito.forEach((producto, index) => {
            const divProducto = document.createElement("div");
            divProducto.classList.add("productoCarrito");
            divProducto.innerHTML = ` 
                <p>${producto.id}</p>
                <p>Precio: $${producto.precio}</p>
                <button class="eliminarProducto" data-index="${index}">Eliminar</button>
            `;
            carritoList.appendChild(divProducto);
            total += producto.precio;
        });

        document.getElementById("totalPrice").textContent = total.toFixed(2);

        // Agregar funcionalidad de eliminar producto del carrito
        document.querySelectorAll('.eliminarProducto').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                carrito.splice(index, 1); // Eliminar producto
                actualizarCarrito();
            });
        });
    }

    // Vaciar el carrito
    document.getElementById("vaciarCarrito").addEventListener('click', () => {
        carrito.length = 0;
        actualizarCarrito();
        carritoModal.style.display = "none";
    });

    // Cerrar modales al hacer clic fuera de la ventana del modal
    window.addEventListener('click', (e) => {
        if (e.target === piezasModal && !piezasModal.contains(e.target)) {
            cerrarModal(piezasModal);
        }
        if (e.target === carritoModal && !carritoModal.contains(e.target)) {
            cerrarModal(carritoModal);
        }
    });

    // Agregar botón para ir al carrito en el modal de piezas
    const botonIrCarrito = document.createElement('button');
    botonIrCarrito.textContent = "Ir al Carrito";
    botonIrCarrito.classList.add('irCarrito');
    piezasModal.appendChild(botonIrCarrito);

    // Ir al carrito al hacer clic en el botón
    botonIrCarrito.addEventListener('click', () => {
        cerrarModal(piezasModal);
        abrirModal(carritoModal);
    });

    // Carrusel: Mostrar el siguiente elemento en el carrusel
    let currentIndex = 0;
    const items = document.querySelectorAll(".carrusel-item");

    // Función para mostrar el siguiente elemento en el carrusel
    function showNextItem() {
        items[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % items.length;
        items[currentIndex].classList.add("active");
    }

    // Función para mostrar el item anterior
    function showPrevItem() {
        items[currentIndex].classList.remove("active");
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        items[currentIndex].classList.add("active");
    }

    // Mostrar el primer item al cargar
    items[currentIndex].classList.add("active");

    // Configurar los botones "next" y "prev"
    document.getElementById("next").addEventListener("click", showNextItem);
    document.getElementById("prev").addEventListener("click", showPrevItem);

    // Cambiar de imagen automáticamente cada 5 segundos
    setInterval(showNextItem, 5000); // Cambia la imagen cada 5 segundos
});
