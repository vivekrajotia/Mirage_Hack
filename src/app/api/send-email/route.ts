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

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Contact from ${name}`,
    text: message,
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