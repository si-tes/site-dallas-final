import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router';
import { ArrowLeft, User } from 'lucide-react';

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="pt-24 md:pt-28 pb-20 container mx-auto px-4 max-w-4xl">
        <div className="border-b border-gray-200 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Painel Administrativo
            </h1>
          </div>
        </div>

        <div className="bg-white p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">{user?.nome || 'Administrador'}</h2>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Status: Ativo</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('@DallasImports:token');
                window.location.href = '/login';
              }}
              className="text-red-600 font-bold uppercase text-xs border border-red-200 bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors"
            >
              Sair
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">ID</p>
              <p className="font-bold text-black">{user?.id}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Nome</p>
              <p className="font-bold text-black">{user?.nome}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">E-mail</p>
              <p className="font-bold text-black">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Admin</p>
              <p className="font-bold text-green-600 bg-green-50 inline-block px-3 py-1 rounded-full text-xs">
                {user?.is_admin ? 'Sim' : 'Não'}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <Link 
              to="/admin/cupons" 
              className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              Ver Cupons
            </Link>
            <Link 
              to="/admin/estoque" 
              className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              Ver Estoque
            </Link>
            <Link 
              to="/admin/produtos" 
              className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              Ver Produtos
            </Link>
            <Link 
              to="/admin/pedidos" 
              className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              Ver Pedidos
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
