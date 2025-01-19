<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Latest Blog Posts</h1>
    
    <!-- Blog post grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <article 
        v-for="post in posts" 
        :key="post.id" 
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <NuxtLink :to="`/blog/${post.slug}`" class="block h-full">
          <div class="aspect-w-16 aspect-h-9 relative">
            <img 
              :src="getFirstImage(post.content.rendered)" 
              :alt="post.title.rendered"
              class="w-full h-64 object-cover"
              @error="handleImageError"
            />
          </div>
          <div class="p-6">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">{{ formatDate(post.date) }}</div>
            <h2 
              class="text-2xl font-semibold mb-3 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2"
              v-html="post.title.rendered"
            ></h2>
            <p 
              class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3"
              v-html="stripHtml(post.excerpt.rendered)"
            ></p>
            <div class="flex items-center justify-between text-sm">
              <span class="text-primary-600 dark:text-primary-400 font-medium">Read More →</span>
              <span class="text-gray-500 dark:text-gray-400">{{ getReadTime(post.content.rendered) }} min read</span>
            </div>
          </div>
        </NuxtLink>
      </article>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Loading blog posts...</p>
    </div>

    <!-- Error state -->
    <div v-if="error" class="text-center py-12">
      <p class="text-red-600 dark:text-red-400">Failed to load blog posts. Please try again later.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Blog'
})

// Fetch posts from WordPress API
const { data: posts, pending, error } = await useFetch('https://woo.groovygallerydesigns.com/wp-json/wp/v2/posts', {
  headers: {
    'Authorization': 'Basic ' + btoa('ck_90846993a7f31d0c512aee435ac278edd2b07a63:cs_8cccc3b94095049498243682dc77f6f5bf502e84')
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

// Function to handle image load error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder-image.jpg'
}

// Function to strip HTML from excerpt
const stripHtml = (html: string) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Function to estimate read time
const getReadTime = (content: string) => {
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}
</script>

<style>
/* Card hover effect */
article {
  transition: all 0.3s ease;
}

article:hover {
  transform: translateY(-4px);
}

/* Line clamp for text overflow */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Image aspect ratio */
.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%;
}

.aspect-w-16 img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
