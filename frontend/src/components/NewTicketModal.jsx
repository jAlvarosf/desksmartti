import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Paperclip,
  X,
  AlertCircle,
  User,
  Send,
  Building,
  Store,
  Phone,
  Mail,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_DEPARTMENTS } from '../constants/departments';

export default function NewTicketModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states with auto-filled profile info
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);

  // Requester information (Editable ONLY if ADMIN)
  const [requesterFullName, setRequesterFullName] = useState(user?.fullName || '');
  const [requesterEmail, setRequesterEmail] = useState(user?.email || '');
  const [requesterPhone, setRequesterPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || DEFAULT_DEPARTMENTS[0]);
  const [store, setStore] = useState(user?.store || '');

  useEffect(() => {
    if (isOpen) {
      api.get('/admin/categories')
        .then((res) => {
          setCategories(res.data.categories);
          if (res.data.categories.length > 0) {
            setCategoryId(res.data.categories[0].id);
          }
        })
        .catch((err) => console.error(err));

      api.get('/companies/public/companies')
        .then((res) => setCompanies(res.data.companies))
        .catch(() => {});

      // Reset form defaults
      setTitle('');
      setDescription('');
      setFiles([]);
      setError('');
      setPriority('MEDIUM');
      setRequesterFullName(user?.fullName || '');
      setRequesterEmail(user?.email || '');
      setRequesterPhone(user?.phone || '');
      setDepartment(user?.department || DEFAULT_DEPARTMENTS[0]);
      setStore(user?.store || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

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

      onClose();
      if (onCreated) {
        onCreated(res.data.ticket);
      } else {
        navigate(`/tickets/${res.data.ticket.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar o chamado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Abertura de Novo Chamado
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              O chamado utilizará seus dados cadastrados automaticamente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border-l-4 border-rose-500 rounded-r-lg flex items-center text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 mr-2.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Requester Info - ONLY VISIBLE TO ADMIN */}
          {user?.role === 'ADMIN' && (
            <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Informações do Solicitante <span className="text-[10px] bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded ml-2">Modo Admin</span>
              </h3>

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
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Setor / Departamento</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  >
                    {DEFAULT_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Empresa / Unidade</label>
                  {companies.length > 0 ? (
                    <select
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    >
                      {companies.map((comp) => (
                        <option key={comp.id} value={comp.name}>{comp.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Ticket Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Assunto / Título do Problema *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Computador não liga ou impressora desconectada"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Categoria *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="LOW">Baixa - Dúvida ou melhoria simples</option>
                  <option value="MEDIUM">Média - Problema padrão sem paralisação</option>
                  <option value="HIGH">Alta - Impactando o trabalho</option>
                  <option value="URGENT">Urgente - Setor / Loja parado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Descrição do Chamado *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Descreva detalhadamente o problema ou solicitação..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Anexar Arquivo ou Foto (Opcional)
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="modal-file-upload"
                />
                <label htmlFor="modal-file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <Paperclip className="w-6 h-6 text-sky-600 dark:text-sky-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Clique para anexar imagens ou documentos</span>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Anexos Selecionados:</p>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    {files.map((f, idx) => (
                      <li key={idx} className="flex items-center text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-100 dark:border-sky-900">
                        📎 {f.name} ({(f.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs hover:bg-sky-700 shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all flex items-center cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Abrir Chamado
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
