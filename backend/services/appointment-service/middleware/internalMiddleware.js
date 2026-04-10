const protectInternal = (req, res, next) => {
  const incomingSecret = req.headers["x-internal-service-secret"];

  if (!incomingSecret || incomingSecret !== process.env.INTERNAL_SERVICE_SECRET) {
    return res.status(403).json({ message: "Forbidden internal request" });
  }

  next();
};

module.exports = { protectInternal };