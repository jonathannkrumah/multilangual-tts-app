terraform {
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket         = "tts-terraform-state-bucket12468770040"
    key            = "app/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock-table1244500545"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region
}
