import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Carrinho from "./pages/Carrinho";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ProtectedRoute } from "../components/ProtectedRoute";
import MinhaContaLayout from "./pages/minha-conta/MinhaContaLayout";
import PedidosList from "./pages/minha-conta/PedidosList";
import MeusDados from "./pages/minha-conta/MeusDados";
import MeuEndereco from "./pages/minha-conta/MeuEndereco";
import AlterarSenha from "./pages/minha-conta/AlterarSenha";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import ProdutosAdmin from "./pages/admin/ProdutosAdmin";
import EstoqueAdmin from "./pages/admin/EstoqueAdmin";
import PedidosAdmin from "./pages/admin/PedidosAdmin";
import CuponsAdmin from "./pages/admin/CuponsAdmin";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/cadastro",
    Component: Register,
  },
  {
    path: "/esqueci-senha",
    Component: ForgotPassword,
  },
  {
    path: "/redefinir-senha",
    Component: ResetPassword,
  },
  // Fim das rotas de autenticação
  {
    path: "/minha-conta",
    element: <ProtectedRoute><MinhaContaLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <PedidosList />, // Default route
      },
      {
        path: "pedidos",
        Component: PedidosList,
      },
      {
        path: "dados",
        Component: MeusDados,
      },
      {
        path: "endereco",
        Component: MeuEndereco,
      },
      {
        path: "senha",
        Component: AlterarSenha,
      },
    ]
  },
  {
    path: "/admin",
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      {
        index: true,
        element: <ProdutosAdmin />,
      },
      {
        path: "produtos",
        Component: ProdutosAdmin,
      },
      {
        path: "estoque",
        Component: EstoqueAdmin,
      },
      {
        path: "pedidos",
        Component: PedidosAdmin,
      },
      {
        path: "cupons",
        Component: CuponsAdmin,
      },
    ]
  },

  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "product/:id",
        Component: ProductDetail,
      },
      {
        path: "carrinho",
        Component: Carrinho,
      },
      {
        path: "checkout",
        Component: Checkout,
      },
    ],
  },
]);
