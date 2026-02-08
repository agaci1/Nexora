(() => {
    const CONFIG = {
      API_BASE: "", // keep "" if same domain. If different, set: "https://your-api-domain"
      TOKEN_KEY: "nexora_admin_token_v1",
      CATEGORIES: [
        "T-Shirts",
        "Trousers",
        "Suits",
        "Jackets",
        "Dresses",
        "Sportswear / Activewear",
        "Accessories",
        "Cosmetics",
        "Perfumes"
      ]
    };
  
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    if (!token) window.location.href = "/html/index.html#home";
  
    function apiUrl(path) {
      return `${CONFIG.API_BASE}${path}`;
    }
  
    async function apiGet(path) {
      const res = await fetch(apiUrl(path), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`GET ${path} failed`);
      return res.json();
    }
  
    async function apiPost(path, body) {
      const res = await fetch(apiUrl(path), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `POST ${path} failed`);
      }
      return res.json();
    }
  
    async function apiPutJson(path, body) {
      const res = await fetch(apiUrl(path), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `PUT ${path} failed`);
      }
    }
  
    // For endpoints that expect a RAW string (order status)
    async function apiPutRaw(path, rawJsonString) {
      const res = await fetch(apiUrl(path), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: rawJsonString
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `PUT ${path} failed`);
      }
    }
  
    async function apiDelete(path) {
      const res = await fetch(apiUrl(path), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `DELETE ${path} failed`);
      }
    }
  
    // ===== Tabs =====
    const tabTitle = document.getElementById("tab-title");
    const sideLinks = document.querySelectorAll(".side-link");
    const tabs = {
      products: document.getElementById("tab-products"),
      orders: document.getElementById("tab-orders"),
      content: document.getElementById("tab-content")
    };
  
    function openTab(name) {
      Object.values(tabs).forEach(t => t.classList.add("hidden"));
      tabs[name].classList.remove("hidden");
      sideLinks.forEach(b => b.classList.toggle("active", b.dataset.tab === name));
      tabTitle.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    }
  
    sideLinks.forEach(btn => btn.addEventListener("click", () => openTab(btn.dataset.tab)));
  
    document.getElementById("logout").addEventListener("click", () => {
      localStorage.removeItem(CONFIG.TOKEN_KEY);
      window.location.href = "/html/index.html#home";
    });
  
    document.getElementById("refresh").addEventListener("click", () => refreshAll());
  
    // ===== Products =====
    const productsTbody = document.getElementById("products-tbody");
    const openAddProductBtn = document.getElementById("open-add-product");
  
    const addModal = document.getElementById("add-product-modal");
    const addCancel = document.getElementById("add-product-cancel");
    const addSave = document.getElementById("add-product-save");
    const addError = document.getElementById("add-product-error");
  
    const pName = document.getElementById("p-name");
    const pPrice = document.getElementById("p-price");
    const pGender = document.getElementById("p-gender");
    const pCategory = document.getElementById("p-category");
    const pSize = document.getElementById("p-size");
    const pNote = document.getElementById("p-note");
    const pDescription = document.getElementById("p-description");
    const pPhotos = document.getElementById("p-photos");
  
    function showModal() {
      addModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
    function hideModal() {
      addModal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  
    function fillCategoryOptions() {
      pCategory.innerHTML = "";
      for (const c of CONFIG.CATEGORIES) {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        pCategory.appendChild(opt);
      }
    }
  
    function resetAddForm() {
      addError.classList.add("hidden");
      addError.textContent = "";
      pName.value = "";
      pPrice.value = "";
      pGender.value = "male";
      pCategory.value = "T-Shirts";
      pSize.value = "";
      pNote.value = "";
      pDescription.value = "";
      pPhotos.value = "";
    }
  
    openAddProductBtn.addEventListener("click", () => {
      fillCategoryOptions();
      resetAddForm();
      showModal();
    });
    addCancel.addEventListener("click", hideModal);
    addModal.addEventListener("click", (e) => { if (e.target === addModal) hideModal(); });
  
    async function loadProducts() {
      const products = await apiGet("/api/admin/products?page=1&pageSize=200");
      renderProducts(products);
    }
  
    function renderProducts(products) {
      productsTbody.innerHTML = "";
      for (const p of (products || [])) {
        const tr = document.createElement("tr");
  
        const imgTd = document.createElement("td");
        const img = document.createElement("img");
        img.className = "timg";
        img.src = (p.imageUrls && p.imageUrls.length) ? p.imageUrls[0] : "";
        img.alt = p.name;
        imgTd.appendChild(img);
  
        const nameTd = document.createElement("td");
        nameTd.textContent = p.name;
  
        const gTd = document.createElement("td");
        gTd.textContent = p.genderType;
  
        const cTd = document.createElement("td");
        cTd.textContent = p.category;
  
        const priceTd = document.createElement("td");
        priceTd.textContent = Number(p.price || 0).toFixed(2);
  
        const actTd = document.createElement("td");
        const del = document.createElement("button");
        del.className = "btn btn-danger";
        del.textContent = "Delete";
        del.onclick = async () => {
          if (!confirm("Delete this product?")) return;
          await apiDelete(`/api/admin/products/${p.id}`);
          await loadProducts();
        };
        actTd.appendChild(del);
  
        tr.append(imgTd, nameTd, gTd, cTd, priceTd, actTd);
        productsTbody.appendChild(tr);
      }
    }
  
    // ===== Image upload via cloudinary-service =====
    async function getCloudinaryServiceUrl() {
      // You already have ConfigController
      // GET /api/config/cloudinary-service -> returns URL string
      const res = await fetch(apiUrl("/api/config/cloudinary-service"));
      if (!res.ok) throw new Error("Failed to load cloudinary-service url");
      const url = await res.json();
      if (!url || typeof url !== "string") throw new Error("Invalid cloudinary-service url");
      return url.replace(/\/$/, "");
    }
  
    async function uploadFilesToCloudinaryService(files) {
      // Expected: POST {serviceUrl}/upload with multipart files
      // Returns: { urls: ["https://...","https://..."] }
      const serviceUrl = await getCloudinaryServiceUrl();
  
      const fd = new FormData();
      for (const f of files) fd.append("files", f);
  
      const res = await fetch(`${serviceUrl}/upload`, {
        method: "POST",
        body: fd
      });
  
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Upload service failed");
      }
  
      const data = await res.json();
      const urls = data.urls || data.imageUrls || data;
      if (!Array.isArray(urls) || urls.length === 0) {
        throw new Error("Upload service returned no urls");
      }
      return urls;
    }
  
    addSave.addEventListener("click", async () => {
      addError.classList.add("hidden");
      addError.textContent = "";
  
      const name = pName.value.trim();
      const price = Number(pPrice.value);
      const genderType = pGender.value;
      const category = pCategory.value;
  
      const size = pSize.value.trim();
      const note = pNote.value.trim();
      const descriptionRaw = pDescription.value || "";
  
      if (!name || !price || price <= 0 || !genderType || !category) {
        addError.textContent = "Please fill Name, Price, Gender, Category.";
        addError.classList.remove("hidden");
        return;
      }
  
      // Merge size + note into description (size NOT in DB column)
      let finalDescription = descriptionRaw.trim();
      if (size) finalDescription = `Size: ${size}\n\n${finalDescription}`;
      if (note) finalDescription = `${finalDescription}\n\nNote: ${note}`;
  
      try {
        addSave.disabled = true;
        addSave.textContent = "Saving...";
  
        // 1) Create product
        const created = await apiPost("/api/admin/products", {
          name,
          price,
          genderType,
          category,
          description: finalDescription
        });
        const productId = created.id;
  
        // 2) Upload images (optional)
        const files = Array.from(pPhotos.files || []);
        if (files.length > 0) {
          const urls = await uploadFilesToCloudinaryService(files);
  
          // Backend Option B (ProductImagesDto { imageUrls: [] })
          await apiPost(`/api/admin/products/${productId}/images`, { imageUrls: urls });
        }
  
        hideModal();
        await loadProducts();
      } catch (err) {
        console.error(err);
        addError.textContent = (err && err.message) ? err.message : "Failed to add product.";
        addError.classList.remove("hidden");
      } finally {
        addSave.disabled = false;
        addSave.textContent = "Save";
      }
    });
  
    // ===== Orders =====
    const ordersTbody = document.getElementById("orders-tbody");
  
    async function loadOrders() {
      const orders = await apiGet("/api/admin/orders?page=1&pageSize=100");
      renderOrders(orders);
    }
  
    function renderOrders(orders) {
      ordersTbody.innerHTML = "";
      for (const o of (orders || [])) {
        const tr = document.createElement("tr");
  
        const dateTd = document.createElement("td");
        dateTd.textContent = o.createdAt ? new Date(o.createdAt).toLocaleString() : "—";
  
        const custTd = document.createElement("td");
        custTd.textContent = `${o.customerName} (${o.contactNumber})`;
  
        const totalTd = document.createElement("td");
        totalTd.textContent = Number(o.totalAmount || 0).toFixed(2);
  
        const statusTd = document.createElement("td");
        const sel = document.createElement("select");
        ["Pending", "Completed", "Cancelled"].forEach(s => {
          const opt = document.createElement("option");
          opt.value = s;
          opt.textContent = s;
          sel.appendChild(opt);
        });
        sel.value = o.status || "Pending";
        sel.onchange = async () => {
          await apiPutRaw(`/api/admin/orders/${o.id}/status`, JSON.stringify(sel.value));
        };
        statusTd.appendChild(sel);
  
        const actTd = document.createElement("td");
        const del = document.createElement("button");
        del.className = "btn btn-danger";
        del.textContent = "Delete";
        del.onclick = async () => {
          if (!confirm("Delete this order?")) return;
          await apiDelete(`/api/admin/orders/${o.id}`);
          await loadOrders();
        };
        actTd.appendChild(del);
  
        tr.append(dateTd, custTd, totalTd, statusTd, actTd);
        ordersTbody.appendChild(tr);
      }
    }
  
    // ===== Content =====
    const contentPills = document.querySelectorAll(".content-tabs .pill");
    const contentHome = document.getElementById("content-home");
    const contentAbout = document.getElementById("content-about");
  
    // Home fields (hero)
    const heroTitle = document.getElementById("home-title");
    const heroSubtitle = document.getElementById("home-subtitle");
    const heroImageUrl = document.getElementById("home-imageUrl");
    const saveHome = document.getElementById("save-home");
    const homeSaveMsg = document.getElementById("home-save-msg");
  
    // About fields (content)
    const contentText = document.getElementById("about-text");
    const contentImage1Url = document.getElementById("about-imageUrl1");
    const contentImage2Url = document.getElementById("about-imageUrl2");
    const saveAbout = document.getElementById("save-about");
    const aboutSaveMsg = document.getElementById("about-save-msg");
  
    contentPills.forEach(p => {
      p.addEventListener("click", () => {
        contentPills.forEach(x => x.classList.toggle("active", x === p));
        const t = p.dataset.ctab;
        if (t === "home") {
          contentHome.classList.remove("hidden");
          contentAbout.classList.add("hidden");
        } else {
          contentAbout.classList.remove("hidden");
          contentHome.classList.add("hidden");
        }
      });
    });
  
    async function loadContent() {
      const home = await fetch(apiUrl("/api/content/home")).then(r => r.json());
      const about = await fetch(apiUrl("/api/content/about")).then(r => r.json());
  
      heroTitle.value = home.heroTitle || "";
      heroSubtitle.value = home.heroSubtitle || "";
      heroImageUrl.value = home.heroImageUrl || "";
  
      contentText.value = about.contentText || "";
      contentImage1Url.value = about.contentImage1Url || "";
      contentImage2Url.value = about.contentImage1Url || "";
    }
  
    function showMsg(el, text) {
      el.textContent = text;
      el.classList.remove("hidden");
      setTimeout(() => el.classList.add("hidden"), 1600);
    }
  
    saveHome.addEventListener("click", async () => {
      await apiPutJson("/api/admin/content/home", {
        heroTitle: heroTitle.value.trim(),
        heroSubtitle: heroSubtitle.value.trim(),
        heroImageUrl: heroImageUrl.value.trim()
      });
      showMsg(homeSaveMsg, "Saved.");
    });
  
    saveAbout.addEventListener("click", async () => {
      await apiPutJson("/api/admin/content/about", {
        contentText: contentText.value,
        contentImage1Url: contentImage1Url.value.trim(),
        contentImage2Url: contentImage2Url.value.trim()
      });
      showMsg(aboutSaveMsg, "Saved.");
    });
  
    // ===== Init =====
    async function refreshAll() {
      try {
        await loadProducts();
        await loadOrders();
        await loadContent();
      } catch (e) {
        console.error(e);
        alert("Admin API error. Token invalid or backend not reachable.");
      }
    }
  
    openTab("products");
    refreshAll();
  })();