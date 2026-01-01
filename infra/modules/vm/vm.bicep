param projectName string
param location string
param sshKeyData string
param subnetId string
param adminUsername string
param backendPoolId string
param inboundNatRuleId string
param managedIdentityId string
param index int // specific index passed in by parent for naming uniqueness

var vmName = '${projectName}-vm-${index}'
var nicName = '${projectName}-nic-${index}'

resource nic 'Microsoft.Network/networkInterfaces@2023-04-01' = {
  name: nicName
  location: location
  properties: {
    ipConfigurations: [
      {
        name: '${projectName}-ipconfig-${index}'
        properties: {
          privateIPAllocationMethod: 'Dynamic'
          subnet: {
            id: subnetId
          }
          loadBalancerBackendAddressPools: [
            {
              id: backendPoolId
            }
          ]
          loadBalancerInboundNatRules: [
            {
              id: inboundNatRuleId
            }
          ]
        }
      }
    ]
  }
}

// Define the Virtual Machine
resource vm 'Microsoft.Compute/virtualMachines@2023-03-01' = {
  name: vmName
  location: location
  identity: {
    type: 'UserAssigned'
    // Assign the managed identity to the VM, the VMs share the same identity
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    hardwareProfile: {
      vmSize: 'Standard_B1s' // 1 vCPU, 1 GB RAM
    }
    osProfile: {
      computerName: vmName
      adminUsername: adminUsername
      // Using cloud-init script for custom data, for example to install Docker, Caddy, Node.js, etc.
      customData: base64(replace(loadTextContent('../../scripts/install-vm.yaml'), '__SERVER_ID__', string(index)))
      linuxConfiguration: {
        disablePasswordAuthentication: true
        ssh: {
          publicKeys: [
            {
              path: '/home/${adminUsername}/.ssh/authorized_keys'
              keyData: sshKeyData
            }
          ]
        }
      }
    }
    storageProfile: {
      imageReference: {
        publisher: 'Canonical'
        offer: '0001-com-ubuntu-server-jammy'
        sku: '22_04-lts'
        version: 'latest'
      }
      osDisk: {
        createOption: 'FromImage'
        name: 'osdisk-${projectName}-vm-${index}'
        managedDisk: {
          storageAccountType: 'Standard_LRS'
        }
      }
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: nic.id
        }
      ]
    }
  }
}

// Output the Private IP instead of Public IP
output vmPrivateIP string = nic.properties.ipConfigurations[0].properties.privateIPAddress
