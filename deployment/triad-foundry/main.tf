terraform {
  required_version = ">= 1.9.8, < 2.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.100.0"
    }
  }
}
provider "aws" {
  alias  = "sydney"
  region = "ap-southeast-2"
}
provider "aws" {
  alias  = "oregon"
  region = "us-west-2"
}
variable "deployment_id" {
  type = string
  validation {
    condition     = can(regex("^[a-z0-9-]{3,32}$", var.deployment_id))
    error_message = "Supply a distinct staging deployment identity."
  }
}
resource "aws_vpc" "sydney" {
  provider             = aws.sydney
  cidr_block           = "10.100.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags                 = { Name = "keddeh-${var.deployment_id}-sydney", Authority = "a.keddeh", Tier = "Triad-Canary" }
  lifecycle { prevent_destroy = true }
}
resource "aws_vpc" "oregon" {
  provider             = aws.oregon
  cidr_block           = "10.200.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags                 = { Name = "keddeh-${var.deployment_id}-oregon", Authority = "a.keddeh", Tier = "Triad-Canary" }
  lifecycle { prevent_destroy = true }
}
resource "aws_subnet" "sydney" {
  provider                = aws.sydney
  vpc_id                  = aws_vpc.sydney.id
  cidr_block              = "10.100.1.0/24"
  availability_zone       = "ap-southeast-2a"
  map_public_ip_on_launch = false
  tags                    = { Name = "keddeh-${var.deployment_id}-sydney-private" }
}
resource "aws_subnet" "oregon" {
  provider                = aws.oregon
  vpc_id                  = aws_vpc.oregon.id
  cidr_block              = "10.200.1.0/24"
  availability_zone       = "us-west-2a"
  map_public_ip_on_launch = false
  tags                    = { Name = "keddeh-${var.deployment_id}-oregon-private" }
}
resource "aws_security_group" "sydney" {
  provider    = aws.sydney
  name        = "keddeh-${var.deployment_id}-sydney-grpc"
  description = "Private TCP reachability only; peer mTLS is enforced by the gRPC service"
  vpc_id      = aws_vpc.sydney.id
  ingress {
    from_port   = 8962
    to_port     = 8962
    protocol    = "tcp"
    cidr_blocks = [aws_subnet.sydney.cidr_block]
  }
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.sydney.cidr_block]
  }
}
resource "aws_security_group" "oregon" {
  provider    = aws.oregon
  name        = "keddeh-${var.deployment_id}-oregon-grpc"
  description = "Private TCP reachability only; peer mTLS is enforced by the gRPC service"
  vpc_id      = aws_vpc.oregon.id
  ingress {
    from_port   = 8962
    to_port     = 8962
    protocol    = "tcp"
    cidr_blocks = [aws_subnet.oregon.cidr_block]
  }
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.oregon.cidr_block]
  }
}
output "sydney_foundation" {
  value = { vpc_id = aws_vpc.sydney.id, subnet_id = aws_subnet.sydney.id, security_group_id = aws_security_group.sydney.id }
}
output "oregon_foundation" {
  value = { vpc_id = aws_vpc.oregon.id, subnet_id = aws_subnet.oregon.id, security_group_id = aws_security_group.oregon.id }
}
