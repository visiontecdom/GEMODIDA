import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

// Configuración de proveedores de email
const EMAIL_PROVIDERS = {
  GMAIL_OAUTH2: 'gmail_oauth2',
  SMTP: 'smtp',
  SENDGRID: 'sendgrid'
};

// Configuración actual del proveedor (puede cambiarse dinámicamente)
const CURRENT_PROVIDER = process.env.EMAIL_PROVIDER || EMAIL_PROVIDERS.SMTP;

// Configurar Gmail OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

// Crear transporter según configuración de BD
const createTransporter = async () => {
  try {
    // Obtener configuración activa desde la base de datos
    const { data: configData, error: configError } = await (supabase() as any).rpc('get_active_email_config');

    if (configError) {
      throw new Error('Error obteniendo configuración de email: ' + configError.message);
    }

    if (!configData) {
      throw new Error('No hay proveedor de email activo configurado. Configure un proveedor en el panel de administración.');
    }

    const provider = (configData as any).provider;
    const config = (configData as any).config;

    console.log(`📧 Usando proveedor: ${provider}`);

    switch (provider) {
      case 'gmail_oauth2':
        return await createGmailOAuth2Transporter(config);

      case 'smtp':
        return createSMTPTransporter(config);

      case 'sendgrid':
        return await createSendGridTransporter(config);

      default:
        throw new Error(`Proveedor no soportado: ${provider}`);
    }
  } catch (error) {
    throw new Error('Error configurando proveedor de email: ' + (error as Error).message);
  }
};

// Gmail OAuth2 Transporter
const createGmailOAuth2Transporter = async (config: any) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      config.client_id,
      config.client_secret,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: config.refresh_token
    });

    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        type: 'OAuth2',
        user: config.from_email,
        clientId: config.client_id,
        clientSecret: config.client_secret,
        refreshToken: config.refresh_token,
        accessToken: accessToken.token,
      },
      tls: {
        rejectUnauthorized: false,
      },
    } as any);

    return transporter;
  } catch (error) {
    throw new Error('Error configurando Gmail OAuth2: ' + (error as Error).message);
  }
};

// SMTP Transporter (para cuentas empresariales)
const createSMTPTransporter = (config: any) => {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: parseInt(config.port || '587'),
    secure: config.secure === 'true' || config.secure === true,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  } as any);

  return transporter;
};

// SendGrid Transporter (fallback)
const createSendGridTransporter = async (config: any) => {
  throw new Error('SendGrid no está soportado actualmente. Use SMTP o Gmail OAuth2.');
};

export async function POST(request: NextRequest) {
  try {
    const { token, userEmail, userName } = await request.json();

    if (!token || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Obtener configuración activa
    const { data: configData, error: configError } = await (supabase() as any).rpc('get_active_email_config');

    if (configError) {
      return NextResponse.json(
        { error: 'Error obteniendo configuración de email: ' + configError.message },
        { status: 500 }
      );
    }

    if (!configData) {
      return NextResponse.json(
        { error: 'No hay proveedor de email activo configurado. Configure un proveedor en el panel de administración.' },
        { status: 500 }
      );
    }

    console.log(`📧 Enviando email con proveedor: ${(configData as any).provider}`);

    // Crear transporter según el proveedor configurado
    const transporter = await createTransporter();

    // Configurar el email usando la configuración de BD
    const mailOptions = {
      from: {
        name: (configData as any).config.from_name || 'GEMODIDA Sistema',
        address: (configData as any).config.from_email || 'noreply@gemodida.com'
      },
      to: userEmail,
      subject: 'Código de recuperación de contraseña - GEMODIDA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de Contraseña - GEMODIDA</h2>
          <p>Hola <strong>${userName}</strong>,</p>
          <p>Has solicitado recuperar tu contraseña en el sistema GEMODIDA.</p>
          <p>Tu código de verificación es:</p>
          <div style="background-color: #f8f9fa; border: 2px solid #007bff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${token}</h1>
          </div>
          <p><strong>Importante:</strong></p>
          <ul>
            <li>Este código expira en 15 minutos.</li>
            <li>Si no solicitaste este cambio, ignora este mensaje.</li>
            <li>El código es único y solo puede usarse una vez.</li>
          </ul>
          <p>Si tienes alguna duda, contacta al administrador del sistema.</p>
          <br>
          <p>Saludos,<br>Equipo GEMODIDA</p>
        </div>
      `,
      text: `
        Recuperación de Contraseña - GEMODIDA

        Hola ${userName},

        Has solicitado recuperar tu contraseña en el sistema GEMODIDA.

        Tu código de verificación es: ${token}

        Importante:
        - Este código expira en 15 minutos.
        - Si no solicitaste este cambio, ignora este mensaje.
        - El código es único y solo puede usarse una vez.

        Si tienes alguna duda, contacta al administrador del sistema.

        Saludos,
        Equipo GEMODIDA
      `,
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: `Email enviado exitosamente via ${(configData as any).provider}`,
      provider: (configData as any).provider
    });

  } catch (error: any) {
    console.error('Error enviando email:', error);

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}