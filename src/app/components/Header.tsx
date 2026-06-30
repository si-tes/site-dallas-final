import { Search, Menu, X, ShoppingBag, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { carrinhoService } from '../../services/carrinhoService';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [totalItems, setTotalItems] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const atualizarContador = () => {
    setTotalItems(carrinhoService.getTotalItens());
  };

  useEffect(() => {
    atualizarContador();
    window.addEventListener('carrinhoAtualizado', atualizarContador);
    return () => window.removeEventListener('carrinhoAtualizado', atualizarContador);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      <motion.header 
        className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          {/* Esquerda: Botão do Menu Hamburguer */}
          <div className="flex items-center w-1/3">
            <button 
              onClick={toggleMenu} 
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Abrir menu"
            >
              <Menu size={24} className="text-black" />
            </button>
          </div>

          {/* Centro: Logotipo Serifado */}
          <div className="flex items-center justify-center w-1/3">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase font-cinzel text-black">
                Dalla Imports
              </h1>
            </Link>
          </div>

          {/* Direita: Ações (Pesquisa, Sacola) */}
          <div className="flex items-center justify-end gap-1 w-1/3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
              <Search size={20} className="text-black" />
            </button>
            <Link 
              to="/carrinho" 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Ver carrinho"
            >
              <ShoppingBag size={20} className="text-black" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* OVERLAY E DRAWER LATERAL (GAVETA DE NAVEGAÇÃO) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div 
              className="fixed inset-0 bg-black/50 z-50 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
            />

            {/* Menu Drawer */}
            <motion.div 
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-[60] shadow-2xl flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              {/* Header do Drawer */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight font-cinzel">Dalla Imports</h2>
                <button onClick={toggleMenu} className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-black" />
                </button>
              </div>

              {/* Links de Navegação */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <button 
                  onClick={() => handleLinkClick('/')}
                  className="text-lg font-bold text-left hover:text-gray-500 uppercase tracking-wider font-cinzel transition-colors"
                >
                  Início
                </button>
                <button 
                  onClick={() => handleLinkClick('/lancamentos')}
                  className="text-lg font-bold text-left hover:text-gray-500 uppercase tracking-wider font-cinzel transition-colors"
                >
                  Lançamentos
                </button>
                <button 
                  onClick={() => handleLinkClick('/brasil')}
                  className="text-lg font-bold text-left hover:text-gray-500 uppercase tracking-wider font-cinzel transition-colors"
                >
                  Brasileirão
                </button>
                <button 
                  onClick={() => handleLinkClick('/europeus')}
                  className="text-lg font-bold text-left hover:text-gray-500 uppercase tracking-wider font-cinzel transition-colors"
                >
                  Ligas Europeias
                </button>
                <button 
                  onClick={() => handleLinkClick('/retro')}
                  className="text-lg font-bold text-left hover:text-gray-500 uppercase tracking-wider font-cinzel transition-colors"
                >
                  Retrô
                </button>
              </div>

              {/* Rodapé do Drawer - Conta do Usuário */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    <button 
                      onClick={() => handleLinkClick('/minha-conta')}
                      className="flex items-center gap-3 text-sm font-bold text-black uppercase tracking-wider"
                    >
                      <User size={18} /> Olá, {user?.nome.split(' ')[0]}
                    </button>
                    <button 
                      onClick={handleLogoutClick}
                      className="flex items-center gap-3 text-sm font-bold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider text-left"
                    >
                      <LogOut size={18} /> Sair da Conta
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleLinkClick('/login')}
                    className="flex items-center gap-3 text-sm font-bold text-black uppercase tracking-wider"
                  >
                    <User size={18} /> Minha Conta / Entrar
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
