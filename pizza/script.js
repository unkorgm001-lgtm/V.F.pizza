const cart = [];
let orderMode = "Delivery";

// Mode Toggle (Delivery vs Pickup)
document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    orderMode = btn.dataset.mode;
    document.getElementById("drawerMode").textContent = orderMode;
    renderCart();
  });
});

// Category Filtering
document.querySelectorAll(".pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    const filter = pill.dataset.filter;
    document.querySelectorAll(".pizza-card").forEach(card => {
      const cats = card.dataset.category;
      card.style.display = (filter === "all" || cats.includes(filter)) ? "flex" : "none";
    });
  });
});

// Card Size Selection & Price Update
document.querySelectorAll(".pizza-card").forEach(card => {
  const basePrice = parseFloat(card.dataset.base);
  const priceEl = card.querySelector(".price");

  card.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      card.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const mult = parseFloat(btn.dataset.mult);
      priceEl.textContent = `$${(basePrice * mult).toFixed(2)}`;
    });
  });

  card.querySelector(".add-to-cart").addEventListener("click", () => {
    const activeSize = card.querySelector(".size-btn.active").dataset.size;
    const currentPrice = parseFloat(priceEl.textContent.replace("$", ""));
    addToCart(`${card.dataset.name} (${activeSize})`, currentPrice);
  });
});

// Interactive Custom Pizza Builder
let builderBasePrice = 15.99;
let builderSizeLabel = 'Medium 12"';
let builderCrustExtra = 0;
let builderCrustLabel = "48h Sourdough";

function updateBuilderTotal() {
  const checkedCount = document.querySelectorAll("#builderToppings input:checked").length;
  const total = builderBasePrice + builderCrustExtra + checkedCount * 1.5;
  document.getElementById("builderTotal").textContent = `$${total.toFixed(2)}`;
  return total;
}

document.querySelectorAll("#builderSize .opt-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#builderSize .opt-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    builderBasePrice = parseFloat(btn.dataset.price);
    builderSizeLabel = btn.dataset.label;
    updateBuilderTotal();
  });
});

document.querySelectorAll("#builderCrust .opt-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#builderCrust .opt-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    builderCrustExtra = parseFloat(btn.dataset.extra);
    builderCrustLabel = btn.dataset.label;
    updateBuilderTotal();
  });
});

document.querySelectorAll("#builderToppings input").forEach(cb => {
  cb.addEventListener("change", updateBuilderTotal);
});

document.getElementById("addCustomBtn").addEventListener("click", () => {
  const toppings = Array.from(document.querySelectorAll("#builderToppings input:checked")).map(i => i.value);
  const topText = toppings.length ? ` + ${toppings.join(", ")}` : "";
  const price = updateBuilderTotal();
  addToCart(`Custom ${builderSizeLabel} (${builderCrustLabel}${topText})`, price);
});

// Cart Management
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  renderCart();
  openCart();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const countEl = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("cartSubtotal");
  const deliveryEl = document.getElementById("cartDelivery");
  const grandTotalEl = document.getElementById("cartGrandTotal");

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  countEl.textContent = totalQty;

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-msg">Your pizza box is empty. Add a hot pie to get started!</p>';
    subtotalEl.textContent = "$0.00";
    deliveryEl.textContent = "$0.00";
    grandTotalEl.textContent = "$0.00";
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map((item, idx) => {
    subtotal += item.price * item.qty;
    return `
      <div class="cart-item">
        <div>
          <h4>${item.name}</h4>
          <small>$${item.price.toFixed(2)} each</small>
        </div>
        <div class="qty-controls">
          <button onclick="changeQty(${idx}, -1)">-</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${idx}, 1)">+</button>
        </div>
      </div>
    `;
  }).join("");

  const deliveryFee = (orderMode === "Pickup" || subtotal >= 25) ? 0 : 2.99;
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  deliveryEl.textContent = deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`;
  grandTotalEl.textContent = `$${(subtotal + deliveryFee).toFixed(2)}`;
}

// Drawer Open/Close
const drawer = document.getElementById("cartDrawer");
const backdrop = document.getElementById("cartBackdrop");

function openCart() {
  drawer.classList.add("open");
  backdrop.classList.add("open");
}

function closeCart() {
  drawer.classList.remove("open");
  backdrop.classList.remove("open");
}

document.getElementById("openCartBtn").addEventListener("click", openCart);
document.getElementById("closeCartBtn").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;
  alert(`Order confirmed for ${orderMode}! Your hot pizzas are heading into the 900°F oven.`);
  cart.length = 0;
  renderCart();
  closeCart();
});
