locals {
  domain_name         = "jonatech.online"
  subdomain           = "app"
  full_domain         = "${local.subdomain}.${local.domain_name}"
  s3_bucket_name      = "tts-app-frontend12131884"
  s3_website_endpoint = "${local.s3_bucket_name}.s3-website-us-east-1.amazonaws.com"
}

# ACM Certificate for both root & subdomain
resource "aws_acm_certificate" "cert" {
  domain_name               = local.domain_name
  subject_alternative_names = [local.full_domain]
  validation_method         = "DNS"
}

# DNS validation records (root + subdomain)
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# API Gateway custom domain (root)
resource "aws_apigatewayv2_domain_name" "root_domain" {
  domain_name = local.domain_name

  domain_name_configuration {
    certificate_arn = aws_acm_certificate_validation.cert_validation.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

# API Gateway custom domain (subdomain)
resource "aws_apigatewayv2_domain_name" "sub_domain" {
  domain_name = local.full_domain

  domain_name_configuration {
    certificate_arn = aws_acm_certificate_validation.cert_validation.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

# API Mappings
resource "aws_apigatewayv2_api_mapping" "root_mapping" {
  api_id      = aws_apigatewayv2_api.http_api.id
  domain_name = aws_apigatewayv2_domain_name.root_domain.domain_name
  stage       = aws_apigatewayv2_stage.default.id
}

resource "aws_apigatewayv2_api_mapping" "sub_mapping" {
  api_id      = aws_apigatewayv2_api.http_api.id
  domain_name = aws_apigatewayv2_domain_name.sub_domain.domain_name
  stage       = aws_apigatewayv2_stage.default.id
}

# Create API Gateway HTTP API
resource "aws_apigatewayv2_api" "http_api" {
  name          = "tts-http-api"
  protocol_type = "HTTP"
}

# Default stage for API Gateway
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}


# Route 53 hosted zone for jonatech.online
resource "aws_route53_zone" "main" {
  name = local.domain_name
}


# Route 53 records
resource "aws_route53_record" "root_alias" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.domain_name
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.root_domain.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.root_domain.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "sub_alias" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.full_domain
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.sub_domain.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.sub_domain.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}


resource "aws_apigatewayv2_api_mapping" "app_mapping" {
  api_id      = aws_apigatewayv2_api.http_api.id
  domain_name = aws_apigatewayv2_domain_name.sub.domain_name
  stage       = aws_apigatewayv2_stage.default.id
}

