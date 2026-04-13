const axios = require("axios");

function simplifyDoctor(doctor) {
  return {
    _id: doctor._id,
    name: doctor.name,
    specialization: doctor.specialization,
    qualifications: doctor.qualifications || [],
    experience: doctor.experience || 0,
    locations: (doctor.locations || []).map((location) => ({
      hospitalName: location.hospitalName,
      city: location.city,
      address: location.address,
      consultationFee: location.consultationFee
    }))
  };
}

async function getRecommendedDoctorsBySpecialty(specialization) {
  try {
    const baseUrl = process.env.USER_SERVICE_URL;

    if (!baseUrl || !specialization) {
      return [];
    }

    const response = await axios.get(`${baseUrl}/api/doctors`, {
      params: { specialization }
    });

    const doctors = response?.data?.doctors || [];

    return doctors.slice(0, 5).map(simplifyDoctor);
  } catch (error) {
    console.error("Doctor recommendation fetch failed:", error.message);
    return [];
  }
}

module.exports = { getRecommendedDoctorsBySpecialty };