<template>
  <div v-if="!shouldShowAd" class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center text-xs text-emerald-700">
    <VIcon icon="mdi-account-heart" size="small" class="mr-1" />
    Supporter view – ads removed. Thank you!
  </div>
  <div v-else class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-500">
    <slot>
      Advertisement – {{ slotName }} slot
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session';
import { useAnalytics } from '~/composables/useAnalytics';
import { computed, onMounted } from 'vue';

const props = defineProps<{
  slotName?: string;
  campaignId?: string;
  creativeId?: string;
}>();

const session = useSessionStore();
const { trackAdEvent } = useAnalytics();

const slotName = computed(() => props.slotName ?? 'inline');

/**
 * Check if ads should be shown based on membership status
 * Returns true if ads should be shown (non-supporter or expired)
 */
const shouldShowAd = computed(() => {
  // If user is active supporter, don't show ads
  if (session.isSupporter) {
    return false;
  }

  // Check membership expiry
  const expiresAt = session.membershipExpiresAt;
  if (expiresAt) {
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();

    // If membership is still active (not expired), don't show ads
    if (expiryTime > now) {
      return false;
    }
  }

  // Show ads for non-supporters or expired memberships
  return true;
});

// Track ad impression when shown
onMounted(() => {
  if (shouldShowAd.value && props.campaignId && props.creativeId) {
    trackAdEvent('impression', {
      campaignId: props.campaignId,
      creativeId: props.creativeId,
      position: slotName.value,
    });
  }
});
</script>
