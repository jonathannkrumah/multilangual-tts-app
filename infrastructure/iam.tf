resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Attach AWS managed policies
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "polly_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonPollyFullAccess"
}

# Execution role for Lambda
resource "aws_iam_role" "lambda_exec" {
  name = "tts-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Inline IAM policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "tts-lambda-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # Logs
      {
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      },
      # Polly
      {
        Action   = ["polly:SynthesizeSpeech"]
        Effect   = "Allow"
        Resource = "*"
      },
      # S3 (audio bucket)
      {
        Action   = ["s3:PutObject", "s3:GetObject", "s3:ListBucket"]
        Effect   = "Allow"
        Resource = [
          "arn:aws:s3:::${aws_s3_bucket.audio.bucket}",
          "arn:aws:s3:::${aws_s3_bucket.audio.bucket}/*"
        ]
      },
      # Translate
      {
        Action   = ["translate:TranslateText"]
        Effect   = "Allow"
        Resource = "*"
      },
      # Comprehend
      {
        Action   = ["comprehend:DetectDominantLanguage"]
        Effect   = "Allow"
        Resource = "*"
      },
      # Custom metrics (PutMetricData for CloudWatch)
      {
        Action   = ["cloudwatch:PutMetricData"]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Grant Lambda role permission to decrypt environment variables encrypted with KMS
resource "aws_iam_role_policy" "lambda_kms_access" {
  name = "lambda-kms-decrypt"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "arn:aws:kms:us-east-1:164229328614:key/693044c0-a953-4017-9479-61c6677decdd"
      }
    ]
  })
}

