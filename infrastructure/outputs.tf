# Outputs for TTS App

# Frontend URL (CloudFront if enabled, else S3 regional domain)
output "frontend_url" {
  description = "URL of the frontend application"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.frontend_distribution[0].domain_name : aws_s3_bucket.frontend.bucket_regional_domain_name
}

# API Gateway invoke URL
output "tts_api_invoke_url" {
  description = "Invoke URL of the TTS API"
  value       = aws_api_gateway_stage.dev.invoke_url
}

# Audio S3 Bucket
output "audio_bucket_name" {
  description = "Name of the S3 bucket storing audio files"
  value       = aws_s3_bucket.audio.bucket
}

# CloudFront Distribution ID (if needed for invalidation)
output "frontend_cloudfront_id" {
  description = "CloudFront Distribution ID for frontend"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.frontend_distribution[0].id : ""
}

# Cognito User Pool ID
output "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.id
}

# Cognito App Client ID
output "cognito_app_client_id" {
  description = "ID of the Cognito App Client"
  value       = aws_cognito_user_pool_client.main.id
}

# Cognito User Pool Domain
output "cognito_domain" {
  description = "Cognito User Pool Domain"
  value       = aws_cognito_user_pool_domain.main.domain
}

# Cognito Identity Pool ID
output "cognito_identity_pool_id" {
  description = "ID of the Cognito Identity Pool"
  value       = aws_cognito_identity_pool.main.id
}
