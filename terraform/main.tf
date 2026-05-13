# Terraform IaC to provision the URL Shortener environments
# Matches the CV claim: "Built reusable IaC modules with Terraform to provision 5+ environments"

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # State file management could go here (e.g., S3 backend)
}

provider "aws" {
  region = var.aws_region
}

# --- VPC & Networking ---
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name = "url-shortener-vpc-${var.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}

# --- Security Group ---
resource "aws_security_group" "k8s_cluster_sg" {
  name        = "url-shortener-sg-${var.environment}"
  description = "Security group for the URL Shortener Kubernetes cluster"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "Allow HTTP for Frontend"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTP for API"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow SSH for Ansible Configuration"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- EC2 Instance (for K3s/Minikube cluster) ---
resource "aws_instance" "k8s_node" {
  ami           = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS
  instance_type = var.instance_type
  subnet_id     = module.vpc.public_subnets[0]
  
  vpc_security_group_ids = [aws_security_group.k8s_cluster_sg.id]
  key_name               = var.ssh_key_name

  tags = {
    Name        = "url-shortener-node-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

output "instance_public_ip" {
  value = aws_instance.k8s_node.public_ip
}
