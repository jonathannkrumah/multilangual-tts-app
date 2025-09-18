# Cognito User Pool for Authentication
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-user-pool"

  # User attributes
  alias_attributes         = ["email"]
  auto_verified_attributes = ["email"]

  # Password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  # User verification
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Verification code for Jonatech Multi-Langual App"
    email_message        = "Your verification code is {####}. Welcome to Jonatech Multi-Langual App!"
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # User pool add-ons
  user_pool_add_ons {
    advanced_security_mode = "ENFORCED"
  }

  # Device configuration
  device_configuration {
    challenge_required_on_new_device      = false
    device_only_remembered_on_user_prompt = false
  }

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Schema for user attributes
  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  tags = {
    Name        = "${var.project_name}-user-pool"
    Environment = var.environment
  }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project_name}-app-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # Client settings
  generate_secret                      = false
  prevent_user_existence_errors       = "ENABLED"
  enable_token_revocation              = true
  enable_propagate_additional_user_context_data = false

  # Token validity
  access_token_validity  = 60   # 1 hour
  id_token_validity      = 60   # 1 hour
  refresh_token_validity = 30   # 30 days

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  # OAuth settings
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  
  # Callback URLs for hosted UI (adjust based on your domain)
  callback_urls = [
    "http://localhost:3000/callback",
    "https://${aws_s3_bucket.frontend.bucket_regional_domain_name}/callback"
  ]
  
  logout_urls = [
    "http://localhost:3000/",
    "https://${aws_s3_bucket.frontend.bucket_regional_domain_name}/"
  ]

  # Supported identity providers
  supported_identity_providers = ["COGNITO"]

  # Auth flows
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  # Read and write attributes
  read_attributes = [
    "email",
    "email_verified",
    "name"
  ]

  write_attributes = [
    "email",
    "name"
  ]
}

# Cognito User Pool Domain for Hosted UI
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-auth-${random_string.domain_suffix.result}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Random string for unique domain
resource "random_string" "domain_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Cognito Identity Pool for AWS credentials
resource "aws_cognito_identity_pool" "main" {
  identity_pool_name      = "${var.project_name}-identity-pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.main.id
    provider_name           = aws_cognito_user_pool.main.endpoint
    server_side_token_check = false
  }

  tags = {
    Name        = "${var.project_name}-identity-pool"
    Environment = var.environment
  }
}

# IAM role for authenticated users
resource "aws_iam_role" "authenticated" {
  name = "${var.project_name}-cognito-authenticated-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-cognito-authenticated-role"
    Environment = var.environment
  }
}

# IAM policy for authenticated users
resource "aws_iam_role_policy" "authenticated" {
  name = "${var.project_name}-cognito-authenticated-policy"
  role = aws_iam_role.authenticated.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-sync:*",
          "cognito-identity:*"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach roles to identity pool
resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    authenticated = aws_iam_role.authenticated.arn
  }
}
