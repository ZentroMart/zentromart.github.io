# ZentroMart — Multi-Category E-Commerce Store

> **"Everything You Need, All in One Place."**  
> Lightning-fast, mobile-first static e-commerce website designed for seamless WhatsApp checkout (+92 318 3085519) and zero-cost GitHub Pages hosting.

---

## 🚀 How to Run Locally

You can run ZentroMart locally using any of the following methods:

### Method 1: One-Click Run (Windows — Recommended)
Simply double-click the **`start-local.bat`** file in this project folder.
- It will automatically detect Python or Node.js on your computer.
- It will spin up the local server and launch your default web browser automatically.

---

### Method 2: VS Code / Antigravity IDE (Live Server)
1. Install the **Live Server** extension (by *Ritwick Dey*) if not already installed.
2. In the explorer, right-click [`index.html`](file:///c:/Users/murtu/OneDrive/Desktop/ZentroMart/index.html) and select **"Open with Live Server"**.
3. Or click **"Go Live"** on the blue status bar at the bottom right.
4. Your browser will open at:
   ```
   http://127.0.0.1:5500/
   ```

---

### Method 3: Python Built-In Server
Open Command Prompt (`cmd.exe`) in this directory and run:
```cmd
python -m http.server 8000
```
*(or `py -m http.server 8000`)*

Then open your browser and go to:
```
http://localhost:8000/
```

---

### Method 4: Node.js / npm
Open your terminal in this directory and run:
```cmd
npx serve .
```
or
```cmd
npm start
```
Then open:
```
http://localhost:3000/
```

---

### Method 5: Direct File Opening (No Server Required)
You can also directly double-click [`index.html`](file:///c:/Users/murtu/OneDrive/Desktop/ZentroMart/index.html) in Windows Explorer to open it in your browser (`file:///...`).
- Thanks to the bundled catalog fallback (`data/catalog-bundle.js`), all 42 products, categories, search, filtering, wishlist, cart, and WhatsApp checkout work immediately without CORS blocking.

---

## 🛒 Key Features

- **Multi-Category Catalog (42 Real Products)**: Stone-ground chakki flour, daals, pure spices, 4L Delish commercial sauces, mozzarella cheese, desi ghee, farm eggs, and frozen snacks.
- **WhatsApp Checkout**: Instant 1-click single-item order and multi-item cart checkout to `+92 318 3085519`.
- **Flat 20% OFF Launch Discount**: Automatically computed across all product badges, cards, and cart summaries.
- **Client-Side Search & Filters**: Live search with debounced instant dropdown suggestions, category filtering, price filtering, and sorting.
- **Client-Side Pagination**: Exactly 25 products per page with URL query parameter support (`shop.html?page=1`).
- **Cart & Wishlist Engine**: Persistent state using browser `localStorage`.
- **SEO & Social Share Ready**: Complete Open Graph, Twitter cards, JSON-LD Schema structured data, `sitemap.xml`, and `robots.txt`.
- **Zero Backend**: Requires no database, Node.js server, or Firebase. 100% static GitHub Pages compatible.

---

## 📁 Project Structure

```text
ZentroMart/
├── start-local.bat           # 1-Click local server launcher for Windows
├── package.json              # npm scripts (npm start, npm run dev)
├── index.html                # Homepage with hero, banners & featured carousels
├── shop.html                 # Complete catalog with search, filters & pagination
├── product.html              # Dynamic product detail page with image gallery
├── cart.html                 # Cart review & WhatsApp order generator
├── wishlist.html             # Saved favorite items
├── about.html                # Brand story and mission
├── contact.html              # Direct customer support & inquiries
├── shipping.html             # Delivery policies & timelines
├── returns.html              # Exchange & guarantee terms
├── privacy.html              # Privacy policy
├── terms.html                # Terms & conditions
├── faq.html                  # Frequently asked questions
├── 404.html                  # Custom error page
├── sitemap.xml               # Search engine index
├── robots.txt                # Search crawler instructions
│
├── assets/
│   ├── css/
│   │   ├── main.css          # Design system, CSS variables & typography
│   │   ├── components.css    # Cards, badges, buttons, drawers, modals
│   │   └── responsive.css    # Mobile-first adaptive media queries
│   ├── js/
│   │   ├── utils.js          # Helpers, price formatting & toast notifications
│   │   ├── products.js       # Data loader & product card generator
│   │   ├── search.js         # Instant search & live dropdown engine
│   │   ├── filters.js        # Category & price range filter engine
│   │   ├── pagination.js     # 25-item paginator & query sync
│   │   ├── cart.js           # LocalStorage cart management
│   │   ├── wishlist.js       # LocalStorage wishlist toggle
│   │   ├── whatsapp.js       # WhatsApp URL formatting & cart message encoder
│   │   ├── gallery.js        # Multi-image thumbnail switcher
│   │   └── app.js            # Main initialization & UI wiring
│   └── images/               # Logos, hero banners, and vector icons
│
├── data/
│   ├── products.json         # Master product database (42 items)
│   ├── categories.json       # Store categories and icons
│   ├── featured.json         # Featured & bestseller IDs
│   ├── catalog-bundle.js     # Standalone fallback data bundle
│   └── catalog/              # Pre-split JSON chunks for fast loading
│
└── Products/                 # Original product photos organized by folder
```

---

## 🌐 Deploying to GitHub Pages

1. Initialize git and commit your files:
   ```bash
   git add .
   git commit -m "Deploy ZentroMart"
   git push origin main
   ```
2. In your GitHub repository:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select branch **`main`** and folder **`/ (root)`**, then click **Save**.
3. Your site will be live at:
   ```
   https://<username>.github.io/<repo-name>/
   ```
