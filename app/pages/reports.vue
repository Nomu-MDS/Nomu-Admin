<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
  layout: 'dashboard'
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader 
      title="Signalements"
      description="Gérez les signalements utilisateurs"
    />
    
    <div class="bg-[#464640] rounded-xl shadow-sm border border-[#5D5D58] p-6 text-white h-96 flex items-center justify-center">
      <p class="text-gray-400">Contenu à venir...</p>
    </div>
  </div>
</template>
