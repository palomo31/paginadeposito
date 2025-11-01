// ============================
// Navegación entre secciones
// ============================

// Seleccionamos todas las secciones y los links del menú
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav a');

// Cuando se hace clic en "Inicio" o "Equipos"
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();

    const targetPage = e.target.dataset.page; // home-page o products-page

    // Oculta todas las secciones
    pages.forEach(page => {
      page.classList.add('hidden');
      page.classList.remove('active');
    });

    // Muestra la que corresponde
    const selected = document.getElementById(targetPage);
    if (selected) {
      selected.classList.remove('hidden');
      setTimeout(() => selected.classList.add('active'), 50);
    }
  });
});

// Mostrar siempre "Inicio" al cargar
document.addEventListener('DOMContentLoaded', () => {
  const homePage = document.getElementById('home-page');
  if (homePage) {
    pages.forEach(p => p.classList.add('hidden'));
    homePage.classList.remove('hidden');
    homePage.classList.add('active');
  }
});


// ============================
// Cargar productos desde API
// ============================

async function loadProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;

  try {
   const res = await fetch('https://pagina1-0.onrender.com/api/products');
    const products = await res.json();

    productList.innerHTML = products.map(p => `
      <div class="card">
        <img src="${p.image || '/imagenes/default.png'}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${p.description || '-'}</p>
        <p class="price">$${p.price_per_day.toLocaleString()} / día</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error cargando productos:', err);
    productList.innerHTML = '<p>Error cargando productos.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);


// ============================
// Carrusel de la página de inicio
// ============================

document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const items = Array.from(document.querySelectorAll('.carousel-item'));
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  // Duplicamos para scroll infinito
  track.innerHTML += track.innerHTML;
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

  // Pausar cuando el usuario pasa el mouse
  track.parentElement.addEventListener('mouseenter', () => speed = 0);
  track.parentElement.addEventListener('mouseleave', () => speed = 2);

  // Botones manuales
  nextBtn.addEventListener('click', () => {
    position -= 200;
    track.style.transform = `translateX(${position}px)`;
  });
  prevBtn.addEventListener('click', () => {
    position += 200;
    track.style.transform = `translateX(${position}px)`;
  });
});
