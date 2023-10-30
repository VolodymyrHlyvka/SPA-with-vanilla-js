const Router = {
  init: () => {
    document.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const url = event.target.getAttribute("href");
        Router.go(url);
      });
    });
    window.addEventListener("popstate", (event) => {
      Router.go(event.state.route, false);
    });

    Router.go(location.pathname);
  },

  go: (route, addToHistory = true) => {
    if (addToHistory) {
      history.pushState({ route }, "", route);
    }
    let pageHeading = null;
    let pageElement = null;
    console.log("route", route);

    switch (route) {
      case "/":
      case "/shop-all":
      case "/best-sellers":
        pageHeading = document.createElement("h1");
        pageHeading.textContent = route;
        const productsContainer = document.querySelector(".products-container");
        productsContainer.innerHTML = "";
        pageElement = document.createElement("products-content");
        productsContainer.appendChild(pageElement);
        break;
      default:
        if (route.includes("/product-")) {
          pageHeading = document.createElement("h1");
          pageHeading.textContent = "Product";
          pageHeading.dataset.productId = route.substring(
            route.lastIndexOf("-") + 1
          );
        }
    }
    if (pageHeading) {
      const pageHeader = document.querySelector(".page-header");
      pageHeader.innerHTML = "";
      pageHeading.classList.add("page-header-heading");
      pageHeader.appendChild(pageHeading);
    }

    window.scrollX = 0;
    window.scrollY = 0;
  },
};

export default Router;
