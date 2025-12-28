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

  resource subnet2 'subnets' = {
    name: '${projectName}-subnet-lb'
    properties: {
      addressPrefix: '10.200.1.0/24'
      networkSecurityGroup: {
        id: nsgId
      }
    }
  }
}

output subnet1ResourceId string = vnet::subnet1.id // output the subnet resource ID using the correct 'child' syntax
output subnet2ResourceId string = vnet::subnet2.id
