<template>
  <div class="container mx-auto px-4 py-12">
    <div v-if="post" class="max-w-4xl mx-auto">
      <!-- Page header -->
      <header class="text-center mb-16">
        <h1 class="text-5xl font-bold mb-6 text-gray-900 dark:text-white">About Us</h1>
        <p class="text-xl text-gray-600 dark:text-gray-400">Discover our story and passion for creating unique gallery designs</p>
      </header>

      <!-- Featured image -->
      <img 
        v-if="featuredImage"
        :src="featuredImage" 
        :alt="post.title.rendered"
        class="w-full h-[500px] object-cover rounded-2xl mb-16 shadow-xl"
      />

      <!-- Page content -->
      <div class="prose prose-lg max-w-none dark:prose-invert">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div v-html="post.content.rendered"></div>
        </div>
      </div>

      <!-- Contact section -->
      <div class="mt-16 text-center">
        <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Get in Touch</h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">Have questions? We'd love to hear from you!</p>
        <NuxtLink 
          to="/contact" 
          class="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-primary-600 rounded-full hover:bg-primary-700 transition-colors duration-300"
        >
          Contact Us
          <span class="ml-2">→</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="pending" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Loading page content...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 dark:text-red-400">Failed to load page content. Please try again later.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'About Us'
})

// Fetch page from WordPress API
const { data: post, pending, error } = await useFetch('https://woo.groovygallerydesigns.com/wp-json/wp/v2/pages/8380', {
  headers: {
    'Authorization': 'Basic ' + btoa('ck_90846993a7f31d0c512aee435ac278edd2b07a63:cs_8cccc3b94095049498243682dc77f6f5bf502e84')
  }
})

// Extract featured image
const featuredImage = computed(() => {
  if (!post.value) return null
  const imgRegex = /<img[^>]+src="([^">]+)"/
  const match = post.value.content.rendered.match(imgRegex)
  return match ? match[1] : null
})
</script>

<style>
/* WordPress content styles */
.prose {
  @apply text-gray-800 dark:text-gray-200;
}

.prose h2 {
  @apply text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white;
}

.prose h3 {
  @apply text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white;
}

.prose p {
  @apply mb-6 leading-relaxed text-lg;
}

.prose ul {
  @apply list-disc list-inside mb-6;
}

.prose ol {
  @apply list-decimal list-inside mb-6;
}

.prose a {
  @apply text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 transition-colors duration-300;
}

.prose figure {
  @apply my-8;
}

.prose img {
  @apply rounded-lg shadow-md dark:shadow-none transition-transform duration-300 hover:scale-105;
}

.prose blockquote {
  @apply border-l-4 border-primary-500 pl-6 py-2 my-6 bg-gray-50 dark:bg-gray-900 rounded-r-lg italic;
}

/* Additional styles */
.bg-gradient {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
}
</style>
