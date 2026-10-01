import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Paperclip,
  ArrowLeft,
  AlertCircle,
  User,
  Send,
  Building,
  Store,
  Phone,
  Mail,
  Shield
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TicketCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states with auto-filled profile info
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);

  // Requester information (Editable if ADMIN)
  const [requesterFullName, setRequesterFullName] = useState(user?.fullName || '');
  const [requesterEmail, setRequesterEmail] = useState(user?.email || '');
  const [requesterPhone, setRequesterPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [store, setStore] = useState(user?.store || '');

  useEffect(() => {
    api.get('/admin/categories')
      .then((res) => {
        setCategories(res.data.categories);
        if (res.data.categories.length > 0) {
          setCategoryId(res.data.categories[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !categoryId) {
      setError('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('categoryId', categoryId);
      formData.append('priority', priority);
      formData.append('description', description);
      formData.append('department', department);
      formData.append('store', store);

      if (user?.role === 'ADMIN') {
        formData.append('requesterFullName', requesterFullName);
        formData.append('requesterEmail', requesterEmail);
        formData.append('requesterPhone', requesterPhone);
      }

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate(`/tickets/${res.data.ticket.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar o chamado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Meus Chamados
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            Abertura de Novo Chamado
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Preencha os detalhes da solicitação. {user?.role === 'ADMIN' ? 'Como Administrador, você pode alterar os dados do solicitante.' : 'Seus dados foram preenchidos automaticamente.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border-l-4 border-rose-500 rounded-r-lg flex items-center text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* User Information Card */}
          <div className="p-4 bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Informações do Solicitante {user?.role === 'ADMIN' && <span className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded ml-2">Editável p/ Admin</span>}
            </h3>

            {user?.role === 'ADMIN' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={requesterFullName}
                    onChange={(e) => setRequesterFullName(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={requesterEmail}
                    onChange={(e) => setRequesterEmail(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={requesterPhone}
                    onChange={(e) => setRequesterPhone(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Setor</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Loja / Unidade</label>
                  <input
                    type="text"
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block font-medium">Nome Completo:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{user?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">E-mail:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Telefone / WhatsApp:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{user?.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Setor / Departamento:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{user?.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Loja / Unidade:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{user?.store}</span>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Information Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Assunto / Título do Problema *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Impressora da recepção não está imprimindo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Categoria do Chamado *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Prioridade *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="LOW">Baixa - Duvida ou melhoria simples</option>
                  <option value="MEDIUM">Média - Problema padrão sem paralisação</option>
                  <option value="HIGH">Alta - Problema impactando trabalho</option>
                  <option value="URGENT">Urgente - Loja/Setor totalmente parado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Descrição Detalhada do Ocorrido *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Descreva detalhadamente o que aconteceu, mensagens de erro exibidas e quando o problema começou..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
              />
            </div>

            {/* File Uploads */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Anexar Arquivos ou Fotos (Opcional)
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <Paperclip className="w-8 h-8 text-sky-600 dark:text-sky-400 mb-1" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Clique para selecionar arquivos</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Capturas de tela, documentos ou imagens (máx. 10MB)</span>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Arquivos Selecionados:</p>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    {files.map((file, idx) => (
                      <li key={idx} className="flex items-center text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-3 py-1.5 rounded-lg border border-sky-100 dark:border-sky-900">
                        📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all flex items-center cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Registrar Chamado
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
