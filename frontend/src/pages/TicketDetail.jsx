import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Building,
  Paperclip,
  Send,
  MessageSquare,
  History,
  Shield,
  RefreshCw,
  AlertCircle,
  FileText,
  Download,
  Edit3,
  Save,
  X,
  Eye,
  Star
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ImageModal from '../components/ImageModal';
import TicketRatingModal from '../components/TicketRatingModal';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment & Attachment states
  const [newComment, setNewComment] = useState('');
  const [commentFiles, setCommentFiles] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Preview file modal state
  const [previewFile, setPreviewFile] = useState(null);

  // Admin status/priority change state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Admin edit ticket modal/inline mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editPriority, setEditPriority] = useState('MEDIUM');
  const [editDepartment, setEditDepartment] = useState('');
  const [editStore, setEditStore] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data.ticket);
      setEditTitle(res.data.ticket.title);
      setEditDescription(res.data.ticket.description);
      setEditCategoryId(res.data.ticket.categoryId);
      setEditPriority(res.data.ticket.priority);
      setEditDepartment(res.data.ticket.department);
      setEditStore(res.data.ticket.store);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar os detalhes do chamado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/admin/categories').then(res => setCategories(res.data.categories)).catch(() => {});
    fetchTicketDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/tickets/${id}/status`, { status: newStatus });
      await fetchTicketDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao alterar status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/tickets/${id}/status`, { priority: newPriority });
      await fetchTicketDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao alterar prioridade.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await api.put(`/tickets/${id}`, {
        title: editTitle,
        description: editDescription,
        categoryId: editCategoryId,
        priority: editPriority,
        department: editDepartment,
        store: editStore
      });
      setIsEditing(false);
      await fetchTicketDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar alterações no chamado.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const formData = new FormData();
      formData.append('content', newComment);
      commentFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      await api.post(`/tickets/${id}/comments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setNewComment('');
      setCommentFiles([]);
      await fetchTicketDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao enviar resposta.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusBadge = (statusKey) => {
    switch (statusKey) {
      case 'OPEN':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"><Clock className="w-3.5 h-3.5 mr-1.5" /> Aberto</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Em Atendimento</span>;
      case 'WAITING_USER':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"><AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Aguardando Usuário</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Resolvido</span>;
      case 'CLOSED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"><XCircle className="w-3.5 h-3.5 mr-1.5" /> Fechado</span>;
      default:
        return statusKey;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-600 mb-2" />
        <p className="text-sm">Carregando detalhes do chamado...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Não foi possível carregar o chamado</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error || 'Chamado não encontrado ou sem permissão.'}</p>
        <Link to="/" className="inline-flex items-center mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Image Preview Modal */}
      {previewFile && (
        <ImageModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Chamados
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 font-semibold text-xs rounded-xl transition-colors border border-sky-200 dark:border-sky-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Cancelar Edição' : 'Editar Chamado (Admin)'}
            </button>
          )}

          {ticket.status !== 'CLOSED' ? (
            <button
              onClick={() => handleStatusChange('CLOSED')}
              disabled={updatingStatus}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              Concluir / Encerrar Chamado
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('OPEN')}
              disabled={updatingStatus}
              className="px-3.5 py-1.5 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 font-semibold text-xs rounded-xl transition-colors border border-sky-200 dark:border-sky-800 cursor-pointer"
            >
              Reabrir Chamado
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Ticket Card (Edit or View mode) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
            {isEditing && user?.role === 'ADMIN' ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 border-2 border-dashed border-sky-300 dark:border-sky-800 p-4 rounded-xl bg-sky-50/30 dark:bg-sky-950/20">
                <div className="flex items-center justify-between pb-2 border-b border-sky-200 dark:border-sky-900">
                  <span className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4" /> Editando Informações do Chamado
                  </span>
                  <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Título / Assunto</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Categoria</label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Prioridade</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    >
                      <option value="LOW">Baixa</option>
                      <option value="MEDIUM">Média</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Descrição</label>
                  <textarea
                    rows={4}
                    required
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white resize-y"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-5 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                      <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded border border-sky-200 dark:border-sky-900">
                        #{ticket.code}
                      </span>
                      {getStatusBadge(ticket.status)}
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                        {ticket.category?.name}
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{ticket.title}</h1>
                  </div>
                </div>

                <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {ticket.description}
                </div>
              </>
            )}

            {/* Attachments Section */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  Anexos do Chamado ({ticket.attachments.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ticket.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{att.originalname}</span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setPreviewFile(att)}
                          className="p-1 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950 rounded cursor-pointer"
                          title="Visualizar anexo em modal"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={att.url}
                          download={att.originalname}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded"
                          title="Baixar arquivo"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rating Section for Ticket Owner when Resolved/Closed */}
          {(['RESOLVED', 'CLOSED'].includes(ticket.status)) && (ticket.userId === user?.id || user?.role === 'ADMIN') && (
            <TicketRatingModal
              ticketId={ticket.id}
              existingRating={ticket.rating}
              existingFeedback={ticket.feedback}
              onRated={fetchTicketDetails}
            />
          )}

          {/* Timeline & Responses Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Histórico de Respostas e Interações
            </h3>

            {/* Comments List */}
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              {(ticket.comments || []).length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">Nenhuma resposta registrada até o momento.</p>
              ) : (
                (ticket.comments || []).map((comment) => {
                  const isAdminComment = comment.user?.role === 'ADMIN';
                  const initial = comment.user?.fullName ? comment.user.fullName.charAt(0).toUpperCase() : 'U';
                  return (
                    <div key={comment.id || Math.random()} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isAdminComment ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}>
                            {initial}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{comment.user?.fullName || 'Usuário'}</span>
                            {isAdminComment && (
                              <span className="ml-2 text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                                Equipe de TI
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 pl-10 whitespace-pre-line leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Response Form */}
            <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Adicionar Resposta / Acompanhamento
              </label>
              <textarea
                rows={3}
                required
                placeholder="Escreva sua mensagem ou atualização sobre este chamado..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setCommentFiles(Array.from(e.target.files))}
                  className="text-xs text-slate-500 dark:text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 cursor-pointer"
                />

                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-5 py-2 bg-sky-600 text-white font-semibold text-sm rounded-xl hover:bg-sky-700 shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  {submittingComment ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1.5" />
                      Enviar Resposta
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-6">
          {/* Admin Status Control Panel */}
          {user?.role === 'ADMIN' && (
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Painel do Administrador
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                    Alterar Status do Chamado
                  </label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="OPEN">Aberto</option>
                    <option value="IN_PROGRESS">Em Atendimento</option>
                    <option value="WAITING_USER">Aguardando Usuário</option>
                    <option value="RESOLVED">Resolvido</option>
                    <option value="CLOSED">Fechado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                    Alterar Nível de Prioridade
                  </label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    disabled={updatingStatus}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Information Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
              Informações Gerais
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Solicitante:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center mt-0.5">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {ticket.user?.fullName}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Setor / Departamento:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center mt-0.5">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {ticket.department}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Empresa / Unidade:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center mt-0.5">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {ticket.company?.name || ticket.store}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Telefone de Contato:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.user?.phone}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">E-mail:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.user?.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Data de Abertura:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(ticket.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log / History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <History className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Histórico de Ações
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {ticket.history?.map((hist) => (
                <div key={hist.id} className="text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>{hist.action === 'CREATED' ? 'Chamado Criado' : hist.action === 'RATED' ? 'Avaliado' : hist.action === 'EDITED_BY_ADMIN' ? 'Editado por Admin' : 'Status Alterado'}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(hist.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {hist.newValue ? `${hist.newValue}` : ''} por <strong>{hist.performedBy}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
