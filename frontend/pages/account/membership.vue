<template>
  <VContainer class="max-w-2xl py-10 space-y-8">
    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-bold">Support Tadam</h1>
      <p class="text-slate-500">
        Become an ad-free supporter and help us build trustworthy Tamil journalism. Your membership renews manually; no recurring auto-debits.
      </p>
    </div>

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
      <VCardActions class="justify-between">
        <div class="text-xs text-slate-300">
          Payment processed via PhonePe sandbox. Refunds available within 7 days.
        </div>
        <VBtn color="secondary" :loading="loading" @click="startPayment">
          Start secure payment
        </VBtn>
      </VCardActions>
    </VCard>

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
const planAmount = 249;
const loading = ref(false);
const statusLoading = ref(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const statusState = ref<string | null>(null);
const latestTransactionId = ref<string | null>(null);
const router = useRouter();

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
    const response = await $fetch<{ merchantTransactionId: string; paymentPageUrl: string }>(
      '/api/phonepe/order',
      {
        method: 'POST',
        body: { amount: planAmount },
      },
    );

    localStorage.setItem('tadam-last-transaction', response.merchantTransactionId);
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

    if (state === 'COMPLETED') {
      message.value = 'Payment successful! Membership activated.';
    } else if (state === 'FAILED' || state === 'DECLINED') {
      error.value = 'Payment failed or declined. Please try again.';
    } else {
      message.value = 'Payment is still processing. Please try again shortly.';
    }
  } catch (err) {
    error.value = 'Unable to fetch payment status at this time.';
  } finally {
    statusLoading.value = false;
  }
};

onMounted(() => {
  loadLatestTransaction();
  const returningTxn = new URL(window.location.href).searchParams.get('transactionId');
  if (returningTxn) {
    localStorage.setItem('tadam-last-transaction', returningTxn);
    latestTransactionId.value = returningTxn;
    checkStatus();
  }
});
</script>
