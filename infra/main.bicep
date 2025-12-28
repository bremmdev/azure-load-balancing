targetScope = 'subscription'

param projectName string
param location string
param adminIpAddress string

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

// module lbModule 'modules/loadBalancer.bicep' = {
//   name: 'loadBalancerDeployment'
//   scope: rg
//   params: {
//     projectName: projectName
//     location: location
//     subnetResourceId: vnetModule.outputs.subnet1ResourceId
//   }
// }
