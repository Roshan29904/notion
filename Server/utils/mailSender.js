
const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || "smtp.gmail.com",
            port: Number(process.env.MAIL_PORT || 587),
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        let info = await transporter.sendMail({
            from: `StudyNotion <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });

        console.log("Email sent successfully", info.messageId);
        return info;
    } catch (error) {
        console.log("Mail send failed", error.message);
        throw error;
    }
};

module.exports = mailSender;