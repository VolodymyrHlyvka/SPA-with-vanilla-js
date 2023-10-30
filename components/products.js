export default class Products extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
    const styles = document.createElement("style");
    this.root.appendChild(styles);

    async function loadCSS() {
      const request = await fetch("/components/products.css");
      const css = await request.text();
      styles.textContent = css;
    }
    loadCSS();
  }

  connectedCallback() {
    const template = document.getElementById("products-container");
    const content = template.content.cloneNode(true);
    this.root.appendChild(content);

    window.addEventListener("appProductsChange", () => {
      this.render();
    });
  }

  render() {
    const section = this.root.querySelector("section");
    if (app.store.products) {
      section.innerHTML = "";
      for (let product of app.store.products) {
        const productItem = document.createElement("product-item");
        productItem.dataset.product = JSON.stringify(product);
        section.appendChild(productItem);
      }
    } else {
      section.innerHTML = "Loading...";
    }
  }
}
customElements.define("products-content", Products);
