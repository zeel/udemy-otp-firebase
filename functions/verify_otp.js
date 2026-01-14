const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (request, response) => {
  logger.info("Verifying OTP!", { structuredData: true });
  // verify the user provided the phone number and OTP
  if (!request.body.phone || !request.body.otp) {
    return response.status(422).send({ error: "You must provide a phone number and OTP" });
  }
  // Format the phone number to remove non-digit characters
  const rawPhone = String(request.body.phone).replace(/[^\d]/g, "");
  // verify the OTP
  const otp = await admin.firestore().collection("otpCodes").doc(rawPhone).get();
  if (!otp.exists) {
    return response.status(422).send({ error: "OTP not found" });
  }
  // verify the OTP
  if (parseInt(otp.data().code) !== parseInt(request.body.otp)) {
    return response.status(422).send({ error: "Invalid OTP" });
  }
  // verify the OTP has not expired
  if (new Date(otp.data().expiresAt) < new Date()) {
    return response.status(422).send({ error: "OTP has expired" });
  }
  // verify the OTP is for the correct phone number
  if (String(otp.data().phone) !== String(rawPhone)) {
    return response.status(422).send({ error: "Invalid phone number" });
  }

  // Optionally delete OTP after successful verification
  await admin.firestore().collection("otpCodes").doc(rawPhone).delete();

  try {
    const token = await admin.auth().createCustomToken(rawPhone);
    return response.send({ success: true, token });
  } catch (error) {
    logger.error("Error creating custom token!", error);
    return response.status(422).send({ error: error.message });
  }
};