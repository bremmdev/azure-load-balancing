# Azure Load Balancing Infrastructure

This project contains Infrastructure as Code (IaC) for deploying a load-balanced web application on Azure using **Bicep** templates and **cloud-init** for VM provisioning.

## Architecture Overview

The infrastructure deploys a set of Ubuntu VMs behind an Azure Standard Load Balancer, serving a static SPA (Memcaydia) with TLS termination via Caddy web server. Site content and certificates are pulled from Azure Blob Storage using Managed Identity authentication.

```
                                    ┌─────────────────────────────────────────────────────────────┐
                                    │                     AZURE SUBSCRIPTION                       │
                                    └─────────────────────────────────────────────────────────────┘
                                                                 │
                    ┌────────────────────────────────────────────┴────────────────────────────────────────────┐
                    │                                                                                         │
                    ▼                                                                                         ▼
    ┌───────────────────────────────────────────────────────────────────────────┐        ┌────────────────────────────────┐
    │                        RESOURCE GROUP: rg-load-balancing                  │        │   EXISTING STORAGE RG          │
    │                                                                           │        │                                │
    │  ┌─────────────────────┐                                                  │        │  ┌──────────────────────────┐  │
    │  │   PUBLIC IP (Static)│◄───────────────────────────────┐                 │        │  │  STORAGE ACCOUNT         │  │
    │  │   Standard SKU      │                                │                 │        │  │  memcaydiasitedata       │  │
    │  │   Zone-redundant    │                                │                 │        │  │                          │  │
    │  └─────────────────────┘                                │                 │        │  │  ┌────────────────────┐  │  │
    │            │                                            │                 │        │  │  │ Container: dist/   │  │  │
    │            ▼                                            │                 │        │  │  │ (Site files)       │  │  │
    │  ┌─────────────────────────────────────────────────┐    │                 │        │  │  └────────────────────┘  │  │
    │  │              LOAD BALANCER (Standard)           │    │                 │        │  │  ┌────────────────────┐  │  │
    │  │              Zone-redundant                     │    │                 │        │  │  │ Container: cert/   │  │  │
    │  │                                                 │    │                 │        │  │  │ (TLS certs)        │  │  │
    │  │  Frontend IP ◄──────────────────────────────────┘    │                 │        │  │  └────────────────────┘  │  │
    │  │       │                                              │                 │        │  └──────────────────────────┘  │
    │  │       │  ┌─────────────────────────────────────┐     │                 │        │              ▲                 │
    │  │       │  │         LOAD BALANCING RULES        │     │                 │        └──────────────┼─────────────────┘
    │  │       │  │  • HTTP  (80 → 80)                  │     │                 │                       │
    │  │       │  │  • HTTPS (443 → 443)                │     │                 │                       │ Storage Blob
    │  │       │  └─────────────────────────────────────┘     │                 │                       │ Data Reader
    │  │       │  ┌─────────────────────────────────────┐     │                 │                       │
    │  │       │  │         INBOUND NAT RULES           │     │                 │        ┌──────────────┴───────────────┐
    │  │       │  │  • SSH VM1 (2201 → 22)              │     │                 │        │    ROLE ASSIGNMENT           │
    │  │       │  │  • SSH VM2 (2202 → 22)              │     │                 │        │    (Cross-RG)                │
    │  │       │  └─────────────────────────────────────┘     │                 │        └──────────────▲───────────────┘
    │  │       │  ┌─────────────────────────────────────┐     │                 │                       │
    │  │       │  │         HEALTH PROBES               │     │                 │        ┌──────────────┴───────────────┐
    │  │       │  │  • TCP :80  (every 15s)             │     │                 │        │   USER-ASSIGNED              │
    │  │       │  │  • TCP :443 (every 15s)             │     │                 │        │   MANAGED IDENTITY           │
    │  │       │  └─────────────────────────────────────┘     │                 │        │   (Shared by all VMs)        │
    │  │       │                                              │                 │        └──────────────▲───────────────┘
    │  │       ▼                                              │                 │                       │
    │  │  Backend Pool                                        │                 │                       │
    │  └───────┬─────────────────────────────────────────┘    │                 │                       │
    │          │                                              │                 │                       │
    │  ┌───────┴──────────────────────────────────────────────────────────────────────────────────────┐ │
    │  │                              VIRTUAL NETWORK (10.200.0.0/16)                                 │ │
    │  │  ┌──────────────────────────────────────────────────────────────────────────────────────────┐│ │
    │  │  │                              SUBNET (10.200.0.0/24) + NSG                                ││ │
    │  │  │                                                                                          ││ │
    │  │  │   ┌────────────────────────┐   ┌────────────────────────┐   ┌────────────────────────┐   ││ │
    │  │  │   │      ZONE 1            │   │      ZONE 2            │   │      ZONE 3            │   ││ │
    │  │  │   │  ┌──────────────────┐  │   │  ┌──────────────────┐  │   │                        │   ││ │
    │  │  │   │  │      VM-0        │  │   │  │      VM-1        │  │   │      (future VMs)      │◄──┘│ │
    │  │  │   │  │  Ubuntu 22.04    │  │   │  │  Ubuntu 22.04    │  │   │                        │    │ │
    │  │  │   │  │  Caddy Server    │  │   │  │  Caddy Server    │  │   │                        │    │ │
    │  │  │   │  │  X-Server-ID: 0  │  │   │  │  X-Server-ID: 1  │  │   │                        │    │ │
    │  │  │   │  │  NAT: 2201→22    │  │   │  │  NAT: 2202→22    │  │   │                        │    │ │
    │  │  │   │  └──────────────────┘  │   │  └──────────────────┘  │   │                        │    │ │
    │  │  │   └────────────────────────┘   └────────────────────────┘   └────────────────────────┘   ││ │
    │  │  └──────────────────────────────────────────────────────────────────────────────────────────┘│ │
    │  └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
    │                                                                                                    │
    │  ┌────────────────────────────────────────────────────────────────────────────────────────────┐   │
    │  │                         NETWORK SECURITY GROUP                                             │   │
    │  │  • Allow HTTP (80) from Internet                                                           │   │
    │  │  • Allow HTTPS (443) from Internet                                                         │   │
    │  │  • Allow Azure Load Balancer health probes                                                 │   │
    │  │  • Allow SSH (22) from Admin IP only                                                       │   │
    │  └────────────────────────────────────────────────────────────────────────────────────────────┘   │
    └───────────────────────────────────────────────────────────────────────────────────────────────────┘


                                         INTERNET TRAFFIC FLOW
    ┌─────────────┐      HTTPS       ┌─────────────┐              ┌─────────────┐
    │   Browser   │ ──────────────►  │  Public IP  │ ──────────►  │ Load        │ ──► VM-0 (Zone 1)
    │             │  :443            │             │              │ Balancer    │     or VM-1 (Zone 2)
    └─────────────┘                  └─────────────┘              └─────────────┘


                                            SSH ACCESS
    ┌─────────────┐     Port 2201    ┌─────────────┐   NAT Rule   ┌─────────────┐
    │   Admin     │ ──────────────►  │  Public IP  │ ──────────►  │ VM-0 (Z1)   │ :22
    └─────────────┘     Port 2202    └─────────────┘              │ VM-1 (Z2)   │ :22
```

---

## File Structure

```
infra/
├── vmdeploy.bicep              # Main orchestration template (subscription-level)
├── vmdeployparameters.json     # Deployment parameters (gitignored)
├── parameters-example.json     # Example parameters template
├── scripts/
│   └── install-vm.yaml         # Cloud-init script for VM provisioning
└── modules/vm/
    ├── vm.bicep                # Virtual Machine definition
    ├── vnet.bicep              # Virtual Network & Subnet
    ├── nsg.bicep               # Network Security Group rules
    ├── publicIp.bicep          # Static Public IP address
    ├── loadBalancer.bicep      # Load Balancer with rules & probes
    ├── managedIdentity.bicep   # User-Assigned Managed Identity
    └── roleAssignment.bicep    # RBAC assignment for blob access
```

---

## Component Details

### 1. Main Deployment (`vmdeploy.bicep`)

The orchestration template that:

- Creates the resource group
- Loops to create multiple VMs (default: 2)
- Links VMs to the load balancer backend pool

| Parameter              | Description                                   |
| ---------------------- | --------------------------------------------- |
| `projectName`          | Prefix for all resource names                 |
| `location`             | Azure region (e.g., `westeurope`)             |
| `adminIpAddress`       | Your IP for SSH access                        |
| `adminUsername`        | VM admin username                             |
| `sshKeyData`           | Public SSH key                                |
| `storageAccountName`   | Existing storage account with site content    |
| `storageResourceGroup` | Resource group containing the storage account |

---

### 2. Virtual Machines (`vm.bicep`)

Ubuntu 22.04 LTS VMs configured with:

- **Size:** Standard_B1s (1 vCPU, 1GB RAM)
- **Authentication:** SSH key only (no password)
- **Identity:** User-Assigned Managed Identity for Azure resource access
- **Custom Data:** cloud-init script for automatic provisioning
- **Availability Zones:** Distributed across zones for high availability

Each VM:

- Joins the load balancer backend pool
- Has a dedicated NAT rule for SSH access (port 2201, 2202, etc.)
- Sends `X-Server-ID` header to identify which VM served the request
- Deployed to a specific availability zone (VM-0 → Zone 1, VM-1 → Zone 2, etc.)

---

### 3. Network Security Group (`nsg.bicep`)

Firewall rules controlling inbound traffic:

| Rule                   | Priority | Source            | Port   | Purpose                  |
| ---------------------- | -------- | ----------------- | ------ | ------------------------ |
| AllowHTTP              | 100      | Internet          | 80     | Public web traffic       |
| AllowHTTPS             | 110      | Internet          | 443    | Public web traffic (TLS) |
| AllowAzureLoadBalancer | 120      | AzureLoadBalancer | 80/443 | Health probe traffic     |
| AllowSSHFromAdmin      | 200      | Admin IP          | 22     | Restricted SSH access    |

---

### 4. Load Balancer (`loadBalancer.bicep`)

Azure Standard Load Balancer providing:

| Feature            | Configuration                              |
| ------------------ | ------------------------------------------ |
| **SKU**            | Standard (required for availability zones) |
| **Frontend**       | Static Public IP                           |
| **Backend Pool**   | All VMs in the deployment                  |
| **Health Probes**  | TCP checks on ports 80 and 443 (every 15s) |
| **LB Rules**       | HTTP (80→80), HTTPS (443→443)              |
| **NAT Rules**      | SSH access per VM (2201→22, 2202→22)       |
| **Outbound Rules** | Explicit SNAT with 2048 ports per VM       |

---

### 5. Managed Identity (`managedIdentity.bicep`)

A **User-Assigned Managed Identity** shared by all VMs, enabling:

- Passwordless authentication to Azure services
- No credentials stored on disk
- Automatic credential rotation by Azure

---

### 6. Role Assignment (`roleAssignment.bicep`)

Grants the Managed Identity the **Storage Blob Data Reader** role on the storage account, allowing VMs to:

- Download site content from blob storage
- Download TLS certificates
- Use `azcopy` with MSI authentication

---

### 7. Cloud-Init Script (`install-vm.yaml`)

Automatic VM provisioning that:

1. **Installs AzCopy** — For syncing site content and downloading certs
2. **Downloads TLS certificates** — From blob storage using Managed Identity
3. **Installs Caddy** — Web server
4. **Deploys Caddyfile** — Custom configuration for the SPA
5. **Syncs site content** — Downloads from blob storage to `/var/www/memcaydia`
6. **Enables auto-sync timer** — Refreshes content every 15 minutes

---

## Deployment

### Prerequisites

- Azure CLI installed and authenticated (`az login`)
- An existing storage account with:
  - Container `dist/` containing site files
  - Container `cert/` containing `fullchain.pem` and `privkey.pem`

### Steps

1. **Copy and configure parameters:**

   ```bash
   cp infra/parameters-example.json infra/vmdeployparameters.json
   # Edit vmdeployparameters.json with your values
   ```

2. **Deploy the infrastructure:**

   ```bash
   npm run azure:deployvm
   ```

   Or manually:

   ```bash
   az deployment sub create \
     --location westeurope \
     --template-file ./infra/vmdeploy.bicep \
     --parameters ./infra/vmdeployparameters.json
   ```

3. **SSH into VMs** (through NAT rules):

   ```bash
   # VM 0
   ssh -i ~/.ssh/your_key -p 2201 azureuser@<public-ip>

   # VM 1
   ssh -i ~/.ssh/your_key -p 2202 azureuser@<public-ip>
   ```

---

## High Availability

The infrastructure is designed for zone-level fault tolerance:

| Component         | Zone Configuration               | Resilience                       |
| ----------------- | -------------------------------- | -------------------------------- |
| **Load Balancer** | Zone-redundant (automatic)       | Survives any single zone failure |
| **Public IP**     | Zone-redundant (automatic)       | Survives any single zone failure |
| **VMs**           | Distributed across zones 1, 2, 3 | Survives datacenter outage       |

### Failure Scenarios

| Scenario           | Impact                                               |
| ------------------ | ---------------------------------------------------- |
| Single VM failure  | ✅ No downtime — LB routes to healthy VMs            |
| Single zone outage | ✅ No downtime — LB routes to VMs in surviving zones |
| Region outage      | ❌ Full outage (requires multi-region setup)         |

---

## Security Features

| Feature                  | Implementation                                 |
| ------------------------ | ---------------------------------------------- |
| **No public IPs on VMs** | All traffic routes through Load Balancer       |
| **SSH restricted**       | Only allowed from configured admin IP          |
| **Managed Identity**     | No credentials on disk; automatic rotation     |
| **TLS termination**      | Caddy handles HTTPS with pre-provisioned certs |
| **Zone isolation**       | VMs distributed across availability zones      |

---

## Content Updates

Site content updates automatically:

1. Upload new files to the `dist/` container in blob storage
2. VMs sync every **15 minutes** via systemd timer
3. Caddy reloads automatically after sync

For immediate updates, SSH into each VM and run:

```bash
sudo /opt/scripts/download_site.sh
```
