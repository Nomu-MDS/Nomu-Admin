<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="bg-[#464640] rounded-xl shadow-sm border border-[#5D5D58] p-6 mb-6">
    <h1 class="text-2xl font-bold text-white">{{ title }}</h1>
    <p v-if="description" class="text-gray-400 mt-1">{{ description }}</p>
    <slot />
  </div>
</template>
