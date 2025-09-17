variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "tts-app"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "enable_cloudfront" {
  description = "Whether to create a CloudFront distribution for the frontend"
  type        = bool
  default     = false
}

variable "s3_bucket_name" {
  description = "S3 bucket for audio storage"
  type        = string
}