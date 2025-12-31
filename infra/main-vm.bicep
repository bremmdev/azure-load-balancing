targetScope = 'subscription'

var vmCount = 2

param projectName string
param location string
param adminIpAddress string
param adminUsername string
param sshKeyData string
param storageAccountName string
param storageResourceGroup string

resource rg 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: 'rg-${projectName}'
  location: location
}

module nsgModule 'modules/vm/nsg.bicep' = {
  name: '${projectName}-nsg-deployment'
  scope: rg
  params: {
    projectName: projectName
    location: location
    adminIpAddress: adminIpAddress
  }
}

module vnetModule 'modules/vm/vnet.bicep' = {
  name: '${projectName}-vnet-deployment'
  scope: rg
  params: {
    projectName: projectName
    location: location
    nsgId: nsgModule.outputs.nsgId
  }
}

// create multiple VMs using a loop
module vmModule 'modules/vm/vm.bicep' = [
  for i in range(0, vmCount): {
    name: '${projectName}-vm-deployment-${i}'
    scope: rg
    params: {
      projectName: projectName
      location: location
      sshKeyData: sshKeyData
      managedIdentityId: identityModule.outputs.managedIdentityId
      subnetId: vnetModule.outputs.subnet1ResourceId
      adminUsername: adminUsername
      index: i
      backendPoolId: lbModule.outputs.backendPoolId
      inboundNatRuleId: i == 0 ? lbModule.outputs.inboundNatRuleId1 : lbModule.outputs.inboundNatRuleId2
    }
  }
]

module publicIpModule 'modules/vm/publicIp.bicep' = {
  name: 'publicIpDeployment'
  scope: rg
  params: {
    projectName: projectName
    location: location
  }
}

module lbModule 'modules/vm/loadBalancer.bicep' = {
  name: 'loadBalancerDeployment'
  scope: rg
  params: {
    projectName: projectName
    location: location
    publicIpId: publicIpModule.outputs.publicIpId
  }
}

module identityModule 'modules/vm/managedIdentity.bicep' = {
  name: 'managedIdentityDeployment'
  scope: rg
  params: {
    projectName: projectName
    location: location
  }
}

// We pull our site data from an existing Storage Account in another RG
resource existingStorageRG 'Microsoft.Resources/resourceGroups@2021-04-01' existing = {
  name: storageResourceGroup
}

// 2. Deploy the role assignment module specifically to that RG scope
module storageRoleAssignment 'modules/vm/roleAssignment.bicep' = {
  name: '${projectName}-role-assign-uami'
  scope: existingStorageRG // Deploy to the Storage RG scope
  params: {
    storageAccountName: storageAccountName
    principalId: identityModule.outputs.principalId
  }
}
