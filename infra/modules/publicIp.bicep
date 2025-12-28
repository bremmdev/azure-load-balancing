param projectName string
param location string

resource publicIp 'Microsoft.Network/publicIPAddresses@2025-01-01' = {
  name: '${projectName}-public-ip'
  location: location
  sku: {
    name: 'Standard'
  }
  properties: {
    publicIPAllocationMethod: 'Static'
    idleTimeoutInMinutes: 4
  }
}

output publicIpId string = publicIp.id
