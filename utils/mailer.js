// Stub mailer - replace with Nodemailer/Resend etc.
export const sendEmail = async ({ to, template, data }) => {
  console.log(`📧 Mail sent to ${to}: ${template}`, data);
  // TODO: Implement real email service
};

export default sendEmail;
