const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

export async function sendSMS (body) {
     const messages = await client.messages
        .create({
            body: body.body,
            from: process.env.REACT_APP_TWILIO_NUMBER,
            to: body.to
        }).then(message => { console.log(message)  });
        return messages
}