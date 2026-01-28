import { Layout } from "./Layout";
import { SearchForm, ProductList } from "../components";

export const Home = ({ filters, products, pagination, loading = false }) => {
  return `${Layout({
    children: `
   ${SearchForm({ filters, pagination })}
   ${ProductList({ products, isLoading: loading })}
  `,
  })}`;
};
