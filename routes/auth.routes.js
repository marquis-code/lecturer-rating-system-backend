const { Router } = require("express");
const {
  signup_handler,
  login_handler,
  logout_handler,
  reset_handler,
  request_reset_handler,
  handle_otp_verification,
  handle_resend_otp_verification,
  handle_subscription
} = require("../controllers/auth.controller");

const router = Router();

router.post("/signup", signup_handler);

router.post("/login", login_handler);

router.get("/logout", logout_handler);

router.post("/password-reset", request_reset_handler);

router.post("/verifyOtp", handle_otp_verification);

router.post("/password-reset/:userId/:token", reset_handler);

router.post('/resendOTPVerificationCode', handle_resend_otp_verification)

router.post('/subscribe', handle_subscription)

module.exports = router;
