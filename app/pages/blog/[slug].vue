<template>
  <div class="container mx-auto px-4 py-8">
    <article v-if="post" class="max-w-4xl mx-auto">
      <!-- Back button -->
      <NuxtLink 
        to="/blog" 
        class="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors duration-300"
      >
        <span class="mr-2">←</span>
        Back to Blog
      </NuxtLink>

      <!-- Article header -->
      <header class="mb-8">
        <h1 
          class="text-4xl font-bold mb-4 text-gray-900 dark:text-white" 
          v-html="post.title.rendered"
        ></h1>
        <div class="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <span>{{ formatDate(post.date) }}</span>
          <span class="mx-2">•</span>
          <span>{{ getReadTime(post.content.rendered) }} min read</span>
        </div>
      </header>

      <!-- Featured image -->
      <img 
        v-if="featuredImage"
        :src="featuredImage" 
        :alt="post.title.rendered"
        class="w-full h-[400px] object-cover rounded-lg mb-8 shadow-lg"
      />

      <!-- Article content -->
      <div 
        class="prose prose-lg max-w-none dark:prose-invert" 
        v-html="post.content.rendered"
      ></div>

      <!-- Share buttons -->
      <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Share this article</h3>
        <div class="flex space-x-4">
          <button 
            @click="shareOnTwitter" 
            class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center transition-colors duration-300"
          >
            <span class="mr-2">Twitter</span>
          </button>
          <button 
            @click="shareOnFacebook" 
            class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center transition-colors duration-300"
          >
            <span class="mr-2">Facebook</span>
          </button>
        </div>
      </div>

      <!-- Related posts -->
      <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Related Posts</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <article 
            v-for="relatedPost in relatedPosts" 
            :key="relatedPost.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <NuxtLink :to="`/blog/${relatedPost.slug}`" class="block h-full">
              <img 
                :src="getFirstImage(relatedPost.content.rendered)" 
                :alt="relatedPost.title.rendered"
                class="w-full h-48 object-cover"
              />
              <div class="p-4">
                <h4 
                  class="text-lg font-semibold mb-2 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2"
                  v-html="relatedPost.title.rendered"
                ></h4>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(relatedPost.date) }}
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </article>

    <!-- Loading state -->
    <div v-else-if="pending" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Loading article...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 dark:text-red-400">Failed to load article. Please try again later.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

definePageMeta({
  title: 'Blog Post'
})

// Fetch single post from WordPress API
const { data: post, pending, error } = await useFetch(`https://woo.groovygallerydesigns.com/wp-json/wp/v2/posts?slug=${slug}`, {
  headers: {
    'Authorization': 'Basic ' + btoa('ck_90846993a7f31d0c512aee435ac278edd2b07a63:cs_8cccc3b94095049498243682dc77f6f5bf502e84')
  },
  transform: (posts) => posts[0]
})

// Extract featured image
const featuredImage = computed(() => {
  if (!post.value) return null
  const imgRegex = /<img[^>]+src="([^">]+)"/
  const match = post.value.content.rendered.match(imgRegex)
  return match ? match[1] : null
})

// Fetch related posts
const { data: relatedPosts } = await useFetch('https://woo.groovygallerydesigns.com/wp-json/wp/v2/posts', {
  headers: {
    'Authorization': 'Basic ' + btoa('ck_90846993a7f31d0c512aee435ac278edd2b07a63:cs_8cccc3b94095049498243682dc77f6f5bf502e84')
  },
  transform: (posts) => {
    // Filter out current post and limit to 2 posts
    return posts.filter(p => p.slug !== slug).slice(0, 2)
  }
})

// Function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Function to get first image from content
const getFirstImage = (content: string) => {
  const imgRegex = /<img[^>]+src="([^">]+)"/
  const match = content.match(imgRegex)
  return match ? match[1] : '/placeholder-image.jpg'
}

// Function to estimate read time
const getReadTime = (content: string) => {
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Share functions
const shareOnTwitter = () => {
  const url = window.location.href
  const text = post.value.title.rendered
  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
}

const shareOnFacebook = () => {
  const url = window.location.href
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
}
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
  @apply mb-4 leading-relaxed;
}

.prose ul {
  @apply list-disc list-inside mb-4;
}

.prose ol {
  @apply list-decimal list-inside mb-4;
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
  @apply border-l-4 border-primary-500 pl-4 italic my-4;
}

/* Line clamp for text overflow */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card hover effects */
article {
  transition: all 0.3s ease;
}

article:hover {
  transform: translateY(-4px);
}
</style>
