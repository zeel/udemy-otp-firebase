/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Load environment variables from .env file for local development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { onRequest } = require("firebase-functions/v2/https");
const createUser = require("./create_user");
const requestOTP = require("./request_otp");
const admin = require("firebase-admin");

// Initialize Firebase Admin (uses default credentials in Cloud Functions)
if (!admin.apps.length) {
  admin.initializeApp();
}
exports.createUser = onRequest(createUser);
exports.requestOTP = onRequest(requestOTP);