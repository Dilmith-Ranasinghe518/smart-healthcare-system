const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
};

const uniqueRecipients = (...values) => {
  return [...new Set(values.flatMap((v) => ensureArray(v)).filter(Boolean))];
};

const buildWelcomeUserTemplate = (payload) => {
  const { name, email, role } = payload;

  return {
    to: uniqueRecipients(email),
    subject: "Welcome to Smart Healthcare",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Welcome to Smart Healthcare</h2>
        <p>Hello ${name || "User"},</p>
        <p>Your account has been created successfully.</p>
        <p><strong>Role:</strong> ${role || "user"}</p>
        <p>You can now log in and use the platform services.</p>
        <p>Thank you,<br/>Smart Healthcare Team</p>
      </div>
    `,
    text: `Welcome to Smart Healthcare

Hello ${name || "User"},
Your account has been created successfully.
Role: ${role || "user"}

You can now log in and use the platform services.

Thank you,
Smart Healthcare Team`
  };
};

const buildDoctorVerifiedTemplate = (payload) => {
  const { doctorName, doctorEmail, isVerified } = payload;

  return {
    to: uniqueRecipients(doctorEmail),
    subject: isVerified
      ? "Doctor Profile Verified"
      : "Doctor Profile Verification Update",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>${isVerified ? "Doctor Profile Verified" : "Doctor Profile Update"}</h2>
        <p>Hello Dr. ${doctorName || "Doctor"},</p>
        <p>Your doctor profile verification status has been updated.</p>
        <p><strong>Status:</strong> ${isVerified ? "Verified" : "Not Verified"}</p>
        <p>Please log in to check your dashboard for the latest details.</p>
        <p>Thank you,<br/>Smart Healthcare Team</p>
      </div>
    `,
    text: `${isVerified ? "Doctor Profile Verified" : "Doctor Profile Update"}

Hello Dr. ${doctorName || "Doctor"},
Your doctor profile verification status has been updated.
Status: ${isVerified ? "Verified" : "Not Verified"}

Please log in to check your dashboard for the latest details.

Thank you,
Smart Healthcare Team`
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

  return {
    to: uniqueRecipients(patientEmail, doctorEmail),
    subject: "Appointment Booking Confirmed",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Appointment Booking Confirmed</h2>
        <p>Hello,</p>
        <p>An appointment has been successfully confirmed.</p>
        <ul>
          <li><strong>Appointment ID:</strong> ${appointmentId || "-"}</li>
          <li><strong>Patient:</strong> ${patientName || "-"}</li>
          <li><strong>Doctor:</strong> ${doctorName || "-"}</li>
          <li><strong>Type:</strong> ${appointmentType || "-"}</li>
          <li><strong>Date:</strong> ${date || "-"}</li>
          <li><strong>Time:</strong> ${startTime || "-"} - ${endTime || "-"}</li>
          <li><strong>Hospital:</strong> ${hospitalName || "-"}</li>
          <li><strong>Location:</strong> ${address || "-"}, ${city || "-"}</li>
        </ul>
        <p>Thank you,<br/>Smart Healthcare Team</p>
      </div>
    `,
    text: `Appointment Booking Confirmed

Appointment ID: ${appointmentId || "-"}
Patient: ${patientName || "-"}
Doctor: ${doctorName || "-"}
Type: ${appointmentType || "-"}
Date: ${date || "-"}
Time: ${startTime || "-"} - ${endTime || "-"}
Hospital: ${hospitalName || "-"}
Location: ${address || "-"}, ${city || "-"}

Thank you,
Smart Healthcare Team`
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

  return {
    to: uniqueRecipients(patientEmail, doctorEmail),
    subject: "Appointment Cancelled",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Appointment Cancelled</h2>
        <p>The following appointment has been cancelled.</p>
        <ul>
          <li><strong>Appointment ID:</strong> ${appointmentId || "-"}</li>
          <li><strong>Patient:</strong> ${patientName || "-"}</li>
          <li><strong>Doctor:</strong> ${doctorName || "-"}</li>
          <li><strong>Date:</strong> ${date || "-"}</li>
          <li><strong>Time:</strong> ${startTime || "-"} - ${endTime || "-"}</li>
          <li><strong>Hospital:</strong> ${hospitalName || "-"}</li>
          <li><strong>Cancelled By:</strong> ${cancelledBy || "-"}</li>
          <li><strong>Reason:</strong> ${statusReason || "Not provided"}</li>
        </ul>
        <p>Thank you,<br/>Smart Healthcare Team</p>
      </div>
    `,
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
Smart Healthcare Team`
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

  return {
    to: uniqueRecipients(patientEmail, doctorEmail),
    subject: "Appointment Rescheduled",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Appointment Rescheduled</h2>
        <p>Your appointment has been rescheduled.</p>
        <ul>
          <li><strong>Appointment ID:</strong> ${appointmentId || "-"}</li>
          <li><strong>Patient:</strong> ${patientName || "-"}</li>
          <li><strong>Doctor:</strong> ${doctorName || "-"}</li>
          <li><strong>Date:</strong> ${date || "-"}</li>
          <li><strong>Time:</strong> ${startTime || "-"} - ${endTime || "-"}</li>
          <li><strong>Hospital:</strong> ${hospitalName || "-"}</li>
        </ul>
        <p>Thank you,<br/>Smart Healthcare Team</p>
      </div>
    `,
    text: `Appointment Rescheduled

Appointment ID: ${appointmentId || "-"}
Patient: ${patientName || "-"}
Doctor: ${doctorName || "-"}
Date: ${date || "-"}
Time: ${startTime || "-"} - ${endTime || "-"}
Hospital: ${hospitalName || "-"}

Thank you,
Smart Healthcare Team`
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

  return {
    to: uniqueRecipients(patientEmail),
    subject: "Appointment Accepted by Doctor",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Appointment Accepted</h2>
        <p>Hello ${patientName || "Patient"},</p>
        <p>Your appointment has been accepted by Dr. ${doctorName || "Doctor"}.</p>
        <ul>
          <li><strong>Appointment ID:</strong> ${appointmentId || "-"}</li>
          <li><strong>Date:</strong> ${date || "-"}</li>
          <li><strong>Time:</strong> ${startTime || "-"} - ${endTime || "-"}</li>
          <li><strong>Hospital:</strong> ${hospitalName || "-"}</li>
        </ul>
        <p>Thank you,<br/>Smart Healthcare Team</p>
      </div>
    `,
    text: `Appointment Accepted

Hello ${patientName || "Patient"},
Your appointment has been accepted by Dr. ${doctorName || "Doctor"}.

Appointment ID: ${appointmentId || "-"}
Date: ${date || "-"}
Time: ${startTime || "-"} - ${endTime || "-"}
Hospital: ${hospitalName || "-"}

Thank you,
Smart Healthcare Team`
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

  return {
    to: uniqueRecipients(patientEmail),
    subject: "Appointment Rejected",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Appointment Rejected</h2>
        <p>Hello ${patientName || "Patient"},</p>
        <p>Your appointment has been rejected by Dr. ${doctorName || "Doctor"}.</p>
        <ul>
          <li><strong>Appointment ID:</strong> ${appointmentId || "-"}</li>
          <li><strong>Date:</strong> ${date || "-"}</li>
          <li><strong>Time:</strong> ${startTime || "-"} - ${endTime || "-"}</li>
          <li><strong>Hospital:</strong> ${hospitalName || "-"}</li>
          <li><strong>Reason:</strong> ${statusReason || "Not provided"}</li>
        </ul>
        <p>Thank you,<br/>Smart Healthcare Team</p>
      </div>
    `,
    text: `Appointment Rejected

Hello ${patientName || "Patient"},
Your appointment has been rejected by Dr. ${doctorName || "Doctor"}.

Appointment ID: ${appointmentId || "-"}
Date: ${date || "-"}
Time: ${startTime || "-"} - ${endTime || "-"}
Hospital: ${hospitalName || "-"}
Reason: ${statusReason || "Not provided"}

Thank you,
Smart Healthcare Team`
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

  return {
    to: uniqueRecipients(patientEmail),
    subject: "Appointment Completed",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Appointment Completed</h2>
        <p>Hello ${patientName || "Patient"},</p>
        <p>Your consultation with Dr. ${doctorName || "Doctor"} has been marked as completed.</p>
        <ul>
          <li><strong>Appointment ID:</strong> ${appointmentId || "-"}</li>
          <li><strong>Date:</strong> ${date || "-"}</li>
          <li><strong>Time:</strong> ${startTime || "-"} - ${endTime || "-"}</li>
          <li><strong>Hospital:</strong> ${hospitalName || "-"}</li>
        </ul>
        <p>Thank you,<br/>Smart Healthcare Team</p>
      </div>
    `,
    text: `Appointment Completed

Hello ${patientName || "Patient"},
Your consultation with Dr. ${doctorName || "Doctor"} has been marked as completed.

Appointment ID: ${appointmentId || "-"}
Date: ${date || "-"}
Time: ${startTime || "-"} - ${endTime || "-"}
Hospital: ${hospitalName || "-"}

Thank you,
Smart Healthcare Team`
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
    default:
      throw new Error(`Unsupported eventType: ${eventType}`);
  }
};

module.exports = { buildTemplateByEvent };