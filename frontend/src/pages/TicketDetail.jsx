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
  Download
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment & Attachment states
  const [newComment, setNewComment] = useState('');
  const [commentFiles, setCommentFiles] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Admin status/priority change state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data.ticket);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar os detalhes do chamado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800"><Clock className="w-3.5 h-3.5 mr-1.5" /> Aberto</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Em Atendimento</span>;
      case 'WAITING_USER':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Aguardando Usuário</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Resolvido</span>;
      case 'CLOSED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"><XCircle className="w-3.5 h-3.5 mr-1.5" /> Fechado</span>;
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
      <div className="p-8 max-w-xl mx-auto text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Não foi possível carregar o chamado</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'Chamado não encontrado ou sem permissão.'}</p>
        <Link to="/" className="inline-flex items-center mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Chamados
        </Link>

        {/* Quick action for ticket owner to close/reopen */}
        <div className="flex items-center gap-2">
          {ticket.status !== 'CLOSED' ? (
            <button
              onClick={() => handleStatusChange('CLOSED')}
              disabled={updatingStatus}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors border border-slate-200"
            >
              Concluir / Encerrar Chamado
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('OPEN')}
              disabled={updatingStatus}
              className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs rounded-xl transition-colors border border-sky-200"
            >
              Reabrir Chamado
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Ticket Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
                    #{ticket.code}
                  </span>
                  {getStatusBadge(ticket.status)}
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                    {ticket.category?.name}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{ticket.title}</h1>
              </div>
            </div>

            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {ticket.description}
            </div>

            {/* Attachments Section */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-sky-600" />
                  Anexos do Chamado ({ticket.attachments.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ticket.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-50 hover:bg-sky-50/60 border border-slate-200 rounded-xl flex items-center justify-between text-xs transition-colors group"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-medium text-slate-700 group-hover:text-sky-700 truncate">{att.originalname}</span>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline & Responses Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-600" />
              Histórico de Respostas e Interações
            </h3>

            {/* Comments List */}
            <div className="space-y-4 divide-y divide-slate-100">
              {ticket.comments.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-4">Nenhuma resposta registrada até o momento.</p>
              ) : (
                ticket.comments.map((comment) => {
                  const isAdminComment = comment.user?.role === 'ADMIN';
                  return (
                    <div key={comment.id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isAdminComment ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {comment.user?.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">{comment.user?.fullName}</span>
                            {isAdminComment && (
                              <span className="ml-2 text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                                Equipe de TI
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 pl-10 whitespace-pre-line leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Response Form */}
            <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Adicionar Resposta / Acompanhamento
              </label>
              <textarea
                rows={3}
                required
                placeholder="Escreva sua mensagem ou atualização sobre este chamado..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white resize-y"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setCommentFiles(Array.from(e.target.files))}
                  className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />

                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-5 py-2 bg-sky-600 text-white font-semibold text-sm rounded-xl hover:bg-sky-700 shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
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
            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                Painel do Administrador
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-indigo-950 mb-1">
                    Alterar Status do Chamado
                  </label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="OPEN">Aberto</option>
                    <option value="IN_PROGRESS">Em Atendimento</option>
                    <option value="WAITING_USER">Aguardando Usuário</option>
                    <option value="RESOLVED">Resolvido</option>
                    <option value="CLOSED">Fechado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-950 mb-1">
                    Alterar Nível de Prioridade
                  </label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    disabled={updatingStatus}
                    className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
              Informações Gerais
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Solicitante:</span>
                <span className="font-semibold text-slate-800 flex items-center mt-0.5">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {ticket.user?.fullName}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Setor / Departamento:</span>
                <span className="font-semibold text-slate-800 flex items-center mt-0.5">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {ticket.department}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Loja / Unidade:</span>
                <span className="font-semibold text-slate-800 flex items-center mt-0.5">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {ticket.store}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Telefone de Contato:</span>
                <span className="font-semibold text-slate-800">{ticket.user?.phone}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">E-mail:</span>
                <span className="font-semibold text-slate-800">{ticket.user?.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Data de Abertura:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(ticket.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log / History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <History className="w-3.5 h-3.5 text-sky-600" />
              Histórico de Ações
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {ticket.history?.map((hist) => (
                <div key={hist.id} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>{hist.action === 'CREATED' ? 'Chamado Criado' : 'Status Alterado'}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(hist.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    {hist.newValue ? `Modificado para: ${hist.newValue}` : ''} por <strong>{hist.performedBy}</strong>
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
