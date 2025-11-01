// Variables y elementos
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav a');
const productList = document.getElementById('product-list');

let products = [];

// ------------------------------
// Navegación entre páginas con fade-in
// ------------------------------
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const pageId = e.target.dataset.page;

    pages.forEach(p => {
      p.classList.remove('active');   
      p.classList.add('hidden');
    });

    const page = document.getElementById(pageId);
    page.classList.remove('hidden');
    setTimeout(() => page.classList.add('active'), 50);
  });
});

// 🔹 Mostrar siempre la página de inicio al cargar
document.addEventListener('DOMContentLoaded', () => {
  pages.forEach(p => p.classList.add('hidden'));
  const homePage = document.getElementById('home-page');
  if (homePage) {
    homePage.classList.remove('hidden');
    homePage.classList.add('active');
  }
}); 

// ------------------------------
// Cargar productos desde API
// ------------------------------
async function loadProducts() {
  try {
    const res = await fetch('https://pagina1-0.onrender.com/api/products');
    products = await res.json();

    // Render tarjetas de productos
    if (productList) {
      productList.innerHTML = products.map(p => `
        <div class="card">
          <img src="${p.image || '/imagenes/default.png'}" alt="${p.title}">
          <h3>${p.title}</h3>
          <p>${p.description || '-'}</p>
          <p class="price">$${p.price_per_day.toLocaleString()} / día</p>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error('Error cargando productos:', err);
    if (productList) productList.innerHTML = '<p>Error cargando productos.</p>';
  }
}

loadProducts();

// ------------------------------
// Carrusel de productos destacados
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector('.carousel-track');
  const items = Array.from(document.querySelectorAll('.carousel-item'));
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  if (!track || items.length === 0) return;

  // Duplicamos los items para efecto infinito
  track.innerHTML += track.innerHTML;
  const totalItems = track.children.length;
  let speed = 2; // pixels por frame
  let position = 0;

  function animate() {
    position -= speed;
    const trackWidth = track.scrollWidth / 2;
    if (-position >= trackWidth) position = 0;
    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animate);
  }

  animate();

  // Hover pausa
  track.parentElement.addEventListener('mouseenter', () => speed = 0);
  track.parentElement.addEventListener('mouseleave', () => speed = 2);

  // Botones de desplazamiento
  nextBtn.addEventListener('click', () => {
    position -= 200;
    track.style.transform = `translateX(${position}px)`;
  });

  prevBtn.addEventListener('click', () => {
    position += 200;
    track.style.transform = `translateX(${position}px)`;
  });
});
// ================================
// 📱 Menú Hamburguesa (Móvil)
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu");
  const nav = document.querySelector(".nav");

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("active");
      menuBtn.classList.toggle("active");
    });
  }
});
// ------------------------------
// Menú responsive (para celular)
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu");
  const nav = document.querySelector(".nav");

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("active");
    });

    // Cerrar el menú al tocar un enlace
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
      });
    });
  }
});

