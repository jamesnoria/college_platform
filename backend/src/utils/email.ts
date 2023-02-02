import AWS from 'aws-sdk';
import { IUser } from '../models/userModel';

// TODO: Integrar con PUG
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

class Email {
  to: string;
  message: string;
  subject: string;
  firstName: string;
  from: string;

  constructor(user: IUser, message: string, subject: string) {
    this.to = user.email;
    this.message = message;
    this.subject = subject;
    this.firstName = user.name.split(' ')[0];
    this.from = `James Noria <${process.env.EMAIL_FROM}>`;
  }

  params() {
    return {
      Destination: {
        ToAddresses: [this.to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: this.message,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: this.subject,
        },
      },
      Source: this.from,
    };
  }

  async send() {
    const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(this.params()).promise();
    return sendPromise;
  }
}

export default Email;
