const nodemailer = require('nodemailer');

let transporter;

if (process.env.NODE_ENV === 'production') {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  // For development, use a test account
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error('Failed to create a testing account', err);
      return;
    }
    
    transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
  });
}

const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.log('Transporter not initialized. Email would be sent in production.');
    return { messageId: 'test-message-id' };
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html
    };

    console.log('Attempting to send email:', JSON.stringify(mailOptions, null, 2));

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };