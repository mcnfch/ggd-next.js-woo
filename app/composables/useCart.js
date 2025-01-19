export const useCart = () => {
  const cart = useState('cart', () => []);
  const addToCartButtonStatus = ref('add');
  const removeFromCartButtonStatus = ref('remove');

  const handleAddToCart = (input) => {
    addToCartButtonStatus.value = 'loading';

    // Input is already properly structured from the component
    addToCart(input)
      .then(res => {
        const currentCart = Array.isArray(cart.value) ? cart.value : [];
        updateCart([...currentCart, res.addToCart.cartItem]);
        addToCartButtonStatus.value = 'added';
        setTimeout(() => (addToCartButtonStatus.value = 'add'), 2000);
      })
      .catch(err => {
        addToCartButtonStatus.value = 'add';
        const errorMessage = err.response?.errors?.[0]?.message
          ?.replace(/<a[^>]*>(.*?)<\/a>/g, '')
          ?.replace(/&mdash;/g, '—')
          ?.trim() || 'Failed to add item to cart';
        console.error('Add to cart error:', err);
        push.error(errorMessage);
      });
  };

  const handleRemoveFromCart = key => {
    removeFromCartButtonStatus.value = 'loading';
    updateItemQuantities({ items: [{ key, quantity: 0 }] }).then(() => {
      removeFromCartButtonStatus.value = 'remove';
      updateCart(cart.value.filter(item => item.key !== key));
    });
  };

  const updateCart = newCart => {
    cart.value = newCart;
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  onMounted(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const currentCart = Array.isArray(JSON.parse(storedCart)) ? JSON.parse(storedCart) : [];
      cart.value = currentCart;
    }
  });

  return {
    cart,
    handleAddToCart,
    addToCartButtonStatus,
    handleRemoveFromCart,
    removeFromCartButtonStatus,
  };
};
