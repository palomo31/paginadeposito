
// Variables y elementos
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav a');

const productList = document.getElementById('product-list');
const productSelect = document.getElementById('productSelect');

const quoteForm = document.getElementById('quoteForm');
const quoteItemsBody = document.getElementById('quoteItemsBody');
const quoteTotal = document.getElementById('quoteTotal');

const formMsg = document.getElementById('formMsg');
const sendQuoteBtn = document.getElementById('sendQuoteBtn');
const sendMsg = document.getElementById('sendMsg');

let products = [];
let quoteItems = [];

// Navegación entre páginas con fade-in

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
    setTimeout(() => page.classList.add('active'), 50); // pequeño delay para animar fade-in
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
    const res = await fetch('/api/products');
    products = await res.json();

    // Render tarjetas
    if (productList) {
      productList.innerHTML = products.map(p => `
        <div class="card">
          <img src="${p.image || '/imagenes/default.png'}" alt="${p.title}">
          <h3>${p.title}</h3>
          <p>${p.description || '-'}</p>
          <p class="price">$${p.price_per_day.toLocaleString()} / día</p>
          <button type="button" onclick="selectProduct(${p.id})">Cotizar este</button>
        </div>
      `).join('');
    }

    // Render select
    if (productSelect) {
      productSelect.innerHTML = '<option value="">Selecciona un equipo</option>' +
        products.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
    }

  } catch (err) {
    console.error('Error cargando productos:', err);
    if (productList) productList.innerHTML = '<p>Error cargando productos.</p>';
  }
}

loadProducts();

// ------------------------------
// Seleccionar producto desde tarjeta
// ------------------------------
window.selectProduct = function(id) {
  const prod = products.find(p => p.id == id);
  if (!prod) return;

  productSelect.value = id;
  document.getElementById('qty').value = 1;
  document.getElementById('dateFrom').value = '';
  document.getElementById('dateTo').value = '';

  pages.forEach(p => p.classList.add('hidden'));
  document.getElementById('contact-page').classList.remove('hidden');
};

// ------------------------------
// Agregar producto a cotización
// ------------------------------
quoteForm.addEventListener('submit', e => {
  e.preventDefault();

  const id = productSelect.value;
  const prod = products.find(p => p.id == id);
  if (!prod) {
    formMsg.textContent = "⚠️ Selecciona un producto.";
    return;
  }

  const qty = parseInt(document.getElementById('qty').value) || 1;
  const from = document.getElementById('dateFrom').value;
  const to = document.getElementById('dateTo').value;

  let days = 1;
  if (from && to) {
    const diff = (new Date(to) - new Date(from)) / (1000*60*60*24);
    days = diff >= 1 ? diff + 1 : 1;
  }

  const subtotal = prod.price_per_day * qty * days;

  // Si el producto ya existe en la cotización, solo actualizamos cantidad y subtotal
  const existing = quoteItems.find(i => i.id == prod.id && i.from === from && i.to === to);
  if (existing) {
    existing.qty += qty;
    existing.subtotal += subtotal;
    existing.days = days;
  } else {
    quoteItems.push({ id: prod.id, title: prod.title, qty, from, to, subtotal, days });
  }

  renderQuoteTable();
  formMsg.textContent = "✅ Producto agregado a la cotización.";
  document.getElementById('qty').value = 1;
});

// ------------------------------
// Renderizar tabla de cotización
// ------------------------------
function renderQuoteTable() {
  if (!quoteItemsBody) return;

  if (quoteItems.length === 0) {
    quoteItemsBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay productos agregados</td></tr>';
    quoteTotal.textContent = "$0";
    return;
  }

  let html = '';
  let total = 0;
  quoteItems.forEach((item, i) => {
    total += item.subtotal;
    html += `<tr>
      <td>${item.title}</td>
      <td>${item.qty}</td>
      <td>${item.days}</td>
      <td>$${item.subtotal.toLocaleString()}</td>
      <td><button type="button" onclick="removeItem(${i})">❌</button></td>
    </tr>`;
  });

  quoteItemsBody.innerHTML = html;
  quoteTotal.textContent = `$${total.toLocaleString()}`;

  // Agregar highlight a la última fila
  const lastRow = quoteItemsBody.lastElementChild;
  if(lastRow) lastRow.classList.add('highlight');
}

// ------------------------------
// Remover producto
// ------------------------------
window.removeItem = function(i) {
  quoteItems.splice(i, 1);
  renderQuoteTable();
};

// ------------------------------
// Enviar cotización al servidor
// ------------------------------
sendQuoteBtn.addEventListener('click', async () => {
  if (quoteItems.length === 0) {
    sendMsg.textContent = "⚠️ Agrega productos antes de enviar.";
    return;
  }

  const data = {
    products: quoteItems.map(i => ({
      id: i.id,
      title: i.title,
      qty: i.qty,
      date_from: i.from,
      date_to: i.to,
      subtotal: i.subtotal
    })),
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value
  };

  sendMsg.textContent = "Enviando cotización...";
  try {
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const json = await res.json();
    if (json.success) {
      sendMsg.textContent = "✅ Cotización enviada correctamente!";
      quoteItems = [];
      renderQuoteTable();
      quoteForm.reset();
    } else {
      sendMsg.textContent = "⚠️ Error al enviar la cotización.";
    }
  } catch (err) {
    console.error(err);
    sendMsg.textContent = "❌ No se pudo enviar la cotización.";
  }
});
// ------------------------------
// Carrusel de productos destacados
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector('.carousel-track');
  const items = Array.from(document.querySelectorAll('.carousel-item'));
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  if (!track || items.length === 0) return;

  // Duplicamos los items para efecto infinito
  track.innerHTML += track.innerHTML;
  const totalItems = track.children.length;
  let speed = 2; // pixels por frame, ajusta para más rápido
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

  // Botones mueven de golpe
  nextBtn.addEventListener('click', () => {
    position -= 200;
    track.style.transform = `translateX(${position}px)`;
  });

  prevBtn.addEventListener('click', () => {
    position += 200;
    track.style.transform = `translateX(${position}px)`;
  });
});
