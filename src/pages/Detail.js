import { Layout } from "./Layout.js";
import { ProductDetail } from "../components";

export const Detail = ({ product, loading }) => {
  return `${Layout({
    children: `   
    ${ProductDetail({ product, loading })}
  `,
  })}
  `;
};
