param storageAccountName string
param principalId string

resource stg 'Microsoft.Storage/storageAccounts@2025-06-01' existing = {
  name: storageAccountName
}

// 2. Create the assignment scoped to that Storage Account
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(stg.id, principalId, 'Storage Blob Data Reader')
  scope: stg
  properties: {
    // Storage Blob Data Reader
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1'
    )
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}
