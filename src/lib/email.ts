import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export interface PriceAlertEmailData {
  to: string;
  userName: string;
  productName: string;
  productImage?: string;
  currentPrice: number;
  targetPrice: number;
  retailerName: string;
  productUrl: string;
  productSlug: string;
}

export async function sendPriceAlertEmail(data: PriceAlertEmailData): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f13; color: #e5e7eb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #16161d; border: 1px solid #252533; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1d4ed8, #2563eb); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .product { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; }
    .price-box { background: #252533; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .current-price { font-size: 36px; font-weight: 700; color: #22c55e; }
    .target-price { color: #9ca3af; margin-top: 4px; }
    .cta { display: block; background: #2563eb; color: white; text-align: center; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
    .footer { padding: 24px 32px; border-top: 1px solid #252533; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>🎯 Price Alert Triggered!</h1>
        <p style="color: #bfdbfe; margin: 8px 0 0;">Your target price has been reached</p>
      </div>
      <div class="body">
        <p>Hi ${data.userName},</p>
        <p>Great news! <strong>${data.productName}</strong> has dropped to your target price on <strong>${data.retailerName}</strong>.</p>

        <div class="price-box">
          <div class="current-price">$${data.currentPrice.toFixed(2)}</div>
          <div class="target-price">Your target: $${data.targetPrice.toFixed(2)}</div>
        </div>

        <a href="${appUrl}/products/${data.productSlug}" class="cta">
          View Product & Buy Now →
        </a>
      </div>
      <div class="footer">
        <p>PC Price Tracker · <a href="${appUrl}/settings/alerts" style="color: #60a5fa;">Manage your alerts</a></p>
        <p>You're receiving this because you set a price alert. © ${new Date().getFullYear()} PC Price Tracker</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "PC Price Tracker <noreply@pcpricetracker.com>",
    to: data.to,
    subject: `💰 Price Alert: ${data.productName} is now $${data.currentPrice.toFixed(2)}`,
    html,
  });
}
