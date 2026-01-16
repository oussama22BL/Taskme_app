const nodemailer = require('nodemailer');


/**
 * Service d'envoi d'email pour Taskme
 * @param {Object} options - Contient email, subject, name, role, code
 */
const sendEmail = async (options) => {
    // 1. Créer le transporteur (Configuration SMTP)
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Ou utilisez un autre service comme Mailtrap pour les tests
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS  // Utilisez un "Mot de passe d'application" Google
        }
    });

    // 2. Définir le contenu HTML de l'email (Design Taskme)
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
            <div style="background-color: #4f46e5; padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 800;">TASKME</h1>
                <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Administration Système</p>
            </div>
            
            <div style="padding: 40px; background-color: #ffffff;">
                <h2 style="margin-top: 0; color: #0f172a;">Bienvenue, ${options.name} !</h2>
                <p style="line-height: 1.6;">Votre compte <strong>${options.role}</strong> a été créé avec succès par l'administrateur système.</p>
                <p style="line-height: 1.6;">Vous pouvez désormais vous connecter à la plateforme en utilisant les informations suivantes :</p>
                
                <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
                    <p style="margin: 0 0 10px; font-size: 12px; font-weight: bold; color: #64748b; uppercase; letter-spacing: 1px;">Votre code d'accès temporaire</p>
                    <span style="font-size: 32px; font-weight: 900; color: #4f46e5; letter-spacing: 4px;">${options.code}</span>
                </div>

                <p style="font-size: 13px; color: #ef4444; font-weight: 600;">⚠️ Pour votre sécurité, veuillez changer votre mot de passe dès votre première connexion dans l'onglet "Profil".</p>
            </div>

            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                Ceci est un email automatique, merci de ne pas y répondre.<br>
                &copy; 2024 Taskme Audit System
            </div>
        </div>
    `;

    // 3. Options de l'email
    const mailOptions = {
        from: `"Taskme Administration" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: htmlContent
    };

    // 4. Envoi réel
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;