import React, { useState } from 'react';
import { Star, Send, RefreshCw, CheckCircle2, MessageSquare } from 'lucide-react';
import api from '../services/api';

export default function TicketRatingModal({ ticketId, existingRating, existingFeedback, onRated }) {
  const [rating, setRating] = useState(existingRating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState(existingFeedback || '');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/tickets/${ticketId}/rating`, {
        rating,
        feedback
      });
      setSuccessMsg('Obrigado pela sua avaliação! Sua opinião ajuda a melhorar o atendimento de TI.');
      if (onRated) onRated();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao registrar avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/80 rounded-2xl p-5 space-y-3">
      <h3 className="text-sm font-bold text-sky-900 dark:text-sky-200 flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        Avaliação do Atendimento do Chamado
      </h3>

      {successMsg ? (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Como você avalia a solução e a presteza no atendimento fornecido pela equipe de TI?
          </p>

          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
              {rating} de 5 estrelas
            </span>
          </div>

          <div>
            <textarea
              rows={2}
              placeholder="Deixe um comentário ou sugestão sobre o atendimento (opcional)..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all flex items-center cursor-pointer"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Enviar Avaliação
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
