<template>
  <div>
    <!-- Hamburger Button -->
    <button 
      @click="isOpen = !isOpen"
      class="lg:hidden flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle mobile menu">
      <UIcon
        :name="isOpen ? 'i-heroicons-x-mark-20-solid' : 'i-heroicons-bars-3-20-solid'"
        class="w-6 h-6 text-gray-700 dark:text-gray-300"
      />
    </button>

    <!-- Mobile Menu Overlay -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="isOpen = false"
      ></div>
    </transition>

    <!-- Mobile Menu Panel -->
    <transition
      enter-active-class="transition duration-300 ease-out transform"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in transform"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="isOpen"
        class="fixed top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 z-50 shadow-xl overflow-y-auto"
      >
        <!-- Menu Header -->
        <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          <button
            @click="isOpen = false"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close menu"
          >
            <UIcon name="i-heroicons-x-mark-20-solid" class="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <!-- Menu Items -->
        <nav class="px-2 py-4">
          <ul class="space-y-1">
            <li>
              <NuxtLink
                to="/contact"
                class="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="isOpen = false"
              >
                Contact Us
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/blog"
                class="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="isOpen = false"
              >
                Blog
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/about"
                class="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="isOpen = false"
              >
                About Us
              </NuxtLink>
            </li>
            
            <!-- Shop Info Submenu -->
            <li>
              <button
                @click="shopInfoOpen = !shopInfoOpen"
                class="flex items-center justify-between w-full px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span>Shop Info</span>
                <UIcon
                  :name="shopInfoOpen ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'"
                  class="w-5 h-5"
                />
              </button>
              <transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <ul v-if="shopInfoOpen" class="mt-2 space-y-1 pl-4">
                  <li>
                    <NuxtLink
                      to="/shop-info/shipping"
                      class="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      @click="isOpen = false"
                    >
                      Shipping Information
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink
                      to="/shop-info/refunds"
                      class="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      @click="isOpen = false"
                    >
                      Refunds & Returns
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink
                      to="/shop-info/sustainability"
                      class="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      @click="isOpen = false"
                    >
                      Sustainability
                    </NuxtLink>
                  </li>
                </ul>
              </transition>
            </li>
          </ul>
        </nav>
      </div>
    </transition>
  </div>
</template>

<script setup>
const isOpen = ref(false)
const shopInfoOpen = ref(false)

// Close menu when route changes
watch(() => useRoute().fullPath, () => {
  isOpen.value = false
  shopInfoOpen.value = false
})

// Close menu when clicking outside
onClickOutside(isOpen, () => {
  isOpen.value = false
})

// Close menu on escape key
onKeyStroke('Escape', () => {
  isOpen.value = false
})
</script>
