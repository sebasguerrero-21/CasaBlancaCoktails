// =====================================================
//  CONFIGURACIÓN — cambia estos datos por los de tu negocio
// =====================================================
// Número de WhatsApp que recibirá los pedidos: código de país + número, SIN +, espacios ni guiones.
// Ejemplo Colombia: 573001234567
const WHATSAPP_NUMERO = "573017668515";

// Nombre del negocio que aparece en el mensaje del pedido.
const NEGOCIO = "Casa Blanca Cocktails";

// =====================================================
//  MENÚ ADAPTABLE PARA CELULARES
// =====================================================
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
  menuToggle.textContent = isOpen ? "×" : "☰";
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

// =====================================================
//  CARRITO DE COMPRAS
// =====================================================
(function () {
  const STORAGE_KEY = "casablanca-carrito";
  const money = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const $ = (id) => document.getElementById(id);
  const toggleBtn = $("cartToggle");
  const countBadge = $("cartCount");
  const drawer = $("cartDrawer");
  const overlay = $("cartOverlay");
  const closeBtn = $("cartClose");
  const listEl = $("cartList");
  const emptyEl = $("cartEmpty");
  const footEl = $("cartFoot");
  const totalRow = $("cartTotalRow");
  const totalEl = $("cartTotal");
  const nameInput = $("cartName");
  const notesInput = $("cartNotes");
  const sendBtn = $("cartSend");
  const clearBtn = $("cartClear");

  let cart = load();
  let lastFocus = null;

  // ---------- almacenamiento (a prueba de fallos) ----------
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(data)) {
        return data.filter((i) => i && i.id && i.name && i.qty > 0);
      }
    } catch (e) {}
    return [];
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
  }

  // ---------- utilidades ----------
  function slug(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  const hasPrices = () => cart.some((i) => i.price > 0);
  const totalItems = () => cart.reduce((n, i) => n + i.qty, 0);
  const totalMoney = () => cart.reduce((n, i) => n + i.qty * i.price, 0);

  // ---------- acciones ----------
  function add(product) {
    const found = cart.find((i) => i.id === product.id);
    if (found) found.qty += 1;
    else cart.push({ ...product, qty: 1 });
    update();
  }
  function changeQty(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
    update();
  }
  function remove(id) {
    cart = cart.filter((i) => i.id !== id);
    update();
  }
  function clear() {
    cart = [];
    update();
  }

  // ---------- dibujar el carrito ----------
  function update() {
    save();
    render();
  }

  function render() {
    const n = totalItems();
    countBadge.textContent = n;
    countBadge.hidden = n === 0;
    toggleBtn.setAttribute(
      "aria-label",
      n ? `Abrir carrito, ${n} ${n === 1 ? "producto" : "productos"}` : "Abrir carrito"
    );

    emptyEl.hidden = n > 0;
    footEl.hidden = n === 0;
    listEl.textContent = "";

    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-item";

      const info = document.createElement("div");
      info.className = "cart-item-info";
      const title = document.createElement("p");
      title.className = "cart-item-name";
      title.textContent = item.name;
      info.appendChild(title);
      if (item.price > 0) {
        const price = document.createElement("p");
        price.className = "cart-item-price";
        price.textContent = money.format(item.price * item.qty);
        info.appendChild(price);
      }

      const qty = document.createElement("div");
      qty.className = "cart-qty";
      const minus = qtyButton("−", `Quitar uno de ${item.name}`, () => changeQty(item.id, -1));
      const num = document.createElement("span");
      num.textContent = item.qty;
      const plus = qtyButton("+", `Agregar uno más de ${item.name}`, () => changeQty(item.id, 1));
      qty.append(minus, num, plus);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "cart-remove";
      del.setAttribute("aria-label", `Eliminar ${item.name}`);
      del.textContent = "×";
      del.addEventListener("click", () => remove(item.id));

      li.append(info, qty, del);
      listEl.appendChild(li);
    });

    const showTotal = hasPrices();
    totalRow.hidden = !showTotal;
    if (showTotal) totalEl.textContent = money.format(totalMoney());
  }

  function qtyButton(label, aria, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("aria-label", aria);
    b.addEventListener("click", onClick);
    return b;
  }

  // ---------- abrir / cerrar ----------
  function openCart() {
    lastFocus = document.activeElement;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("show"));
    toggleBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("cart-open");
    drawer.focus();
  }
  function closeCart() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.classList.remove("show");
    toggleBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("cart-open");
    setTimeout(() => {
      if (!drawer.classList.contains("open")) overlay.hidden = true;
    }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  toggleBtn.addEventListener("click", openCart);
  closeBtn.addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeCart();
  });
  clearBtn.addEventListener("click", clear);

  // ---------- botones "agregar" en cada cóctel ----------
  document.querySelectorAll(".cocktail-card").forEach((card) => {
    const nameEl = card.querySelector("h3");
    const info = card.querySelector(".card-info");
    if (!nameEl || !info) return;

    const name = nameEl.textContent.trim();
    const price = parseInt(String(card.dataset.price || "").replace(/\D/g, ""), 10) || 0;
    const product = { id: slug(name), name, price };

    if (price > 0) {
      const tag = document.createElement("p");
      tag.className = "card-price";
      tag.textContent = money.format(price);
      nameEl.after(tag);
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "add-btn";
    btn.textContent = "+ agregar";
    btn.setAttribute("aria-label", `Agregar ${name} al carrito`);
    let timer;
    btn.addEventListener("click", () => {
      add(product);
      btn.textContent = "✓ agregado";
      btn.classList.add("added");
      toggleBtn.classList.remove("bump");
      void toggleBtn.offsetWidth; // reinicia la animación
      toggleBtn.classList.add("bump");
      clearTimeout(timer);
      timer = setTimeout(() => {
        btn.textContent = "+ agregar";
        btn.classList.remove("added");
      }, 1100);
    });
    info.appendChild(btn);
  });

  // ---------- finalizar pedido por WhatsApp ----------
  function buildMessage() {
    const lines = [`Hola ${NEGOCIO} 👋, quisiera hacer este pedido:`, ""];
    cart.forEach((i) => {
      const sub = i.price > 0 ? ` — ${money.format(i.price * i.qty)}` : "";
      lines.push(`• ${i.qty} x ${i.name}${sub}`);
    });
    if (hasPrices()) {
      lines.push("", `*Total: ${money.format(totalMoney())}*`);
    }
    const name = nameInput.value.trim();
    const notes = notesInput.value.trim();
    if (name || notes) lines.push("");
    if (name) lines.push(`Nombre: ${name}`);
    if (notes) lines.push(`Dirección / notas: ${notes}`);
    return lines.join("\n");
  }

  sendBtn.addEventListener("click", () => {
    if (!cart.length) return;
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank", "noopener");
  });

  render();
})();
