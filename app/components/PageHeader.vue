<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="bg-card rounded-xl shadow-sm border border-navy/10 p-6 mb-6">
    <h1 class="text-2xl font-bold text-navy">{{ title }}</h1>
    <p v-if="description" class="text-navy/50 mt-1">{{ description }}</p>
    <slot />
  </div>
</template>
