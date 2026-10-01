import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Users,
  FolderPlus,
  LogOut,
  Headphones,
  User,
  X
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const userNav = [
    { name: 'Meus Chamados', path: '/', icon: Ticket },
    { name: 'Novo Chamado', path: '/tickets/new', icon: PlusCircle },
    { name: 'Meu Perfil', path: '/profile', icon: User },
  ];

  const adminNav = [
    { name: 'Painel Geral (Dashboard)', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Todos os Chamados', path: '/', icon: Ticket },
    { name: 'Novo Chamado', path: '/tickets/new', icon: PlusCircle },
    { name: 'Gerenciar Usuários', path: '/admin/users', icon: Users },
    { name: 'Categorias de TI', path: '/admin/categories', icon: FolderPlus },
    { name: 'Meu Perfil', path: '/profile', icon: User },
  ];

  const navItems = user?.role === 'ADMIN' ? adminNav : userNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-sky-600 text-white rounded-lg shadow-sm">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">
              Desk<span className="text-sky-600">SmartTI</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.department} • {user?.store}</p>
              <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                user?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {user?.role === 'ADMIN' ? 'Administrador' : 'Usuário Solicitante'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-sky-50 text-sky-700 border-l-4 border-sky-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>
    </>
  );
}
