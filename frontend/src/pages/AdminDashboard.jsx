import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Filter,
  Star,
  ThumbsUp,
  PieChart as PieIcon,
  BarChart as BarIcon,
  X
} from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Modal & Filter states
  const [showFilterModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [store, setStore] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [companyId, setCompanyId] = useState('');

  const fetchCategoriesAndCompanies = async () => {
    try {
      const [catRes, compRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/companies/companies')
      ]);
      setCategories(catRes.data.categories);
      setCompanies(compRes.data.companies);
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
      if (companyId) params.companyId = companyId;

      const res = await api.get('/admin/stats', { params });
      setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndCompanies();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate, store, categoryId, companyId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Painel Geral da TI (Dashboard Analytics)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Acompanhe métricas de atendimento, índice de satisfação (CSAT), gráficos por prioridade e loja.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold text-sm rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors cursor-pointer shrink-0"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avançados
          </button>

          <button
            onClick={fetchStats}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
          <p className="text-sm">Carregando dados estatísticos...</p>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total</span>
                <Ticket className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.summary?.total || 0}</p>
              <p className="text-[10px] text-slate-400 mt-1">Chamados gerados</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-sky-100 dark:border-sky-900/50 shadow-xs bg-sky-50/30 dark:bg-sky-950/20">
              <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Abertos</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-sky-700 dark:text-sky-300">{stats?.summary?.open || 0}</p>
              <p className="text-[10px] text-sky-600/80 dark:text-sky-400/80 mt-1">Aguardando início</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/50 shadow-xs bg-amber-50/30 dark:bg-amber-950/20">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Em Atend.</span>
                <RefreshCw className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{stats?.summary?.inProgress || 0}</p>
              <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1">Em resolução</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/50 shadow-xs bg-purple-50/30 dark:bg-purple-950/20">
              <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Aguardando</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-purple-700 dark:text-purple-300">{stats?.summary?.waitingUser || 0}</p>
              <p className="text-[10px] text-purple-600/80 dark:text-purple-400/80 mt-1">Aguardando usuário</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-xs bg-emerald-50/30 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Resolvidos</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{stats?.summary?.resolved || 0}</p>
              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Solucionados</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Fechados</span>
                <XCircle className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-2xl font-black text-slate-700 dark:text-slate-300">{stats?.summary?.closed || 0}</p>
              <p className="text-[10px] text-slate-400 mt-1">Encerrados</p>
            </div>
          </div>

          {/* Rating CSAT Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-sky-500/10 dark:from-amber-950/30 dark:to-sky-950/30 p-6 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ThumbsUp className="w-4 h-4" />
                <span>Índice de Satisfação de TI (CSAT)</span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {stats?.ratings?.csatPercent || 0}% de Aprovação
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Média de <strong className="text-amber-600 dark:text-amber-400">{stats?.ratings?.averageRating || 0} / 5.0 ⭐</strong> com base em {stats?.ratings?.totalRated || 0} avaliações.
              </p>
            </div>

            {/* Star Distribution Visual */}
            <div className="space-y-1 text-xs">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats?.ratings?.distribution?.[star] || 0;
                const total = stats?.ratings?.totalRated || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={star} className="flex items-center space-x-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300 w-12 flex items-center gap-1">
                      {star} <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    </span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-slate-400 font-mono w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Recent Feedbacks */}
            <div className="space-y-2 border-l border-amber-200/80 dark:border-amber-900/50 pl-0 md:pl-6 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px]">Comentários Recentes:</h4>
              {stats?.ratings?.recentFeedback?.length === 0 ? (
                <p className="text-slate-400 italic">Nenhum comentário recebido ainda.</p>
              ) : (
                stats?.ratings?.recentFeedback?.slice(0, 2).map((fb, idx) => (
                  <div key={idx} className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{fb.feedback || 'Sem comentário'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">— {fb.user?.fullName} (#{fb.code})</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Visual Charts Section (Pie & Bar representations) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Column Chart Representation - Priority */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <BarIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Gráfico em Colunas (Prioridade)
              </h3>

              <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-200 dark:border-slate-800">
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((pKey) => {
                  const found = stats?.byPriority?.find(p => p.priority === pKey);
                  const count = found ? found.count : 0;
                  const maxCount = Math.max(...(stats?.byPriority?.map(p => p.count) || [1]), 1);
                  const heightPct = Math.max(10, Math.round((count / maxCount) * 100));

                  const pLabel = pKey === 'LOW' ? 'Baixa' : pKey === 'MEDIUM' ? 'Média' : pKey === 'HIGH' ? 'Alta' : 'Urgente';
                  const barColor = pKey === 'URGENT' ? 'bg-rose-500' : pKey === 'HIGH' ? 'bg-amber-500' : pKey === 'MEDIUM' ? 'bg-sky-500' : 'bg-slate-400';

                  return (
                    <div key={pKey} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{count}</span>
                      <div
                        className={`w-full rounded-t-xl transition-all duration-300 ${barColor} group-hover:brightness-110`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">{pLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pie Chart Representation - Categories */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <PieIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Gráfico em Pizza (Categorias)
              </h3>

              <div className="space-y-3 pt-2">
                {stats?.byCategory?.map((c, idx) => {
                  const percent = stats.summary.total > 0 ? Math.round((c.count / stats.summary.total) * 100) : 0;
                  const colors = ['bg-sky-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
                  const color = colors[idx % colors.length];

                  return (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="truncate max-w-[180px] flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                          {c.category}
                        </span>
                        <span>{c.count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Store Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <BarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Chamados por Empresa / Loja
              </h3>

              <div className="space-y-3 pt-2">
                {stats?.byStore?.map((s) => {
                  const percent = stats.summary.total > 0 ? Math.round((s.count / stats.summary.total) * 100) : 0;
                  return (
                    <div key={s.store} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="truncate max-w-[180px]">{s.store}</span>
                        <span>{s.count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                Filtros Avançados
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Data Final</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Empresa / Unidade</label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="">Todas Empresas</option>
                  {companies.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="">Todas Categorias</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setStore('');
                  setCategoryId('');
                  setCompanyId('');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Limpar Filtros
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
