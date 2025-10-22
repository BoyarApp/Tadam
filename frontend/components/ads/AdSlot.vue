<template>
  <div v-if="!isSupporter" class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-500">
    <slot>
      Advertisement – {{ slotName }} slot
    </slot>
  </div>
  <div v-else class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center text-xs text-emerald-700">
    Supporter view – ads removed. Thank you!
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session';

import { computed } from 'vue';

const props = defineProps<{ slotName?: string }>();

const session = useSessionStore();
const isSupporter = computed(() => session.isSupporter);

const slotName = computed(() => props.slotName ?? 'inline');
</script>
