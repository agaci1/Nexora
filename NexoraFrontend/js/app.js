(() => {
    const CONFIG = {
      API_BASE: window.__ENV__?.API_BASE || "http://localhost:5000",
      CART_STORAGE_KEY: "nexora_cart_v1",
      TOKEN_KEY: "nexora_admin_token_v1",
      CURRENCY: "EUR"
    };
  
    // ===== DOM =====
    const pages = {
      home: document.getElementById("home-page"),
      about: document.getElementById("about-page"),
      shop: document.getElementById("shop-page"),
      product: document.getElementById("product-details-page"),
      cart: document.getElementById("cart-page"),
      contact: document.getElementById("contact-page"),
      privacy: document.getElementById("privacy-page")
    };
  
    const cartBadge = document.getElementById("cart-badge");
  
    // Home dynamic
    const homeTitleEl = document.getElementById("home-title");
    const homeSubtitleEl = document.getElementById("home-subtitle");
    const homeImageEl = document.getElementById("home-image");
    const shopNowBtn = document.getElementById("shop-now-btn");
  
    // About dynamic
    const aboutTextEl = document.getElementById("about-text");
    const aboutImg1El = document.getElementById("about-image-1");
    const aboutImg2El = document.getElementById("about-image-2");
  
    // Shop
    const genderMaleBtn = document.getElementById("gender-male");
    const genderFemaleBtn = document.getElementById("gender-female");
    const categoryPills = document.getElementById("category-pills");
    const productsGrid = document.getElementById("products-grid");
    const shopEmpty = document.getElementById("shop-empty");
  
    // Product details
    const backToShopBtn = document.getElementById("back-to-shop");
    const productImage = document.getElementById("product-image");
    const productName = document.getElementById("product-name");
    const productPrice = document.getElementById("product-price");
    const productDescription = document.getElementById("product-description");
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    const carouselPrev = document.getElementById("carousel-prev");
    const carouselNext = document.getElementById("carousel-next");
  
    // Cart
    const cartList = document.getElementById("cart-list");
    const cartEmpty = document.getElementById("cart-empty");
    const cartTotalEl = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");
  
    // Privacy
    const privacyUpdated = document.getElementById("privacy-updated");
  
    // Admin flow
    const adminIcon = document.getElementById("admin-icon");
    const adminConfirmModal = document.getElementById("admin-confirm-modal");
    const adminNoBtn = document.getElementById("admin-no-btn");
    const adminYesBtn = document.getElementById("admin-yes-btn");
  
    const adminLoginModal = document.getElementById("admin-login-modal");
    const adminLoginCancel = document.getElementById("admin-login-cancel");
    const adminLoginSubmit = document.getElementById("admin-login-submit");
    const adminUsername = document.getElementById("admin-username");
    const adminPassword = document.getElementById("admin-password");
    const adminLoginError = document.getElementById("admin-login-error");
  
    // Checkout modal + form
    const checkoutModal = document.getElementById("checkout-modal");
    const checkoutCancel = document.getElementById("checkout-cancel");
    const checkoutForm = document.getElementById("checkout-form");
    const checkoutError = document.getElementById("checkout-error");
    const stateOptions = document.getElementById("state-options");
  
    // ===== STATE =====
    let cart = [];
    let selectedGender = null;
    let selectedCategory = null;
  
    let currentProduct = null;
    let carouselImages = [];
    let carouselIndex = 0;
  
    let OWNER_WHATSAPP = "+1234567890";
  
    const STATE_SUGGESTIONS = {
      Albania: ["Tirana", "Durrës", "Vlorë", "Shkodër", "Fier", "Elbasan", "Korçë", "Berat", "Gjirokastër", "Lezhë", "Kukës"],
      Greece: ["Attica", "Thessaloniki", "Crete", "Peloponnese", "Central Macedonia", "Epirus", "Thessaly"],
      Kosovo: ["Prishtina", "Prizren", "Peja", "Gjilan", "Ferizaj", "Mitrovica", "Gjakova"],
      "North Macedonia": ["Skopje", "Bitola", "Tetovo", "Kumanovo", "Ohrid", "Prilep", "Štip"]
    };
  
    const CATEGORIES = [
      "T-Shirts",
      "Trousers",
      "Suits",
      "Jackets",
      "Dresses",
      "Sportswear / Activewear",
      "Accessories",
      "Cosmetics",
      "Perfumes"
    ];
  
    // ===== HELPERS =====
    function apiUrl(path) {
      return `${CONFIG.API_BASE}${path}`;
    }
  
    async function apiGet(path) {
      const res = await fetch(apiUrl(path));
      if (!res.ok) throw new Error(`GET ${path} failed`);
      return res.json();
    }
  
    async function apiPost(path, body) {
      const res = await fetch(apiUrl(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `POST ${path} failed`);
      }
      return res.json();
    }
  
    function money(amount) {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: CONFIG.CURRENCY }).format(Number(amount || 0));
    }
  
    function showModal(el) {
      el?.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
    function hideModal(el) {
      el?.classList.add("hidden");
      document.body.style.overflow = "";
    }
  
    function showPage(name) {
      Object.values(pages).forEach(p => p?.classList.add("hidden"));
      if (name === "product") pages.product?.classList.remove("hidden");
      else pages[name]?.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  
    function route() {
      const hash = (window.location.hash || "#home").replace("#", "");
      if (hash.startsWith("product/")) {
        const id = hash.split("/")[1];
        showPage("product");
        showProductDetails(id);
        return;
      }
      if (!pages[hash]) {
        window.location.hash = "#home";
        return;
      }
      showPage(hash);
  
      if (hash === "cart") renderCart();
    }
  
    // ===== CART (PERSISTENT) =====
    function loadCart() {
      try {
        cart = JSON.parse(localStorage.getItem(CONFIG.CART_STORAGE_KEY) || "[]");
      } catch {
        cart = [];
      }
      updateCartBadge();
    }
  
    function saveCart() {
      localStorage.setItem(CONFIG.CART_STORAGE_KEY, JSON.stringify(cart));
      updateCartBadge();
    }
  
    function updateCartBadge() {
      cartBadge.textContent = String(cart.reduce((s, i) => s + (i.quantity || 0), 0));
    }
  
    function cartTotal() {
      return cart.reduce((s, i) => s + (Number(i.price) * Number(i.quantity)), 0);
    }
  
    function addToCart(product) {
      const existing = cart.find(i => i.productId === product.id);
  
      // ✅ FIX: correct property name is imageUrls (not ImageUrls)
      const firstImg = (product.imageUrls && product.imageUrls.length) ? product.imageUrls[0] : "";
  
      if (existing) existing.quantity += 1;
      else {
        cart.push({
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          imageUrl: firstImg
        });
      }
      saveCart();
    }
  
    function removeFromCart(productId) {
      cart = cart.filter(i => i.productId !== productId);
      saveCart();
      renderCart();
    }
  
    function updateCartQuantity(productId, q) {
      const it = cart.find(i => i.productId === productId);
      if (!it) return;
      it.quantity = Math.max(1, Number(q || 1));
      saveCart();
      renderCart();
    }
  
    function renderCart() {
      cartList.innerHTML = "";
  
      if (cart.length === 0) {
        cartEmpty.classList.remove("hidden");
        cartTotalEl.textContent = money(0);
        return;
      }
  
      cartEmpty.classList.add("hidden");
  
      for (const item of cart) {
        const row = document.createElement("div");
        row.className = "cart-item";
  
        const img = document.createElement("img");
        img.src = item.imageUrl || "";
        img.alt = item.name;
  
        const main = document.createElement("div");
        main.className = "ci-main";
  
        const top = document.createElement("div");
        top.innerHTML = `<strong>${item.name}</strong> <span class="muted">${money(item.price)}</span>`;
  
        const qty = document.createElement("div");
        qty.className = "qty";
  
        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.onclick = () => updateCartQuantity(item.productId, item.quantity - 1);
  
        const qval = document.createElement("span");
        qval.className = "qval";
        qval.textContent = String(item.quantity);
  
        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.onclick = () => updateCartQuantity(item.productId, item.quantity + 1);
  
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "btn btn-danger";
        remove.textContent = "Remove";
        remove.onclick = () => removeFromCart(item.productId);
  
        qty.append(minus, qval, plus, remove);
  
        main.append(top, qty);
        row.append(img, main);
        cartList.appendChild(row);
      }
  
      cartTotalEl.textContent = money(cartTotal());
    }
  
    // ===== CONTENT =====
    async function loadHomeContent() {
      const data = await apiGet("/api/content/home");
      homeTitleEl.textContent = data.heroTitle || "Nexora";
      homeSubtitleEl.textContent = data.heroSubtitle || "";
      homeImageEl.src = data.heroImageUrl || "";
    }
  
    async function loadAboutContent() {
      const data = await apiGet("/api/content/about");
      aboutTextEl.textContent = data.contentText || "";
      aboutImg1El.src = data.contentImage1Url || "";
      aboutImg2El.src = data.contentImage2Url || "";
    }
  
    // ===== CONFIG =====
    async function loadConfig() {
      try {
        const phone = await apiGet("/api/config/whatsapp");
        if (phone) OWNER_WHATSAPP = String(phone);
      } catch { /* ignore */ }
    }
  
    // ===== SHOP =====
    function renderCategories() {
      categoryPills.innerHTML = "";
  
      if (!selectedGender) {
        categoryPills.textContent = "Select a gender to see categories.";
        categoryPills.classList.add("muted");
        return;
      }
  
      categoryPills.classList.remove("muted");
  
      const cats = CATEGORIES.filter(c => c !== "Dresses" || selectedGender === "female");
  
      const allBtn = document.createElement("button");
      allBtn.className = "pill";
      allBtn.textContent = "All";
      allBtn.dataset.pill = "All";
      allBtn.onclick = () => {
        selectedCategory = null;
        setActivePill("All");
        loadProducts();
      };
      categoryPills.appendChild(allBtn);
  
      for (const c of cats) {
        const b = document.createElement("button");
        b.className = "pill";
        b.textContent = c;
        b.dataset.pill = c;
        b.onclick = () => {
          selectedCategory = c;
          setActivePill(c);
          loadProducts();
        };
        categoryPills.appendChild(b);
      }
  
      setActivePill(selectedCategory || "All");
    }
  
    function setActivePill(label) {
      categoryPills.querySelectorAll(".pill").forEach(p => p.classList.toggle("active", p.dataset.pill === label));
    }
  
    async function loadProducts() {
      if (!selectedGender) return;
  
      const params = new URLSearchParams();
      params.set("gender", selectedGender);
      if (selectedCategory) params.set("category", selectedCategory);
  
      const list = await apiGet(`/api/products?${params.toString()}`);
      productsGrid.innerHTML = "";
  
      if (!list || list.length === 0) {
        shopEmpty.classList.remove("hidden");
        return;
      }
  
      shopEmpty.classList.add("hidden");
  
      for (const p of list) {
        const card = document.createElement("div");
        card.className = "product-card";
        card.onclick = () => (window.location.hash = `#product/${p.id}`);
  
        const img = document.createElement("img");
        img.className = "product-thumb";
        img.src = (p.imageUrls && p.imageUrls.length) ? p.imageUrls[0] : "";
        img.alt = p.name;
  
        const body = document.createElement("div");
        body.className = "pc-body";
        body.innerHTML = `<strong>${p.name}</strong><span class="price">${money(p.price)}</span>`;
  
        card.append(img, body);
        productsGrid.appendChild(card);
      }
    }
  
    // ===== PRODUCT DETAILS =====
    async function showProductDetails(id) {
      const p = await apiGet(`/api/products/${id}`);
      currentProduct = p;
  
      carouselImages = (p.imageUrls && p.imageUrls.length) ? p.imageUrls : [""];
      carouselIndex = 0;
  
      productImage.src = carouselImages[0] || "";
      productName.textContent = p.name || "";
      productPrice.textContent = money(p.price);
      productDescription.textContent = p.description || "";
    }
  
    // ===== CHECKOUT =====
    function setStateSuggestions(country) {
      stateOptions.innerHTML = "";
      const list = STATE_SUGGESTIONS[country] || [];
      list.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        stateOptions.appendChild(opt);
      });
    }
  
    function buildWhatsAppMessage(orderData) {
      const lines = [];
      lines.push("NEXORA ORDER", "");
      lines.push(`Name: ${orderData.CustomerName}`);
      lines.push(`Email: ${orderData.CustomerEmail}`);
      lines.push(`Phone: ${orderData.ContactNumber}`);
      lines.push(`Country: ${orderData.Country}`);
      lines.push(`State/Province: ${orderData.StateProvince}`);
      lines.push(`City: ${orderData.City}`);
      lines.push(`Post Code: ${orderData.PostCode}`);
      if (orderData.Notes) lines.push(`Notes: ${orderData.Notes}`);
      lines.push("", "Items:");
      orderData.Items.forEach(it => {
        lines.push(`- ${it.ProductName} x${it.Quantity} = ${money(it.Price * it.Quantity)}`);
      });
      lines.push("", `Total: ${money(orderData.Items.reduce((s, it) => s + it.Price * it.Quantity, 0))}`);
      return lines.join("\n");
    }
  
    function redirectToWhatsApp(message) {
      const phone = OWNER_WHATSAPP.replace("+", "").replace(/\s+/g, "");
      window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
  
    // ===== ADMIN LOGIN (index icon) =====
    async function adminLogin(username, password) {
      const res = await apiPost("/api/admin/login", { username, password });
      if (!res || !res.token) throw new Error("Invalid login response");
      localStorage.setItem(CONFIG.TOKEN_KEY, res.token);
      window.location.href = "/html/admin.html";
    }
  
    // ===== EVENTS =====
    window.addEventListener("hashchange", route);
  
    shopNowBtn?.addEventListener("click", () => (window.location.hash = "#shop"));
  
    genderMaleBtn?.addEventListener("click", async () => {
      selectedGender = "male";
      selectedCategory = null;
      genderMaleBtn.classList.add("active");
      genderFemaleBtn.classList.remove("active");
      renderCategories();
      await loadProducts();
    });
  
    genderFemaleBtn?.addEventListener("click", async () => {
      selectedGender = "female";
      selectedCategory = null;
      genderFemaleBtn.classList.add("active");
      genderMaleBtn.classList.remove("active");
      renderCategories();
      await loadProducts();
    });
  
    backToShopBtn?.addEventListener("click", () => (window.location.hash = "#shop"));
  
    addToCartBtn?.addEventListener("click", () => {
      if (!currentProduct) return;
      addToCart(currentProduct);
      window.location.hash = "#cart";
      renderCart();
    });
  
    carouselPrev?.addEventListener("click", () => {
      if (!carouselImages.length) return;
      carouselIndex = (carouselIndex - 1 + carouselImages.length) % carouselImages.length;
      productImage.src = carouselImages[carouselIndex] || "";
    });
  
    carouselNext?.addEventListener("click", () => {
      if (!carouselImages.length) return;
      carouselIndex = (carouselIndex + 1) % carouselImages.length;
      productImage.src = carouselImages[carouselIndex] || "";
    });
  
    checkoutBtn?.addEventListener("click", () => {
      if (cart.length === 0) return;
      checkoutError.classList.add("hidden");
      checkoutError.textContent = "";
      checkoutForm.reset();
      stateOptions.innerHTML = "";
      showModal(checkoutModal);
    });
  
    checkoutCancel?.addEventListener("click", () => hideModal(checkoutModal));
  
    // ✅ FIX: country input name is "country"
    checkoutForm?.addEventListener("input", (e) => {
      const t = e.target;
      if (t && t.name === "country") {
        setStateSuggestions(t.value);
      }
    });
  
    checkoutForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      checkoutError.classList.add("hidden");
      checkoutError.textContent = "";
  
      const fd = new FormData(checkoutForm);
  
      // ✅ FIX: map from your HTML input names
      const orderDto = {
        CustomerName: String(fd.get("fullName") || "").trim(),
        CustomerEmail: String(fd.get("email") || "").trim(),
        ContactNumber: String(fd.get("phone") || "").trim(),
        Country: String(fd.get("country") || "").trim(),
        StateProvince: String(fd.get("state") || "").trim(),
        City: String(fd.get("city") || "").trim(),
        PostCode: String(fd.get("postCode") || "").trim(),
        Notes: String(fd.get("notes") || "").trim()
      };
  
      const required = ["CustomerName", "CustomerEmail", "ContactNumber", "Country", "StateProvince", "City", "PostCode"];
      for (const k of required) {
        if (!orderDto[k]) {
          checkoutError.textContent = "Please fill all required fields.";
          checkoutError.classList.remove("hidden");
          return;
        }
      }
      if (!orderDto.Notes) orderDto.Notes = null;
  
      orderDto.Items = cart.map(i => ({
        ProductId: i.productId,
        ProductName: i.name,
        Price: Number(i.price),
        Quantity: Number(i.quantity),
        ProductImageUrl: i.imageUrl || null
      }));
  
      if (orderDto.Items.length === 0) {
        checkoutError.textContent = "Your cart is empty.";
        checkoutError.classList.remove("hidden");
        return;
      }
  
      try {
        await apiPost("/api/orders", orderDto);
  
        hideModal(checkoutModal);
  
        const message = buildWhatsAppMessage(orderDto);
        redirectToWhatsApp(message);
  
        cart = [];
        saveCart();
        renderCart();
      } catch (err) {
        console.error(err);
        checkoutError.textContent = "Could not create order. Please try again.";
        checkoutError.classList.remove("hidden");
      }
    });
  
    // Admin icon -> confirm -> login modal
    adminIcon?.addEventListener("click", () => showModal(adminConfirmModal));
    adminNoBtn?.addEventListener("click", () => hideModal(adminConfirmModal));
    adminYesBtn?.addEventListener("click", () => {
      hideModal(adminConfirmModal);
      adminLoginError.classList.add("hidden");
      adminUsername.value = "";
      adminPassword.value = "";
      showModal(adminLoginModal);
    });
  
    adminLoginCancel?.addEventListener("click", () => hideModal(adminLoginModal));
    adminLoginSubmit?.addEventListener("click", async () => {
      adminLoginError.classList.add("hidden");
      try {
        await adminLogin(adminUsername.value.trim(), adminPassword.value);
      } catch {
        adminLoginError.textContent = "Invalid credentials.";
        adminLoginError.classList.remove("hidden");
      }
    });
  
    [adminConfirmModal, adminLoginModal, checkoutModal].forEach(m => {
      m?.addEventListener("click", (e) => {
        if (e.target === m) hideModal(m);
      });
    });
  
    // ===== INIT =====
    async function init() {
      loadCart();
      privacyUpdated && (privacyUpdated.textContent = new Date().toLocaleDateString());
  
      await loadConfig();
      try { await loadHomeContent(); } catch {}
      try { await loadAboutContent(); } catch {}
  
      route();
    }
  
    init();
  })();