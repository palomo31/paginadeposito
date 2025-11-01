// ============================
// Navegación entre secciones
// ============================

const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav a');

// Control de menú hamburguesa
const menuBtn = document.querySelector('.menu');
const nav = document.querySelector('.nav');
menuBtn.addEventListener('click', () => nav.classList.toggle('active'));

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetPage = e.target.dataset.page;

    // Oculta todas las secciones
    pages.forEach(page => {
      page.classList.add('hidden');
      page.classList.remove('active');
    });

    // Muestra la seleccionada
    const selected = document.getElementById(targetPage);
    if (selected) {
      selected.classList.remove('hidden');
      setTimeout(() => selected.classList.add('active'), 50);
    }

    // Cierra el menú en móvil
    nav.classList.remove('active');
  });
});

// ============================
// Al cargar la página
// ============================

document.addEventListener('DOMContentLoaded', () => {
  // Mostrar solo el inicio al principio
  const homePage = document.getElementById('home-page');
  if (homePage) {
    pages.forEach(p => p.classList.add('hidden'));
    homePage.classList.remove('hidden');
    homePage.classList.add('active');
  }

  // Cargar equipos y activar carrusel
  loadProducts();
  iniciarCarrusel();
});

// ============================
// Cargar productos desde la API
// ============================

async function loadProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Error al obtener productos');
    const products = await res.json();

    if (products.length === 0) {
      productList.innerHTML = '<p>No hay equipos registrados aún.</p>';
      return;
    }

    productList.innerHTML = products.map(p => `
      <div class="card">
        <img src="${p.image || '/imagenes/default.png'}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${p.description || 'Sin descripción'}</p>
        <p class="price">$${p.price_per_day?.toLocaleString() || '0'} / día</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error cargando productos:', error);
    productList.innerHTML = '<p>Error cargando productos desde el servidor.</p>';
  }
}

// ============================
// Carrusel automático y manual
// ============================

function iniciarCarrusel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  let position = 0;
  const speed = 1; // velocidad del movimiento automático

  function moveCarousel() {
    position -= speed;
    if (Math.abs(position) >= track.scrollWidth / 2) {
      position = 0;
    }
    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(moveCarousel);
  }

  // Duplicar contenido para scroll infinito
  track.innerHTML += track.innerHTML;

  // Iniciar movimiento
  moveCarousel();

  // Pausar al pasar el mouse
  track.parentElement.addEventListener('mouseenter', () => cancelAnimationFrame(moveCarousel));
  track.parentElement.addEventListener('mouseleave', () => moveCarousel());

  // Botones manuales
  nextBtn.addEventListener('click', () => {
    position -= 200;
    track.style.transform = `translateX(${position}px)`;
  });

  prevBtn.addEventListener('click', () => {
    position += 200;
    track.style.transform = `translateX(${position}px)`;
  });
}
