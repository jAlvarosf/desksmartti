import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  Mail,
  Store,
  RefreshCw,
  UserPlus,
  Edit3,
  UserCheck,
  UserX,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { DEFAULT_DEPARTMENTS } from '../constants/departments';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State for Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState(DEFAULT_DEPARTMENTS[0]);
  const [store, setStore] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [role, setRole] = useState('USER');
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUsersAndCompanies = async () => {
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/companies/public/companies').catch(() => ({ data: { companies: [] } }))
      ]);
      setUsers(uRes.data.users);
      setCompanies(cRes.data.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndCompanies();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setDepartment(DEFAULT_DEPARTMENTS[0]);
    const defaultComp = companies.length > 0 ? companies[0] : null;
    setCompanyId(defaultComp ? defaultComp.id : '');
    setStore(defaultComp ? defaultComp.name : 'Matriz - Central');
    setRole('USER');
    setActive(true);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFullName(u.fullName);
    setEmail(u.email);
    setPassword('');
    setPhone(u.phone);
    setDepartment(u.department || DEFAULT_DEPARTMENTS[0]);
    setCompanyId(u.companyId || (companies.length > 0 ? companies[0].id : ''));
    setStore(u.company?.name || u.store || '');
    setRole(u.role);
    setActive(u.active);
    setError('');
    setShowModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const selectedComp = companies.find(c => c.id === companyId);
      const targetStore = selectedComp ? selectedComp.name : store;

      if (editingUser) {
        // Edit user
        await api.patch(`/admin/users/${editingUser.id}`, {
          fullName,
          email,
          phone,
          department,
          store: targetStore,
          companyId: companyId || null,
          role,
          active,
          password: password.trim() ? password : undefined
        });
      } else {
        // Create user
        if (!password) {
          setError('A senha é obrigatória para criar um novo usuário.');
          setSaving(false);
          return;
        }
        await api.post('/admin/users', {
          fullName,
          email,
          password,
          phone,
          department,
          store: targetStore,
          companyId: companyId || null,
          role,
          active
        });
      }

      setShowModal(false);
      await fetchUsersAndCompanies();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar informações do usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (userToToggle) => {
    const action = userToToggle.active ? 'desativar' : 'ativar';
    if (!window.confirm(`Deseja realmente ${action} a conta de ${userToToggle.fullName}?`)) {
      return;
    }

    try {
      await api.patch(`/admin/users/${userToToggle.id}`, {
        active: !userToToggle.active
      });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao alterar status da conta.');
    }
  };

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.store.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Crie, edite, ative/desative e gerencie permissões dos usuários do sistema.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center justify-center px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-sky-600 text-white font-semibold text-sm rounded-xl hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar usuário por nome, e-mail, departamento ou loja..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
            <p className="text-sm">Carregando lista de usuários...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Usuário / E-mail</th>
                  <th className="py-3.5 px-4">Setor & Loja</th>
                  <th className="py-3.5 px-4">Telefone</th>
                  <th className="py-3.5 px-4">Status & Nível</th>
                  <th className="py-3.5 px-4 text-center">Chamados</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{u.fullName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {u.email}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{u.department}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Store className="w-3 h-3 text-slate-400" />
                        {u.store}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                      {u.phone}
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {u.active ? 'Ativo' : 'Inativo'}
                        </span>

                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {u.role === 'ADMIN' ? 'TI Admin' : 'Usuário'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {u._count?.tickets || 0}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Editar Usuário"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          u.active
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400'
                        }`}
                        title={u.active ? 'Desativar Usuário' : 'Ativar Usuário'}
                      >
                        {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create / Edit User */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
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

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {editingUser ? 'Senha (opcional)' : 'Senha *'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingUser ? 'Manter senha atual' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Telefone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Setor / Departamento</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  >
                    {DEFAULT_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Empresa / Unidade</label>
                  {companies.length > 0 ? (
                    <select
                      value={companyId}
                      onChange={(e) => {
                        setCompanyId(e.target.value);
                        const c = companies.find(comp => comp.id === e.target.value);
                        if (c) setStore(c.name);
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    >
                      {companies.map((comp) => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Nível de Acesso</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  >
                    <option value="USER">Usuário Solicitante</option>
                    <option value="ADMIN">Administrador TI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Status da Conta</label>
                  <select
                    value={active ? 'true' : 'false'}
                    onChange={(e) => setActive(e.target.value === 'true')}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo (Bloqueado)</option>
                  </select>
                </div>
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
                  disabled={saving}
                  className="px-5 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
