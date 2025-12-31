param projectName string
param location string

resource uami 'Microsoft.ManagedIdentity/userAssignedIdentities@2025-01-31-preview' = {
  name: '${projectName}-vm-mi'
  location: location
}

// Used for attaching to the VM
output managedIdentityId string = uami.id
// Used for Role Assignments (Permissions)
output principalId string = uami.properties.principalId
