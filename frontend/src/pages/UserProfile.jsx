import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Store, Shield, CheckCircle2, AlertCircle, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DEFAULT_DEPARTMENTS } from '../constants/departments';

export default function UserProfile() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || DEFAULT_DEPARTMENTS[0]);
  const [store, setStore] = useState(user?.store || '');
  const [companies, setCompanies] = useState([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/companies/public/companies')
      .then(res => setCompanies(res.data.companies))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await api.put('/auth/me', {
        fullName,
        phone,
        department,
        store
      });

      updateUser(res.data.user);
      setMessage('Perfil e dados corporativos atualizados com sucesso!');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar dados.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-7 h-7 text-sky-600" />
          Meu Perfil e Dados Cadastrais
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Suas informações são preenchidas automaticamente ao abrir novos chamados de TI.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {message && (
          <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-center text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl flex items-center text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              E-mail de Acesso (Não alterável)
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Telefone / WhatsApp *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Setor / Departamento *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                {DEFAULT_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Empresa / Loja *
              </label>
              {companies.length > 0 ? (
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                >
                  {companies.map((comp) => (
                    <option key={comp.id} value={comp.name}>{comp.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Nível: <strong className="text-slate-700">{user?.role === 'ADMIN' ? 'Administrador TI' : 'Usuário Comun'}</strong>
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-sky-600 text-white font-semibold text-sm rounded-xl hover:bg-sky-700 shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all flex items-center cursor-pointer"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
