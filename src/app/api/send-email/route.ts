import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    console.error('Missing required fields:', { name, email, message });
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
    subject: `Contact from ${name}`,
    text: message,
    html: htmlContent,
    replyTo: email,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent:', mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Failed to send email:', err);
    return NextResponse.json({ message: 'Failed to send email', error: err.message }, { status: 500 });
  }
}