import Store from "./services/store.js";
import { loadCart, loadProducts } from "./services/api.js";
import Router from "./services/router.js";

import Products from "./components/products.js";
import Product from "./components/product-item.js";
import Orders from "./components/orders.js";

window.app = {};
app.store = Store;
app.router = Router;

window.addEventListener("DOMContentLoaded", function () {
  const cartOpenBtn = $(".open-cart");
  const cartCloseBtn = $(".close-cart");
  const cartContent = $(".cart-dialog");
  const pageOverlay = $(".page-overlay");

  cartOpenBtn.addEventListener("click", function () {
    cartContent.classList.toggle("active");
    pageOverlay.classList.toggle("active");
    loadCart();
  });
  pageOverlay.addEventListener("click", function () {
    cartContent.classList.remove("active");
    pageOverlay.classList.remove("active");
  });
  cartCloseBtn.addEventListener("click", function () {
    cartContent.classList.remove("active");
    pageOverlay.classList.remove("active");
  });
});

window.addEventListener("DOMContentLoaded", function () {
  app.router.init();
  loadProducts();
});

const $ = (...args) => {
  return document.querySelector.apply(document, args);
};
// const $$ = (...args) => document.querySelectorAll.apply(document, args);
// HTMLElement.prototype.on = (a, b, c) => document.addEventListener(a, b, c);
// HTMLElement.prototype.off = (a, b) => document.removeEventListener(a, b);
// HTMLElement.prototype.$ = (s) => document.querySelector(s);
// HTMLElement.prototype.$ = (s) => document.querySelectorAll(s);
