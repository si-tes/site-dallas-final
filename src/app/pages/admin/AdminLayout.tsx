import { Outlet, Link, useLocation } from 'react-router';
import { Package, Layers, ShoppingCart, Ticket, LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const getLinkClass = (path: string) => {
    const isActive = pathname.includes(path);
    return `flex items-center gap-3 px-6 py-4 font-bold text-sm transition-colors ${
      isActive 
        ? 'bg-black text-white border-l-4 border-red-600' 
        : 'text-black/60 hover:bg-black/5 hover:text-black border-l-4 border-transparent'
    }`;
  };

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-[#fafafa] pt-24 md:pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-xl sticky top-28">
                <nav className="flex flex-col py-4">
                  <Link to="/admin/produtos" className={getLinkClass('/admin/produtos')}>
                    <Package size={20} /> Produtos
                  </Link>
                  <Link to="/admin/estoque" className={getLinkClass('/admin/estoque')}>
                    <Layers size={20} /> Estoque
                  </Link>
                  <Link to="/admin/pedidos" className={getLinkClass('/admin/pedidos')}>
                    <ShoppingCart size={20} /> Pedidos
                  </Link>
                  <Link to="/admin/cupons" className={getLinkClass('/admin/cupons')}>
                    <Ticket size={20} /> Cupons
                  </Link>
                  
                  <div className="h-[1px] bg-black/5 my-2 mx-6"></div>
                  
                  <button 
                    onClick={logout}
                    className="flex items-center gap-3 px-6 py-4 font-bold text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut size={20} /> Sair
                  </button>
                </nav>
              </div>
            </aside>

          <main className="flex-1">
            <div className="bg-white rounded-3xl border border-black/5 shadow-xl p-6 md:p-8 min-h-[400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
    </>
  );
}
