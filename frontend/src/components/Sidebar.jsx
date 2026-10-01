import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Users,
  FolderPlus,
  BookOpen,
  Headphones,
  X
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const userNav = [
    { name: 'Meus Chamados', path: '/', icon: Ticket },
    { name: 'Base de Conhecimento', path: '/knowledge', icon: BookOpen },
  ];

  const adminNav = [
    { name: 'Painel Geral (Dashboard)', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Todos os Chamados', path: '/', icon: Ticket },
    { name: 'Gerenciar Usuários', path: '/admin/users', icon: Users },
    { name: 'Categorias de TI', path: '/admin/categories', icon: FolderPlus },
    { name: 'Base de Conhecimento', path: '/knowledge', icon: BookOpen },
  ];

  const navItems = user?.role === 'ADMIN' ? adminNav : userNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 dark:border-slate-800">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-sky-600 text-white rounded-lg shadow-sm">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Desk<span className="text-sky-600 dark:text-sky-400">SmartTI</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
                  ${active
                    ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-l-4 border-sky-600 dark:border-sky-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
