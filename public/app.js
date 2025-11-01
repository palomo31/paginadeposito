// ============================
// Navegación entre secciones
// ============================

const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav a');
const menuBtn = document.querySelector('.menu');
const nav = document.querySelector('.nav');

if (menuBtn) {
  menuBtn.addEventListener('click', () => nav.classList.toggle('active'));
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetPage = e.target.dataset.page;

    // Oculta todas las secciones
    pages.forEach(page => page.classList.add('hidden'));

    // Muestra la seleccionada
    const selected = document.getElementById(targetPage);
    if (selected) selected.classList.remove('hidden');

    // Actualiza estado del menú
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    nav.classList.remove('active');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const homePage = document.getElementById('home-page');
  if (homePage) homePage.classList.remove('hidden');
  loadProducts();
  iniciarCarrusel();
});


// ============================
// Cargar productos desde API
// ============================

async function loadProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  try {
    const res = await fetch('/api/products', { cache: "no-store" });
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
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
  } catch (err) {
    console.error('Error cargando productos:', err);
    productList.innerHTML = '<p>Error cargando productos desde el servidor.</p>';
  }
}


// ============================
// Carrusel automático
// ============================

function iniciarCarrusel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const nextBtn = document.querySelector('.carousel-btn.next');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  let position = 0;
  let speed = 1.5;
  const width = track.scrollWidth / 2;

  // duplicamos para efecto infinito
  track.innerHTML += track.innerHTML;

  function animar() {
    position -= speed;
    if (-position >= width) position = 0;
    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animar);
  }
  animar();

  track.parentElement.addEventListener('mouseenter', () => speed = 0);
  track.parentElement.addEventListener('mouseleave', () => speed = 1.5);

  nextBtn?.addEventListener('click', () => position -= 200);
  prevBtn?.addEventListener('click', () => position += 200);
}
