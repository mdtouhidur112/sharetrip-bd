/**
 * Admin Authentication Service
 * Strictly authenticates Root Admin (.env) and Normal Admins (assigned by Root Admin)
 */
import { StorageService } from './storageService';
import { supabase, adminProfileToRow, rowToAdminProfile } from './supabaseClient';

export const ADMIN_SESSION_KEY = 'aetheria_admin_session';
export const ROOT_ADMIN_PROFILE_KEY = 'aetheria_root_admin_profile';

/**
 * Retrieve admin credentials dynamically from environment variables
 */
const getEnvCredentials = () => {
  const envUsername = import.meta.env.admin_user_name || import.meta.env.VITE_ADMIN_USER_NAME;
  const envPassword = import.meta.env.admin_pass || import.meta.env.VITE_ADMIN_PASS;

  return {
    username: envUsername ? String(envUsername).trim() : '',
    password: envPassword ? String(envPassword).trim() : ''
  };
};

export const AdminAuthService = {
  /**
   * Check if admin is currently authenticated
   */
  isAuthenticated: () => {
    try {
      const session = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!session) return false;
      const parsed = JSON.parse(session);
      return Boolean(parsed && parsed.token && parsed.authenticated);
    } catch (e) {
      console.warn('Error reading admin session', e);
      return false;
    }
  },

  /**
   * Check if current session belongs to Root Admin (.env)
   */
  isRootAdmin: () => {
    const admin = AdminAuthService.getCurrentAdmin();
    const { username: envUsername } = getEnvCredentials();
    if (!admin || !admin.authenticated || !envUsername) return false;
    return (
      admin.role === 'root_admin' &&
      admin.isRoot === true &&
      String(admin.token || '').startsWith('root-adm-') &&
      String(admin.username || '').trim().toLowerCase() === envUsername.toLowerCase()
    );
  },

  /**
   * Check if current session belongs to a Normal Admin
   */
  isNormalAdmin: () => {
    const admin = AdminAuthService.getCurrentAdmin();
    return Boolean(admin && admin.authenticated && admin.role === 'normal_admin');
  },

  /**
   * Get currently authenticated admin details
   */
  getCurrentAdmin: () => {
    try {
      const session = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!session) return null;
      return JSON.parse(session);
    } catch (e) {
      return null;
    }
  },

  /**
   * Retrieve Root Admin profile settings (name, photo, phone, gmail, address)
   */
  getRootAdminProfile: () => {
    const { username } = getEnvCredentials();
    const defaultProfile = {
      name: username ? `${username} (Root Admin)` : 'রুট অ্যাডমিন (Root Admin)',
      email: `${username ? username.toLowerCase() : 'admin'}@travelagency.com`,
      phone: '+8801711234567',
      address: 'ঢাকা, বাংলাদেশ',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
    };

    try {
      const stored = localStorage.getItem(ROOT_ADMIN_PROFILE_KEY);
      if (stored) {
        return { ...defaultProfile, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading root admin profile', e);
    }
    return defaultProfile;
  },

  /**
   * Update and persist Root Admin profile settings
   */
  saveRootAdminProfile: async (profileData) => {
    try {
      const current = AdminAuthService.getRootAdminProfile();
      const updated = { ...current, ...profileData, updatedAt: new Date().toISOString() };

      // Persist to Supabase PostgreSQL Database with strict error handling
      if (supabase) {
        const { data, error } = await supabase
          .from('admin_profile')
          .upsert(adminProfileToRow(updated), { onConflict: 'id' })
          .select()
          .single();

        if (error) {
          console.error('Supabase admin profile upsert error:', error);
          throw new Error(error.message || 'Supabase admin profile save failed');
        }
      }

      localStorage.setItem(ROOT_ADMIN_PROFILE_KEY, JSON.stringify(updated));

      // Also update active session if currently logged in as Root
      const session = AdminAuthService.getCurrentAdmin();
      if (session && (session.role === 'root_admin' || session.isRoot)) {
        const updatedSession = {
          ...session,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          address: updated.address,
          avatar: updated.avatar
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(updatedSession));
      }

      window.dispatchEvent(new CustomEvent('app:root-admin-profile-updated', { detail: updated }));
      window.dispatchEvent(new CustomEvent('app:admin-session-changed'));

      return updated;
    } catch (e) {
      console.error('Error saving root admin profile', e);
      throw e;
    }
  },

  /**
   * Authenticate Root Admin using Username and Password strictly against .env values
   * @param {string} inputUsername 
   * @param {string} inputPassword 
   */
  login: async (inputUsername, inputPassword) => {
    // Artificial slight delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { username: validUsername, password: validPassword } = getEnvCredentials();

    if (!validUsername || !validPassword) {
      console.error('.env configuration missing: admin_user_name or admin_pass is not set.');
      return {
        success: false,
        message: 'অ্যাডমিন কনফিগারেশন ত্রুটি: .env ফাইলে ইউজারনেম ও পাসওয়ার্ড সেট করা নেই।'
      };
    }

    const cleanInputUser = (inputUsername || '').trim();
    const cleanInputPass = (inputPassword || '').trim();

    // Check exact or case-insensitive username match and exact password match
    const isUserMatch = cleanInputUser.toLowerCase() === validUsername.toLowerCase();
    const isPassMatch = cleanInputPass === validPassword;

    if (!isUserMatch || !isPassMatch) {
      return {
        success: false,
        message: 'ভুল ইউজারনেম বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।'
      };
    }

    const rootProfile = AdminAuthService.getRootAdminProfile();
    const sessionData = {
      authenticated: true,
      username: validUsername,
      name: rootProfile.name || 'রুট অ্যাডমিন (Root Admin)',
      email: rootProfile.email,
      phone: rootProfile.phone,
      address: rootProfile.address,
      avatar: rootProfile.avatar,
      role: 'root_admin',
      isRoot: true,
      token: `root-adm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      loginTime: new Date().toISOString()
    };

    try {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      window.dispatchEvent(new CustomEvent('app:admin-session-changed'));
    } catch (e) {
      console.error('Error saving admin session', e);
    }

    return {
      success: true,
      admin: sessionData
    };
  },

  /**
   * Login as a Normal Admin directly (for users who have been granted Normal Admin rights by Root Admin)
   */
  loginAsNormalAdmin: (userPayload) => {
    if (!userPayload || !userPayload.email) {
      return { success: false, message: 'ইউজার তথ্য পাওয়া যায়নি।' };
    }

    // Verify against StorageService that user's email actually holds normal_admin role
    if (!StorageService.isNormalAdmin(userPayload.email)) {
      return { success: false, message: 'আপনার অ্যাকাউন্টে অ্যাডমিন পারমিশন নেই।' };
    }

    const sessionData = {
      authenticated: true,
      username: userPayload.email,
      name: userPayload.name || 'নরমাল অ্যাডমিন',
      email: userPayload.email,
      avatar: userPayload.avatar || '',
      role: 'normal_admin',
      isRoot: false,
      token: `norm-adm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      loginTime: new Date().toISOString()
    };

    try {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      window.dispatchEvent(new CustomEvent('app:admin-session-changed'));
    } catch (e) {
      console.error('Error saving normal admin session', e);
    }

    return {
      success: true,
      admin: sessionData
    };
  },

  /**
   * Log out admin and terminate admin session
   */
  logout: () => {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      window.dispatchEvent(new CustomEvent('app:admin-session-changed'));
    } catch (e) {
      console.warn('Error removing admin session', e);
    }
  }
};

// Auto-sync root admin profile from Supabase in background
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('admin_profile')
        .select('*')
        .eq('id', 'root')
        .maybeSingle();
      if (!error && data && (data.name || data.email || data.phone || data.address || data.avatar)) {
        const mapped = rowToAdminProfile(data);
        localStorage.setItem(ROOT_ADMIN_PROFILE_KEY, JSON.stringify(mapped));
        window.dispatchEvent(new CustomEvent('app:root-admin-profile-updated', { detail: mapped }));
      }
    } catch (e) {
      console.warn('Supabase admin profile sync notice:', e);
    }
  }, 400);
}
