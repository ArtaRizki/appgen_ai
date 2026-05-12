import nodemailer from 'nodemailer';

export interface MessengerInput {
  platform: 'email' | 'whatsapp';
  recipients: string[]; // emails or phone numbers
  subject?: string;
  message: string;
}

export interface MessengerResult {
  platform: string;
  totalSent: number;
  totalFailed: number;
  details: { recipient: string; status: 'success' | 'failed'; error?: string }[];
}

export class MessengerService {
  async execute(input: MessengerInput): Promise<MessengerResult> {
    const { platform, recipients, subject, message } = input;

    if (platform === 'email') {
      return this.sendEmail(recipients, subject || 'Message from Aidigicube', message);
    } else {
      return this.sendWhatsApp(recipients, message);
    }
  }

  private async sendEmail(recipients: string[], subject: string, message: string): Promise<MessengerResult> {
    // Create a test account if no credentials provided
    // In production, use your SMTP server (Gmail, SendGrid, etc.)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'mock-user',
        pass: process.env.SMTP_PASS || 'mock-pass',
      },
    });

    const details: MessengerResult['details'] = [];
    let sentCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
      try {
        // In this simulated mode, we just log the send attempt
        // unless real credentials are provided
        if (process.env.SMTP_USER === 'mock-user') {
          console.log(`[SIMULATED EMAIL] To: ${recipient}, Subject: ${subject}`);
        } else {
          await transporter.sendMail({
            from: `"Aidigicube Portal" <${process.env.SMTP_FROM || 'noreply@adigicube.com'}>`,
            to: recipient,
            subject,
            text: message,
          });
        }
        
        details.push({ recipient, status: 'success' });
        sentCount++;
      } catch (err: any) {
        details.push({ recipient, status: 'failed', error: err.message });
        failCount++;
      }
    }

    return {
      platform: 'email',
      totalSent: sentCount,
      totalFailed: failCount,
      details,
    };
  }

  private async sendWhatsApp(recipients: string[], message: string): Promise<MessengerResult> {
    // Simulating WhatsApp API call (e.g., via Twilio or a custom WA Gateway)
    const details: MessengerResult['details'] = [];
    let sentCount = 0;

    for (const recipient of recipients) {
      console.log(`[SIMULATED WHATSAPP] To: ${recipient}, Message: ${message}`);
      details.push({ recipient, status: 'success' });
      sentCount++;
    }

    return {
      platform: 'whatsapp',
      totalSent: sentCount,
      totalFailed: 0,
      details,
    };
  }
}
