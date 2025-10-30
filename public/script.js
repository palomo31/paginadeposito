// script.js — carga el catálogo de productos desde la API
async function cargarProductos() {
  try {
    const res = await fetch("/api/products");
    const productos = await res.json();

    const contenedor = document.getElementById("catalogo");
    contenedor.innerHTML = "";

    productos.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <p><strong>$${p.price_per_day.toLocaleString()} / día</strong></p>
      `;
      contenedor.appendChild(card);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

cargarProductos();
