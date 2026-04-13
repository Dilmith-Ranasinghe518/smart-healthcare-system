const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
};

const uniqueRecipients = (...values) => {
  return [...new Set(values.flatMap((v) => ensureArray(v)).filter(Boolean))];
};

const BRAND_NAME = "MediSync";
const BRAND_TAGLINE = "Connected Health Solutions";
const BRAND_PRIMARY = "#0E3A8A";
const BRAND_SECONDARY = "#17A2B8";
const BRAND_ACCENT = "#22C55E";
const BRAND_BG = "#F4F8FC";
const BRAND_TEXT = "#1F2937";
const BRAND_MUTED = "#6B7280";

const getLogoUrl = () =>
  process.env.EMAIL_LOGO_URL ||
  "https://via.placeholder.com/240x80.png?text=MediSync+Logo";

const buildEmailShell = ({
  title,
  preheader = "",
  intro = "",
  bodyHtml = "",
  ctaLabel = "",
  ctaUrl = "",
  footerNote = "",
}) => {
  const logoUrl = getLogoUrl();

  const ctaSection =
    ctaLabel && ctaUrl
      ? `
        <div style="text-align:center; margin: 28px 0 10px 0;">
          <a
            href="${ctaUrl}"
            style="
              display:inline-block;
              background:${BRAND_ACCENT};
              color:#ffffff;
              text-decoration:none;
              padding:14px 28px;
              border-radius:999px;
              font-size:15px;
              font-weight:700;
            "
          >
            ${ctaLabel}
          </a>
        </div>
      `
      : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin:0; padding:0; background:${BRAND_BG}; font-family:Arial, Helvetica, sans-serif; color:${BRAND_TEXT};">
        <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
          ${preheader}
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND_BG}; margin:0; padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                
                <tr>
                  <td style="background:linear-gradient(135deg, ${BRAND_PRIMARY}, ${BRAND_SECONDARY}); padding:28px 28px 18px 28px; text-align:center;">
                    <img
                      src="${logoUrl}"
                      alt="${BRAND_NAME} Logo"
                      style="max-width:260px; width:100%; height:auto; display:block; margin:0 auto 10px auto;"
                    />
                    <div style="font-size:14px; color:#DCEBFF; letter-spacing:1px; font-weight:600;">
                      ${BRAND_TAGLINE}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 28px 12px 28px;">
                    <h1 style="margin:0 0 14px 0; font-size:34px; line-height:1.2; color:${BRAND_TEXT}; font-weight:800;">
                      ${title}
                    </h1>
                    ${
                      intro
                        ? `<p style="margin:0; font-size:16px; line-height:1.7; color:${BRAND_MUTED};">${intro}</p>`
                        : ""
                    }
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 28px 8px 28px;">
                    ${bodyHtml}
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 28px 10px 28px;">
                    ${ctaSection}
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 28px 28px 28px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #E5E7EB; padding-top:20px;">
                      <tr>
                        <td style="font-size:13px; line-height:1.7; color:${BRAND_MUTED};">
                          ${footerNote || `${BRAND_NAME} • ${BRAND_TAGLINE}`}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

const buildInfoCard = (rows = []) => {
  const items = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 0; border-bottom:1px solid #EEF2F7; vertical-align:top;">
            <div style="font-size:13px; color:${BRAND_MUTED}; font-weight:700; margin-bottom:4px;">${row.label}</div>
            <div style="font-size:15px; color:${BRAND_TEXT}; line-height:1.6;">${row.value || "-"}</div>
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
      style="background:#ffffff; border:1px solid #E5E7EB; border-radius:16px; padding:0 18px;">
      ${items}
    </table>
  `;
};

const buildTwoColumnCard = ({ leftTitle, rightTitle, leftContent, rightContent }) => {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
      style="background:#ffffff; border:1px solid #E5E7EB; border-radius:18px;">
      <tr>
        <td width="55%" style="padding:20px; vertical-align:top; border-right:1px solid #EEF2F7;">
          <div style="font-size:14px; font-weight:800; color:${BRAND_PRIMARY}; margin-bottom:12px;">${leftTitle}</div>
          ${leftContent}
        </td>
        <td width="45%" style="padding:20px; vertical-align:top;">
          <div style="font-size:14px; font-weight:800; color:${BRAND_PRIMARY}; margin-bottom:12px;">${rightTitle}</div>
          ${rightContent}
        </td>
      </tr>
    </table>
  `;
};

const buildAppointmentMainCard = ({
  appointmentId,
  patientName,
  doctorName,
  appointmentType,
  date,
  startTime,
  endTime,
  hospitalName,
  address,
  city,
}) => {
  const left = `
    <div style="font-size:15px; line-height:1.8; color:${BRAND_TEXT};">
      <div style="margin-bottom:8px;"><strong>Appointment ID:</strong> ${appointmentId || "-"}</div>
      <div style="margin-bottom:8px;"><strong>Date:</strong> ${date || "-"}</div>
      <div style="margin-bottom:8px;"><strong>Time:</strong> ${startTime || "-"} - ${endTime || "-"}</div>
      <div style="margin-bottom:8px;"><strong>Hospital:</strong> ${hospitalName || "-"}</div>
      <div><strong>Location:</strong> ${address || "-"}, ${city || "-"}</div>
    </div>
  `;

  const right = `
    <div style="font-size:15px; line-height:1.8; color:${BRAND_TEXT};">
      <div style="margin-bottom:8px;"><strong>Patient:</strong> ${patientName || "-"}</div>
      <div style="margin-bottom:8px;"><strong>Doctor:</strong> ${doctorName || "-"}</div>
      <div><strong>Type:</strong> ${appointmentType || "-"}</div>
    </div>
  `;

  return buildTwoColumnCard({
    leftTitle: "Appointment Details",
    rightTitle: "Consultation Summary",
    leftContent: left,
    rightContent: right,
  });
};

const buildWelcomeUserTemplate = (payload) => {
  const { name, email, role } = payload;

  const html = buildEmailShell({
    title: "Welcome to MediSync!",
    preheader: "Your MediSync account has been created successfully.",
    intro: `Hello ${name || "User"}, your account has been created successfully. You can now use MediSync and access connected healthcare services securely.`,
    bodyHtml: buildInfoCard([
      { label: "Name", value: name || "-" },
      { label: "Email", value: email || "-" },
      { label: "Role", value: role || "user" },
    ]),
    footerNote: `${BRAND_NAME} • ${BRAND_TAGLINE}`,
  });

  return {
    to: uniqueRecipients(email),
    subject: "Welcome to MediSync",
    html,
    text: `Welcome to MediSync

Hello ${name || "User"},
Your account has been created successfully.

Name: ${name || "-"}
Email: ${email || "-"}
Role: ${role || "user"}

Thank you,
MediSync`
  };
};

const buildDoctorVerifiedTemplate = (payload) => {
  const { doctorName, doctorEmail, isVerified } = payload;

  const html = buildEmailShell({
    title: isVerified ? "Doctor Profile Verified" : "Doctor Profile Updated",
    preheader: "Your MediSync doctor profile status has changed.",
    intro: `Hello Dr. ${doctorName || "Doctor"}, your doctor profile status has been updated in MediSync.`,
    bodyHtml: buildInfoCard([
      { label: "Doctor Name", value: doctorName || "-" },
      { label: "Email", value: doctorEmail || "-" },
      { label: "Status", value: isVerified ? "Verified" : "Not Verified" },
    ]),
    footerNote: `${BRAND_NAME} • ${BRAND_TAGLINE}`,
  });

  return {
    to: uniqueRecipients(doctorEmail),
    subject: isVerified ? "Doctor Profile Verified" : "Doctor Profile Verification Update",
    html,
    text: `${isVerified ? "Doctor Profile Verified" : "Doctor Profile Update"}

Hello Dr. ${doctorName || "Doctor"},
Your doctor profile status has been updated.

Email: ${doctorEmail || "-"}
Status: ${isVerified ? "Verified" : "Not Verified"}

Thank you,
MediSync`
  };
};

const buildAppointmentBookedTemplate = (payload) => {
  const {
    patientEmail,
    doctorEmail,
    patientName,
    doctorName,
    hospitalName,
    city,
    address,
    date,
    startTime,
    endTime,
    appointmentType,
    appointmentId
  } = payload;

  const html = buildEmailShell({
    title: "Your Appointment is Confirmed!",
    preheader: "Your MediSync appointment has been booked successfully.",
    intro: `Hello ${patientName || "Patient"}, your appointment with ${doctorName || "the doctor"} has been confirmed. Please review the details below.`,
    bodyHtml: `
      ${buildAppointmentMainCard({
        appointmentId,
        patientName,
        doctorName,
        appointmentType,
        date,
        startTime,
        endTime,
        hospitalName,
        address,
        city,
      })}

      <div style="height:18px;"></div>

      ${buildTwoColumnCard({
        leftTitle: "What to Bring",
        rightTitle: "Need Help?",
        leftContent: `
          <div style="font-size:15px; color:${BRAND_TEXT}; line-height:1.9;">
            1. Photo ID or NIC<br/>
            2. Medical reports if available<br/>
            3. Current medication list
          </div>
        `,
        rightContent: `
          <div style="font-size:15px; color:${BRAND_TEXT}; line-height:1.9;">
            Contact your hospital or doctor if you need to change or confirm any details before the visit.
          </div>
        `,
      })}
    `,
    footerNote: `${BRAND_NAME} • ${BRAND_TAGLINE}`,
  });

  return {
    to: uniqueRecipients(patientEmail, doctorEmail),
    subject: "MediSync | Your Appointment is Confirmed",
    html,
    text: `Your Appointment is Confirmed

Hello ${patientName || "Patient"},
Your appointment with ${doctorName || "the doctor"} has been confirmed.

Appointment ID: ${appointmentId || "-"}
Patient: ${patientName || "-"}
Doctor: ${doctorName || "-"}
Type: ${appointmentType || "-"}
Date: ${date || "-"}
Time: ${startTime || "-"} - ${endTime || "-"}
Hospital: ${hospitalName || "-"}
Location: ${address || "-"}, ${city || "-"}

Thank you,
MediSync`
  };
};

const buildAppointmentCancelledTemplate = (payload) => {
  const {
    patientEmail,
    doctorEmail,
    patientName,
    doctorName,
    hospitalName,
    date,
    startTime,
    endTime,
    appointmentId,
    cancelledBy,
    statusReason
  } = payload;

  const html = buildEmailShell({
    title: "Appointment Cancelled",
    preheader: "A MediSync appointment has been cancelled.",
    intro: `The following appointment has been cancelled. Please review the details below.`,
    bodyHtml: buildInfoCard([
      { label: "Appointment ID", value: appointmentId || "-" },
      { label: "Patient", value: patientName || "-" },
      { label: "Doctor", value: doctorName || "-" },
      { label: "Date", value: date || "-" },
      { label: "Time", value: `${startTime || "-"} - ${endTime || "-"}` },
      { label: "Hospital", value: hospitalName || "-" },
      { label: "Cancelled By", value: cancelledBy || "-" },
      { label: "Reason", value: statusReason || "Not provided" },
    ]),
    footerNote: `${BRAND_NAME} • ${BRAND_TAGLINE}`,
  });

  return {
    to: uniqueRecipients(patientEmail, doctorEmail),
    subject: "MediSync | Appointment Cancelled",
    html,
    text: `Appointment Cancelled

Appointment ID: ${appointmentId || "-"}
Patient: ${patientName || "-"}
Doctor: ${doctorName || "-"}
Date: ${date || "-"}
Time: ${startTime || "-"} - ${endTime || "-"}
Hospital: ${hospitalName || "-"}
Cancelled By: ${cancelledBy || "-"}
Reason: ${statusReason || "Not provided"}

Thank you,
MediSync`
  };
};

const buildAppointmentRescheduledTemplate = (payload) => {
  const {
    patientEmail,
    doctorEmail,
    patientName,
    doctorName,
    hospitalName,
    date,
    startTime,
    endTime,
    appointmentId
  } = payload;

  const html = buildEmailShell({
    title: "Appointment Rescheduled",
    preheader: "Your MediSync appointment has been rescheduled.",
    intro: `Your appointment has been rescheduled. Please review the updated details below.`,
    bodyHtml: buildInfoCard([
      { label: "Appointment ID", value: appointmentId || "-" },
      { label: "Patient", value: patientName || "-" },
      { label: "Doctor", value: doctorName || "-" },
      { label: "Date", value: date || "-" },
      { label: "Time", value: `${startTime || "-"} - ${endTime || "-"}` },
      { label: "Hospital", value: hospitalName || "-" },
    ]),
    footerNote: `${BRAND_NAME} • ${BRAND_TAGLINE}`,
  });

  return {
    to: uniqueRecipients(patientEmail, doctorEmail),
    subject: "MediSync | Appointment Rescheduled",
    html,
    text: `Appointment Rescheduled

Appointment ID: ${appointmentId || "-"}
Patient: ${patientName || "-"}
Doctor: ${doctorName || "-"}
Date: ${date || "-"}
Time: ${startTime || "-"} - ${endTime || "-"}
Hospital: ${hospitalName || "-"}

Thank you,
MediSync`
  };
};

const buildAppointmentAcceptedTemplate = (payload) => {
  const {
    patientEmail,
    patientName,
    doctorName,
    hospitalName,
    date,
    startTime,
    endTime,
    appointmentId
  } = payload;

  const html = buildEmailShell({
    title: "Appointment Accepted",
    preheader: "Your MediSync appointment has been accepted by the doctor.",
    intro: `Hello ${patientName || "Patient"}, your appointment has been accepted by ${doctorName || "the doctor"}.`,
    bodyHtml: buildInfoCard([
      { label: "Appointment ID", value: appointmentId || "-" },
      { label: "Doctor", value: doctorName || "-" },
      { label: "Date", value: date || "-" },
      { label: "Time", value: `${startTime || "-"} - ${endTime || "-"}` },
      { label: "Hospital", value: hospitalName || "-" },
    ]),
    footerNote: `${BRAND_NAME} • ${BRAND_TAGLINE}`,
  });

  return {
    to: uniqueRecipients(patientEmail),
    subject: "MediSync | Appointment Accepted",
    html,
    text: `Appointment Accepted

Hello ${patientName || "Patient"},
Your appointment has been accepted by ${doctorName || "the doctor"}.

Appointment ID: ${appointmentId || "-"}
Date: ${date || "-"}
Time: ${startTime || "-"} - ${endTime || "-"}
Hospital: ${hospitalName || "-"}

Thank you,
MediSync`
  };
};

const buildAppointmentRejectedTemplate = (payload) => {
  const {
    patientEmail,
    patientName,
    doctorName,
    hospitalName,
    date,
    startTime,
    endTime,
    appointmentId,
    statusReason
  } = payload;

  const html = buildEmailShell({
    title: "Appointment Rejected",
    preheader: "Your MediSync appointment has been rejected.",
    intro: `Hello ${patientName || "Patient"}, your appointment has been rejected by ${doctorName || "the doctor"}.`,
    bodyHtml: buildInfoCard([
      { label: "Appointment ID", value: appointmentId || "-" },
      { label: "Doctor", value: doctorName || "-" },
      { label: "Date", value: date || "-" },
      { label: "Time", value: `${startTime || "-"} - ${endTime || "-"}` },
      { label: "Hospital", value: hospitalName || "-" },
      { label: "Reason", value: statusReason || "Not provided" },
    ]),
    footerNote: `${BRAND_NAME} • ${BRAND_TAGLINE}`,
  });

  return {
    to: uniqueRecipients(patientEmail),
    subject: "MediSync | Appointment Rejected",
    html,
    text: `Appointment Rejected

Hello ${patientName || "Patient"},
Your appointment has been rejected by ${doctorName || "the doctor"}.

Appointment ID: ${appointmentId || "-"}
Date: ${date || "-"}
Time: ${startTime || "-"} - ${endTime || "-"}
Hospital: ${hospitalName || "-"}
Reason: ${statusReason || "Not provided"}

Thank you,
MediSync`
  };
};

const buildAppointmentCompletedTemplate = (payload) => {
  const {
    patientEmail,
    patientName,
    doctorName,
    hospitalName,
    date,
    startTime,
    endTime,
    appointmentId
  } = payload;

  const html = buildEmailShell({
    title: "Appointment Completed",
    preheader: "Your MediSync consultation has been marked as completed.",
    intro: `Hello ${patientName || "Patient"}, your consultation with ${doctorName || "the doctor"} has been marked as completed.`,
    bodyHtml: buildInfoCard([
      { label: "Appointment ID", value: appointmentId || "-" },
      { label: "Doctor", value: doctorName || "-" },
      { label: "Date", value: date || "-" },
      { label: "Time", value: `${startTime || "-"} - ${endTime || "-"}` },
      { label: "Hospital", value: hospitalName || "-" },
    ]),
    footerNote: `${BRAND_NAME} • ${BRAND_TAGLINE}`,
  });

  return {
    to: uniqueRecipients(patientEmail),
    subject: "MediSync | Appointment Completed",
    html,
    text: `Appointment Completed

Hello ${patientName || "Patient"},
Your consultation with ${doctorName || "the doctor"} has been marked as completed.

Appointment ID: ${appointmentId || "-"}
Date: ${date || "-"}
Time: ${startTime || "-"} - ${endTime || "-"}
Hospital: ${hospitalName || "-"}

Thank you,
MediSync`
  };
};

const buildDoctorDirectMessageTemplate = (payload) => {
  const {
    patientEmail,
    patientName,
    doctorName,
    customSubject,
    customBody,
    appointmentId
  } = payload;

  const html = buildEmailShell({
    title: customSubject || `Message from Dr. ${doctorName}`,
    preheader: `You have received a new message from Dr. ${doctorName}.`,
    intro: `Hello ${patientName || "Patient"}, Dr. ${doctorName || "your doctor"} has sent you a message regarding appointment #${appointmentId || ""}.`,
    bodyHtml: `
      <div style="background:${BRAND_BG}; padding:20px; border-radius:12px; border-left:4px solid ${BRAND_PRIMARY}; margin-bottom:20px;">
        <p style="margin:0; font-size:16px; line-height:1.7; color:${BRAND_TEXT}; white-space: pre-wrap;">
          ${customBody || ""}
        </p>
      </div>
      ${buildInfoCard([
        { label: "Doctor", value: doctorName || "-" },
        { label: "Appointment ID", value: appointmentId || "-" },
      ])}
    `,
    footerNote: `${BRAND_NAME} • ${BRAND_TAGLINE}`,
  });

  return {
    to: uniqueRecipients(patientEmail),
    subject: customSubject || `MediSync | Message from Dr. ${doctorName}`,
    html,
    text: `Message from Dr. ${doctorName}
    
Hello ${patientName || "Patient"},
Dr. ${doctorName || "your doctor"} has sent you a message regarding appointment #${appointmentId || ""}:

${customBody || ""}

Thank you,
MediSync`
  };
};

const buildTemplateByEvent = (eventType, payload) => {
  switch (eventType) {
    case "WELCOME_USER":
      return buildWelcomeUserTemplate(payload);
    case "DOCTOR_VERIFIED":
      return buildDoctorVerifiedTemplate(payload);
    case "APPOINTMENT_BOOKED_PAYMENT_CONFIRMED":
      return buildAppointmentBookedTemplate(payload);
    case "APPOINTMENT_CANCELLED":
      return buildAppointmentCancelledTemplate(payload);
    case "APPOINTMENT_RESCHEDULED":
      return buildAppointmentRescheduledTemplate(payload);
    case "APPOINTMENT_ACCEPTED":
      return buildAppointmentAcceptedTemplate(payload);
    case "APPOINTMENT_REJECTED":
      return buildAppointmentRejectedTemplate(payload);
    case "APPOINTMENT_COMPLETED":
      return buildAppointmentCompletedTemplate(payload);
    case "DOCTOR_DIRECT_MESSAGE":
      return buildDoctorDirectMessageTemplate(payload);
    default:
      throw new Error(`Unsupported eventType: ${eventType}`);
  }
};

module.exports = { buildTemplateByEvent };
