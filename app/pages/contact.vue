<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Contact Us</h1>
    <div class="max-w-2xl">
      <p class="mb-6">Get in touch with us for any inquiries or support.</p>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Category Selection -->
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700">What can we help you with?</label>
          <select 
            id="category" 
            v-model="formData.category"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            required
          >
            <option value="">Select a category</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <!-- Subcategory Selection (Conditional) -->
        <div v-if="formData.category && subcategories[formData.category]">
          <label for="subcategory" class="block text-sm font-medium text-gray-700">Please specify:</label>
          <select 
            id="subcategory" 
            v-model="formData.subcategory"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            required
          >
            <option value="">Select a subcategory</option>
            <option v-for="sub in subcategories[formData.category]" :key="sub" :value="sub">
              {{ sub }}
            </option>
          </select>
        </div>

        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
            :class="{'border-red-500': emailError}"
          />
          <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
        </div>

        <!-- Message Box -->
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700">
            Additional Details (max 200 characters)
          </label>
          <textarea 
            id="message" 
            v-model="formData.message"
            rows="4"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            maxlength="200"
          ></textarea>
          <p class="mt-1 text-sm text-gray-500">{{ 200 - formData.message.length }} characters remaining</p>
        </div>

        <!-- Marketing Notice -->
        <div class="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
          <p>This form is for customer inquiries only. Marketing and unsolicited proposals will not be responded to.</p>
        </div>

        <!-- Submit Button -->
        <div>
          <button 
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Sending...' : 'Send Message' }}
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="submitted" class="mt-4 p-4 bg-green-50 rounded-md">
          <p class="text-green-700">
            Thank you! Our team will respond within 24 hours. For immediate assistance, please call our support line.
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

definePageMeta({
  title: 'Contact Us'
})

const categories = [
  'Product Inquiry',
  'Technical Support',
  'Partnerships',
  'Feedback',
  'Other'
]

const subcategories = {
  'Technical Support': [
    'Login Issues',
    'Payment Problems',
    'Feature Requests'
  ],
  'Product Inquiry': [
    'Pricing',
    'Specifications',
    'Availability'
  ],
  'Partnerships': [
    'Business Collaboration',
    'Integration Partnership',
    'Reseller Program'
  ],
  'Feedback': [
    'Product Feedback',
    'Website Feedback',
    'Service Feedback'
  ],
  'Other': [
    'General Question',
    'Press Inquiry',
    'Other'
  ]
}

const formData = reactive({
  category: '',
  subcategory: '',
  email: '',
  message: ''
})

const isSubmitting = ref(false)
const submitted = ref(false)
const emailError = ref('')

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const handleSubmit = async () => {
  // Reset errors
  emailError.value = ''
  
  // Validate email
  if (!validateEmail(formData.email)) {
    emailError.value = 'Please enter a valid email address'
    return
  }

  isSubmitting.value = true

  try {
    // Here you would typically make an API call to submit the form
    // For now, we'll simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    submitted.value = true
    // Reset form
    formData.category = ''
    formData.subcategory = ''
    formData.email = ''
    formData.message = ''
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
