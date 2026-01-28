import { Home, Detail } from "./pages";
import { getProducts, getProduct } from "./api/productApi";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

// 이벤트같은걸 등록해서, 순환참조가 발생하지 않도록 주의
const push = (path) => {
  history.pushState({}, "", path);
  render();
};

async function render() {
  const $root = document.getElementById("root");

  if (location.pathname === "/") {
    $root.innerHTML = Home({ loading: true });
    const data = await getProducts(); // { filters, products, pagination }

    $root.innerHTML = Home({ ...data, loading: false });
  } else {
    $root.innerHTML = Detail({ loading: true });
    const productId = location.pathname.split("/").pop();
    const data = await getProduct(productId);
    console.log(data);
    $root.innerHTML = Detail({ product: data, loading: false });
  }
}

// 이벤트 리스너를 render() 밖으로 이동하여 한 번만 등록
document.body.addEventListener("click", (event) => {
  console.log(event.target);
  if (event.target.closest(".product-card")) {
    const productId = event.target.closest(".product-card").dataset.productId;
    // router.push() 식으로 라우터 생성해서 사용
    push(`/products/${productId}`);
  }
});

// 뒤로가기 이벤트 핸들링
// router.onpopstate = render; 식으로 라우터에 등록해주기
window.addEventListener("popstate", () => {
  render();
});

// 애플리케이션 시작
function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
