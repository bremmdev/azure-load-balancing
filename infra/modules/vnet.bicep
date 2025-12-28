param projectName string
param location string
param nsgId string

resource vnet 'Microsoft.Network/virtualNetworks@2025-01-01' = {
  name: '${projectName}-vnet'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.200.0.0/16'
      ]
    }
  }

  resource subnet1 'subnets' = {
    name: '${projectName}-subnet1'
    properties: {
      addressPrefix: '10.200.0.0/24'
      networkSecurityGroup: {
        id: nsgId
      }
    }
  }
}

output subnet1ResourceId string = vnet::subnet1.id
