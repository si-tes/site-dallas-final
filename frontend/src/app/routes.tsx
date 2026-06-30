import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Carrinho from "./pages/Carrinho";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import AdminLogin from "./pages/AdminLogin";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import PedidosAdmin from "./pages/admin/PedidosAdmin";
import ProdutosAdmin from "./pages/admin/ProdutosAdmin";
import EstoqueAdmin from "./pages/admin/EstoqueAdmin";
import CuponsAdmin from "./pages/admin/CuponsAdmin";
import MinhaContaLayout from "./pages/minha-conta/MinhaContaLayout";
import MeusDados from "./pages/minha-conta/MeusDados";
import PedidosList from "./pages/minha-conta/PedidosList";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/product/:id",
    Component: ProductDetail,
  },
  {
    path: "/carrinho",
    Component: Carrinho,
  },
  {
    path: "/checkout",
    Component: Checkout,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/cadastro",
    Component: Cadastro,
  },
  {
    path: "/esqueci-senha",
    Component: EsqueciSenha,
  },
  {
    path: "/redefinir-senha",
    Component: RedefinirSenha,
  },
  {
    path: "/admin-login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    element: <AdminRoute><AdminLayout /></AdminRoute>,
  },
  {
    path: "/admin/produtos",
    element: <AdminRoute><ProdutosAdmin /></AdminRoute>,
  },
  {
    path: "/admin/pedidos",
    element: <AdminRoute><PedidosAdmin /></AdminRoute>,
  },
  {
    path: "/admin/estoque",
    element: <AdminRoute><EstoqueAdmin /></AdminRoute>,
  },
  {
    path: "/admin/cupons",
    element: <AdminRoute><CuponsAdmin /></AdminRoute>,
  },
  {
    path: "/minha-conta",
    element: <MinhaContaLayout />,
    children: [
      {
        path: "dados",
        element: <MeusDados />
      },
      {
        path: "pedidos",
        element: <PedidosList />
      }
    ]
  },
]);
