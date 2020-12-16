variable "project" {
  type = string
  description = "Project name"
}

variable "environment" {
  type = string
  description = "Environment (dev / stage / prod)"
}

variable "location" {
  type = string
  description = "Azure region"
}

variable "postgresql_password" {
  type = string
  description = "Root password for the PostgreSQL instance"
}
