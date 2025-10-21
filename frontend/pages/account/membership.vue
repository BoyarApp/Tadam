<template>
  <VContainer class="max-w-3xl py-10 space-y-8">
    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-bold">Support Tadam</h1>
      <p class="text-slate-500">
        Become an ad-free supporter and help us build trustworthy Tamil journalism. Your membership renews manually; no recurring auto-debits.
      </p>
    </div>

    <VRow>
      <VCol cols="12" md="6">
        <VCard variant="outlined">
          <VCardTitle class="flex items-center justify-between">
            <span class="font-semibold">Your membership</span>
            <VChip :color="isSupporter ? 'secondary' : hasPendingCancellation ? 'warning' : 'grey'" variant="flat" size="small">
              {{ membershipStatusLabel }}
            </VChip>
          </VCardTitle>
          <VCardText class="space-y-3 text-sm text-slate-600">
            <div class="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
              <span>Member since</span>
              <span v-if="session.profile?.id">#{{ session.profile?.id }}</span>
            </div>
            <div>
              <strong>Expires:</strong>
              <span v-if="session.membershipExpiresAt">{{ formatDate(session.membershipExpiresAt) }}</span>
              <span v-else>Not active</span>
            </div>
            <div>
              <strong>Preferences:</strong>
              <span>{{ preferenceSummary }}</span>
            </div>
            <VAlert
              v-if="renewalHint"
              :type="renewalHintType"
              variant="tonal"
              density="comfortable"
              class="border"
            >
              {{ renewalHint }}
            </VAlert>
            <VAlert
              v-if="hasPendingCancellation && cancellationRequestedAt"
              type="warning"
              variant="tonal"
              density="comfortable"
              class="border border-amber-200"
            >
              Cancellation requested on {{ formatDate(cancellationRequestedAt) }}. We will email you when the refund is processed.
            </VAlert>
            <div v-if="isSupporter" class="rounded-lg bg-emerald-50 p-3 text-emerald-700 text-xs">
              Thank you for supporting independent Tamil journalism!
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="6">
        <VCard variant="tonal" color="primary">
          <VCardTitle class="flex items-center justify-between">
            <span class="text-xl font-semibold">Supporter Pass</span>
            <span class="text-2xl font-bold">₹{{ planAmount }}</span>
          </VCardTitle>
          <VCardText class="space-y-3 text-slate-200">
            <div class="flex items-center gap-2">
              <VIcon icon="mdi-shield-check" />
              <span>Browse without ads across web & future app</span>
            </div>
            <div class="flex items-center gap-2">
              <VIcon icon="mdi-account-tie" />
              <span>Priority access to district alerts & explainers</span>
            </div>
            <div class="flex items-center gap-2">
              <VIcon icon="mdi-chat-processing" />
              <span>Join our supporter advisory circle</span>
            </div>
          </VCardText>
          <VCardActions class="justify-between items-center">
            <div class="text-xs text-slate-300">
              PhonePe sandbox for testing. Refunds available within 7 days.
            </div>
            <VBtn color="secondary" :loading="loading" @click="startPayment">
              Start secure payment
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <VAlert v-if="message" type="info" variant="tonal" class="border border-blue-200">
      {{ message }}
    </VAlert>
    <VAlert v-if="error" type="error" variant="tonal" class="border border-red-200">
      {{ error }}
    </VAlert>

    <div class="space-y-3 rounded-xl border border-slate-200 bg-surface p-4">
      <h2 class="text-lg font-semibold">Recent transaction</h2>
      <div class="text-sm text-slate-600">
        <div v-if="latestTransactionId">Merchant Txn: <code>{{ latestTransactionId }}</code></div>
        <div v-else>No transaction yet. Complete a payment to view status.</div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <VBtn
          variant="outlined"
          color="primary"
          :disabled="!latestTransactionId"
          :loading="statusLoading"
          @click="checkStatus"
        >
          Check payment status
        </VBtn>
        <VChip v-if="statusState" color="primary" variant="flat">
          Status: {{ statusState }}
        </VChip>
      </div>
    </div>

    <VCard variant="outlined">
      <VCardTitle class="text-lg font-semibold">Payment history</VCardTitle>
      <VCardText>
        <table class="w-full table-auto text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th class="py-2 pr-3">Date</th>
              <th class="py-2 pr-3">Amount</th>
              <th class="py-2 pr-3">Status</th>
              <th class="py-2 pr-3">Reference</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in ledgerEntries" :key="entry.id" class="border-b border-slate-100">
              <td class="py-2 pr-3">{{ formatDate(entry.createdAt) }}</td>
              <td class="py-2 pr-3">₹{{ entry.amount.toFixed(0) }}</td>
              <td class="py-2 pr-3">
                <VChip
                  size="small"
                  :color="entry.status === 'completed' ? 'success' : entry.status === 'pending' ? 'warning' : 'error'"
                  variant="flat"
                >
                  {{ entry.status }}
                </VChip>
              </td>
              <td class="py-2 pr-3">
                <code v-if="entry.externalReference">{{ entry.externalReference }}</code>
                <span v-else>—</span>
              </td>
            </tr>
            <tr v-if="!ledgerEntries.length">
              <td colspan="4" class="py-6 text-center text-slate-500">No payments recorded yet.</td>
            </tr>
          </tbody>
        </table>
      </VCardText>
    </VCard>

    <VCard variant="outlined">
      <VCardTitle class="text-lg font-semibold">Request cancellation / refund</VCardTitle>
      <VCardText class="space-y-4 text-sm text-slate-600">
        <p>
          We honour cancellations within 7 days. Select the payment you want to refund and share a short note.
          Our team files a PhonePe refund and keeps you updated via email.
        </p>
        <VAlert
          v-if="hasPendingCancellation && cancellationRequestedAt"
          type="warning"
          variant="tonal"
          density="comfortable"
          class="border border-amber-200"
        >
          Refund requested on {{ formatDate(cancellationRequestedAt) }}. Reference will appear in your PhonePe app once processed.
        </VAlert>
        <VAlert
          v-else-if="cancelMessage"
          type="success"
          variant="tonal"
          density="comfortable"
          class="border border-emerald-200"
        >
          {{ cancelMessage }}
        </VAlert>
        <VAlert
          v-else-if="cancelError"
          type="error"
          variant="tonal"
          density="comfortable"
          class="border border-red-200"
        >
          {{ cancelError }}
        </VAlert>
        <VForm @submit.prevent="requestCancellation">
          <VRow class="items-start gap-y-4">
            <VCol cols="12" md="6">
              <VSelect
                v-model="cancelForm.merchantTransactionId"
                :items="cancelOptions"
                item-title="title"
                item-value="value"
                label="Select payment"
                :disabled="hasPendingCancellation || !cancelOptions.length"
                hide-details="auto"
                variant="outlined"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextarea
                v-model="cancelForm.reason"
                label="Reason (optional)"
                hint="Helps us improve the supporter experience."
                persistent-hint
                rows="3"
                variant="outlined"
                :disabled="hasPendingCancellation"
              />
            </VCol>
            <VCol cols="12" class="flex flex-wrap items-center gap-3">
              <VBtn
                type="submit"
                color="warning"
                :loading="cancelLoading"
                :disabled="hasPendingCancellation || !cancelForm.merchantTransactionId"
              >
                Submit refund request
              </VBtn>
              <span class="text-xs text-slate-500">
                PhonePe refunds settle back to your payment source in 5–7 working days.
              </span>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <VCard variant="outlined">
      <VCardTitle class="text-lg font-semibold">Need help?</VCardTitle>
      <VCardText class="space-y-1 text-sm text-slate-600">
        <div>
          <strong>Support number:</strong> +91-89253 45678
        </div>
        <div>
          <strong>Support email:</strong> <a href="mailto:support@tadam.in" class="text-primary">support@tadam.in</a>
        </div>
        <div>
          Refunds accepted within 7 days; processed within 5–7 business days.
        </div>
      </VCardText>
    </VCard>
  </VContainer>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session';

import { ref, computed, reactive, onMounted, watch } from 'vue';

const planAmount = 249;
const loading = ref(false);
const statusLoading = ref(false);
const cancelLoading = ref(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const statusState = ref<string | null>(null);
const latestTransactionId = ref<string | null>(null);
const cancelError = ref<string | null>(null);
const cancelMessage = ref<string | null>(null);

const router = useRouter();
const session = useSessionStore();
const ledgerEntries = ref<any[]>([]);
const supporterBannerState = useState('supporter-banner-visible', () => false);

const cancelForm = reactive({
  merchantTransactionId: '',
  reason: '',
});

const analytics = (event: string, props?: Record<string, any>) => {
  if (process.client && typeof (window as any).plausible === 'function') {
    (window as any).plausible(event, { props });
  }
};

const isSupporter = computed(() => session.isSupporter);
const hasPendingCancellation = computed(() => session.hasPendingCancellation);
const cancellationRequestedAt = computed(() => session.membershipCancelRequestedAt ?? null);
const membershipStatusLabel = computed(() => {
  const status = session.profile?.membershipStatus;
  if (status === 'active') {
    return 'Active Supporter';
  }
  if (status === 'grace') {
    return 'Grace period';
  }
  if (status === 'expired') {
    return 'Expired';
  }
  if (status === 'cancelled') {
    return 'Cancelled';
  }
  return 'Free member';
});

const preferenceSummary = computed(() => {
  const districts = session.profile?.districts?.map(d => d.name) ?? [];
  const categories = session.profile?.categories?.map(c => c.name) ?? [];
  if (!districts.length && !categories.length) {
    return 'Default mix';
  }
  return [
    districts.length ? `Districts: ${districts.join(', ')}` : null,
    categories.length ? `Interests: ${categories.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join(' • ');
});

const formatDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

const membershipExpiresAt = computed(() => session.membershipExpiresAt);
const daysUntilExpiry = computed(() => {
  const expiresAt = membershipExpiresAt.value;
  if (!expiresAt) {
    return null;
  }
  const expiry = new Date(expiresAt).getTime();
  const diff = Math.ceil((expiry - Date.now()) / (24 * 60 * 60 * 1000));
  return Number.isNaN(diff) ? null : diff;
});

const renewalHint = computed(() => {
  if (hasPendingCancellation.value && cancellationRequestedAt.value) {
    return `Cancellation request logged on ${formatDate(cancellationRequestedAt.value)}.`;
  }
  if (!isSupporter.value) {
    return 'Upgrade to a supporter pass for an ad-free experience and tailored alerts.';
  }
  if (daysUntilExpiry.value === null) {
    return null;
  }
  if (daysUntilExpiry.value <= 0) {
    return 'Your supporter pass has expired. Renew now to keep browsing without ads.';
  }
  if (daysUntilExpiry.value <= 7) {
    return `Only ${daysUntilExpiry.value} day${daysUntilExpiry.value === 1 ? '' : 's'} left. Renew soon to avoid interruptions.`;
  }
  return `Manual renewal due on ${formatDate(membershipExpiresAt.value)}.`;
});

const renewalHintType = computed(() => {
  if (!isSupporter.value) {
    return 'info';
  }
  if (daysUntilExpiry.value !== null && daysUntilExpiry.value <= 0) {
    return 'error';
  }
  if (daysUntilExpiry.value !== null && daysUntilExpiry.value <= 7) {
    return 'warning';
  }
  return 'success';
});

const cancelOptions = computed(() =>
  ledgerEntries.value
    .filter(entry => entry.status === 'completed' && entry.externalReference)
    .map(entry => ({
      title: `${formatDate(entry.createdAt)} • ₹${entry.amount.toFixed(0)} • ${entry.externalReference}`,
      value: entry.externalReference as string,
    })),
);

const loadLatestTransaction = () => {
  if (process.server) {
    return;
  }
  latestTransactionId.value = localStorage.getItem('tadam-last-transaction');
};

const startPayment = async () => {
  if (process.server) {
    return;
  }
  error.value = null;
  message.value = null;
  statusState.value = null;
  loading.value = true;

  try {
    analytics('membership_payment_start', { amount: planAmount });

    const response = await $fetch<{ merchantTransactionId: string; paymentPageUrl: string }>(
      '/api/phonepe/order',
      {
        method: 'POST',
        body: { amount: planAmount },
      },
    );

    localStorage.setItem('tadam-last-transaction', response.merchantTransactionId);
    localStorage.removeItem('tadam-supporter-banner-dismissed');
    message.value = 'Redirecting to PhonePe...';
    window.location.href = response.paymentPageUrl;
  } catch (err: any) {
    if (err?.status === 401) {
      error.value = 'Please sign in to complete the payment.';
      await router.push('/login');
    } else {
      error.value = 'Unable to initiate payment. Please try again later.';
    }
  } finally {
    loading.value = false;
    loadLatestTransaction();
  }
};

const checkStatus = async () => {
  if (process.server) {
    return;
  }
  const transactionId = latestTransactionId.value;
  if (!transactionId) {
    error.value = 'No transaction to check.';
    return;
  }

  statusLoading.value = true;
  error.value = null;

  try {
    const response = await $fetch<{ status: any }>(`/api/phonepe/status/${transactionId}`);
    const state = response.status?.data?.state ?? 'PENDING';
    statusState.value = state;
    analytics('membership_payment_status', { state });

    if (state === 'COMPLETED') {
      message.value = 'Payment successful! Membership activated.';
      analytics('membership_payment_success', { state });
      localStorage.removeItem('tadam-supporter-banner-dismissed');
      supporterBannerState.value = true;
      await session.fetchProfile(true);
      await fetchLedger();
    } else if (state === 'FAILED' || state === 'DECLINED') {
      error.value = 'Payment failed or declined. Please try again.';
      analytics('membership_payment_failure', { state });
    } else {
      message.value = 'Payment is still processing. Please try again shortly.';
    }
  } catch (err) {
    error.value = 'Unable to fetch payment status at this time.';
  } finally {
    statusLoading.value = false;
  }
};

const setDefaultCancelTransaction = () => {
  if (cancelForm.merchantTransactionId || !cancelOptions.value.length) {
    return;
  }
  cancelForm.merchantTransactionId = cancelOptions.value[0].value;
};

const fetchLedger = async () => {
  try {
    const response = await $fetch<{ entries: any[] }>('/api/account/ledger');
    ledgerEntries.value = response.entries ?? [];
    setDefaultCancelTransaction();
  } catch (err) {
    console.warn('Unable to load ledger history', err);
  }
};

const requestCancellation = async () => {
  cancelError.value = null;
  cancelMessage.value = null;

  if (!cancelForm.merchantTransactionId) {
    cancelError.value = 'Select a payment to cancel.';
    return;
  }

  cancelLoading.value = true;

  try {
    const response = await $fetch<{ success: boolean; refundRequestId?: string; requestedAt: string }>(
      '/api/account/membership/cancel',
      {
        method: 'POST',
        body: {
          merchantTransactionId: cancelForm.merchantTransactionId,
          reason: cancelForm.reason?.trim() || undefined,
        },
      },
    );

    if (response.success) {
      cancelMessage.value = 'Cancellation requested. We will email you once the refund is processed.';
      analytics('membership_cancel_request', {
        merchantTransactionId: cancelForm.merchantTransactionId,
        refundRequestId: response.refundRequestId,
      });
      cancelForm.reason = '';
      localStorage.removeItem('tadam-supporter-banner-dismissed');
      supporterBannerState.value = true;
      await session.fetchProfile(true);
      await fetchLedger();
    }
  } catch (err: any) {
    const errorMessage = err?.data?.error ?? err?.message ?? 'Unable to submit cancellation request right now.';
    cancelError.value = errorMessage;
    analytics('membership_cancel_request_failed', { message: errorMessage });
  } finally {
    cancelLoading.value = false;
  }
};

onMounted(() => {
  session.fetchProfile().catch(() => {});
  fetchLedger();
  loadLatestTransaction();
  const returningTxn = process.client ? new URL(window.location.href).searchParams.get('transactionId') : null;
  if (returningTxn) {
    localStorage.setItem('tadam-last-transaction', returningTxn);
    latestTransactionId.value = returningTxn;
    checkStatus();
  }
});

watch(cancelOptions, () => {
  setDefaultCancelTransaction();
});
</script>
