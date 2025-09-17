resource "aws_api_gateway_stage" "dev" {
  rest_api_id   = aws_api_gateway_rest_api.tts_api.id
  deployment_id = aws_api_gateway_deployment.tts_deployment.id
  stage_name    = "dev"
}
