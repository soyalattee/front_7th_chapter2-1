import { Home, Detail } from "./pages";
import { getProducts, getProduct } from "./api/productApi";
import { addRoute, push, start, subscribe, getTarget, getParams } from "./lib/Router.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

async function render() {
  const $root = document.getElementById("root");
  const target = getTarget();

  if (!target?.component) {
    $root.innerHTML = "";
    return;
  }

  const { component, loadData } = target;
  const params = getParams();

  $root.innerHTML = component({ loading: true });
  const data = await loadData(params);
  $root.innerHTML = component({ ...data, loading: false });
}

function main() {
  // 1. 라우트 등록
  addRoute("/", {
    component: Home,
    loadData: async () => {
      const data = await getProducts();
      return { ...data };
    },
  });
  addRoute("/products/:id", {
    component: Detail,
    loadData: async (params) => {
      const product = await getProduct(params.id);
      return { product };
    },
  });

  // 2. 라우터 변경 시 render 호출되도록 구독
  subscribe(render);

  // 3. 전역 클릭 리스너 (한 번만 등록)
  document.body.addEventListener("click", (event) => {
    if (event.target.closest(".product-card")) {
      const productId = event.target.closest(".product-card").dataset.productId;
      push(`/products/${productId}`);
    }
  });

  // 4. 라우터 시작: popstate 등록 + 초기 라우트 매칭 + render 실행
  start();
}

if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
