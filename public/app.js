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

// Mostrar siempre “Inicio” al cargar
document.addEventListener('DOMContentLoaded', () => {
  const homePage = document.getElementById('home-page');
  if (homePage) {
    pages.forEach(p => p.classList.add('hidden'));
    homePage.classList.remove('hidden');
    homePage.classList.add('active');
  }
  loadProducts(); // Se asegura de cargar productos al inicio
});


// ============================
// Cargar productos desde API
// ============================

async function loadProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Respuesta no válida del servidor');
    const products = await res.json();

    if (products.length === 0) {
      productList.innerHTML = '<p>No hay equipos registrados aún.</p>';
      return;
    }

    productList.innerHTML = products.map(p => `
      <div class="card">
        <img src="${p.image ? p.image : '/imagenes/default.png'}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${p.description || 'Sin descripción'}</p>
        <p class="price">$${p.price_per_day?.toLocaleString() || '0'} / día</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error cargando productos:', err);
    productList.innerHTML = '<p>Error cargando productos desde el servidor.</p>';
  }
}


// ============================
// Carrusel de la página de inicio
// ============================

document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  track.innerHTML += track.innerHTML; // scroll infinito
  let position = 0;
  let speed = 2;

  function animate() {
    position -= speed;
    const width = track.scrollWidth / 2;
    if (-position >= width) position = 0;
    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animate);
  }

  animate();

  track.parentElement.addEventListener('mouseenter', () => speed = 0);
  track.parentElement.addEventListener('mouseleave', () => speed = 2);

  nextBtn.addEventListener('click', () => {
    position -= 200;
    track.style.transform = `translateX(${position}px)`;
  });
  prevBtn.addEventListener('click', () => {
    position += 200;
    track.style.transform = `translateX(${position}px)`;
  });
});
