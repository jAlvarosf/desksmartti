import React, { useState, useEffect } from 'react';
import { FolderPlus, Plus, RefreshCw, Tag, AlertCircle, Edit3, Trash2, Save, X } from 'lucide-react';
import api from '../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Edit inline state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      await api.post('/admin/categories', { name, description });
      setName('');
      setDescription('');
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar categoria.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || '');
  };

  const handleSaveEdit = async (catId) => {
    if (!editName.trim()) return;
    setSavingEdit(true);
    try {
      await api.put(`/admin/categories/${catId}`, {
        name: editName,
        description: editDescription
      });
      setEditingId(null);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao editar categoria.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Deseja realmente excluir a categoria "${cat.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/admin/categories/${cat.id}`);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir categoria.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderPlus className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Categorias de Atendimento
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cadastre, edite e exclua os tipos de solicitações de suporte oferecidos pela TI.
          </p>
        </div>

        <button
          onClick={fetchCategories}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Lista
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Plus className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Nova Categoria
          </h2>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Nome da Categoria *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Redes, Impressoras, ERP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Descrição Breve
              </label>
              <textarea
                rows={3}
                placeholder="Explique o tipo de problema atendido nesta categoria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-sky-600 text-white font-semibold text-sm rounded-xl hover:bg-sky-700 shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Salvar Categoria
                </>
              )}
            </button>
          </form>
        </div>

        {/* Categories Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Categorias Ativas no Sistema
          </h2>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
              <p className="text-sm">Carregando categorias...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl space-y-2">
                  {editingId === cat.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                      />
                      <textarea
                        rows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 resize-y"
                      />
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          disabled={savingEdit}
                          className="px-3 py-1 bg-sky-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          {cat.name}
                        </span>

                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded-full mr-1">
                            {cat._count?.tickets || 0}
                          </span>
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"
                            title="Editar Categoria"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {cat.description || 'Sem descrição cadastrada.'}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
