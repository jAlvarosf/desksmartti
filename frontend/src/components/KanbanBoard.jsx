import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Building,
  Paperclip,
  ChevronRight
} from 'lucide-react';

const KANBAN_COLUMNS = [
  { key: 'OPEN', title: 'Criados / Abertos', icon: Clock, color: 'sky' },
  { key: 'IN_PROGRESS', title: 'Em Atendimento', icon: RefreshCw, color: 'amber' },
  { key: 'WAITING_USER', title: 'Aguardando Retorno', icon: AlertTriangle, color: 'purple' },
  { key: 'RESOLVED', title: 'Resolvidos', icon: CheckCircle2, color: 'emerald' },
  { key: 'CLOSED', title: 'Finalizados', icon: XCircle, color: 'slate' }
];

export default function KanbanBoard({ tickets, onStatusChange, isAdmin, onPreviewFile }) {
  const handleDragStart = (e, ticketId) => {
    if (!isAdmin) return;
    e.dataTransfer.setData('text/plain', ticketId);
  };

  const handleDragOver = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    if (!isAdmin) return;
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain');
    if (ticketId) {
      onStatusChange(ticketId, newStatus);
    }
  };

  const getPriorityBadge = (priorityKey) => {
    switch (priorityKey) {
      case 'LOW':
        return <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">Baixa</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Média</span>;
      case 'HIGH':
        return <span className="text-[10px] font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">Alta</span>;
      case 'URGENT':
        return <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded animate-pulse">Urgente</span>;
      default:
        return priorityKey;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => {
        const columnTickets = tickets.filter((t) => t.status === col.key);
        const Icon = col.icon;

        return (
          <div
            key={col.key}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.key)}
            className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-col min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 text-${col.color}-600 dark:text-${col.color}-400`} />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {col.title}
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                {columnTickets.length}
              </span>
            </div>

            {/* Column Tickets Container */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnTickets.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl">
                  Nenhum chamado nesta etapa
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    draggable={isAdmin}
                    onDragStart={(e) => handleDragStart(e, ticket.id)}
                    className={`bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:shadow-md transition-all duration-150 space-y-2.5 ${
                      isAdmin ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-900">
                        #{ticket.code}
                      </span>
                      {getPriorityBadge(ticket.priority)}
                    </div>

                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="block font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 line-clamp-2"
                    >
                      {ticket.title}
                    </Link>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {ticket.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center truncate max-w-[120px]">
                        <User className="w-3 h-3 mr-1 shrink-0" />
                        <span className="truncate">{ticket.user?.fullName}</span>
                      </span>

                      <div className="flex items-center space-x-1 shrink-0">
                        {ticket.attachments && ticket.attachments.length > 0 && (
                          <button
                            onClick={() => onPreviewFile && onPreviewFile(ticket.attachments[0])}
                            className="p-1 hover:text-sky-600 dark:hover:text-sky-400"
                            title="Ver Anexo"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <Link to={`/tickets/${ticket.id}`} className="p-1 hover:text-sky-600 dark:hover:text-sky-400">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Quick Move Selector for Admin or Touch Devices */}
                    {isAdmin && (
                      <div className="pt-1">
                        <select
                          value={ticket.status}
                          onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                          className="w-full text-[10px] p-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
                        >
                          <option value="OPEN">Mover p/ Criados</option>
                          <option value="IN_PROGRESS">Mover p/ Atendimento</option>
                          <option value="WAITING_USER">Mover p/ Aguardando</option>
                          <option value="RESOLVED">Mover p/ Resolvidos</option>
                          <option value="CLOSED">Mover p/ Finalizados</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
