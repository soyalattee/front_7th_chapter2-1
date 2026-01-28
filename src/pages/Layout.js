import { Header, Footer } from "../components";

export const Layout = ({ children }) => {
  return `
  <div class="min-h-screen bg-gray-50">
    ${Header()}
    <main class="max-w-md mx-auto px-4 py-4">
      ${children}
    </main>
    ${Footer()}
  </div>
  `;
};
