<template>
  <VAlert
    v-if="shouldShowNotification"
    :type="alertType"
    variant="tonal"
    closable
    class="mb-4"
    @click:close="dismiss"
  >
    <template #prepend>
      <VIcon :icon="alertIcon" />
    </template>

    <div class="d-flex align-center justify-space-between flex-wrap gap-3">
      <div>
        <p class="text-body-2 font-weight-bold mb-1">{{ notificationTitle }}</p>
        <p class="text-body-2 mb-0">{{ notificationMessage }}</p>
      </div>

      <VBtn
        v-if="showRenewButton"
        :color="alertType === 'error' ? 'error' : 'warning'"
        variant="flat"
        size="small"
        to="/account/membership"
      >
        <VIcon icon="mdi-refresh" start />
        Renew Now
      </VBtn>
    </div>
  </VAlert>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session';
import { computed, ref, onMounted } from 'vue';

const session = useSessionStore();

const STORAGE_KEY = 'tadam-expiry-notification-dismissed';
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const dismissed = ref(false);

/**
 * Calculate days until membership expires
 */
const daysUntilExpiry = computed(() => {
  const expiresAt = session.membershipExpiresAt;
  if (!expiresAt) {
    return null;
  }

  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const diff = Math.ceil((expiryTime - now) / (24 * 60 * 60 * 1000));

  return diff;
});

/**
 * Check if notification should be shown
 * Show notification if:
 * - User is a supporter
 * - Membership expires in 7 days or less, or already expired
 * - User hasn't dismissed notification in last 24 hours
 */
const shouldShowNotification = computed(() => {
  if (dismissed.value) {
    return false;
  }

  if (!session.isSupporter && daysUntilExpiry.value === null) {
    return false;
  }

  const days = daysUntilExpiry.value;
  if (days === null) {
    return false;
  }

  // Show if expired or expiring within 7 days
  return days <= 7;
});

/**
 * Alert type based on urgency
 */
const alertType = computed(() => {
  const days = daysUntilExpiry.value;
  if (days === null) {
    return 'info';
  }

  if (days <= 0) {
    return 'error';
  }

  if (days <= 3) {
    return 'warning';
  }

  return 'info';
});

/**
 * Alert icon based on type
 */
const alertIcon = computed(() => {
  const type = alertType.value;

  if (type === 'error') {
    return 'mdi-alert-circle';
  }

  if (type === 'warning') {
    return 'mdi-clock-alert-outline';
  }

  return 'mdi-information-outline';
});

/**
 * Notification title based on days remaining
 */
const notificationTitle = computed(() => {
  const days = daysUntilExpiry.value;
  if (days === null) {
    return '';
  }

  if (days <= 0) {
    return 'Your membership has expired';
  }

  if (days === 1) {
    return 'Your membership expires tomorrow';
  }

  return `Your membership expires in ${days} days`;
});

/**
 * Notification message
 */
const notificationMessage = computed(() => {
  const days = daysUntilExpiry.value;
  if (days === null) {
    return '';
  }

  if (days <= 0) {
    return 'Renew your supporter pass to continue enjoying ad-free browsing and exclusive features.';
  }

  return 'Renew your supporter pass to avoid interruptions.';
});

/**
 * Show renew button for expired or expiring memberships
 */
const showRenewButton = computed(() => {
  const days = daysUntilExpiry.value;
  return days !== null && days <= 7;
});

/**
 * Dismiss notification for 24 hours
 */
const dismiss = () => {
  dismissed.value = true;

  if (process.client) {
    const dismissedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, String(dismissedAt));
  }
};

/**
 * Check if notification was recently dismissed
 */
const checkDismissedStatus = () => {
  if (!process.client) {
    return;
  }

  const dismissedAtStr = localStorage.getItem(STORAGE_KEY);
  if (!dismissedAtStr) {
    return;
  }

  const dismissedAt = parseInt(dismissedAtStr, 10);
  const now = Date.now();

  // If dismissed within last 24 hours, keep it dismissed
  if (now - dismissedAt < DISMISS_DURATION_MS) {
    dismissed.value = true;
  } else {
    // Clear old dismissal
    localStorage.removeItem(STORAGE_KEY);
  }
};

onMounted(() => {
  checkDismissedStatus();
});
</script>
