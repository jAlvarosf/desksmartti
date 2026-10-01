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
  LayoutGrid,
  ListFilter,
  Paperclip,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import ImageModal from '../components/ImageModal';

export default function TicketList() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // View mode: 'list' or 'kanban'
  const [viewMode, setViewMode] = useState('list');

  // Preview file modal state
  const [previewFile, setPreviewFile] = useState(null);

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

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao alterar status do chamado.');
    }
  };

  const getStatusBadge = (statusKey) => {
    switch (statusKey) {
      case 'OPEN':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"><Clock className="w-3.5 h-3.5 mr-1" /> Aberto</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"><RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Em Atendimento</span>;
      case 'WAITING_USER':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Aguardando Usuário</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolvido</span>;
      case 'CLOSED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"><XCircle className="w-3.5 h-3.5 mr-1" /> Fechado</span>;
      default:
        return statusKey;
    }
  };

  const getPriorityBadge = (priorityKey) => {
    switch (priorityKey) {
      case 'LOW':
        return <span className="text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded">Baixa</span>;
      case 'MEDIUM':
        return <span className="text-xs font-medium text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded">Média</span>;
      case 'HIGH':
        return <span className="text-xs font-semibold text-orange-700 bg-orange-50 dark:bg-orange-950 dark:text-orange-300 px-2 py-0.5 rounded">Alta</span>;
      case 'URGENT':
        return <span className="text-xs font-bold text-rose-700 bg-rose-50 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded animate-pulse">Urgente</span>;
      default:
        return priorityKey;
    }
  };

  return (
    <div className="space-y-6">
      {/* Image/File Preview Modal */}
      {previewFile && (
        <ImageModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      {/* Top Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {user?.role === 'ADMIN' ? 'Gerenciamento de Chamados de TI' : 'Meus Chamados de Suporte'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.role === 'ADMIN'
              ? 'Acompanhe, arraste pelo Kanban e atribua aos chamados da empresa.'
              : 'Consulte o andamento das suas solicitações no formato Lista ou Kanban.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Lista</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Kanban</span>
            </button>
          </div>

          <Link
            to="/tickets/new"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-sky-600 text-white font-semibold text-sm rounded-xl hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Abrir Novo Chamado
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código (TCK-...), assunto ou conteúdo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white font-medium text-sm rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todas Prioridades</option>
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Todas Categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Loja / Unidade</label>
            <input
              type="text"
              placeholder="Ex: Matriz, Loja 01"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* View Content (Kanban vs List) */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-600" />
          <p className="text-sm">Carregando chamados...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tickets={tickets}
          onStatusChange={handleStatusChange}
          isAdmin={user?.role === 'ADMIN'}
          onPreviewFile={(file) => setPreviewFile(file)}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {tickets.length === 0 ? (
            <div className="p-12 text-center">
              <TicketIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Nenhum chamado encontrado</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
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
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors block group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-900">
                          #{ticket.code}
                        </span>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {ticket.category?.name}
                        </span>
                      </div>

                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate block"
                      >
                        {ticket.title}
                      </Link>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {ticket.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-slate-400 dark:text-slate-500 pt-1">
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
                      <div className="text-right text-xs text-slate-400 dark:text-slate-500 space-y-1">
                        <span>{ticket._count?.comments || 0} respostas</span>
                        {ticket.attachments && ticket.attachments.length > 0 && (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => setPreviewFile(ticket.attachments[0])}
                              className="text-sky-600 dark:text-sky-400 hover:underline flex items-center font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Ver Anexo ({ticket.attachments.length})
                            </button>
                          </div>
                        )}
                      </div>
                      <Link to={`/tickets/${ticket.id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
