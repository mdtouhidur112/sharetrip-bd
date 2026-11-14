import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCog,
  Shield,
  Users,
  Search,
  UserPlus,
  UserCheck,
  UserMinus,
  Crown,
  Mail,
  Phone,
  RefreshCw
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { supabase, rowToUser } from '../../services/supabaseClient';

export const AdminControl = ({ language = 'bn', isLight = false, isRoot = false, onShowToast }) => {
  const [users, setUsers] = useState(() => StorageService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'normal_admin' | 'user'
  const [manualEmail, setManualEmail] = useState('');
  const [busyKey, setBusyKey] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const syncFromStorage = () => {
    setUsers(StorageService.getUsers());
  };

  const refreshFromSupabase = async () => {
    if (!supabase) {
      syncFromStorage();
      return;
    }
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const mapped = data
          .map(rowToUser)
          .filter(
            (u) =>
              u?.email &&
              !u.email.includes('@dhakavoyages.com') &&
              !u.email.includes('@londonlux.co.uk') &&
              !u.email.includes('@ctgsteel.com') &&
              !u.email.includes('@zurichprivate.ch') &&
              !u.email.includes('@nycapitol.com')
          );
        localStorage.setItem('aetheria_registered_users_db', JSON.stringify(mapped));
        window.dispatchEvent(new CustomEvent('app:users-updated'));
        setUsers(mapped);
      }
    } catch (err) {
      console.warn('Error refreshing users:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    syncFromStorage();
    window.addEventListener('app:users-updated', syncFromStorage);
    return () => window.removeEventListener('app:users-updated', syncFromStorage);
  }, []);

  const handleSetRole = async (emailOrId, targetRole, displayName) => {
    if (!isRoot) {
      onShowToast?.(
        language === 'en'
          ? 'Only Root Admin can change user roles.'
          : 'শুধুমাত্র রুট অ্যাডমিন ইউজার রোল পরিবর্তন করতে পারবেন।'
      );
      return;
    }

    setBusyKey(emailOrId);
    try {
      const updated = await StorageService.setUserRole(emailOrId, targetRole);
      setUsers(updated);
      const label = displayName || emailOrId;
      onShowToast?.(
        targetRole === 'normal_admin'
          ? language === 'en'
            ? `${label} is now a Normal Admin!`
            : `${label}-কে সাধারণ অ্যাডমিন করা হয়েছে!`
          : language === 'en'
            ? `${label} has been changed back to User.`
            : `${label}-কে আবার সাধারণ ইউজার করা হয়েছে।`
      );
    } finally {
      setBusyKey('');
    }
  };

  const handlePromoteByEmail = async (e) => {
    e.preventDefault();
    const cleanEmail = manualEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      onShowToast?.(
        language === 'en' ? 'Please enter a valid email address.' : 'সঠিক ইমেইল ঠিকানা দিন।'
      );
      return;
    }
    await handleSetRole(cleanEmail, 'normal_admin', cleanEmail);
    setManualEmail('');
  };

  const stats = useMemo(() => {
    const normalAdmins = users.filter((u) => u.role === 'normal_admin').length;
    const regularUsers = users.length - normalAdmins;
    return { total: users.length, normalAdmins, regularUsers };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole =
        roleFilter === 'all'
          ? true
          : roleFilter === 'normal_admin'
            ? u.role === 'normal_admin'
            : u.role !== 'normal_admin';
      if (!matchesRole) return false;
      if (!q) return true;
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery, roleFilter]);

  const cardCls = isLight
    ? 'bg-white border border-slate-200 shadow-xs'
    : 'bg-slate-900/80 border border-slate-800';

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-hidden transition-all ${
    isLight
      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
      : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
  }`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Refresh */}
      <div className={`rounded-3xl p-5 sm:p-6 ${cardCls}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#69EBDA]/15 border border-[#69EBDA]/35 flex items-center justify-center text-[#69EBDA] shrink-0">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>{language === 'en' ? 'Admin Control' : 'অ্যাডমিন কন্ট্রোল'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-500 text-[10px] font-black border border-amber-400/30 inline-flex items-center gap-1">
                  <Crown className="w-3 h-3" /> ROOT CONTROL
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'en'
                  ? 'Promote any registered user to Normal Admin or demote back to regular User in real time.'
                  : 'যেকোনো ইউজারকে সাধারণ অ্যাডমিন বানান অথবা চাইলে আবার সাধারণ ইউজারে ফিরিয়ে নিন (রিয়েলটাইম)।'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshFromSupabase}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-[#69EBDA]/15 hover:bg-[#69EBDA]/25 border border-[#69EBDA]/40 text-[#69EBDA] text-xs font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{language === 'en' ? 'Refresh Users' : 'রিফ্রেশ করুন'}</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                {language === 'en' ? 'Total Registered' : 'মোট ইউজার'}
              </span>
              <Users className="w-4 h-4 text-[#69EBDA]" />
            </div>
            <p className={`text-2xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{stats.total}</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-teal-50/70 border-teal-200' : 'bg-teal-950/20 border-teal-500/30'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-500">
                {language === 'en' ? 'Normal Admins' : 'সাধারণ অ্যাডমিন'}
              </span>
              <Shield className="w-4 h-4 text-teal-400" />
            </div>
            <p className={`text-2xl font-black mt-1 ${isLight ? 'text-teal-700' : 'text-[#69EBDA]'}`}>{stats.normalAdmins}</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                {language === 'en' ? 'Regular Users' : 'সাধারণ ইউজার'}
              </span>
              <UserCheck className="w-4 h-4 text-slate-400" />
            </div>
            <p className={`text-2xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{stats.regularUsers}</p>
          </div>
        </div>
      </div>

      {/* Quick Promote by Email (Root Only) */}
      {isRoot && (
        <form onSubmit={handlePromoteByEmail} className={`rounded-3xl p-5 sm:p-6 ${cardCls}`}>
          <h3 className={`text-sm font-extrabold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {language === 'en' ? 'Direct Promote by Email' : 'ইমেইল দিয়ে সরাসরি সাধারণ অ্যাডমিন বানান'}
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            {language === 'en'
              ? 'Enter a user email to grant Normal Admin access immediately.'
              : 'যেকোনো ইউজারের ইমেইল দিয়ে সরাসরি সাধারণ অ্যাডমিন পারমিশন দিন।'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              required
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              placeholder="user@gmail.com"
              className={inputCls}
            />
            <button
              type="submit"
              disabled={Boolean(busyKey)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 text-xs font-black inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'en' ? 'Make Normal Admin' : 'সাধারণ অ্যাডমিন বানান'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Search, Filter & Users List */}
      <div className={`rounded-3xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search by name, email or phone...' : 'নাম, ইমেইল বা ফোন দিয়ে খুঁজুন...'}
              className={`${inputCls} pl-9`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: language === 'en' ? `All (${stats.total})` : `সব (${stats.total})` },
              { id: 'normal_admin', label: language === 'en' ? `Normal Admins (${stats.normalAdmins})` : `সাধারণ অ্যাডমিন (${stats.normalAdmins})` },
              { id: 'user', label: language === 'en' ? `Users (${stats.regularUsers})` : `ইউজার (${stats.regularUsers})` }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setRoleFilter(f.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  roleFilter === f.id
                    ? 'bg-[#69EBDA] text-slate-950 shadow-sm'
                    : isLight
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {!isRoot && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            {language === 'en'
              ? 'View-only mode: Only Root Admin can promote or demote admins.'
              : 'শুধুমাত্র দেখার অনুমতি: কেবল রুট অ্যাডমিন রোল পরিবর্তন করতে পারবেন।'}
          </div>
        )}

        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {language === 'en' ? 'No users found.' : 'কোনো ইউজার পাওয়া যায়নি।'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredUsers.map((u) => {
              const isNormalAdmin = u.role === 'normal_admin';
              const isBusy = busyKey === u.email || busyKey === u.id;
              return (
                <div
                  key={u.id || u.email}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isNormalAdmin
                      ? isLight
                        ? 'bg-teal-50/50 border-teal-300'
                        : 'bg-teal-950/20 border-teal-500/40'
                      : isLight
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-slate-950/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        u.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={u.name || u.email}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#69EBDA]/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm font-extrabold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {u.name || 'Unnamed User'}
                        </p>
                        {isNormalAdmin ? (
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-400/40 text-teal-400 text-[10px] font-black inline-flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" />
                            <span>{language === 'en' ? 'Normal Admin' : 'সাধারণ অ্যাডমিন'}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-500/15 border border-slate-500/30 text-slate-400 text-[10px] font-bold">
                            {language === 'en' ? 'User' : 'ইউজার'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </p>
                      {u.phone && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{u.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {isRoot && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        handleSetRole(
                          u.email || u.id,
                          isNormalAdmin ? 'user' : 'normal_admin',
                          u.name || u.email
                        )
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-black inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-all disabled:opacity-60 ${
                        isNormalAdmin
                          ? 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400'
                          : 'bg-[#69EBDA] hover:bg-[#69EBDA]/90 text-slate-950 shadow-sm'
                      }`}
                    >
                      {isNormalAdmin ? (
                        <>
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Make User' : 'ইউজার বানান'}</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Make Admin' : 'সাধারণ অ্যাডমিন বানান'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
