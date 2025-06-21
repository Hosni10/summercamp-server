const getEmailTemplate = (bookingData) => {
  const {
    firstName,
    lastName,
    parentEmail,
    parentPhone,
    parentAddress,
    numberOfChildren,
    children,
    startDate,
    membershipPlan,
    location,
    totalAmountPaid,
    bookingId,
  } = bookingData;

  // Generate QR code data (you can customize this)
  const qrData = `Booking ID: ${bookingId}\nParent: ${firstName} ${lastName}\nEmail: ${parentEmail}\nPlan: ${membershipPlan}\nLocation: ${location}`;

  // Format children names
  const childrenNames = children
    .map((child) => `${child.name} (${child.age} years, ${child.gender})`)
    .join(", ");

  // Format date
  const formattedDate = new Date(startDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AFC Sports Summer Camp - Booking Confirmation</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #ed3227 0%, #c41e3a 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .ticket-title {
                font-size: 24px;
                margin-bottom: 5px;
            }
            .ticket-subtitle {
                font-size: 16px;
                opacity: 0.9;
            }
            .content {
                padding: 30px;
            }
            .booking-details {
                background-color: #f8f9fa;
                border-radius: 10px;
                padding: 25px;
                margin-bottom: 25px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e9ecef;
            }
            .detail-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            .detail-label {
                font-weight: 600;
                color: #495057;
            }
            .detail-value {
                color: #212529;
                text-align: right;
            }
            .qr-section {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 10px;
            }
            .qr-code {
                width: 120px;
                height: 120px;
                background-color: #000;
                margin: 0 auto 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                text-align: center;
                line-height: 1.2;
            }
            .important-info {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }
            .important-info h3 {
                color: #856404;
                margin-top: 0;
                margin-bottom: 15px;
            }
            .important-info ul {
                margin: 0;
                padding-left: 20px;
                color: #856404;
            }
            .important-info li {
                margin-bottom: 8px;
            }
            .footer {
                background-color: #343a40;
                color: white;
                padding: 25px;
                text-align: center;
            }
            .contact-info {
                margin-bottom: 15px;
            }
            .contact-info p {
                margin: 5px 0;
                font-size: 14px;
            }
            .social-links {
                margin-top: 15px;
            }
            .social-links a {
                color: white;
                text-decoration: none;
                margin: 0 10px;
                font-size: 14px;
            }
            .booking-id {
                background-color: #ed3227;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                display: inline-block;
                font-weight: bold;
                margin-bottom: 20px;
            }
            @media (max-width: 600px) {
                .container {
                    margin: 0;
                }
                .content {
                    padding: 20px;
                }
                .header {
                    padding: 20px;
                }
                .detail-row {
                    flex-direction: column;
                    text-align: left;
                }
                .detail-value {
                    text-align: left;
                    margin-top: 5px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">AFC SPORTS</div>
                <div class="ticket-title">SUMMER CAMP BOOKING</div>
                <div class="ticket-subtitle">Your Adventure Awaits!</div>
            </div>
            
            <div class="content">
                <div class="booking-id">
                    Booking ID: ${bookingId}
                </div>
                
                <div class="booking-details">
                    <div class="detail-row">
                        <span class="detail-label">Parent Name:</span>
                        <span class="detail-value">${firstName} ${lastName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${parentEmail}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${parentPhone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Address:</span>
                        <span class="detail-value">${parentAddress}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Children:</span>
                        <span class="detail-value">${childrenNames}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Start Date:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Plan:</span>
                        <span class="detail-value">${membershipPlan}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${
                          location === "abuDhabi" ? "Abu Dhabi" : "Al Ain"
                        }</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Amount:</span>
                        <span class="detail-value">AED ${totalAmountPaid}</span>
                    </div>
                </div>
                
                <div class="qr-section">
                    <h3 style="margin-top: 0; color: #495057;">Scan for Quick Access</h3>
                    <div class="qr-code">
                        ${qrData.replace(/\n/g, "<br>")}
                    </div>
                    <p style="margin: 0; color: #6c757d; font-size: 14px;">
                        Present this QR code at check-in
                    </p>
                </div>
                
                <div class="important-info">
                    <h3>📋 Important Information</h3>
                    <ul>
                        <li><strong>Check-in Time:</strong> 8:00 AM (Please arrive 15 minutes early)</li>
                        <li><strong>What to Bring:</strong> Comfortable sports clothes, water bottle, sunscreen</li>
                        <li><strong>Location:</strong> ${
                          location === "abuDhabi"
                            ? "ADNEC, Abu Dhabi Summer Sports"
                            : "Al Ain Sports Complex"
                        }</li>
                        <li><strong>Contact:</strong> 050 333 1468 for any questions</li>
                        <li><strong>Weather:</strong> Activities may be adjusted based on weather conditions</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <h3 style="color: #495057; margin-bottom: 15px;">🎉 Welcome to AFC Sports!</h3>
                    <p style="color: #6c757d; line-height: 1.6;">
                        We're excited to have your children join our summer camp! 
                        Our experienced coaches are ready to provide an amazing 
                        sports experience filled with fun, learning, and adventure.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <div class="contact-info">
                    <p><strong>AFC Sports Summer Camp</strong></p>
                    <p>📍 ADNEC, Abu Dhabi Summer Sports, UAE</p>
                    <p>📞 050 333 1468</p>
                    <p>✉️ info@atomicsfootball.com</p>
                </div>
                <div class="social-links">
                    <a href="#">Facebook</a> |
                    <a href="#">Instagram</a> |
                    <a href="#">Twitter</a>
                </div>
                <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
                    © 2024 AFC Sports. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = getEmailTemplate;
