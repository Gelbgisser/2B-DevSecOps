# Day 3+ : talk to k3s after you copy the kubeconfig off the VM.
# No cloud account. Provider talks to YOUR cluster.

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.33"
    }
  }
}

variable "kubeconfig_path" {
  type        = string
  description = "Path to k3s kubeconfig (copied from the VM). Never commit this file."
}

variable "namespace" {
  type    = string
  default = "team-learner"
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
}

resource "kubernetes_namespace" "team" {
  metadata {
    name = var.namespace
    labels = {
      "pod-security.kubernetes.io/enforce" = "baseline"
    }
  }
}

output "namespace" {
  value = kubernetes_namespace.team.metadata[0].name
}
