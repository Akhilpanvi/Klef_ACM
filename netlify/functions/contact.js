import nodemailer from 'nodemailer';
import { supabase } from './utils/db.js';

export async function handler(event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { name, email, subject, message } = JSON.parse(event.body || '{}');

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name, email, and message are required fields.' }),
      };
    }

    // SMTP Credentials from environment or configured defaults
    // Note: App password formatted without spaces
    const smtpUser = process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'Bhaanugali@gmail.com';
    const rawSmtpPass = process.env.SMTP_PASS || 'yhqx nxzt dvgv pcjz';
    const smtpPass = rawSmtpPass.replace(/\s+/g, '');
    const adminRecipient = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'Bhaanugali@gmail.com';

    // Create Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true, // Use SSL for port 465
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // Prevent self-signed cert issues
      },
    });

    const emailSubject = subject ? `[KLEF ACM Enquiry] ${subject}` : `[KLEF ACM Enquiry] New message from ${name}`;

    // 1. Notification Email sent to Admin Inbox
    const adminMailOptions = {
      from: `"KLEF ACM Website Enquiry" <${smtpUser}>`,
      to: adminRecipient,
      replyTo: email,
      subject: emailSubject,
      text: `New Chapter Enquiry Received:

Name: ${name}
Email: ${email}
Subject: ${subject || 'General Enquiry'}
Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Message:
${message}
`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <div style="background-color: #0085CA; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 1.25rem;">KLEF ACM — New Contact Enquiry</h2>
            <p style="color: #e0f2fe; margin: 4px 0 0 0; font-size: 0.85rem;">Koneru Lakshmaiah Education Foundation Student Chapter</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.95rem;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 120px; font-weight: bold;">Sender Name:</td>
              <td style="padding: 8px 0; color: #1e293b;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Sender Email:</td>
              <td style="padding: 8px 0; color: #0085CA;"><a href="mailto:${email}" style="color: #0085CA;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Subject:</td>
              <td style="padding: 8px 0; color: #1e293b;">${subject || 'General Enquiry'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Timestamp:</td>
              <td style="padding: 8px 0; color: #64748b; font-size: 0.85rem;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border-left: 4px solid #0085CA; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 0.95rem;">Message Content:</h4>
            <p style="margin: 0; color: #334155; line-height: 1.6; white-space: pre-wrap; font-size: 0.9rem;">${message}</p>
          </div>

          <p style="font-size: 0.8rem; color: #94a3b8; margin: 0; text-align: center;">
            This email was automatically generated from the contact form at KLEF ACM Student Chapter website.
          </p>
        </div>
      `,
    };

    // 2. Automated Confirmation Email sent to the Inquirer
    const userConfirmationMailOptions = {
      from: `"KLEF ACM Student Chapter" <${smtpUser}>`,
      to: email,
      subject: `Confirmation: We received your enquiry — KLEF ACM Student Chapter`,
      text: `Dear ${name},

Thank you for contacting the KLEF ACM Student Chapter at Koneru Lakshmaiah Education Foundation.

We have received your message regarding: "${subject || 'General Enquiry'}".

Our chapter coordinator or representative will review your inquiry and get back to you shortly.

Summary of your message:
----------------------------------------
${message}
----------------------------------------

Warm regards,
KLEF ACM Student Chapter (KLEF ACM)
Department of Computer Science and Engineering
Koneru Lakshmaiah Education Foundation (Deemed to be University)
Green Fields, Vaddeswaram, Guntur, AP - 522302
`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <div style="background-color: #0085CA; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 24px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 1.3rem;">KLEF ACM Student Chapter</h2>
            <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 0.85rem;">Koneru Lakshmaiah Education Foundation (Deemed to be University)</p>
          </div>

          <p style="font-size: 1rem; color: #1e293b; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
          
          <p style="font-size: 0.95rem; color: #334155; line-height: 1.6;">
            Thank you for reaching out to the <strong>KLEF ACM Student Chapter (KLEF ACM)</strong>. We have successfully received your inquiry and our team will get in touch with you shortly.
          </p>

          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 0.85rem; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Your Submission Details:</p>
            <p style="margin: 4px 0; font-size: 0.9rem; color: #1e293b;"><strong>Subject:</strong> ${subject || 'General Enquiry'}</p>
            <p style="margin: 4px 0; font-size: 0.9rem; color: #1e293b;"><strong>Message:</strong></p>
            <p style="margin: 4px 0; font-size: 0.85rem; color: #475569; font-style: italic; white-space: pre-wrap; background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">${message}</p>
          </div>

          <p style="font-size: 0.9rem; color: #475569; line-height: 1.6;">
            If you have urgent queries regarding chapter memberships, technical workshops, or upcoming coding events, feel free to visit our CSE Department campus desk.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

          <div style="font-size: 0.8rem; color: #64748b; line-height: 1.5;">
            <strong>KLEF ACM Student Chapter</strong><br />
            Department of Computer Science & Engineering<br />
            Koneru Lakshmaiah Education Foundation<br />
            Green Fields, Vaddeswaram, Andhra Pradesh – 522302
          </div>
        </div>
      `,
    };

    // Send Admin Notification Email
    await transporter.sendMail(adminMailOptions);

    // Send Confirmation Email to Inquirer (catch non-fatal error so response still succeeds)
    try {
      await transporter.sendMail(userConfirmationMailOptions);
    } catch (userMailErr) {
      console.warn('Could not send confirmation copy to inquirer email:', userMailErr.message);
    }

    // Optional: Log to database if Supabase is connected
    try {
      if (supabase) {
        await supabase.from('audit_logs').insert({
          action: 'contact_form_submission',
          resource: 'contact',
          details: `Enquiry from ${name} (${email}) - Subject: ${subject || 'None'}`,
        });
      }
    } catch (dbErr) {
      // Non-blocking database logging error
      console.warn('Supabase audit log skipped:', dbErr.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Your inquiry has been submitted successfully and confirmation emails have been sent.',
      }),
    };
  } catch (err) {
    console.error('Contact form submission error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process inquiry. Please check your network or try again later.',
        details: err.message,
      }),
    };
  }
}
