
# S3 Frontend Bucket (Private + CloudFront)

resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend12131884"
  acl    = "private"

  versioning {
    enabled = true
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  tags = {
    Name = "${var.project_name}-frontend12131884"
  }
}

# CloudFront Origin Access Identity (OAI)
resource "aws_cloudfront_origin_access_identity" "frontend_oai" {
  count   = var.enable_cloudfront ? 1 : 0
  comment = "OAI for frontend S3 bucket"
}

# S3 Bucket Policy (only allow CloudFront OAI or public if CloudFront disabled)
resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      var.enable_cloudfront ? {
        Sid       = "AllowCloudFrontOAIRead"
        Effect    = "Allow"
        Principal = { AWS = aws_cloudfront_origin_access_identity.frontend_oai[0].iam_arn }
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      } : {
        Sid       = "AllowPublicRead"
        Effect    = "Allow"
        Principal = { AWS = "*" }
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend_distribution" {
  count               = var.enable_cloudfront ? 1 : 0
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-Frontend"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend_oai[0].cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Frontend"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project_name}-frontend-cf"
  }
}

########################################
# Audio Bucket (S3)
########################################

resource "aws_s3_bucket" "audio" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = var.s3_bucket_name
    Environment = var.environment
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "audio_sse" {
  bucket = aws_s3_bucket.audio.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Lambda Function

resource "aws_lambda_function" "tts_lambda" {
  filename         = "${path.module}/../backend/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../backend/lambda.zip")
  function_name    = "ttsLambda"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.9"

  environment {
    variables = {
      OUTPUT_BUCKET    = aws_s3_bucket.audio.bucket
      PRESIGNED_EXPIRE = "3600"
    }
  }

  depends_on = [aws_s3_bucket.audio]

  lifecycle {
    ignore_changes = [
      # Ignore metadata changes that cause identity mismatch
      source_code_hash,
      filename,
    ]
  }
   kms_key_arn = aws_kms_key.tts_lambda_key.arn
}



# API Gateway

resource "aws_api_gateway_rest_api" "tts_api" {
  name = "${var.project_name}-api"
}

resource "aws_api_gateway_resource" "tts_resource" {
  rest_api_id = aws_api_gateway_rest_api.tts_api.id
  parent_id   = aws_api_gateway_rest_api.tts_api.root_resource_id
  path_part   = "tts"
}

resource "aws_api_gateway_method" "tts_post" {
  rest_api_id   = aws_api_gateway_rest_api.tts_api.id
  resource_id   = aws_api_gateway_resource.tts_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "tts_integration" {
  rest_api_id             = aws_api_gateway_rest_api.tts_api.id
  resource_id             = aws_api_gateway_resource.tts_resource.id
  http_method             = aws_api_gateway_method.tts_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.tts_lambda.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tts_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tts_api.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "tts_deployment" {
  rest_api_id = aws_api_gateway_rest_api.tts_api.id

  depends_on = [
    aws_api_gateway_integration.tts_integration
  ]
}

resource "aws_api_gateway_stage" "dev" {
  rest_api_id   = aws_api_gateway_rest_api.tts_api.id
  deployment_id = aws_api_gateway_deployment.tts_deployment.id
  stage_name    = "dev"
}
