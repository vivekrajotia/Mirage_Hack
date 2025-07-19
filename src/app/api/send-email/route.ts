import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server';

// In-memory array to keep track of scheduled emails (for prototype only)
const scheduledEmails: NodeJS.Timeout[] = [];

export async function POST(request: Request) {
  const { email, message, scheduledTime } = await request.json();

  if (!email || !message) {
    console.error('Missing required fields:', { email, message });
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });

  const htmlContent = `
    <div style="max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;font-family:Arial,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <h2 style="color:#2563eb;text-align:center;margin-bottom:16px;font-size:2rem;">Summary of Today&#39;s Report</h2>
      <p style="font-size:1.1rem;line-height:1.7;color:#334155;text-align:justify;margin:0;">
        ${message}
      </p>
    </div>
  `;

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Insights Report`,
    text: message,
    html: htmlContent,
    replyTo: email,
  };

  const sendEmail = async () => {
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent:', mailOptions);
    } catch (err: any) {
      console.error('Failed to send email:', err);
    }
  };

  if (scheduledTime && new Date(scheduledTime) > new Date()) {
    const delay = new Date(scheduledTime).getTime() - Date.now();
    const timeout = setTimeout(sendEmail, delay);
    scheduledEmails.push(timeout);
    return NextResponse.json({ message: 'Email scheduled successfully' }, { status: 200 });
  } else {
    try {
      await sendEmail();
      return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({ message: 'Failed to send email', error: err.message }, { status: 500 });
    }
  }
}