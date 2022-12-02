const cards = document.getElementById("cards");
const items = document.getElementById("items");
const footer = document.getElementById("footer");
//con el fragment evitamos el reflow y lo usamos para pintar todos los objetos de la app
const fragment = document.createDocumentFragment();
// los templates con los que se va a trabajar en la aplicación
const templateCart = document.getElementById("template-card").content;
const templateFooter = document.getElementById("template-footer").content;
const templateCarrito = document.getElementById("template-carrito").content;
// objeto que va a guardar la colección de objetos del carrito
let carrito = {};

// al cargar el dom obtiene lo que viene de la promesa
document.addEventListener("DOMContentLoaded", () => {
    fetchData();

    // almacenamiento de los objetos del array en localStorage
    // data es una llave inventada, se puede colocar cualquier cosa
    if(localStorage.getItem("data")){
        carrito = JSON.parse(localStorage.getItem("data"))
    }
    pintarCarrito();
})

// creamos un solo eventListener para todos los botones de las cards
cards.addEventListener("click", e => {
    addCarrito(e)
})

items.addEventListener("click", e => {
    btnAccion(e);
})

const fetchData = async() => {
    // al usar fetch es recomendable usar try-catch para atrapar errores
    try {
        const res = await fetch("api.json");
        const data = await res.json();
        console.log(data) 
        pintarCards(data)  
    } catch (error) {
        console.log(error)
    }
}

/* para dibujar las imagenes en la aplicaión, es recomendable usar con los templates los fragment
para que no haya reflow 
*/

/* usamos el forEach por que la api esta en json, no se va a hacer lo mismo cuando tengamos la coleccion
 de los objetos */ 

 // función para pintar las cards con el titulo, precio, imagen y botón
const pintarCards = data => {
    data.forEach(product => {
        console.log(product  )
        templateCart.querySelector("h5").textContent = product.title;
        templateCart.querySelector("p").textContent = product.precio;
        templateCart.querySelector("img").setAttribute("src", product.thumbnailUrl);
        // con esta instrucción le asigno el id del producto al botón para acceder a cada uno de ellos
        templateCart.querySelector(".btn-dark").dataset.id = product.id;

        const clone = templateCart.cloneNode(true);
        fragment.appendChild(clone);
    })
    cards.appendChild(fragment);
}

// función para agregar al carrito
const addCarrito = e => {
    // devuelve true si al elemento que se le hizo click es el que tiene la clase btn-dark
    if(e.target.classList.contains("btn-dark")){

        //obtengo el div que contiene todos los elementos de la card, 
        /* <div class="card-body">
              <h5>Titulo</h5>
              <p>precio</p>
              <button class="btn btn-dark">Comprar</button>
            </div> */
        //pero la función lo convierte en un objeto y toma los datos sin el resto del div
        setCarrito(e.target.parentElement)
    };

    // detengo los eventos que vienen heredados del elemento padre?
    e.stopPropagation()
}

const setCarrito = objeto => {
    const producto = {
        id: objeto.querySelector(".btn-dark").dataset.id,
        title: objeto.querySelector("h5").textContent,
        precio: objeto.querySelector("p").textContent,
        cantidad: 1
    }

    // si carrito ya contiene el producto, quiere decir que se esta duplicando, entonces aumentamos su cantidad en 1
    if(carrito.hasOwnProperty(producto.id)){
        producto.cantidad = carrito[producto.id].cantidad + 1
    }
    carrito[producto.id] = {...producto}
    console.log(carrito)
    pintarCarrito();

}

const pintarCarrito = () => {
    items.innerHTML = "";
    // como carrito es un objeto y los objetos no pueden usar los métodos del array, debo entonces usar object.values
    Object.values(carrito).forEach(product => {
        templateCarrito.querySelector("th").textContent = product.id
        templateCarrito.querySelectorAll("td")[0].textContent = product.title;
        templateCarrito.querySelectorAll("td")[1].textContent = product.cantidad;
        templateCarrito.querySelector(".btn-info").dataset.id = product.id;
        templateCarrito.querySelector(".btn-danger").dataset.id = product.id;
        templateCarrito.querySelector("span").textContent = product.cantidad * product.precio;

        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    })
        items.appendChild(fragment);
        pintarFooter();

        localStorage.setItem("data", JSON.stringify(carrito))
    }

    const pintarFooter = () => {
        footer.innerHTML = "";
        if(Object.keys(carrito).length === 0){
            // como es solo una línea puedo usar el template de esta manera, si fueran mas líneas no es recomendable
            footer.innerHTML = `
            <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
            `
            // sin este return dibuja de nuevo el botón, el precio y el total y ese no es el comportamiento deseado
            return
        }

        // recordar que como carrito es una coleción de objetos no puede usar los métodos del array
        // pero al hacerlo con Object.values(carrito) ya puedo hacer uso de estos
        const totalCantidad = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad, 0);
        console.log(totalCantidad);
        const totalPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio, 0);
        console.log(totalPrecio);
        templateFooter.querySelectorAll("td")[0].textContent = totalCantidad;
        templateFooter.querySelector("span").textContent = totalPrecio;

        const clone = templateFooter.cloneNode(true);
        fragment.appendChild(clone);
        footer.appendChild(fragment);

        const btnVaciarCarrito = document.getElementById("vaciar-carrito");
        btnVaciarCarrito.addEventListener("click", () => {
            carrito = {};
            pintarCarrito();
        })
    }

    const btnAccion = e => {
        if(e.target.classList.contains("btn-info")){
            console.log(carrito[e.target.dataset.id]);
            const producto = carrito[e.target.dataset.id];
            //producto.cantidad = carrito[e.target.dataset.id].cantidad + 1;
            // esta línea remplaza a la de arriba
            producto.cantidad++
            carrito[e.target.dataset.id] = {...producto};
            pintarCarrito();

        }

        if(e.target.classList.contains("btn-danger")){
            const producto = carrito[e.target.dataset.id];
            producto.cantidad--
            if(producto.cantidad === 0){
                delete carrito[e.target.dataset.id]
            }
            pintarCarrito();
        }

        e.stopPropagation();
    }