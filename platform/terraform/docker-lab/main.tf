terraform {
  required_version = ">= 1.6.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

variable "nginx_http_port" {
  type        = number
  default     = 3080
  description = "Host port published by the edge. APP_URL must include this port."
}

variable "keep_volume" {
  type        = bool
  default     = true
  description = "Named volume survives terraform destroy if true (class data lesson)."
}

resource "docker_network" "lab" {
  name = "tf-secure-demo"
}

resource "docker_volume" "web_html" {
  name = "tf-secure-demo-html"
}

resource "docker_image" "nginx" {
  name         = "nginx:1.27-alpine"
  keep_locally = true
}

resource "docker_container" "edge" {
  name  = "tf-edge"
  image = docker_image.nginx.image_id
  networks_advanced {
    name = docker_network.lab.name
  }
  ports {
    internal = 80
    external = var.nginx_http_port
  }
}

output "app_url" {
  value       = "http://localhost:${var.nginx_http_port}"
  description = "Public origin — do not drop the port."
}

output "volume_name" {
  value = docker_volume.web_html.name
}
