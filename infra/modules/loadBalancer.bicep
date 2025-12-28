param projectName string
param location string
param publicIpId string

resource lb 'Microsoft.Network/loadBalancers@2023-11-01' = {
  name: '${projectName}-lb'
  location: location
  sku: {
    name: 'Standard'
    tier: 'Regional'
  }
  properties: {
    frontendIPConfigurations: [
      {
        name: '${projectName}-LB-FrontEnd'
        properties: {
          publicIPAddress: {
            id: publicIpId
          }
        }
      }
    ]
    backendAddressPools: [
      {
        name: '${projectName}-backend-pool'
      }
    ]
    probes: [
      {
        name: 'TcpProbe-80'
        properties: {
          protocol: 'Tcp'
          port: 80
          intervalInSeconds: 15
          numberOfProbes: 2
        }
      }
    ]

    // 4. LOAD BALANCING RULES
    loadBalancingRules: [
      {
        name: 'HTTPRule'
        properties: {
          protocol: 'Tcp'
          frontendPort: 80
          backendPort: 80
          enableFloatingIP: false
          idleTimeoutInMinutes: 4
          loadDistribution: 'Default'
          // Use resourceId to link components within the same resource
          frontendIPConfiguration: {
            id: resourceId(
              'Microsoft.Network/loadBalancers/frontendIPConfigurations',
              '${projectName}-lb',
              '${projectName}-LB-FrontEnd'
            )
          }
          backendAddressPool: {
            id: resourceId(
              'Microsoft.Network/loadBalancers/backendAddressPools',
              '${projectName}-lb',
              '${projectName}-backend-pool'
            )
          }
          probe: {
            id: resourceId('Microsoft.Network/loadBalancers/probes', '${projectName}-lb', 'TcpProbe-80')
          }
        }
      }
      {
        name: 'HTTPSRule'
        properties: {
          protocol: 'Tcp'
          frontendPort: 443
          backendPort: 443
          enableFloatingIP: false
          idleTimeoutInMinutes: 4
          loadDistribution: 'Default'
          frontendIPConfiguration: {
            id: resourceId(
              'Microsoft.Network/loadBalancers/frontendIPConfigurations',
              '${projectName}-lb',
              '${projectName}-LB-FrontEnd'
            )
          }
          backendAddressPool: {
            id: resourceId(
              'Microsoft.Network/loadBalancers/backendAddressPools',
              '${projectName}-lb',
              '${projectName}-backend-pool'
            )
          }
          probe: {
            id: resourceId('Microsoft.Network/loadBalancers/probes', '${projectName}-lb', 'TcpProbe-80')
          }
        }
      }
    ]
    // 5. INBOUND NAT RULES (For SSH), need to be attached to NICs
    inboundNatRules: [
      {
        name: 'SSH-VM1'
        properties: {
          frontendIPConfiguration: {
            id: resourceId(
              'Microsoft.Network/loadBalancers/frontendIPConfigurations',
              '${projectName}-lb',
              '${projectName}-LB-FrontEnd'
            )
          }
          protocol: 'Tcp'
          frontendPort: 2201 // You SSH to this port
          backendPort: 22 // It lands on the VM at this port
          enableFloatingIP: false
        }
      }
      {
        name: 'SSH-VM2'
        properties: {
          frontendIPConfiguration: {
            id: resourceId(
              'Microsoft.Network/loadBalancers/frontendIPConfigurations',
              '${projectName}-lb',
              '${projectName}-LB-FrontEnd'
            )
          }
          protocol: 'Tcp'
          frontendPort: 2202
          backendPort: 22
          enableFloatingIP: false
        }
      }
    ]
  }
}

// Output the Backend Pool ID so you can attach your VM NICs to it
output backendPoolId string = resourceId(
  'Microsoft.Network/loadBalancers/backendAddressPools',
  '${projectName}-lb',
  '${projectName}-backend-pool'
)

output inboundNatRuleId1 string = resourceId(
  'Microsoft.Network/loadBalancers/inboundNatRules',
  '${projectName}-lb',
  'SSH-VM1'
)
output inboundNatRuleId2 string = resourceId(
  'Microsoft.Network/loadBalancers/inboundNatRules',
  '${projectName}-lb',
  'SSH-VM2'
)
