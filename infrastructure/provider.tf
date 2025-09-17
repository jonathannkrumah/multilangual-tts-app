terraform {
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket         = "tts-terraform-state-bucket12468789797"
    key            = "app/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock-table124455"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region
}
