output "frontend_bucket_url" {
  value = aws_s3_bucket_website_configuration.frontend_website.website_endpoint
}


output "api_gateway_url" {
  value = "https://${aws_api_gateway_rest_api.tts_api.id}.execute-api.${var.region}.amazonaws.com/${var.environment}/tts"
}

output "api_url" {
  value = "https://${aws_api_gateway_rest_api.tts_api.id}.execute-api.${var.region}.amazonaws.com/${aws_api_gateway_stage.dev.stage_name}"
}

output "tts_audio_bucket_name" {
  value = aws_s3_bucket.audio.bucket
}

output "frontend_cloudfront_domain" {
  value = var.enable_cloudfront ? aws_cloudfront_distribution.frontend_distribution[0].domain_name : ""
}


output "tts_api_invoke_url" {
  description = "API Gateway invoke URL for TTS Lambda"
  value       = "https://${aws_api_gateway_rest_api.tts_api.id}.execute-api.${var.region}.amazonaws.com/${aws_api_gateway_stage.dev.stage_name}"
}

# outputs.tf
output "frontend_url" {
  value = var.enable_cloudfront ? aws_cloudfront_distribution.frontend_distribution[0].domain_name : aws_s3_bucket.frontend.bucket_regional_domain_name
}


output "frontend_cloudfront_id" {
  value = length(aws_cloudfront_distribution.frontend_distribution) > 0 ? aws_cloudfront_distribution.frontend_distribution[0].id : ""
  description = "CloudFront distribution ID (empty if not created)"
}



