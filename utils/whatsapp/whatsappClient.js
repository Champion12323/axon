import axios from 'axios';

const MSG91_BASE = 'https://api.msg91.com/api/v5';

const client = axios.create({
  baseURL: MSG91_BASE,
  headers: {
    'authkey':      process.env.MSG91_API_KEY,
    'Content-Type': 'application/json',
  },
});

/**
 * Send WhatsApp message via MSG91
 * @param {string} mobile - E.164 format without + (e.g. 917xxxxxxxxx)
 * @param {string} templateId - MSG91 approved template ID
 * @param {string[]} variables - Template variables in order
 */
export async function sendWhatsApp(mobile, templateId, variables) {
  // Mobile number sanitize karo
  const sanitized = mobile.replace(/\D/g, '');
  const formatted = sanitized.startsWith('91')
    ? sanitized
    : `91${sanitized}`; // India default

  try {
    const payload = {
      integrated_number: process.env.MSG91_WHATSAPP_NUMBER,
      content_type:      'template',
      payload: {
        messaging_product: 'whatsapp',
        type:              'template',
        template: {
          name:     templateId,
          language: { code: 'en' },
          components: [
            {
              type:       'body',
              parameters: variables.map(v => ({
                type: 'text',
                text: String(v),
              })),
            },
          ],
        },
        to: formatted,
      },
    };

    const { data } = await client.post('/whatsapp/whatsapp-outbound-message/bulk/', payload);

    console.log(`[WhatsApp] Sent to ${formatted}:`, data);
    return { success: true, data };

  } catch (err) {
    // WhatsApp fail hone pe app crash nahi karna
    console.error('[WhatsApp] Failed:', err.response?.data ?? err.message);
    return { success: false, error: err.message };
  }
}