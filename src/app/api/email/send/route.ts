import { NextRequest, NextResponse } from 'next/server';
import * as nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, htmlContent, folio } = await request.json();

    if (!to || !subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: to, subject, htmlContent' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Create transporter (using Gmail SMTP as example)
    // In production, these should be environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-header {
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .email-content {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .email-footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            h1, h2, h3 {
              color: #2c3e50;
              margin-top: 25px;
              margin-bottom: 15px;
            }
            h1 {
              font-size: 1.8em;
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
            }
            h2 {
              font-size: 1.4em;
              color: #e74c3c;
            }
            h3 {
              font-size: 1.2em;
            }
            p {
              margin: 10px 0;
            }
            ul, ol {
              margin: 15px 0;
              padding-left: 30px;
            }
            li {
              margin: 5px 0;
            }
            strong {
              font-weight: 600;
            }
            em {
              font-style: italic;
            }
            u {
              text-decoration: underline;
            }
            blockquote {
              border-left: 4px solid #3498db;
              padding-left: 20px;
              margin: 20px 0;
              color: #555;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="email-header">
            <h1 style="color: #2c3e50; margin: 0;">📄 Cotización Legal</h1>
            ${folio ? `<p style="color: #666; margin: 5px 0 0 0;">Folio: <strong>${folio}</strong></p>` : ''}
          </div>
          
          <div class="email-content">
            ${htmlContent}
          </div>
          
          <div class="email-footer">
            <p>Enviado desde Lawgic Cotizaciones Express</p>
            <p style="font-size: 11px; color: #999;">
              Este documento fue generado automáticamente. Para cualquier consulta, responde a este email.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Email enviado exitosamente',
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Handle specific nodemailer errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        return NextResponse.json(
          { error: 'Error de configuración SMTP: credenciales inválidas' },
          { status: 500 }
        );
      }
      if (error.message.includes('getaddrinfo ENOTFOUND')) {
        return NextResponse.json(
          { error: 'Error de conexión SMTP: servidor no encontrado' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor al enviar email' },
      { status: 500 }
    );
  }
}