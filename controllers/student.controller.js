const Student = require("../models/student.model");
const Token = require("../models/token.model");
const OTPVerification = require("../models/OTPVerification");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Subscription = require("../models/Subscription");
const nodemailerMailgunTransport = require("nodemailer-mailgun-transport");
const sendEmail = require("../utils/sendEmail");

const auth = {
    auth: {
        api_key: process.env.MAILGUN_APIKEY,
        domain: process.env.MAILGUN_DOMAIN,
    },
};

const transporter = nodemailer.createTransport(
    nodemailerMailgunTransport(auth)
);


transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("ready for message transport");
        console.log(success);
    }
});

const handleErrors = (err) => {
    let errors = {
        username: "",
        email: "",
        password: "",
    };

    if (err.code === 11000) {
        errors.email = "Email already exist!";
        return errors;
    }

    if (err.message.includes("user validation error")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    if (err.message === "Invalid password") {
        errors.password = "Invalid email or password";
    }

    if (err.message === "Invalid email") {
        errors.email = "Invalid email or password";
    }

    return errors;
};

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "AAIRTA Email Verification Code (One Time Password)",
            html: `
           <p>Hi!</p>
           <p>We recieved a request to access your AAIRTA Account ${email} through your email address.</p>
           <p>Your One Time OTP verification code is: <h3> ${otp}</h3></p>
           <p>Please enter the OTP to verify your email address.</p>
           <p>This code <b>expires in 30 minutes</b>.</p>
           <p>If you did not request this code, it is possible that someone else is trying to access the AAIRTA Account ${email}</p>
           <p><b>Do not forward or give this code to anyone.</b></p>
           <p> If you cannot see the email from 'sandbox.mgsend.net' in your inbox, make sure to check your SPAM folder.</p>
           <P>If you have any questions, send us an email panafstraginternational@gmail.com or isholawilliams@gmail.com</P>
          <p>We’re glad you’re here!,</p>
          <p>The AAIRTA team</p>
      `,
        };

        const saltRounds = 10;
        const hashedOtp = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = await new OTPVerification({
            userId: _id,
            otp: hashedOtp,
            expiresAt: Date.now() + 1800000,
            createdAt: Date.now(),
        });

        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            successMessage: "Verification otp email sent.",
            data: { userId: _id, email },
        });
    } catch (error) {
        return res.status(200).json({
            errorMessage: error.messages,
        });
    }
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id, role) => {
    const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: maxAge,
    });
    return accessToken;
};

module.exports.signup_handler = async (req, res) => {
    const { fullName, email, studentId, department, academicLevel, gender, password, role } = req.body;
    const user = await Student.findOne({ email });
    if (user) {
        return res.status(400).json({ errorMessage: "User Already Exist" });
    }

    const student = new Student({ fullName, email, studentId, department, academicLevel, gender, password, role });

    const token = createToken(student._id, student.role);

    student.save()
        .then((user) => {
            return res.status(200).json({
                successMessage: 'Hurry! now you are successfully registred.'
            });
        })
        .catch((error) => {
            return res.json({
                errorMessage: error.message || "Something went wrong, while saving admin user account, please try again.",
            });
        });

};

module.exports.login_handler = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Student.findOne({ email });
        if (!user) {
            return res.status(400).json({ errorMessage: "Invalid credentials!" });
        }
        let auth = await bcrypt.compare(password, user.password);
        if (!auth) {
            return res.status(400).json({ errorMessage: "Invalid credentials!" });
        }

        const token = createToken(user._id, user.role);

        return res.status(200).json({
            user: user._id,
            accessToken: token,
            successMessage: 'Hurry! now you are successfully loggedIn.'
        });

    } catch (error) {
        return res.status(500).json({ errorMessage: error.message });
    }
};

module.exports.logout_handler = (req, res, next) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        return res.status(200).json({ successMessage: "Logout was successful" });
    } catch (error) {
        return res
            .status(500)
            .json({ errorMessage: "Something went wrong. Please try again" });
    }
};

module.exports.request_reset_handler = async (req, res, next) => {
    const { email } = req.body;
    try {
        let user = await Student.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ errorMessage: "User with given email does not exist" });
        }

        let token = await Token.findOne({ userId: user._id });

        // if (token) await token.deleteOne();

        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.clientURL}/passwordReset?token=${token.token}&id=${user._id}`;
        await sendEmail(
            user.email,
            "Password reset request",
            { name: user.fullName, link: link },
            "../templates/requestResetPassword.handlebars"
        );

        return res.status(200).json({
            successMessage: "Reset Password link has been sent successfully",
        });
    } catch (error) {
        return res.status(500).json({ errorMessage: "Something went wrong." });
    }
};

module.exports.reset_handler = async (req, res) => {
    const userId = req.params.userId;
    const { password } = req.body;
    try {
        let user = await Student.findById({ _id: userId });

        if (!user) {
            return res.status(400).json({ errorMessage: "Invalid link or expired." });
        }

        const passwordResetToken = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });

        if (!passwordResetToken) {
            return res.status(400).json({ errorMessage: "Invalid link or expired." });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, Number(salt));

        await Student.updateOne(
            { _id: userId },
            { $set: { password: hash } },
            { new: true }
        );

        await passwordResetToken.delete();

        await sendEmail(
            user.email,
            "Password Reset Successfully",
            {
                name: user.username,
            },
            "../templates/resetPassword.handlebars"
        );

        await passwordResetToken.deleteOne();

        return res
            .status(200)
            .json({ successMessage: "Password Reset was successfully" });
    } catch (error) {
        return res.status(500).json({ errorMessage: "Something went wrong." });
    }
};

module.exports.handle_otp_verification = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({
                errorMessage: "Empty OTP details are not allowed.",
            });
        } else {
            const userOTPVerificationRecords = await OTPVerification.find({
                userId,
            });

            if (userOTPVerificationRecords.length <= 0) {
                return res.status(400).json({
                    errorMessage:
                        "Account record doesn't exist or has been verified already. Please signup or log in",
                });
            } else {
                const { expiresAt } = userOTPVerificationRecords[0];
                const hashedOtp = userOTPVerificationRecords[0].otp;

                if (expiresAt < Date.now()) {
                    await OTPVerification.deleteMany({ userId });
                    return res.status(400).json({
                        errorMessage: "Code has expired. Please request again.",
                    });
                } else {
                    const validOtp = await bcrypt.compare(otp, hashedOtp);

                    if (!validOtp) {
                        return res.status(400).json({
                            errorMessage: "Invalid code passed. Check your inbox.",
                        });
                    } else {
                        await User.updateOne({ _id: userId }, { verified: true });
                        await OTPVerification.deleteMany({ userId });
                        const user = await User.findOne({ _id: userId });

                        const token = createToken(user._id, user.role);
                        res.cookie("jwt", token, {
                            maxAge: maxAge * 1000,
                            httpOnly: true,
                            secure: true,
                        });

                        return res.status(200).json({ user: { username: user.fullName, email: user.email, role: user.role }, successMessage: 'You are now logged in.', accessToken: token });
                    }
                }
            }
        }
    } catch (error) {
        return res.status(500).json({
            errorMessage: error.message,
        });
    }
}

module.exports.handle_resend_otp_verification = async (req, res) => {
    try {
        const { userId, email } = req.body;
        if (!userId || !email) {
            return res.status(400).json({
                errorMessage: "Empty user details are not allowed.",
            });
        } else {
            await OTPVerification.deleteMany({ userId });
            sendOTPVerificationEmail({ _id: userId, email }, res);
        }
    } catch (error) {
        return res.status(500).json({
            errorMessage: error.message,
        });
    }
}