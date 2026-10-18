/**
 * ZentroMart — WhatsApp Integration Engine
 * WhatsApp Checkout Number: +92 318 3085519 (International format: 923183085519)
 */

const WhatsAppEngine = (() => {
  const WHATSAPP_NUMBER = ZM_CONFIG.WHATSAPP_NUMBER;

  /**
   * Safe URL Generator with encodeURIComponent
   */
  function buildWhatsAppUrl(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Open WhatsApp in new tab / app
   */
  function openWhatsApp(message) {
    if (!message || message.trim() === '') {
      showToast('Message cannot be empty', 'error');
      return;
    }
    const url = buildWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Buy Now button for a single product
   */
  async function orderSingleItem(productId, quantity = 1, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const product = await ProductEngine.getProductByIdOrSlug(productId);
    if (!product) {
      showToast('Product not found', 'error');
      return;
    }

    const message = 
`Hello ZentroMart!

I would like to order:

Product: ${product.name}
Product ID: ${product.id}
Quantity: ${quantity}
Offer: 20% OFF Launch Discount Applied

Please confirm availability and delivery details.`;

    openWhatsApp(message);
  }

  /**
   * Complete Cart Checkout on WhatsApp
   * Note: Adheres strictly to the requirement:
   * - Never add price into the WhatsApp message text
   * - Add tag 20 percent off on all products
   * - Request delivery confirmation & payment options
   */
  async function checkoutCart() {
    const cartItems = await CartEngine.getCartWithProducts();
    if (!cartItems || cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    let itemsText = '';
    cartItems.forEach((item, index) => {
      const p = item.product;
      itemsText += `${index + 1}. ${p.name}\nSKU: ${p.id}\nQty: ${item.quantity}\n- 20% OFF Applied\n\n`;
    });

    const message = 
`Hello ZentroMart!

I would like to place an order.

ORDER DETAILS

${itemsText.trim()}

Please confirm availability, delivery charges and payment options.

Thank you!`;

    // Warn if message is unusually long (> 1800 chars for mobile URL safety)
    if (message.length > 1800) {
      alert("Note: Your cart contains a large number of items. WhatsApp will open with your order list.");
    }

    openWhatsApp(message);
  }

  /**
   * Floating quick contact button opener
   */
  function openGeneralSupport() {
    const message = 
`Hello ZentroMart Support!
I have a general inquiry about your multi-category store products, 20% OFF launch promotion, or delivery options.`;
    openWhatsApp(message);
  }

  return {
    openWhatsApp,
    orderSingleItem,
    checkoutCart,
    openGeneralSupport
  };
})();
