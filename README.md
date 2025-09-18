# Jonatech Multi-Langual App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AWS](https://img.shields.io/badge/AWS-Cloud-orange)](https://aws.amazon.com/)
[![React](https://img.shields.io/badge/React-18+-blue)](https://reactjs.org/)
[![Terraform](https://img.shields.io/badge/Terraform-Infrastructure-purple)](https://terraform.io/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-green)](https://github.com/features/actions)
[![Deploy Status](https://github.com/jonatech/multilingual-tts-app/workflows/Deploy/badge.svg)](https://github.com/jonatech/multilingual-tts-app/actions)

A cutting-edge multilingual text-to-speech and translation application powered by AWS AI services. Break language barriers with AI-powered translation and natural speech synthesis across multiple languages.

## 🌟 Features

### 🗣️ Text-to-Speech
- **Natural Voice Synthesis**: Convert text to lifelike speech using Amazon Polly
- **Multi-Language Support**: 11+ languages with native voice selection
- **Neural Engine**: Advanced neural text-to-speech for human-like quality
- **Format Options**: Multiple audio formats (MP3, OGG, PCM)
- **Voice Customization**: Choose from different voice personalities per language

### 🌍 Text Translation
- **Instant Translation**: Real-time text translation between supported languages
- **Auto-Detection**: Automatic source language detection
- **High Accuracy**: Powered by Amazon Translate for contextual understanding
- **Bidirectional**: Translate from any supported language to any other

### 🔐 Authentication & Security
- **User Registration**: Secure sign-up with email verification
- **User Authentication**: JWT-based authentication with AWS Cognito
- **Password Security**: Strong password policies and secure reset functionality
- **Session Management**: Automatic token refresh and persistent sessions
- **API Protection**: All endpoints secured with Cognito authorization
- **Advanced Security**: AWS Cognito Advanced Security Mode enabled

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first design that works on all devices
- **Professional Interface**: Clean, intuitive user experience
- **Real-time Feedback**: Loading states and progress indicators
- **Accessibility**: WCAG compliant design patterns
- **Authentication Flow**: Seamless sign-up/sign-in experience

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   API Gateway    │    │   AWS Lambda    │
│   (Frontend)    │◄──►│  (REST API +     │◄──►│   (Backend)     │
│   + Cognito SDK │    │   Cognito Auth)  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │              ┌──────────────────┐               │
         └─────────────►│  Cognito User    │               │
                        │     Pool         │               │
                        │ (Authentication) │               │
                        └──────────────────┘               │
                                 │                         │
                                 ▼                         ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │   JWT Tokens     │     │  Amazon Polly   │
                        │   (Security)     │     │ (Text-to-Speech)│
                        └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
                                                ┌─────────────────┐
                                                │ Amazon Translate│
                                                │  (Translation)  │
                                                └─────────────────┘
         ┌─────────────────┐    ┌──────────────────┐     │
         │   Amazon S3     │    │  CloudWatch      │     ▼
         │ (Static Hosting)│    │  (Monitoring)    │ ┌─────────────────┐
         └─────────────────┘    └──────────────────┘ │   Amazon S3     │
                                                     │ (Audio Storage) │
                                                     └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate permissions
- [Terraform](https://terraform.io/) >= 1.5.0
- [Node.js](https://nodejs.org/) >= 18.0.0
- [npm](https://npmjs.com/) >= 8.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jonatech/multilingual-tts-app.git
   cd multilingual-tts-app
   ```

2. **Deploy Infrastructure**
   ```bash
   cd infrastructure
   terraform init
   terraform plan
   terraform apply
   ```

3. **Build and Deploy Lambda**
   ```bash
   cd ../
   bash scripts/package_lambda.sh
   ```

4. **Deploy Frontend**
   ```bash
   bash scripts/deploy_frontend.sh
   ```

5. **Access the Application**
   ```bash
   # Get the frontend URL
   cd infrastructure
   terraform output frontend_url
   ```

## 🛠️ Technology Stack

### Frontend
- **React 19**: Modern UI library with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **JavaScript ES6+**: Modern JavaScript features and syntax
- **Amazon Cognito SDK**: JavaScript authentication library

### Backend
- **AWS Lambda**: Serverless compute for scalable backend logic
- **Python 3.9**: Runtime environment with boto3 AWS SDK
- **API Gateway**: RESTful API management with Cognito authorization

### Authentication
- **Amazon Cognito**: User pool for authentication and authorization
- **JWT Tokens**: Secure token-based authentication
- **Email Verification**: Automated user verification system
- **Password Security**: Strong password policies and reset functionality

### AI Services
- **Amazon Polly**: Neural text-to-speech synthesis
- **Amazon Translate**: Machine learning translation service

### Infrastructure
- **Terraform**: Infrastructure as Code (IaC)
- **AWS S3**: Static website hosting and audio file storage
- **AWS CloudWatch**: Monitoring and logging
- **AWS IAM**: Identity and access management
- **AWS KMS**: Key Management Service for environment encryption

### DevOps & CI/CD
- **GitHub Actions**: Automated CI/CD pipeline for continuous deployment
- **AWS CLI**: Command-line interface for AWS services
- **Bash Scripts**: Automated deployment and build processes

## 🌐 Supported Languages

| Language | Code | Polly Voice | Translation |
|----------|------|-------------|-------------|
| English | `en` | Joanna (Neural) | ✅ |
| French | `fr` | Lea (Neural) | ✅ |
| German | `de` | Hans (Neural) | ✅ |
| Spanish | `es` | Conchita (Neural) | ✅ |
| Italian | `it` | Carla (Neural) | ✅ |
| Portuguese | `pt` | Ines (Neural) | ✅ |
| Japanese | `ja` | Mizuki (Neural) | ✅ |
| Korean | `ko` | Seoyeon (Neural) | ✅ |
| Arabic | `ar` | Zeina (Standard) | ✅ |
| Russian | `ru` | Maxim (Standard) | ✅ |
| Dutch | `nl` | Lotte (Standard) | ✅ |

## 📁 Project Structure

```
multilingual-tts-app/
├── README.md                 # Project documentation
├── .gitignore               # Git ignore patterns
├── .github/                 # GitHub Actions workflows
│   └── workflows/
│       ├── deploy-backend.yml   # Backend CI/CD pipeline
│       └── deploy-frontend.yml  # Frontend CI/CD pipeline
├── backend/                 # Lambda function code
│   ├── lambda_function.py   # Main Lambda handler
│   └── lambda.zip          # Packaged deployment artifact
├── frontend/               # React application
│   └── tts-frontend/
│       ├── src/           # React source code
│       ├── public/        # Static assets
│       ├── build/         # Production build
│       └── package.json   # Node.js dependencies
├── infrastructure/        # Terraform configurations
│   ├── main.tf           # Core infrastructure
│   ├── iam.tf            # Identity and access management
│   ├── cors.tf           # Cross-origin resource sharing
│   ├── dashboard.tf      # CloudWatch dashboard
│   ├── outputs.tf        # Infrastructure outputs
│   └── variables.tf      # Input variables
└── scripts/              # Deployment automation
    ├── deploy_frontend.sh # Frontend deployment script
    └── package_lambda.sh  # Lambda packaging script
```

## 🔧 Configuration

### Environment Variables

**Frontend** (set during build):
```bash
REACT_APP_TTS_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/dev
```

**Backend** (set via Terraform):
```bash
OUTPUT_BUCKET=your-audio-storage-bucket
PRESIGNED_EXPIRE=3600
```

### Terraform Variables

Create `terraform.tfvars` in the `infrastructure/` directory:
```hcl
# Required
s3_bucket_name = "your-unique-audio-bucket-name"
region = "us-east-1"

# Optional
project_name = "tts-app"
environment = "dev"
enable_cloudfront = false
```

## 🚀 API Endpoints

> **🔐 Authentication Required**: All API endpoints require a valid JWT token from Cognito authentication.

### Authentication
All API requests must include an Authorization header with a valid JWT token:
```http
Authorization: Bearer <jwt_token>
```

### Text-to-Speech
```http
POST /tts
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "text": "Hello, world!",
  "target_language": "en",
  "voice": "Joanna",
  "engine": "neural",
  "format": "mp3"
}
```

**Response:**
```json
{
  "audio_key": "tts/20231218T120000Z_abc123.mp3",
  "url": "https://presigned-s3-url...",
  "voice": "Joanna"
}
```

### Text Translation
```http
POST /translate
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "text": "Hello, world!",
  "source_language": "en",
  "target_language": "fr"
}
```

**Response:**
```json
{
  "translated_text": "Bonjour le monde!",
  "source_language": "en",
  "target_language": "fr"
}
```

## 📊 Monitoring

The application includes comprehensive monitoring via AWS CloudWatch:

- **Lambda Metrics**: Invocation count, duration, errors, throttles
- **API Gateway Metrics**: Request count, latency, 4XX/5XX errors
- **Custom Dashboards**: Real-time performance visualization
- **Alarms**: Automated notifications for critical issues

Access the dashboard:
```bash
cd infrastructure
terraform output dashboard_url
```

## 🔒 Security

- **IAM Roles**: Least-privilege access principles
- **API Gateway**: Rate limiting and throttling
- **CORS**: Proper cross-origin resource sharing configuration
- **KMS Encryption**: Environment variable encryption
- **S3 Security**: Bucket policies and access controls

## 🧪 Testing

### Frontend Testing
```bash
cd frontend/tts-frontend
npm test
```

### Backend Testing
```bash
# Direct Lambda invocation
aws lambda invoke \
  --function-name ttsLambda \
  --payload '{"body":"{\"text\":\"test\",\"target_language\":\"en\"}"}' \
  response.json
```

### API Testing
```bash
# Note: All endpoints require authentication
# First, obtain a JWT token by signing in through the web interface

# Test text-to-speech endpoint (requires authentication)
curl -X POST https://your-api-url/dev/tts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"text":"Hello world","target_language":"en"}'

# Test translation endpoint (requires authentication)
curl -X POST https://your-api-url/dev/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"text":"Hello","source_language":"en","target_language":"fr"}'
```

## 🚀 Deployment

### CI/CD with GitHub Actions

The project includes automated CI/CD pipeline using GitHub Actions that automatically deploys changes when you push to the repository:

#### Automated Workflows
- **Backend Deployment**: Triggered on changes to `backend/` directory
  - Packages Lambda function using `scripts/package_lambda.sh`
  - Updates AWS Lambda function with new code
  - Runs automatically on push to main branch

- **Frontend Deployment**: Triggered on changes to `frontend/` directory
  - Builds React application with production optimizations
  - Deploys to S3 using `scripts/deploy_frontend.sh` 
  - Updates static website hosting automatically

#### Workflow Benefits
- ✅ **Zero Downtime**: Seamless deployments without service interruption
- ✅ **Automatic Testing**: Runs tests before deployment
- ✅ **Rollback Capability**: Easy reversion to previous versions
- ✅ **Environment Consistency**: Same deployment process across environments

#### GitHub Secrets Required
Configure these secrets in your GitHub repository settings:
```bash
AWS_ACCESS_KEY_ID          # AWS access key for deployment
AWS_SECRET_ACCESS_KEY      # AWS secret key for deployment  
AWS_DEFAULT_REGION         # AWS region (e.g., us-east-1)
REACT_APP_TTS_API_URL     # API Gateway URL for frontend
```

#### Environment Variables (Auto-configured)
The following environment variables are automatically set during deployment:
```bash
REACT_APP_COGNITO_USER_POOL_ID     # Cognito User Pool ID
REACT_APP_COGNITO_APP_CLIENT_ID    # Cognito App Client ID  
REACT_APP_COGNITO_REGION           # AWS region for Cognito
```

### Manual Deployment
For local development and testing:

```bash
# Deploy everything manually
./scripts/deploy_all.sh

# Deploy only frontend
./scripts/deploy_frontend.sh

# Deploy only backend
./scripts/package_lambda.sh
aws lambda update-function-code --function-name ttsLambda --zip-file fileb://backend/lambda.zip
```

### Infrastructure Deployment
1. **Initial Setup**: `terraform apply` in `infrastructure/`
2. **Backend**: Automated via GitHub Actions or manual scripts
3. **Frontend**: Automated via GitHub Actions or manual scripts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Jonatech Consult** - *Initial work* - [Jonatech](https://github.com/jonatech)

## 🙏 Acknowledgments

- AWS for providing robust AI services
- React team for the excellent frontend framework
- Terraform for infrastructure automation
- The open-source community for continuous inspiration

## 📞 Support

For support, email [support@jonatech.com](mailto:support@jonatech.com) or join our [Discord community](https://discord.gg/jonatech).

## 🗺️ Roadmap

- [ ] **Authentication**: Cognito user pools integration
- [ ] **Custom Domains**: Route 53 DNS configuration
- [ ] **HTTPS**: CloudFront distribution with SSL
- [ ] **Voice Customization**: Custom voice training
- [ ] **Batch Processing**: Multiple file processing
- [ ] **Real-time Streaming**: WebSocket-based live translation
- [ ] **Mobile Apps**: React Native iOS/Android applications

---

<div align="center">
  <strong>Built with ❤️ by Jonatech Consult</strong>
  <br>
  <sub>Empowering global communication through AI</sub>
</div>