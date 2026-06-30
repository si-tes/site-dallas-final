import { useState, useEffect, useRef } from 'react';
import { Search, Menu, ShoppingCart, User, X, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { carrinhoService } from '../../services/carrinhoService';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [totalItens, setTotalItens] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Lê o localStorage ao montar e a cada atualização disparada pelo ProductDetail/Carrinho
  const sincronizarContador = () => {
    setTotalItens(carrinhoService.getTotalItens());
  };

  useEffect(() => {
    sincronizarContador();
    // Escuta o evento customizado disparado ao adicionar/remover/atualizar itens
    window.addEventListener('carrinhoAtualizado', sincronizarContador);
    return () => {
      window.removeEventListener('carrinhoAtualizado', sincronizarContador);
    };
  }, []);

  // Fecha o menu de usuário se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) setIsUserMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      navigate('/login');
    }
  };

  const handleSearchClick = () => {
    if (window.location.pathname === '/') {
      const searchInput = document.getElementById('search-products-input');
      if (searchInput) {
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => searchInput.focus({ preventScroll: true }), 300);
      }
    } else {
      navigate('/#search-products');
    }
  };

  return (
    <>
      {/* OVERLAY DO MENU */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60]" 
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* MENU DRAWER LATERAL */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-2xl font-black tracking-tight uppercase italic text-black">Dalla<span className="text-red-600">.</span></h2>
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-black" />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <Link to="/" onClick={() => setIsDrawerOpen(false)} className="text-lg font-bold text-black/80 hover:text-black uppercase italic transition-colors">Início</Link>
            <Link to="/#lancamentos" onClick={() => setIsDrawerOpen(false)} className="text-lg font-bold text-black/80 hover:text-black uppercase italic transition-colors">Lançamentos</Link>
            <Link to="/#ligas" onClick={() => setIsDrawerOpen(false)} className="text-lg font-bold text-black/80 hover:text-black uppercase italic transition-colors">Ligas Europeias</Link>
            <Link to="/#brasileirao" onClick={() => setIsDrawerOpen(false)} className="text-lg font-bold text-black/80 hover:text-black uppercase italic transition-colors">Brasileirão</Link>
            <Link to="/#retro" onClick={() => setIsDrawerOpen(false)} className="text-lg font-bold text-black/80 hover:text-black uppercase italic transition-colors">Retrô</Link>
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <button 
              onClick={() => {
                setIsDrawerOpen(false);
                navigate(isAuthenticated ? '/minha-conta/dados' : '/login');
              }} 
              className="flex items-center gap-3 text-sm font-bold text-black w-full text-left outline-none"
            >
              <User size={18} /> Perfil / Minha Conta
            </button>
        </div>
      </div>

      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          {/* Lado Esquerdo - Menu */}
          <div className="flex items-center w-1/3">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
              aria-label="Abrir Menu Lateral"
            >
              <Menu size={24} className="text-black" />
            </button>
          </div>

        {/* Centro - Logo */}
        <div className="flex items-center justify-center w-1/3">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl md:text-2xl font-black text-black tracking-tighter uppercase italic">
              Dalla<span className="text-red-600">.</span>
            </h1>
          </Link>
        </div>

        {/* Lado Direito - Ações */}
        <div className="flex items-center justify-end gap-2 md:gap-4 w-1/3">
          <button 
            onClick={handleSearchClick}
            className="p-2 hover:bg-black/10 rounded-full transition-colors"
            aria-label="Buscar produtos"
          >
            <Search size={20} className="text-black" />
          </button>
          
          {/* Ícone de Usuário / Login e Dropdown */}
          <div className="relative">
            <button 
              onClick={handleUserClick}
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
              aria-label={isAuthenticated ? "Opções do Usuário" : "Entrar / Cadastrar"}
            >
              <User size={20} className="text-black" />
            </button>

            {/* Dropdown Sair */}
            {isAuthenticated && isUserMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden z-50 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3 border-b border-gray-100 mb-1">
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Minha Conta</p>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  Sair da Conta
                </button>
              </div>
            )}
          </div>

          {/* Ícone do Carrinho com contador dinâmico */}
          <button
            onClick={() => navigate('/carrinho')}
            className="p-2 hover:bg-black/10 rounded-full transition-colors relative"
            aria-label="Abrir carrinho"
          >
            <ShoppingCart size={20} className="text-black" />
            {totalItens > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {totalItens > 9 ? '9+' : totalItens}
              </span>
            )}
          </button>
        </div>
        </div>
      </motion.header>
    </>
  );
}
