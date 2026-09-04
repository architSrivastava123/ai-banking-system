const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegisterMail(username,email){
  const subject = 'Welcome to Our Service!';
  const text = `Hello ${username},\n\nThank you for registering with our service! We're excited to have you on board.\n\nBest regards,\nThe Team`;
  const html = `<p>Hello ${username},</p><p>Thank you for registering with our service! We're excited to have you on board.</p><p>Best regards,<br>The Team</p>`;
  await sendEmail(email, subject, text, html);
}

async function sendTransactionMail(username,email,amount,fromAccount,toAccount){
  const subject = 'Transaction Notification';
  const text = `Hello ${username},\n\nA transaction of amount ${amount} has been made from account ${fromAccount} to account ${toAccount}.\n\nBest regards,\nThe Team`;
  const html = `<p>Hello ${username},</p><p>A transaction of amount <strong>${amount}</strong> has been made from account <strong>${fromAccount}</strong> to account <strong>${toAccount}</strong>.</p><p>Best regards,<br>The Team</p>`;
  await sendEmail(email, subject, text, html);
}

async function sendTransactionFailedMail(username,email,amount,fromAccount,toAccount){
  const subject = 'Transaction Failed Notification';
  const text = `Hello ${username},\n\nWe regret to inform you that a transaction of amount ${amount} from account ${fromAccount} to account ${toAccount} has failed.\n\nPlease check your account and try again.\n\nBest regards,\nThe Team`;
  const html = `<p>Hello ${username},</p><p>We regret to inform you that a transaction of amount <strong>${amount}</strong> from account <strong>${fromAccount}</strong> to account <strong>${toAccount}</strong> has failed.</p><p>Please check your account and try again.</p><p>Best regards,<br>The Team</p>`;
  await sendEmail(email, subject, text, html);
}

module.exports = { sendRegisterMail, sendTransactionMail, sendTransactionFailedMail };