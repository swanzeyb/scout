import { getEnv } from './env'
import sendgrid from '@sendgrid/mail'
import createTwilio from 'twilio'

const SENDGRID_KEY = getEnv('SENDGRID_KEY')
const SENDGRID_FROM = getEnv('SENDGRID_FROM')
sendgrid.setApiKey(SENDGRID_KEY)

const TWILIO_SID = getEnv('TWILIO_SID')
const TWILIO_SECRET = getEnv('TWILIO_SECRET')
const TWILIO_FROM = getEnv('TWILIO_FROM')
const twilio = createTwilio(TWILIO_SID, TWILIO_SECRET)

export async function sendEmail(subject, to, body, attachments?) {
  return await sendgrid
    .send({
      to,
      from: SENDGRID_FROM,
      subject,
      text: body,
      attachments,
    })
}

export async function sendText(to, body) {
  return await twilio
    .messages
    .create({
      body,
      to,
      from: TWILIO_FROM,
    })
}
