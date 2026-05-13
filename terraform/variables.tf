variable "aws_region" {
  description = "AWS region for deployment"
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g., dev, staging, prod)"
  default     = "dev"
}

variable "instance_type" {
  description = "EC2 instance type for the Kubernetes node"
  default     = "t3.medium" # Minimum recommended for Kubernetes/K3s + monitoring stack
}

variable "ssh_key_name" {
  description = "Name of the AWS key pair to attach to the instance"
  type        = string
  default     = "deployer-key"
}
