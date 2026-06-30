import { useAuth } from '../../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-black text-white z-50 flex items-center shadow-lg">
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        
        {/* Logo / Brand */}
        <div className="text-xl font-black uppercase italic tracking-tighter">
          Dalla <span className="text-red-600">Admin</span>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:block text-sm font-bold text-white/80">
            Olá, {user?.nome.split(' ')[0]}
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-400 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>

      </div>
    </header>
  );
}
