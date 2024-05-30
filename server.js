const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio'); // Example: Using Twilio for sending SMS

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// Example: Set up Twilio client
const twilioClient = twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');

// Example: Route handler for sending OTP
app.post('/api/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        // Generate OTP code
        const otpCode = generateOTP();

        // Send OTP code via SMS using Twilio
        await twilioClient.messages.create({
            body: `Your OTP code is: ${otpCode}`,
            to: phoneNumber,
            from: 'YOUR_TWILIO_PHONE_NUMBER'
        });

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// Example: Function to generate random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
