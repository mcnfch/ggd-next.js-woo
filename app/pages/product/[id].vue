<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
const { isOpenImageSliderModal } = useComponents();

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const thumbsSwiper = ref(null);
const setThumbsSwiper = swiper => {
  thumbsSwiper.value = swiper;
};

const modules = [Navigation, Pagination, Thumbs];

const route = useRoute();
const slug = computed(() => route.params.id || '');

const productResult = ref({});
const selectedAttributes = ref({});
const loading = ref(true);

onMounted(async () => {
  try {
    if (slug.value) {
      const data = await getProduct(slug.value, '');
      productResult.value = data.product;
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  } finally {
    loading.value = false;
  }
});

const product = computed(() => productResult.value || {});

const normalizeString = (str) => str?.toLowerCase().trim();

// Get only attributes that need selection (have multiple options)
const selectableAttributes = computed(() => {
  return product.value?.attributes?.nodes?.filter(attr => 
    attr.options.length > 1
  ) || [];
});

// Initialize and normalize selectedAttributes
watch(() => product.value?.attributes?.nodes, (attrs) => {
  if (attrs) {
    attrs.forEach(attr => {
      const normalizedName = normalizeString(attr.name);
      if (attr.options.length === 1) {
        // Auto-select single options silently
        selectedAttributes.value[normalizedName] = normalizeString(attr.options[0]);
      } else if (!selectedAttributes.value[normalizedName]) {
        selectedAttributes.value[normalizedName] = '';
      }
    });
  }
}, { immediate: true });

// Find matching variation based on normalized attributes
const selectedVariation = computed(() => {
  if (!product.value?.variations?.nodes) return null;

  return product.value.variations.nodes.find(variation => {
    return variation.attributes.nodes.every(attr => {
      const normalizedAttrName = normalizeString(attr.name);
      const selectedValue = normalizeString(selectedAttributes.value[normalizedAttrName]);
      const variationValue = normalizeString(attr.value);
      
      return selectedValue === variationValue;
    });
  });
});

// Check if all required options are selected
const allOptionsSelected = computed(() => {
  if (!product.value?.attributes?.nodes) return false;
  
  return product.value.attributes.nodes.every(attr => {
    const normalizedName = normalizeString(attr.name);
    const selected = selectedAttributes.value[normalizedName];
    return selected && selected !== '';
  });
});

const priceDisplay = computed(() => {
  // If no variation is selected, show the product's price range
  if (!selectedVariation.value) {
    return {
      current: product.value?.regularPrice, // This will be the price range
      sale: false,
      original: null
    };
  }

  // If variation is selected, show its specific price
  const variation = selectedVariation.value;
  const isSale = variation.salePrice !== null;
  
  return {
    current: isSale ? variation.salePrice : variation.regularPrice,
    sale: isSale,
    original: isSale ? variation.regularPrice : null
  };
});

const calculateDiscountPercentage = computed(() => {
  if (!product.value?.salePrice || !product.value?.regularPrice) return 0;
  const salePriceValue = parseFloat(product.value.salePrice.replace(/[^0-9]/g, ''));
  const regularPriceValue = parseFloat(product.value.regularPrice.replace(/[^0-9]/g, ''));
  return Math.round(((salePriceValue - regularPriceValue) / regularPriceValue) * 100);
});

const { handleAddToCart, addToCartButtonStatus } = useCart();

const handleAddToCartClick = () => {
  if (!allOptionsSelected.value) {
    console.error('Cannot add to cart: Not all options selected', {
      selections: selectedAttributes.value
    });
    return;
  }

  if (!selectedVariation.value?.databaseId) {
    console.error('Cannot add to cart: No matching variation found', {
      selections: selectedAttributes.value,
      variations: product.value?.variations?.nodes.map(v => ({
        id: v.databaseId,
        attributes: v.attributes.nodes.map(a => ({
          name: a.name,
          value: a.value
        }))
      }))
    });
    return;
  }

  // Ensure correct input structure for GraphQL mutation
  const input = {
    input: {
      productId: parseInt(product.value.databaseId),
      variationId: parseInt(selectedVariation.value.databaseId),
      quantity: 1
    }
  };

  // Call mutation with properly structured input
  handleAddToCart(input);
};
</script>

<template>
  <ProductSkeleton v-if="loading || !product?.name" />
  <div v-else class="justify-center flex flex-col lg:flex-row lg:mx-5">
    <ButtonBack />
    <div class="mr-6 mt-5 pt-2.5 max-xl:hidden">
      <swiper :modules="modules" @swiper="setThumbsSwiper" class="product-images-thumbs w-14">
        <swiper-slide v-if="product.image?.sourceUrl" class="cursor-pointer rounded-xl overflow-hidden border-2 border-white dark:border-black">
          <NuxtImg
            :alt="product.name"
            class="h-full w-full border-2 border-white bg-neutral-200 dark:bg-neutral-800 dark:border-black rounded-[10px]"
            :src="product.image.sourceUrl" />
        </swiper-slide>
        <swiper-slide 
          v-for="(node, i) in product.galleryImages?.nodes" 
          :key="i"
          class="cursor-pointer rounded-xl overflow-hidden border-2 border-white dark:border-black">
          <NuxtImg 
            :alt="product.name" 
            class="h-full w-full border-2 border-white bg-neutral-200 dark:bg-neutral-800 dark:border-black rounded-[10px]" 
            :src="node.sourceUrl" />
        </swiper-slide>
      </swiper>
    </div>
    <div class="flex lg:p-5 lg:gap-5 flex-col lg:flex-row lg:border lg:border-transparent lg:dark:border-[#262626] lg:rounded-[32px] lg:shadow-[0_1px_20px_rgba(0,0,0,.15)] lg:mt-2.5 select-none">
      <div class="relative">
        <swiper
          :style="{
            '--swiper-navigation-size': '16px',
            '--swiper-navigation-color': '#000',
            '--swiper-pagination-color': 'rgb(0 0 0 / 50%)',
          }"
          :spaceBetween="4"
          :slidesPerView="1.5"
          :pagination="{
            dynamicBullets: true,
          }"
          :navigation="true"
          :modules="modules"
          :thumbs="{ swiper: thumbsSwiper }"
          class="lg:w-[530px] lg:h-[530px] xl:w-[600px] xl:h-[600px] lg:rounded-2xl">
          <swiper-slide v-if="product.image?.sourceUrl" @click="isOpenImageSliderModal = true">
            <NuxtImg :alt="product.name" class="h-full w-full bg-neutral-200 dark:bg-neutral-800" :src="product.image.sourceUrl" />
          </swiper-slide>
          <swiper-slide 
            v-for="(node, i) in product.galleryImages?.nodes" 
            :key="i" 
            @click="isOpenImageSliderModal = true">
            <NuxtImg :alt="product.name" class="h-full w-full bg-neutral-200 dark:bg-neutral-800" :src="node.sourceUrl" />
          </swiper-slide>
        </swiper>
      </div>
      <ImageSliderWithModal :product="product" v-model="isOpenImageSliderModal" />
      <div class="w-full lg:max-w-[28rem]">
        <div class="flex-col flex gap-4 lg:max-h-[530px] xl:max-h-[600px] overflow-hidden">
          <div class="p-3 lg:pb-4 lg:p-0 border-b border-[#efefef] dark:border-[#262626]">
            <h1 class="text-2xl font-semibold mb-1">{{ product.name }}</h1>
            <div class="flex justify-between flex-row items-baseline">
              <div class="flex flex-row items-baseline">
                <p 
                  class="text-xl font-bold"
                  :class="{ 'text-alizarin-crimson-700': priceDisplay.sale }"
                  v-html="priceDisplay.current"
                ></p>
                <template v-if="priceDisplay.sale">
                  <div class="flex-wrap items-baseline flex-row flex">
                    <p class="text-sm ml-2">Originally:</p>
                    <p class="text-sm ml-1 line-through" v-html="priceDisplay.original"></p>
                  </div>
                </template>
              </div>
            </div>
            
          </div>

          <div class="pb-4 px-3 lg:px-0 border-b border-[#efefef] dark:border-[#262626]">
            <!-- Only show attributes that have multiple options -->
            <div v-for="attr in selectableAttributes" :key="attr.name">
              <div class="text-sm font-semibold leading-5 opacity-50 flex gap-1">
                {{ attr.name }}:
                <div class="uppercase">{{ selectedAttributes[normalizeString(attr.name)] }}</div>
              </div>
              <div class="mt-2 mb-4">
                <select 
                  v-model="selectedAttributes[normalizeString(attr.name)]"
                  class="w-full py-2 px-3 rounded-md cursor-pointer select-variation border-2 border-[#9b9b9b] dark:border-[#8c8c8c] transition-all duration-200 focus:outline-none focus:border-alizarin-crimson-700"
                >
                  <option value="">Select {{ attr.name }}</option>
                  <option 
                    v-for="option in attr.options"
                    :key="option"
                    :value="normalizeString(option)"
                    class="font-semibold"
                  >
                    {{ option }}
                  </option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <button
                @click="handleAddToCartClick"
                :disabled="!allOptionsSelected"
                class="button-bezel w-full h-12 rounded-md relative tracking-wide font-semibold text-white text-sm flex justify-center items-center"
              >
                <Transition name="slide-up">
                  <div v-if="addToCartButtonStatus === 'add'" class="absolute">Add to Cart</div>
                  <div v-else-if="addToCartButtonStatus === 'loading'" class="absolute">Adding...</div>
                  <div v-else-if="addToCartButtonStatus === 'added'" class="absolute">Added to Cart!</div>
                </Transition>
              </button>
              <div 
                v-if="!allOptionsSelected" 
                class="text-alizarin-crimson-600 text-center text-sm mt-2"
              >
                Please select all options before adding to cart
              </div>
            </div>
          </div>
          <div class="px-3 lg:px-0">
            <div class="text-base mb-2 font-semibold">Featured Information</div>
            <div
              class="description leading-7 text-sm overflow-y-scroll max-h-40 border border-gray-300"
              style="overflow-y: scroll; max-height: 10rem; border: 1px solid #d1d5db;"
            >
              <ul>
                <div v-html="product.description"></div>
                <br />
                <li>
                  Free returns within 10 days. Click for detailed
                  <a class="underline" href="#">information</a>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  <div class="text-lg lg:text-xl lg:text-center font-semibold mt-4 pt-4 px-3 border-t border-[#efefef] dark:border-[#262626] lg:border-none">Shop similar</div>
  <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-4 px-3 lg:px-5 xl:px-8 mt-4 lg:mt-5">
    <ProductCard :products="product.related?.nodes" />
    <ProductsSkeleton v-if="!product.name" />
  </div>
</template>

<style lang="postcss">
.product-images-thumbs .swiper-wrapper {
  @apply flex-col gap-3;
}
.product-images-thumbs .swiper-slide-thumb-active {
  @apply border-black dark:border-white;
}
.swiper-button-next,
.swiper-button-prev {
  @apply bg-white/50 hover:bg-white p-6 rounded-full flex items-center justify-center shadow transition backdrop-blur-sm;
}

.swiper-button-prev.swiper-button-disabled,
.swiper-button-next.swiper-button-disabled {
  @apply hidden;
}

.swiper-pagination {
  @apply bg-white/50 shadow-sm rounded-full py-1 backdrop-blur-sm;
}

.selected-varitaion,
.select-varitaion:hover:not(.disabled) {
  @apply border-alizarin-crimson-700 dark:border-alizarin-crimson-700 text-alizarin-crimson-700 bg-red-700/10;
}

.disabled {
  @apply opacity-40 cursor-default;
}

.button-bezel {
  box-shadow: 0 0 0 var(--button-outline, 0px) rgb(222, 92, 92, 0.3), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
    0 1px 2px 0 rgba(0, 0, 0, 0.5);
  @apply bg-alizarin-crimson-700 outline-none tracking-[-0.125px] transition scale-[var(--button-scale,1)] duration-200;
  &:hover {
    @apply bg-alizarin-crimson-600;
  }
  &:active {
    --button-outline: 4px;
    --button-scale: 0.975;
  }
}

.description ul li {
  background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxlbGxpcHNlIHJ5PSIzIiByeD0iMyIgY3k9IjMiIGN4PSIzIiBmaWxsPSIjYzljOWM5Ii8+PC9zdmc+)
    no-repeat 0 0.7rem;
  padding-left: 0.938rem;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease 0s, opacity 0.3s ease 0s;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0);
}
</style>
