<template>
  <VLayout class="min-h-screen bg-surface">
    <ShellHeader
      :district-count="preferences.selectedDistricts.length"
      :theme="preferences.theme"
      :is-supporter="isSupporter"
      :membership-expires-at="membershipExpiresAt"
      @toggle-theme="handleToggleTheme"
      @open-districts="isDistrictDrawerOpen = true"
    />

    <VSlideYTransition>
      <div
        v-if="showSupporterBanner"
        :class="['border-b', supporterBannerClasses]"
        data-testid="supporter-banner"
      >
        <VContainer class="max-w-screen-xl flex items-center justify-between py-2 text-sm">
          <div class="flex items-center gap-2">
            <VIcon
              :icon="hasPendingCancellation ? 'mdi-clock-alert-outline' : 'mdi-seal-variant'"
              :color="hasPendingCancellation ? 'amber-darken-3' : 'white'"
            />
            <span>{{ supporterBannerMessage }}</span>
          </div>
          <VBtn
            size="small"
            variant="text"
            :color="hasPendingCancellation ? 'amber-darken-3' : 'white'"
            @click="dismissSupporterBanner"
          >
            Dismiss
          </VBtn>
        </VContainer>
      </div>
    </VSlideYTransition>

    <ShellCategoryRail class="hidden md:block" />

    <VMain class="bg-background">
      <slot />
    </VMain>

    <ShellBottomNav
      class="md:hidden"
      :theme="preferences.theme"
      @toggle-theme="handleToggleTheme"
      @open-districts="isDistrictDrawerOpen = true"
    />

    <ShellDistrictDrawer
      v-model="isDistrictDrawerOpen"
      :selected="preferences.selectedDistricts"
      @save="preferences.setDistricts"
    />
  </VLayout>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';
import { usePreferencesStore } from '~/stores/preferences';
import { useSessionStore } from '~/stores/session';
import { useAnalytics } from '~/composables/useAnalytics';

const preferences = usePreferencesStore();
const theme = useTheme();
const session = useSessionStore();
const { trackEvent } = useAnalytics();

const isDistrictDrawerOpen = ref(false);

const isSupporter = computed(() => session.isSupporter);
const membershipExpiresAt = computed(() => session.membershipExpiresAt);
const hasPendingCancellation = computed(() => session.hasPendingCancellation);
const supporterBannerState = useState('supporter-banner-visible', () => false);

const showSupporterBanner = computed(() => supporterBannerState.value && (isSupporter.value || hasPendingCancellation.value));

const daysUntilExpiry = computed(() => {
  const expiresAt = membershipExpiresAt.value;
  if (!expiresAt) {
    return null;
  }
  const expiryTime = new Date(expiresAt).getTime();
  const diff = Math.ceil((expiryTime - Date.now()) / (24 * 60 * 60 * 1000));
  return Number.isNaN(diff) ? null : diff;
});

const supporterBannerMessage = computed(() => {
  if (hasPendingCancellation.value) {
    return 'Your cancellation request is being processed. We will notify you once the refund is complete.';
  }
  if (isSupporter.value) {
    if (daysUntilExpiry.value !== null) {
      if (daysUntilExpiry.value <= 0) {
        return 'Your supporter pass has expired. Renew to keep enjoying an ad-free experience.';
      }
      if (daysUntilExpiry.value <= 7) {
        return `Supporter benefits active — ${daysUntilExpiry.value} day${daysUntilExpiry.value === 1 ? '' : 's'} left to renew.`;
      }
      return `Supporter benefits active until ${new Date(membershipExpiresAt.value!).toLocaleDateString()}.`;
    }
    return 'Supporter benefits active — thank you for backing Tadam!';
  }
  return '';
});

const supporterBannerClasses = computed(() =>
  hasPendingCancellation.value
    ? 'bg-amber-50 text-amber-900 border-amber-200'
    : 'bg-emerald-600 text-white border-emerald-500',
);

const dismissSupporterBanner = () => {
  supporterBannerState.value = false;
  if (process.client) {
    localStorage.setItem('tadam-supporter-banner-dismissed', '1');
  }
  trackEvent('page_view', {
    page: 'membership_banner_dismissed',
  });
};

const handleToggleTheme = () => {
  const nextTheme = preferences.theme === 'light' ? 'dark' : 'light';
  preferences.setTheme(nextTheme);
  theme.global.name.value = nextTheme === 'light' ? 'lightTheme' : 'darkTheme';
};

onMounted(() => {
  theme.global.name.value = preferences.theme === 'light' ? 'lightTheme' : 'darkTheme';
  session.fetchProfile().catch(() => {});
  if (process.client) {
    const dismissed = localStorage.getItem('tadam-supporter-banner-dismissed') === '1';
    if (!dismissed && (isSupporter.value || hasPendingCancellation.value)) {
      supporterBannerState.value = true;
    }
  }
});

watch([isSupporter, hasPendingCancellation], ([supporterNext, cancelNext], [supporterPrev, cancelPrev]) => {
  const activated = (supporterNext && !supporterPrev) || (cancelNext && !cancelPrev);
  if (!activated) {
    return;
  }
  if (process.client) {
    localStorage.removeItem('tadam-supporter-banner-dismissed');
  }
  supporterBannerState.value = true;
  trackEvent('page_view', {
    page: 'membership_banner_shown',
    supporter: supporterNext,
    cancellation_pending: cancelNext,
  });
});
</script>
