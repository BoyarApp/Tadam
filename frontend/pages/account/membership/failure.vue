<template>
  <VContainer class="max-w-2xl py-8">
    <VCard class="pa-6">
      <div class="text-center">
        <VIcon icon="mdi-alert-circle-outline" color="error" size="80" class="mb-4" />

        <h1 class="text-h4 font-weight-bold mb-2">பேமெண்ட் தோல்வியடைந்தது</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          உங்கள் பேமெண்ட் கம்ப்ளீட் ஆகவில்லை. மீண்டும் முயற்சி செய்யவும்.
        </p>

        <VDivider class="my-6" />

        <div class="text-left mb-6">
          <VAlert type="error" variant="tonal" class="mb-4">
            <template #prepend>
              <VIcon icon="mdi-information" />
            </template>
            <div class="text-body-2">
              <p class="font-weight-bold mb-2">பொதுவான காரணங்கள்:</p>
              <ul class="ml-4">
                <li>போதுமான பேலன்ஸ் இல்லை</li>
                <li>கார்ட் லிமிட் எக்ஸீட் ஆகிவிட்டது</li>
                <li>தவறான OTP அல்லது PIN</li>
                <li>நெட்வொர்க் இஷ்யூ</li>
                <li>பேங்க் டிக்லைன் செய்தது</li>
              </ul>
            </div>
          </VAlert>

          <div v-if="transactionId" class="d-flex justify-space-between mb-3">
            <span class="text-body-2 text-medium-emphasis">ட்ரான்சாக்ஷன் ஐடி</span>
            <span class="text-body-2 font-weight-bold font-mono">{{ transactionId }}</span>
          </div>

          <div v-if="errorReason" class="d-flex justify-space-between mb-3">
            <span class="text-body-2 text-medium-emphasis">ஸ்டேட்டஸ்</span>
            <VChip color="error" size="small">{{ errorReason }}</VChip>
          </div>
        </div>

        <VDivider class="my-6" />

        <VAlert type="info" variant="tonal" class="mb-6">
          <template #prepend>
            <VIcon icon="mdi-shield-check" />
          </template>
          <p class="text-body-2 mb-0">
            உங்கள் அக்கவுண்டில் எந்த தொகையும் டெபிட் ஆகவில்லை.
            மீண்டும் முயற்சி செய்யலாம்.
          </p>
        </VAlert>

        <div class="d-flex flex-column gap-3">
          <VBtn to="/account/membership" color="primary" variant="flat" size="large">
            <VIcon icon="mdi-refresh" start />
            மீண்டும் முயற்சி செய்
          </VBtn>

          <VBtn to="/" variant="text">
            <VIcon icon="mdi-home" start />
            ஹோம் போ
          </VBtn>
        </div>

        <div class="mt-6 text-center">
          <p class="text-body-2 text-medium-emphasis mb-2">உதவி தேவையா?</p>
          <div class="d-flex justify-center gap-4 flex-wrap">
            <a href="mailto:support@tadam.in" class="text-primary text-decoration-none text-body-2">
              <VIcon icon="mdi-email" size="small" class="mr-1" />
              support@tadam.in
            </a>
            <a href="tel:+918925345678" class="text-primary text-decoration-none text-body-2">
              <VIcon icon="mdi-phone" size="small" class="mr-1" />
              +91-89253 45678
            </a>
          </div>
        </div>
      </div>
    </VCard>
  </VContainer>
</template>

<script setup lang="ts">
import { useAnalytics } from '~/composables/useAnalytics';

const route = useRoute();
const { trackMembershipEvent } = useAnalytics();

const transactionId = ref<string>('');
const errorReason = ref<string>('');

onMounted(() => {
  transactionId.value = String(route.query.transaction_id || route.query.txnId || '');
  errorReason.value = String(route.query.reason || route.query.state || 'FAILED');

  // Track failed payment
  trackMembershipEvent('checkout_failed', {
    transactionId: transactionId.value,
    errorReason: errorReason.value,
  });
});

useHead({
  title: 'Payment Failed',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

definePageMeta({
  layout: 'default',
});
</script>
