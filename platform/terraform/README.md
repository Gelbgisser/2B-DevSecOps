# Terraform labs

- [`docker-lab`](docker-lab/main.tf) — Day 2, Docker provider, **no cloud**. Use a host port other than Compose `3080`.
- [`k3s-lab`](k3s-lab/main.tf) — Day 3+, Kubernetes provider against **your** kubeconfig (gitignored).

```bash
terraform fmt -recursive
terraform init
terraform plan
```

State files are gitignored. Do not email `terraform.tfstate`.
