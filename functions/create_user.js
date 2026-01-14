const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

module.exports = async (request, response) => {
  logger.info("Creating user!", { structuredData: true });
  // verify the user provided the phone number
  if (!request.body.phone) {
    return response.status(422).send({ error: "Bad Input" });
  }
  // Format the phone number to remove dashes and spaces
  const phone = String(request.body.phone).replace(/[^\d]/g, '');

  // create new user in the database using the phone number
  try {
    const user = await admin.auth().createUser({
      uid: phone,
    });
    response.send(user);
  } catch (error) {
    logger.error("Error creating user!", error);
    response.status(422).send({ error: error.message });
  }
};
