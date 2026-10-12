# J&C Jeans & Company — local local shop
1. Open this folder in VS Code → install **Live Server** → right-click `index.html` → *Open with Live Server*.
2. Open `admin.html` for the dashboard. Demo data (marked DEMO) loads automatically on first launch.
3. Edit prices/products in Admin → Products, or import from Excel via Admin → Data (CSV).

**Important:** all data is in *this browser only* (localStorage). Orders from customers do NOT reach the owner and are not shared across devices. Use *Export Full Backup* regularly. Admin has no password — do not put real customer data on a public site.
For real online orders you need a small backend (e.g. Google Sheets + Apps Script); `JC.get/JC.set` in `js/storage.js` and `placeOrder()` in `js/shop.js` are the only places to change.

## GitHub Pages
Create a repo → upload all files (keep folders) → Settings → Pages → Branch `main`, folder `/ (root)` → open the link shown. All paths are relative, so subfolders work.
Product photos: put files in `assets/products/` and enter e.g. `assets/products/jeans-blue.jpg` as the image path in Admin → Products. Until then, generated placeholders show.
