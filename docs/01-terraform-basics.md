# Terraform basics (no cloud account)

**When:** last 60–90 minutes of Day 2, reused on Day 3.

Terraform is **declarative infrastructure**. You already declared containers in Compose YAML. Terraform does the same job with state, plans, and providers.

We **do not** need AWS/Azure/GCP for this course.

| Lab | Provider | What you create |
|-----|----------|-----------------|
| Docker lab | `kreuzwerker/docker` | Network + named volume + nginx on `NGINX_HTTP_PORT` |
| k3s lab | `hashicorp/kubernetes` | A `team-<name>` namespace on **your** cluster |

## Install (WSL for Docker lab)

```bash
curl -fsSL https://releases.hashicorp.com/terraform/1.9.8/terraform_1.9.8_linux_amd64.zip -o /tmp/tf.zip
sudo apt install -y unzip
sudo unzip -o /tmp/tf.zip -d /usr/local/bin
terraform version
```

Pick a current 1.x version if 1.9.8 is stale: https://developer.hashicorp.com/terraform/install

## Lab T1 — Docker provider (Day 2)

Docker Desktop must be running. From **WSL**, repo root:

```bash
cd platform/terraform/docker-lab
terraform init
terraform plan -var="nginx_http_port=3081"
terraform apply -auto-approve -var="nginx_http_port=3081"
```

Why **3081**? Day 2 Compose already wants **3080**. Do not collide.

Expected: `app_url = http://localhost:3081`

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3081/
terraform destroy -auto-approve -var="nginx_http_port=3081"
```

Open `main.tf` and find:

- `docker_volume` — same lesson as Compose named volumes
- `ports.external` — this is the published edge port; `APP_URL` must match it

**Security habit:** Terraform state can contain secrets. `.tfstate` is gitignored. In production you would use a remote backend with encryption — out of scope here, but do not email `terraform.tfstate` around.

## Lab T2 — Kubernetes provider (Day 3+)

On the **Linux VM**, after k3s is up:

```bash
cp platform/terraform/k3s-lab/terraform.tfvars.example platform/terraform/k3s-lab/terraform.tfvars
# set kubeconfig_path = "/home/<you>/.kube/config"
# set namespace = "team-ada"
cd platform/terraform/k3s-lab
terraform init
terraform apply -auto-approve
kubectl get ns team-ada
```

Never commit `terraform.tfvars` if it contains paths you care about; the example file is enough. **Never** commit kubeconfig.

## Self-check

- [ ] I can explain plan vs apply vs destroy
- [ ] I did not check in `.tfstate`
- [ ] I used a *different* host port than Compose

## Debug challenge

`terraform apply` against Docker fails with `Error: Cannot connect to the Docker daemon`. Which two sockets should you think about on WSL vs a Linux VM?

See [`troubleshooting.md`](troubleshooting.md) § Terraform.
