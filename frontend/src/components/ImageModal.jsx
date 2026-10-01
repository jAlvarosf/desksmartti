import React from 'react';
import { X, Download, ZoomIn, FileText } from 'lucide-react';

export default function ImageModal({ file, onClose }) {
  if (!file) return null;

  const isImage = file.mimetype?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.originalname || file.filename);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3 truncate">
            <ZoomIn className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
              {file.originalname || file.filename}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={file.url}
              download={file.originalname || file.filename}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950/80 min-h-[300px]">
          {isImage ? (
            <img
              src={file.url}
              alt={file.originalname || 'Visualização do anexo'}
              className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-md"
            />
          ) : (
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md">
              <FileText className="w-16 h-16 text-sky-600 dark:text-sky-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">Pré-visualização não disponível</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Este tipo de arquivo não pode ser exibido diretamente na tela. Clique no botão abaixo para baixá-lo.
              </p>
              <a
                href={file.url}
                download={file.originalname || file.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Arquivo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
