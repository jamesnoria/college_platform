import { IUser } from '../models/userModel';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// TODO: Integrar con PUG
const client = new SESClient({ region: 'us-east-1' });

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
    return client.send(new SendEmailCommand(this.params()));
  }
}

export default Email;
