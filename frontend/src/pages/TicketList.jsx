import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Search,
  Filter,
  Ticket as TicketIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Building,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TicketList() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [store, setStore] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (categoryId) params.categoryId = categoryId;
      if (store) params.store = store;

      const res = await api.get('/tickets', { params });
      setTickets(res.data.tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [status, priority, categoryId, store]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const getStatusBadge = (statusKey) => {
    switch (statusKey) {
      case 'OPEN':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800"><Clock className="w-3.5 h-3.5 mr-1" /> Aberto</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Em Atendimento</span>;
      case 'WAITING_USER':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Aguardando Usuário</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolvido</span>;
      case 'CLOSED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"><XCircle className="w-3.5 h-3.5 mr-1" /> Fechado</span>;
      default:
        return statusKey;
    }
  };

  const getPriorityBadge = (priorityKey) => {
    switch (priorityKey) {
      case 'LOW':
        return <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Baixa</span>;
      case 'MEDIUM':
        return <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Média</span>;
      case 'HIGH':
        return <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">Alta</span>;
      case 'URGENT':
        return <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded animate-pulse">Urgente</span>;
      default:
        return priorityKey;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {user?.role === 'ADMIN' ? 'Gerenciamento de Chamados de TI' : 'Meus Chamados de Suporte'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.role === 'ADMIN'
              ? 'Acompanhe, atribua e responda aos chamados da empresa.'
              : 'Consulte o andamento das suas solicitações ou abra um novo chamado.'}
          </p>
        </div>

        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-sky-600 text-white font-semibold text-sm rounded-xl hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all shrink-0"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Abrir Novo Chamado
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código (TCK-...), assunto ou conteúdo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 text-white font-medium text-sm rounded-xl hover:bg-slate-900 transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todos os Status</option>
              <option value="OPEN">Aberto</option>
              <option value="IN_PROGRESS">Em Atendimento</option>
              <option value="WAITING_USER">Aguardando Usuário</option>
              <option value="RESOLVED">Resolvido</option>
              <option value="CLOSED">Fechado</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todas Prioridades</option>
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todas Categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Loja / Unidade</label>
            <input
              type="text"
              placeholder="Ex: Matriz, Loja 01"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Tickets List Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-600" />
            <p className="text-sm">Carregando chamados...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <TicketIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Nenhum chamado encontrado</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Você não possui solicitações abertas com os filtros selecionados.
            </p>
            <Link
              to="/tickets/new"
              className="inline-flex items-center mt-4 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-700"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Abrir um Chamado Agora
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="p-5 hover:bg-slate-50/80 transition-colors block group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        #{ticket.code}
                      </span>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">
                        {ticket.category?.name}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors truncate">
                      {ticket.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {ticket.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center">
                        <User className="w-3.5 h-3.5 mr-1" />
                        {ticket.user?.fullName}
                      </span>
                      <span className="flex items-center">
                        <Building className="w-3.5 h-3.5 mr-1" />
                        {ticket.store} • {ticket.department}
                      </span>
                      <span className="hidden sm:inline">
                        Aberto em: {new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end space-x-4 shrink-0">
                    <div className="text-right text-xs text-slate-400">
                      <span>{ticket._count?.comments || 0} respostas</span>
                      {ticket._count?.attachments > 0 && (
                        <span className="block text-slate-500">📎 {ticket._count.attachments} anexo(s)</span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
