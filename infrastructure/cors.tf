
# S3 Bucket CORS

resource "aws_s3_bucket_cors_configuration" "frontend_cors" {
  bucket = aws_s3_bucket.frontend.id

  cors_rule {
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"] 
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}


# API Gateway OPTIONS Method (for CORS)

resource "aws_api_gateway_method" "tts_options" {
  rest_api_id   = aws_api_gateway_rest_api.tts_api.id
  resource_id   = aws_api_gateway_resource.tts_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "tts_options_integration" {
  rest_api_id             = aws_api_gateway_rest_api.tts_api.id
  resource_id             = aws_api_gateway_resource.tts_resource.id
  http_method             = aws_api_gateway_method.tts_options.http_method
  type                    = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "tts_options_response" {
  rest_api_id = aws_api_gateway_rest_api.tts_api.id
  resource_id = aws_api_gateway_resource.tts_resource.id
  http_method = aws_api_gateway_method.tts_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "tts_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.tts_api.id
  resource_id = aws_api_gateway_resource.tts_resource.id
  http_method = aws_api_gateway_method.tts_options.http_method
  status_code = aws_api_gateway_method_response.tts_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'" 
  }
}

# API Gateway Deployment (force redeploy on CORS/S3 CORS change)

resource "aws_api_gateway_deployment" "tts_deployment" {
  rest_api_id = aws_api_gateway_rest_api.tts_api.id

  depends_on = [
    aws_api_gateway_integration_response.tts_options_integration_response,
    aws_api_gateway_integration.tts_integration, 
    aws_s3_bucket_cors_configuration.frontend_cors
  ]
}

