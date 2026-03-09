<script setup lang="ts">
const isCollapsed = ref(false)
const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <div class="h-screen flex bg-background overflow-hidden font-sans text-navy">
    
    <!-- Mobile Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
      @click="isMobileMenuOpen = false"
    ></div>

    <AppSidebar 
      :collapsed="isCollapsed" 
      :mobile-open="isMobileMenuOpen"
      @update:collapsed="isCollapsed = $event"
      @close-mobile="isMobileMenuOpen = false"
    />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-background text-navy">
      <!-- Mobile Header -->
      <header class="bg-sidebar border-b border-white/10 lg:hidden h-16 flex items-center px-4 justify-between">
        <button @click="toggleMobileMenu" class="text-white hover:bg-white/10 p-2 rounded-lg -ml-2">
          <Icon name="heroicons:bars-3" class="w-6 h-6" />
        </button>
        <span class="font-bold text-white">Nomu Admin</span>
        <div class="w-8"></div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div class="max-w-7xl mx-auto h-full">
           <slot />
        </div>
      </main>
    </div>

  </div>
</template>

<style scoped>
/* Custom Scrollbar for navigation if needed */
nav::-webkit-scrollbar {
  width: 4px;
}
nav::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.1);
  border-radius: 4px;
}
</style>
