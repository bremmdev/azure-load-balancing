targetScope = 'subscription'

var vmCount = 2

param projectName string
param location string
param adminIpAddress string
param adminUsername string
param sshKeyData string

resource rg 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: 'rg-${projectName}'
  location: location
}

module nsgModule 'modules/nsg.bicep' = {
  name: '${projectName}-nsg-deployment'
  scope: rg
  params: {
    projectName: projectName
    location: location
    adminIpAddress: adminIpAddress
  }
}

module vnetModule 'modules/vnet.bicep' = {
  name: '${projectName}-vnet-deployment'
  scope: rg
  params: {
    projectName: projectName
    location: location
    nsgId: nsgModule.outputs.nsgId
  }
}

// create multiple VMs using a loop
module vmModule 'modules/vm.bicep' = [
  for i in range(0, vmCount): {
    name: '${projectName}-vm-deployment-${i}'
    scope: rg
    params: {
      projectName: projectName
      location: location
      sshKeyData: sshKeyData
      subnetId: vnetModule.outputs.subnet1ResourceId
      adminUsername: adminUsername
      index: i
    }
  }
]

// module lbModule 'modules/loadBalancer.bicep' = {
//   name: 'loadBalancerDeployment'
//   scope: rg
//   params: {
//     projectName: projectName
//     location: location
//     subnetResourceId: vnetModule.outputs.subnet1ResourceId
//   }
// }
