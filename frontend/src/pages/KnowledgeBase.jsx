import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Tag,
  User,
  Clock,
  ChevronRight,
  RefreshCw,
  X,
  Save,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function KnowledgeBase() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Selected Article View
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Create Article Modal (Admin)
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;

      const res = await api.get('/admin/knowledge', { params });
      setArticles(res.data.articles);
      if (res.data.articles.length > 0 && !selectedArticle) {
        setSelectedArticle(res.data.articles[0]);
      }
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
    fetchArticles();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Título e conteúdo são obrigatórios.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/admin/knowledge', {
        title,
        content,
        categoryId: categoryId || null,
        tags
      });

      setShowModal(false);
      setTitle('');
      setContent('');
      setTags('');
      await fetchArticles();
      setSelectedArticle(res.data.article);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao publicar artigo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Base de Conhecimento de TI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Artigos, tutorias rápidos e procedimentos frequentes para ajudar na solução de dúvidas comuns.
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-sky-600 text-white font-semibold text-sm rounded-xl hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Artigo
          </button>
        )}
      </div>

      {/* Search & Category Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar artigos por palavra-chave, senha, impressora, wifi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white font-medium text-sm rounded-xl hover:bg-slate-900 transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center space-x-2 overflow-x-auto pt-2 pb-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === ''
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Todas as Categorias
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Article Titles Column + Content Reading Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-2 h-fit max-h-[700px] overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            Artigos Encontrados ({articles.length})
          </h3>

          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
              <p className="text-xs">Carregando artigos...</p>
            </div>
          ) : articles.length === 0 ? (
            <p className="p-4 text-xs text-slate-400 text-center italic">Nenhum artigo encontrado.</p>
          ) : (
            articles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  selectedArticle?.id === art.id
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-100'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100/80 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    {art.category?.name || 'Geral'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <h4 className="text-xs font-bold line-clamp-2">{art.title}</h4>
              </div>
            ))
          )}
        </div>

        {/* Selected Article Reading View */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4 min-h-[400px]">
          {selectedArticle ? (
            <div className="space-y-4">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-full">
                  {selectedArticle.category?.name || 'Informática Geral'}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-1">{selectedArticle.title}</h2>
                <div className="flex items-center space-x-4 text-xs text-slate-400 dark:text-slate-500">
                  <span className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" />
                    {selectedArticle.author?.fullName || 'TI Admin'}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Publicado em {new Date(selectedArticle.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line space-y-2 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedArticle.content}
              </div>

              {selectedArticle.tags && (
                <div className="pt-2 flex items-center space-x-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {selectedArticle.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400 text-center">
              <HelpCircle className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-sm">Selecione um artigo na lista para visualizar o tutorial.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Article Modal (Admin) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                Publicar Artigo na Base de Conhecimento
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

            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Título do Artigo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Como configurar e-mail corporativo no celular"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  <option value="">Geral / Sem Categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Conteúdo do Tutorial / Passo a Passo *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Instruções claras e numeradas..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Tags de Busca (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: email, celular, outlook, celular"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
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
                  Publicar Artigo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
