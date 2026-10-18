# ZentroMart — High-Performance Multi-Category Static E-Commerce Website

> **Business Concept:** *Everything You Need, All in One Place.*  
> **Official WhatsApp Helpline & Checkout:** `+92 318 3085519` (International: `+923183085519`)  
> **Currency:** Pakistani Rupees (PKR)  
> **Hosting Platform:** GitHub Pages (100% Free, Zero-Server Static Architecture)  
> **Backend / Database:** None. Strictly zero server dependencies, no Firebase/Firestore.

---

## 🌟 Executive Summary

**ZentroMart** is a production-ready, mobile-first static e-commerce storefront engineered specifically for GitHub Pages. It features 42 authentic Pakistani grocery, spice, flour, pulse, dairy, and commercial catering products with rich images, specifications, client-side search, category filters, and an exact **25-products-per-page** pagination engine.

Orders are placed effortlessly through **WhatsApp Checkout**, which formats order messages with product names, SKUs, quantities, and an automatic **20% OFF Launch Promotion Tag**, without exposing raw or inaccurate server calculations.

---

## 🚀 Key Features

1. **Mobile-First Responsive Layout:**
   - **Mobile:** Exactly 2 products per row with touch-friendly sizing and quick bottom navigation bar (Home, Shop, Cart, Wishlist, WhatsApp).
   - **Tablet:** 3 products per row.
   - **Desktop:** 4 products per row.
   - **Large Monitors:** 5 products per row where appropriate.
   - Zero horizontal overflow.

2. **Client-Side Pagination (Max 25 Items Per Page):**
   - Strictly enforces 25 items per page (`1–25: Page 1`, `26–42: Page 2`).
   - Dynamic URL query synchronization (`shop.html?page=1`, `shop.html?page=2`).
   - Filter or search changes automatically reset pagination to Page 1.
   - Keyboard accessible navigation and smooth scroll.

3. **Advanced Fast Client-Side Search:**
   - Search across product title, SKU (`ZM-0001` to `ZM-0042`), category, subcategory, and specifications.
   - Debounced input with keyboard-navigable autocomplete suggestions dropdown.

4. **Multi-Category Dynamic Catalog:**
   - Flours & Grains (Al Hafiz Chakki Atta, Basmati Rice, Maida, Suji, Besan).
   - Pulses & Lentils (Daal Mash, Daal Masoor, Daal Moong, Dal Channa, Kabuli Channa, Kala Channa).
   - Pure Spices & Seasonings (Dhaniya, Haldi, Kuti Lal Mirch, Pesi Lal Mirch, Cinnamon).
   - Commercial Sauces & Condiments (4-Litre Delish BBQ, Chilli Garlic, Mayonnaise, Pizza Sauce, Soy Sauce, Ketchup, Vinegar).
   - Food Flavors & Essences (Biryani, Kewra, Qurma, Vanilla).
   - Dairy & Fresh (Mozzarella 1kg block, Pure Desi Ghee 1kg tin, Farm White Eggs 30-egg tray).
   - Ready to Eat & Frozen (Chicken Donuts, Shami Kababs, Shawarma Wraps, Spaghetti).

5. **Multi-Image Interactive Galleries:**
   - Products with multiple images (e.g., `ZM-0001` with 4 high-res photos) feature thumbnail carousels, next/prev arrow buttons, keyboard navigation, and zoom support.

6. **Frontend Cart & Wishlist (LocalStorage):**
   - No user registration required.
   - Persists through page refreshes.
   - Real-time cart badge counters across desktop and mobile headers.
   - Quantity adjustment steppers (+/-) and instant item removal.

7. **Direct WhatsApp Checkout Integration:**
   - **Single Item "Buy Now on WhatsApp":**
     ```text
     Hello ZentroMart!

     I would like to order:

     Product: Al Hafiz Chakki Atta (Whole Wheat Flour) 10kg
     Product ID: ZM-0001
     Quantity: 1
     Offer: 20% OFF Launch Discount Applied

     Please confirm availability and delivery details.
     ```
   - **Cart Multi-Item Checkout:**
     ```text
     Hello ZentroMart!

     I would like to place an order.

     ORDER DETAILS

     1. Al Hafiz Chakki Atta (Whole Wheat Flour) 10kg
     SKU: ZM-0001
     Qty: 2
     - 20% OFF Applied

     2. Delish Smoky BBQ Barbecue Sauce 4L Commercial Gallon
     SKU: ZM-0030
     Qty: 1
     - 20% OFF Applied

     Please confirm availability, delivery charges and payment options.

     Thank you!
     ```
     *Strictly satisfies: No price included in the WhatsApp message text; 20% OFF promotional tag included on all items!*

8. **SEO & GitHub Pages Compatibility:**
   - Canonical links, Open Graph tags, Twitter/X cards.
   - Pre-rendered static pages in `/p/` with Schema.org `Product` JSON-LD.
   - `.nojekyll` to disable Jekyll processing.
   - Complete `sitemap.xml` and `robots.txt`.

---

## 📂 Project Architecture

```text
ZentroMart/
│
├── index.html                  # Homepage (Hero, categories, featured, bestsellers, new arrivals)
├── shop.html                   # Shop Catalog (Filters, search, sort, exact 25-item pagination)
├── product.html                # Dynamic Product Details & interactive gallery
├── cart.html                   # Shopping Cart & WhatsApp checkout review
├── wishlist.html               # Wishlist saved items
├── about.html                  # About Us
├── contact.html                # Contact Us & WhatsApp inquiry composer
├── shipping.html               # Shipping & Delivery Policy
├── returns.html                # Return & Exchange Policy
├── privacy.html                # Privacy Policy (Zero tracking)
├── terms.html                  # Terms & Conditions
├── faq.html                    # Frequently Asked Questions with interactive accordions
├── 404.html                    # Custom 404 Not Found
├── .nojekyll                   # GitHub Pages bypass for static assets
├── robots.txt                  # Search engine crawler permissions
├── sitemap.xml                 # XML sitemap with all 42 products
│
├── assets/
│   ├── css/
│   │   ├── main.css            # Design tokens, reset, typography, header, footer, animations
│   │   ├── components.css      # Product cards, badges, buttons, pagination, cart rows, toasts
│   │   └── responsive.css      # Mobile navigation, tablet/desktop grid, 2-per-row mobile
│   │
│   ├── js/
│   │   ├── utils.js            # Formatters, LocalStorage helpers, debounce, toasts
│   │   ├── products.js         # Catalog loader, cache, and card generator
│   │   ├── search.js           # Live client-side instant search & autocomplete dropdown
│   │   ├── filters.js          # Category, price range, and sorting engine
│   │   ├── pagination.js       # Exactly 25 products per page logic
│   │   ├── cart.js             # LocalStorage cart engine & order summary renderer
│   │   ├── wishlist.js         # LocalStorage wishlist engine
│   │   ├── whatsapp.js         # WhatsApp URL builder & formatted checkout generator
│   │   ├── gallery.js          # Multi-image product gallery & thumbnails
│   │   └── app.js              # Global orchestrator & route dispatcher
│   │
│   └── images/
│       ├── logo.svg            # Crisp vector brand logo (dark background)
│       ├── logo-dark.svg       # Crisp vector brand logo (light background)
│       └── placeholder.svg     # Elegant SVG fallback for missing images
│
├── data/
│   ├── products.json           # Master product catalog (all 42 verified products)
│   ├── categories.json         # Category definitions, icons, slugs
│   ├── featured.json           # Featured product IDs and promotional banners
│   └── catalog/
│       ├── manifest.json       # Chunk manifest
│       └── chunks/
│           ├── chunk-1.json    # Products 1–25
│           └── chunk-2.json    # Products 26–42
│
├── p/                          # Pre-rendered static SEO product detail pages
│   └── al-hafiz-chakki-atta-whole-wheat-flour.html
│
├── scripts/
│   ├── build-catalog.mjs       # Validates catalog and generates chunk files
│   └── generate-pages.mjs      # Generates pre-rendered static SEO HTML pages in /p/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Actions workflow for GitHub Pages
│
└── README.md                   # Complete documentation
```

---

## 🛠️ Product Maintenance (Without Admin Dashboard)

There is **no administrative dashboard** or database server. Updating products is straightforward via Git:

### 1. How to Add a Product
1. Create a folder for your product inside `Products/` (e.g. `Products/43. Himalayan Pink Salt/`).
2. Add one or more images into the folder.
3. Open `data/products.json` and append a new record:
   ```json
   {
     "id": "ZM-0043",
     "slug": "pure-himalayan-pink-salt-1kg",
     "name": "Pure Himalayan Pink Mineral Salt 1kg",
     "category": "Spices & Seasonings",
     "categorySlug": "spices-seasonings",
     "subcategory": "Salt & Minerals",
     "price": 180,
     "originalPrice": 225,
     "currency": "PKR",
     "description": "Natural hand-mined Himalayan pink rock salt rich in 84 trace minerals.",
     "images": [
       "Products/43. Himalayan Pink Salt/1. Pink Salt.jpg"
     ],
     "stockStatus": "in-stock",
     "featured": false,
     "bestSeller": false,
     "newArrival": true,
     "popularityRank": 85,
     "createdAt": "2026-10-18",
     "specifications": {
       "Origin": "Khewra Salt Mines, Pakistan",
       "Weight": "1 KG"
     }
   }
   ```
4. Optional: Run `node scripts/build-catalog.mjs` locally if Node is available.
5. Commit and push:
   ```bash
   git add .
   git commit -m "Add ZM-0043 Himalayan Pink Salt"
   git push origin main
   ```
   GitHub Pages will automatically publish the update!

### 2. How to Update a Product
- Edit any field (price, description, specifications, or stock status) in `data/products.json`.
- Commit and push to GitHub.

### 3. How to Remove a Product
- Delete its record from `data/products.json`.
- Commit and push.

---

## 🚢 GitHub Pages Deployment

### One-Click Deployment via GitHub Pages
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial ZentroMart Production Commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ZentroMart.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions** (to use `.github/workflows/deploy.yml`) OR select **Deploy from a branch** > branch: `main` > folder: `/(root)`.
3. Your site will be live at:
   `https://<your-username>.github.io/ZentroMart/`

---

## 🧪 Acceptance Testing & Verification

- ✅ **Mobile Layout:** Tested for responsive 2-column grid on mobile phones without horizontal scrolling.
- ✅ **Pagination:** Displays strictly 25 products on Page 1, and 17 products on Page 2. URL updates seamlessly.
- ✅ **Cart Persistence:** Items added to cart survive browser refreshes and browser restarts via LocalStorage.
- ✅ **WhatsApp Checkout:** Generates WhatsApp URL encoded message directed to `+92 318 3085519` containing product names, SKUs, quantities, and "20% OFF Applied" tag without price numbers.
- ✅ **Search:** Instant client-side search with debounce and keyboard suggestion selection.
- ✅ **SEO & Fallbacks:** Fallback SVG for any missing image, structured microdata, and Open Graph tags on every page.
- ✅ **Zero Backend:** Runs 100% statically on GitHub Pages with zero Node.js/PHP/Firebase at runtime.
"# ZentroMart" 
