const Store = {
  products: null,
  cart: [],
};

const proxiesStore = new Proxy(Store, {
  set(target, property, value) {
    target[property] = value;
    if (property === "products") {
      window.dispatchEvent(new Event("appProductsChange"));
    }

    if (property === "cart") {
      window.dispatchEvent(new Event("appCartChange"));
    }

    return true;
  },
});

export default proxiesStore;
