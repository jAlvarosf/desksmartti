import React, { useState, useEffect } from 'react';
import { Building2, Plus, RefreshCw, Search, CheckCircle2, AlertCircle, Edit3, Trash2, Save, X, Building } from 'lucide-react';
import api from '../services/api';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies/companies');
      setCompanies(res.data.companies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openCreateModal = () => {
    setEditingCompany(null);
    setName('');
    setCode('');
    setActive(true);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingCompany(c);
    setName(c.name);
    setCode(c.code || '');
    setActive(c.active);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      if (editingCompany) {
        await api.put(`/companies/companies/${editingCompany.id}`, { name, code, active });
      } else {
        await api.post('/companies/companies', { name, code, active });
      }
      setShowModal(false);
      await fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar empresa.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Deseja realmente excluir a empresa "${c.name}"?`)) return;

    try {
      await api.delete(`/companies/companies/${c.id}`);
      await fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir empresa.');
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Gerenciamento de Empresas e Unidades
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cadastre as empresas e filiais que os usuários poderão selecionar durante o cadastro no sistema.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCompanies}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-sky-600 text-white font-semibold text-sm rounded-xl hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Empresa
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar empresa por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Companies List Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
            <p className="text-sm">Carregando empresas...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma empresa encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((comp) => (
              <div
                key={comp.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      comp.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {comp.active ? 'Ativa' : 'Inativa'}
                    </span>
                    {comp.code && (
                      <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {comp.code}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{comp.name}</h3>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    👥 {comp._count?.users || 0} usuários • 🎫 {comp._count?.tickets || 0} chamados
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(comp)}
                      className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"
                      title="Editar Empresa"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(comp)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Excluir Empresa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                {editingCompany ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Empresa / Unidade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matriz - Central, Filial SP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Código Interno (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: LOJ-01, MAT-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={active ? 'true' : 'false'}
                  onChange={(e) => setActive(e.target.value === 'true')}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  <option value="true">Ativa (Visível no cadastro)</option>
                  <option value="false">Inativa</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-sky-600/20 cursor-pointer"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
