const twilio = require("twilio");
const logger = require("firebase-functions/logger");
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Generate a random 6-digit OTP code as a string.
 * @return {string} A 6-digit OTP code.
 */
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  client,
  generateOtp,
  /**
   * Send an OTP code via SMS using Twilio.
   * @param {string} phone The destination phone number.
   * @param {string} code The OTP code to send.
   * @return {Promise<object>} The Twilio message response.
   */
  sendOtpSms: async (phone, code) => {
    return client.messages.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: `Your verification code is: ${code}`,
    }).then((message) => {
      return message.sid;
    })
      .catch((error) => {
        logger.error("Error sending OTP SMS!", error);
        throw error;
      });
  },
};