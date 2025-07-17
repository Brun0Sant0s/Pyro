import { Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Package, FileText, Wrench, X } from 'lucide-react';

const Sidebar = ({ logout, open, onClose }) => {
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { to: '/produtos', label: 'Produtos', icon: <Package /> },
    { to: '/inventario', label: 'Inventário', icon: <Wrench /> },
    { to: '/documentos', label: 'Documentos', icon: <FileText /> }
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

<div className={`
  fixed md:sticky top-0 left-0 w-64 z-50 bg-[#121212] border-r border-[#2a2a2a]
  transform transition-transform duration-300 ease-in-out
  ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
  h-full md:h-screen flex flex-col
`}>
        {/* Botão fechar mobile */}
        <div className="md:hidden flex justify-end p-4">
          <button onClick={onClose}>
            <X className="text-white w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo com scroll e botão fixo no fundo */}
     <div className="flex flex-col flex-1 overflow-y-auto p-6">
  {/* Logo */}
  <div className="mb-8">
    <img src="../assets/logo_glow.png" alt="Pyro & SFX Logo" className="w-full object-contain max-h-60" />
  </div>

  {/* Navegação */}
  <nav className="flex flex-col gap-2 flex-1">
    {navItems.map(({ to, label, icon }) => (
      <Link
        key={to}
        to={to}
        onClick={onClose}
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition text-sm
          ${location.pathname === to
            ? 'bg-red-600 text-white'
            : 'hover:bg-[#1f1f1f] text-gray-300'}`}
      >
        {icon}
        {label}
      </Link>
    ))}
  </nav>

  {/* Botão logout sempre no fundo */}
  <div className="pt-6 mt-auto border-t border-[#2e2e2e]">
    <button
      onClick={() => {
        logout();
        onClose();
      }}
      className="flex w-full items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition text-sm"
    >
      <LogOut className="w-5 h-5" />
      Logout
    </button>
  </div>
</div>

      </div>
    </>
  );
};

export default Sidebar;
