<template>
  <VContainer class="max-w-2xl py-10 space-y-6 text-center">
    <VIcon icon="mdi-check-circle" color="primary" size="64" />
    <h1 class="text-3xl font-bold">Thanks for supporting Tadam!</h1>
    <p class="text-slate-500">
      We are verifying your payment. This page refreshes as we confirm the latest status from PhonePe.
    </p>

    <div class="space-y-2">
      <div class="text-sm text-slate-600">
        Merchant Transaction ID: <code>{{ transactionId ?? 'unknown' }}</code>
      </div>
      <VChip v-if="statusState" color="primary" variant="flat">
        Current status: {{ statusState }}
      </VChip>
    </div>

    <div class="flex justify-center gap-3">
      <VBtn color="primary" :loading="loading" @click="refreshStatus">Refresh status</VBtn>
      <VBtn variant="text" to="/account/membership">Go back to membership page</VBtn>
    </div>

    <VAlert v-if="error" type="error" variant="tonal" class="border border-red-200">
      {{ error }}
    </VAlert>
    <VAlert v-if="message" type="info" variant="tonal" class="border border-blue-200">
      {{ message }}
    </VAlert>
  </VContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useSessionStore } from '~/stores/session';

const route = useRoute();
const loading = ref(false);
const statusState = ref<string | null>(null);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const transactionId = ref<string | null>(null);
const session = useSessionStore();
const supporterBannerState = useState('supporter-banner-visible', () => false);

const analytics = (event: string, props?: Record<string, any>) => {
  if (process.client && typeof (window as any).plausible === 'function') {
    (window as any).plausible(event, { props });
  }
};

const deriveTransactionId = () => {
  if (process.server) {
    return;
  }
  const fromQuery = route.query.transactionId as string | undefined;
  if (fromQuery) {
    localStorage.setItem('tadam-last-transaction', fromQuery);
    transactionId.value = fromQuery;
    return;
  }
  transactionId.value = localStorage.getItem('tadam-last-transaction');
};

const refreshStatus = async () => {
  if (process.server) {
    return;
  }
  deriveTransactionId();

  if (!transactionId.value) {
    error.value = 'No transaction found. Please initiate a payment first.';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    message.value = null;

    const response = await $fetch<{ status: any }>(`/api/phonepe/status/${transactionId.value}`);
    const state = response.status?.data?.state ?? 'PENDING';
    statusState.value = state;
    analytics('membership_status_poll', { state, context: 'success-page' });

    if (state === 'COMPLETED') {
      message.value = 'Payment confirmed! You now have ad-free access.';
      analytics('membership_payment_success', { state, context: 'success-page' });
      localStorage.removeItem('tadam-supporter-banner-dismissed');
      supporterBannerState.value = true;
      session.fetchProfile(true);
    } else if (state === 'FAILED' || state === 'DECLINED') {
      error.value = 'Payment failed or was declined. Please retry your purchase.';
      analytics('membership_payment_failure', { state, context: 'success-page' });
    } else {
      message.value = 'Payment is still being processed by the bank. Please check again soon.';
    }
  } catch (err) {
    error.value = 'Unable to contact the payment server. Try again in a moment.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  session.fetchProfile().catch(() => {});
  deriveTransactionId();
  if (!transactionId.value) {
    message.value = 'We could not find a payment reference. Start a new membership purchase.';
    return;
  }
  refreshStatus();
});

watch(
  () => route.query.transactionId,
  () => {
    deriveTransactionId();
  },
);
</script>
