const twilio = require("./twilio");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (request, response) => {
  logger.info("Requesting OTP!", { structuredData: true });
  // verify the user provided the phone number
  if (!request.body.phone) {
    return response.status(422).send({ error: "You must provide a phone number" });
  }
  // Format the phone number to remove non-digit characters
  const rawPhone = String(request.body.phone).replace(/[^\d]/g, "");

  // fetch the user from the database
  try {
    const user = await admin.auth().getUser(rawPhone);
    if (!user) {
      return response.status(422).send({ error: "User not found" });
    }
    // generate and send OTP via SMS
    const code = twilio.generateOtp();
    try {
      const phone = `+91${rawPhone}`;
      const message = await twilio.sendOtpSms(phone, code);
      // Store OTP code in Firestore with expiration (5 minutes)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      await admin.firestore().collection("otpCodes").doc(phone).set({
        code,
        phone,
        expiresAt,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      response.send({ success: true, sid: message.sid });
    } catch (error) {
      logger.error("Error sending OTP SMS!", error);
      return response.status(422).send({ error: error.message });
    }
  } catch (error) {
    logger.error("Error fetching user!", error);
    return response.status(422).send({ error: error.message });
  }

};