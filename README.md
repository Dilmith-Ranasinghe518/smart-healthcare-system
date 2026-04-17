# Smart Healthcare System – MediSync

This project is a microservices-based Smart Healthcare System deployed with Docker and Kubernetes.

## Services

The system currently includes these backend services:

- API Gateway
- Auth Service
- User Service
- Telemedicine Service
- Prescription Service
- AI Symptom Service
- Doctor Service
- Appointment Service
- Payment Service
- Notification Service

## External Services
- Stripe
- Nodemailer
- Twillo
- Gemini AI

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Docker
- Kubernetes
- Docker Desktop Kubernetes

---

## Project Structure

```bash
smart-healthcare-system/
├── backend/
│   ├── services/
│   │   ├── api-gateway/
│   │   ├── auth-service/
│   │   ├── user-service/
│   │   ├── telemedicine-service/
│   │   ├── prescription-service/
│   │   ├── ai-symptom-service/
│   │   ├── doctor-service/
│   │   ├── appointment-service/
│   │   ├── payment-service/
│   │   └── notification-service/
│
├── k8s/
│   ├── backend/
│   │   ├── api-gateway.yaml
│   │   ├── auth-service.yaml
│   │   ├── user-service.yaml
│   │   ├── telemedicine-service.yaml
│   │   ├── prescription-service.yaml
│   │   ├── ai-symptom-service.yaml
│   │   ├── doctor-service.yaml
│   │   ├── appointment-service.yaml
│   │   ├── payment-service.yaml
│   │   └── notification-service.yaml
│   │
│   └── configs/
│       ├── configmap.yaml
│       └── secrets.yaml
