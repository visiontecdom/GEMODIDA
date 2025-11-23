export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface WhatsAppNotification {
  to: string;
  message: string;
}

export class NotificationService {
  private sendgridApiKey = process.env.SENDGRID_API_KEY || '';
  private twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
  private twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
  private twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

  async sendEmail(notification: EmailNotification): Promise<boolean> {
    if (!this.sendgridApiKey) {
      console.warn('SendGrid API key not configured');
      return false;
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: notification.to }],
            },
          ],
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'noreply@GEMODIDA.com',
            name: 'GEMODIDA',
          },
          subject: notification.subject,
          content: [
            {
              type: 'text/html',
              value: notification.html,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error('SendGrid error:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  async sendWhatsApp(notification: WhatsAppNotification): Promise<boolean> {
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      console.warn('Twilio credentials not configured');
      return false;
    }

    try {
      const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${this.twilioPhoneNumber}`,
            To: `whatsapp:${notification.to}`,
            Body: notification.message,
          }).toString(),
        }
      );

      if (!response.ok) {
        console.error('Twilio error:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('WhatsApp sending error:', error);
      return false;
    }
  }

  async sendNotification(
    type: 'email' | 'whatsapp',
    notification: EmailNotification | WhatsAppNotification
  ): Promise<boolean> {
    if (type === 'email') {
      return this.sendEmail(notification as EmailNotification);
    } else if (type === 'whatsapp') {
      return this.sendWhatsApp(notification as WhatsAppNotification);
    }
    return false;
  }

  generateEmailTemplate(title: string, message: string, actionUrl?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .button { background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="content">
              <p>${message}</p>
              ${actionUrl ? `<p><a href="${actionUrl}" class="button">Ver Detalles</a></p>` : ''}
            </div>
            <div class="footer">
              <p>© 2025 GEMODIDA. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const notificationService = new NotificationService();
