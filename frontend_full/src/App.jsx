import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import Login from './Login';
import Dashboard from './Dashboard';
import Products from './Products';
import Inventory from './Inventory';
import Documents from './Documents';
import Sidebar from './Sidebar';

import {
  LayoutDashboard,
  Package,
  FileText,
  Wrench
} from 'lucide-react';

// Header dinâmico com base na rota
const Header = () => {
  const location = useLocation();

  const routeInfo = {
    '/dashboard': {
      name: 'Dashboard',
      icon: <LayoutDashboard className="w-6 h-6 text-red-500" />
    },
    '/produtos': {
      name: 'Produtos',
      icon: <Package className="w-6 h-6 text-red-500" />
    },
    '/documentos': {
      name: 'Documentos',
      icon: <FileText className="w-6 h-6 text-red-500" />
    },
    '/inventario': {
      name: 'Inventário',
      icon: <Wrench className="w-6 h-6 text-red-500" />
    }
  };

  const currentRoute = routeInfo[location.pathname] || { name: '', icon: null };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] bg-[#121212]">
      <h1 className="text-xl md:text-2xl font-semibold text-white tracking-wide flex items-center gap-2">
        {currentRoute.icon}
        {currentRoute.name}
      </h1>
    </header>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
  };

  if (!token) return <Login setToken={setToken} setRole={setRole} />;

  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c] text-white font-sans relative">
        {/* Sidebar responsiva */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} logout={logout} />

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col">
          {/* Header com botão mobile */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-[#121212]">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-white" />
            </button>
            <Header />
          </div>

          {/* Header normal para desktop */}
          <div className="hidden md:block">
            <Header />
          </div>

          <main className="p-6 flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard token={token} role={role} />} />
              <Route path="/inventario" element={<Inventory token={token} role={role} />} />
              <Route path="/produtos" element={<Products token={token} role={role} />} />
              <Route path="/documentos" element={<Documents token={token} role={role} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}


export default App;
