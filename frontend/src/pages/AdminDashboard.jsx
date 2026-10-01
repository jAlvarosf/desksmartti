import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Building,
  Tag,
  Calendar,
  RefreshCw,
  Filter
} from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [store, setStore] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (store) params.store = store;
      if (categoryId) params.categoryId = categoryId;

      const res = await api.get('/admin/stats', { params });
      setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate, store, categoryId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-sky-600" />
            Painel Geral da TI (Dashboard)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Métricas de desempenho, chamados por categoria, lojas e níveis de urgência.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors shrink-0"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Dados
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-3 font-bold text-xs uppercase tracking-wider text-slate-500">
          <Filter className="w-4 h-4 text-sky-600" />
          Filtros de Período e Unidade
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            >
              <option value="">Todas Categorias</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Loja / Unidade</label>
            <input
              type="text"
              placeholder="Ex: Matriz, Loja 01"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
          <p className="text-sm">Carregando métricas estatísticas...</p>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total</span>
                <Ticket className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats?.summary?.total || 0}</p>
              <p className="text-[10px] text-slate-400 mt-1">Chamados gerados</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs bg-sky-50/30">
              <div className="flex items-center justify-between text-sky-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Abertos</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-sky-700">{stats?.summary?.open || 0}</p>
              <p className="text-[10px] text-sky-600/80 mt-1">Aguardando início</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs bg-amber-50/30">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Em Atend.</span>
                <RefreshCw className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-amber-700">{stats?.summary?.inProgress || 0}</p>
              <p className="text-[10px] text-amber-600/80 mt-1">Em resolução</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs bg-purple-50/30">
              <div className="flex items-center justify-between text-purple-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Aguardando</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-purple-700">{stats?.summary?.waitingUser || 0}</p>
              <p className="text-[10px] text-purple-600/80 mt-1">Aguardando usuário</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs bg-emerald-50/30">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Resolvidos</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-emerald-700">{stats?.summary?.resolved || 0}</p>
              <p className="text-[10px] text-emerald-600/80 mt-1">Solucionados</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Fechados</span>
                <XCircle className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-2xl font-black text-slate-700">{stats?.summary?.closed || 0}</p>
              <p className="text-[10px] text-slate-400 mt-1">Encerrados</p>
            </div>
          </div>

          {/* Breakdown Charts / Graphs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By Priority */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Chamados por Prioridade
              </h3>
              <div className="space-y-3">
                {stats?.byPriority?.map((p) => {
                  const percent = stats.summary.total > 0 ? Math.round((p.count / stats.summary.total) * 100) : 0;
                  return (
                    <div key={p.priority} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{p.priority === 'LOW' ? 'Baixa' : p.priority === 'MEDIUM' ? 'Média' : p.priority === 'HIGH' ? 'Alta' : 'Urgente'}</span>
                        <span>{p.count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${p.priority === 'URGENT' ? 'bg-rose-500' : p.priority === 'HIGH' ? 'bg-amber-500' : 'bg-sky-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Category */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Tag className="w-4 h-4 text-sky-600" />
                Chamados por Categoria
              </h3>
              <div className="space-y-3">
                {stats?.byCategory?.map((c) => {
                  const percent = stats.summary.total > 0 ? Math.round((c.count / stats.summary.total) * 100) : 0;
                  return (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[180px]">{c.category}</span>
                        <span>{c.count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Store / Unit */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building className="w-4 h-4 text-indigo-600" />
                Chamados por Loja / Unidade
              </h3>
              <div className="space-y-3">
                {stats?.byStore?.map((s) => {
                  const percent = stats.summary.total > 0 ? Math.round((s.count / stats.summary.total) * 100) : 0;
                  return (
                    <div key={s.store} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[180px]">{s.store}</span>
                        <span>{s.count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
