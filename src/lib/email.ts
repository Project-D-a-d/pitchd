// Email templates and functions
export const emailTemplates = {
  bookingConfirmation: (name: string, pitchName: string, date: string, time: string) => ({
    subject: '✓ Booking Confirmed - Pitch\'d',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Booking Confirmed! ⚽</h1>
        <p>Hi ${name},</p>
        <p>Your pitch booking has been confirmed:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Pitch:</strong> ${pitchName}</p>
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${time}</p>
        </div>
        <p>See you on the pitch! 🏆</p>
        <p>— Pitch'd Team</p>
      </div>
    `,
  }),

  paymentConfirmation: (name: string, seatPackName: string, price: string, renewalDate: string) => ({
    subject: '💳 Subscription Activated - Pitch\'d',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Pitch'd! 🎉</h1>
        <p>Hi ${name},</p>
        <p>Your subscription is now active. Here's what you've got:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Plan:</strong> ${seatPackName}</p>
          <p><strong>Price:</strong> €${price}/month</p>
          <p><strong>Renews:</strong> ${new Date(renewalDate).toLocaleDateString()}</p>
        </div>
        <p>You can now manage your team's pitch bookings. Happy coaching! 🏆</p>
        <p>— Pitch'd Team</p>
      </div>
    `,
  }),

  coachApprovalNotification: (coachName: string, clubName: string, status: 'approved' | 'rejected') => ({
    subject: status === 'approved'
      ? '✓ You\'re Approved! - Pitch\'d'
      : '✗ Request Not Approved - Pitch\'d',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">
          ${status === 'approved' ? 'Welcome to ' + clubName + '! 🎉' : 'Request Update'}
        </h1>
        <p>Hi ${coachName},</p>
        ${status === 'approved'
          ? `<p>Great news! You've been approved as a coach for ${clubName}. You can now book pitches and manage your team.</p>`
          : `<p>Unfortunately, your coach request for ${clubName} was not approved at this time. Please contact the club admin for more information.</p>`
        }
        <p>— Pitch'd Team</p>
      </div>
    `,
  }),
}

// Send email function (placeholder - will use Resend or similar)
export async function sendEmail(to: string, template: { subject: string; html: string }) {
  try {
    // TODO: Integrate with Resend or SendGrid
    console.log(`Email sent to ${to}: ${template.subject}`)
    return { success: true }
  } catch (err) {
    console.error('Failed to send email:', err)
    return { success: false, error: err }
  }
}
