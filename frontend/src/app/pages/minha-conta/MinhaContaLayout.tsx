import { Outlet, Link, useLocation, Navigate } from 'react-router';
import { ShoppingBag, UserCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../components/Header';

export default function MinhaContaLayout() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/minha-conta/dados" replace />;
  }

  const getLinkClass = (path: string) => {
    const isActive = pathname.includes(path);
    return `flex items-center gap-3 px-6 py-4 font-bold text-sm transition-colors ${
      isActive 
        ? 'bg-black text-white border-l-4 border-red-600' 
        : 'text-black/60 hover:bg-black/5 hover:text-black border-l-4 border-transparent'
    }`;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      <Header />
      <div className="pt-24 md:pt-32 container mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-8 text-black">
          Olá, <span className="text-red-600">{user?.nome.split(' ')[0]}</span>!
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-xl sticky top-24">
              <nav className="flex flex-col py-4">
                <Link to="/minha-conta/dados" className={getLinkClass('/dados')}>
                  <UserCircle size={20} /> Meus Dados
                </Link>
                <Link to="/minha-conta/pedidos" className={getLinkClass('/pedidos')}>
                  <ShoppingBag size={20} /> Minhas Compras
                </Link>
                {/* 
                Links ocultos nesta fase:
                <Link to="/minha-conta/endereco" className={getLinkClass('/endereco')}>
                  <MapPin size={20} /> Meu Endereço
                </Link>
                <Link to="/minha-conta/senha" className={getLinkClass('/senha')}>
                  <KeyRound size={20} /> Alterar Senha
                </Link>
                */}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="bg-white rounded-3xl border border-black/5 shadow-xl p-6 md:p-8 min-h-[400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
