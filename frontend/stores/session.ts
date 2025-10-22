import { defineStore } from 'pinia';

export type SessionProfile = {
  id: number;
  email: string;
  name?: string;
  role?: {
    id: number;
    name: string;
    type: string;
  } | null;
  membershipStatus: string;
  membershipExpiresAt?: string | null;
  membershipReminderSentAt?: string | null;
  membershipCancelRequestedAt?: string | null;
  membershipCancelReason?: string | null;
  districts: { id: string; name: string; slug?: string }[];
  categories: { id: string; name: string; slug?: string }[];
};

export const useSessionStore = defineStore('session', {
  state: () => ({
    profile: null as SessionProfile | null,
    loading: false,
    lastFetchedAt: 0,
  }),
  getters: {
    isSupporter: state => state.profile?.membershipStatus === 'active',
    isEditorial: (state) => {
      const roleType = state.profile?.role?.type ?? '';
      return ['editor', 'author', 'contributor'].includes(roleType);
    },
    membershipExpiresAt: state => state.profile?.membershipExpiresAt ?? null,
    membershipReminderSentAt: state => state.profile?.membershipReminderSentAt ?? null,
    membershipCancelRequestedAt: state => state.profile?.membershipCancelRequestedAt ?? null,
    hasPendingCancellation: state => Boolean(state.profile?.membershipCancelRequestedAt),
  },
  actions: {
    async fetchProfile (force = false) {
      if (process.server) {
        return;
      }
      if (!force && this.profile && Date.now() - this.lastFetchedAt < 60_000) {
        return;
      }
      this.loading = true;
      try {
        const data = await $fetch<SessionProfile>('/api/account/profile');
        this.profile = data;
        this.lastFetchedAt = Date.now();
      } catch (error) {
        if ((error as any)?.status === 401) {
          this.profile = null;
        } else {
          console.warn('Failed to load session profile', error);
        }
      } finally {
        this.loading = false;
      }
    },
    clear () {
      this.profile = null;
      this.lastFetchedAt = 0;
    },
  },
});
