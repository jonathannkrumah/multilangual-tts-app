resource "aws_cloudwatch_dashboard" "tts_dashboard" {
  dashboard_name = "${var.project_name}-tts-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # 1. Custom Metrics Overview
      {
        type = "metric"
        x = 0
        y = 0
        width = 12
        height = 6
        properties = {
          metrics = [
            [ "TTSApp", "Requests" ],
            [ "TTSApp", "Successes" ],
            [ "TTSApp", "Failures" ]
          ]
          view   = "timeSeries"
          stacked = false
          region = var.region
          title  = "Custom Metrics: Requests, Successes, Failures"
        }
      },

      # 2. Lambda Health Metrics
      {
        type = "metric"
        x = 0
        y = 6
        width = 12
        height = 6
        properties = {
          metrics = [
            [ "AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.tts_lambda.function_name ],
            [ "AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.tts_lambda.function_name ],
            [ "AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.tts_lambda.function_name ]
          ]
          view   = "timeSeries"
          stacked = false
          region = var.region
          title  = "Lambda Health Metrics"
        }
      },

      # 3. Requests by Language
      {
        type = "metric"
        x = 0
        y = 12
        width = 12
        height = 6
        properties = {
          metrics = [
            [ "TTSApp", "Requests", "Language", "en" ],
            [ "TTSApp", "Requests", "Language", "fr" ],
            [ "TTSApp", "Requests", "Language", "es" ]
          ]
          view   = "timeSeries"
          stacked = false
          region = var.region
          title  = "Requests by Language"
        }
      },

      # 4. Lambda Error Rate (%)
      {
        type = "metric"
        x = 12
        y = 0
        width = 12
        height = 6
        properties = {
          metrics = [
            [ { "expression": "100 * (m1/m2)", "label": "Error Rate (%)", "id": "e1", "region": var.region } ],
            [ "AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.tts_lambda.function_name, { "id": "m1" } ],
            [ "AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.tts_lambda.function_name, { "id": "m2" } ]
          ]
          view   = "timeSeries"
          stacked = false
          region = var.region
          title  = "Lambda Error Rate (%)"
        }
      },

      # 5. Lambda Latency (p95)
      {
        type = "metric"
        x = 12
        y = 6
        width = 12
        height = 6
        properties = {
          metrics = [
            [ "AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.tts_lambda.function_name, { "stat": "p95" } ]
          ]
          view   = "timeSeries"
          stacked = false
          region = var.region
          title  = "Lambda Duration (p95 Latency)"
        }
      },

      # 6. API Gateway Metrics
      {
        type = "metric"
        x = 0
        y = 18
        width = 12
        height = 6
        properties = {
          metrics = [
            [ "AWS/ApiGateway", "4XXError", "ApiName", aws_api_gateway_rest_api.tts_api.name ],
            [ "AWS/ApiGateway", "5XXError", "ApiName", aws_api_gateway_rest_api.tts_api.name ],
            [ "AWS/ApiGateway", "Count", "ApiName", aws_api_gateway_rest_api.tts_api.name ]
          ]
          view   = "timeSeries"
          stacked = false
          region = var.region
          title  = "API Gateway: Requests and Errors"
        }
      },

      # 7. S3 Storage Metrics
      {
        type = "metric"
        x = 12
        y = 12
        width = 12
        height = 6
        properties = {
          metrics = [
            [ "AWS/S3", "NumberOfObjects", "BucketName", aws_s3_bucket.audio.bucket, "StorageType", "AllStorageTypes" ],
            [ "AWS/S3", "BucketSizeBytes", "BucketName", aws_s3_bucket.audio.bucket, "StorageType", "StandardStorage" ]
          ]
          view   = "timeSeries"
          stacked = false
          region = var.region
          title  = "S3 Storage: Object Count & Size"
        }
      }
    ]
  })
}
