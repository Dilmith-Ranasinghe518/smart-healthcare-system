const VALID_SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "ENT",
  "Gastroenterology",
  "General Practitioner",
  "General Surgery",
  "Gynecology",
  "Internal Medicine",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Urology",
  "Dentistry",
  "Other"
];

function normalizeSpecialty(input) {
  if (!input || typeof input !== "string") {
    return "General Practitioner";
  }

  const raw = input.trim().toLowerCase();

  const aliasMap = {
    "general physician": "General Practitioner",
    "general doctor": "General Practitioner",
    "gp": "General Practitioner",
    "family medicine": "General Practitioner",
    "family physician": "General Practitioner",
    "ear nose throat": "ENT",
    "ent specialist": "ENT",
    "bone": "Orthopedics",
    "orthopaedic": "Orthopedics",
    "orthopedic": "Orthopedics",
    "lung": "Pulmonology",
    "chest": "Pulmonology",
    "children": "Pediatrics",
    "child specialist": "Pediatrics",
    "women": "Gynecology",
    "eye": "Ophthalmology",
    "mental health": "Psychiatry",
    "skin": "Dermatology",
    "stomach": "Gastroenterology",
    "brain": "Neurology",
    "heart": "Cardiology",
    "urinary": "Urology",
    "teeth": "Dentistry"
  };

  if (aliasMap[raw]) {
    return aliasMap[raw];
  }

  const exact = VALID_SPECIALTIES.find(
    (item) => item.toLowerCase() === raw
  );

  if (exact) {
    return exact;
  }

  const contains = VALID_SPECIALTIES.find((item) =>
    raw.includes(item.toLowerCase())
  );

  if (contains) {
    return contains;
  }

  return "General Practitioner";
}

module.exports = {
  VALID_SPECIALTIES,
  normalizeSpecialty
};