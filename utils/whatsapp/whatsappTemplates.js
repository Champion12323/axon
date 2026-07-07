import { sendWhatsApp } from './whatsappClient.js';

/**
 * Campaign invite WhatsApp notification
 */
export async function sendCampaignInviteWhatsApp({
  mobile,
  influencerName,
  brandName,
  campaignTitle,
  budgetMin,
  budgetMax,
  currency,
  applicationDeadline,
  campaignId,
}) {
  if (!mobile) return { success: false, reason: 'No mobile number' };

  // Budget format karo
  const budget = currency === 'INR'
    ? `₹${budgetMin?.toLocaleString('en-IN')} – ₹${budgetMax?.toLocaleString('en-IN')}`
    : `${currency} ${budgetMin} – ${budgetMax}`;

  // Deadline format karo
  const deadline = new Date(applicationDeadline).toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });

  // Deep link
  const link = `${process.env.FRONTEND_URL}/campaigns/${campaignId}`;

  return sendWhatsApp(
    mobile,
    process.env.MSG91_TEMPLATE_ID,
    [
      influencerName,   // {{1}}
      brandName,        // {{2}}
      campaignTitle,    // {{3}}
      budget,           // {{4}}
      deadline,         // {{5}}
      link,             // {{6}}
    ]
  );
}