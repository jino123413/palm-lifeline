# Azure Student Serverless Deployment

This document configures Azure Functions deployment using GitHub Student benefits and GitHub Actions.

## 1. Prerequisites

- GitHub Student Pack approved account
- Azure for Students activated
- Azure CLI installed
- Optional: GitHub CLI (`gh`) installed

## 2. Create Azure resources

Use PowerShell:

```powershell
$Location = "koreacentral"
$ResourceGroup = "rg-palm-lifeline-student"
$StorageAccount = "palmlifelinestd"
$FunctionAppName = "palm-lifeline-api-student"

az login
az account show
az group create --name $ResourceGroup --location $Location
az storage account create --name $StorageAccount --location $Location --resource-group $ResourceGroup --sku Standard_LRS
az functionapp create --resource-group $ResourceGroup --consumption-plan-location $Location --runtime node --runtime-version 20 --functions-version 4 --name $FunctionAppName --storage-account $StorageAccount --os-type Linux
```

If the storage account name is already used globally, choose another lowercase alphanumeric name (3-24 chars).

## 3. Set app settings

```powershell
az functionapp config appsettings set --name palm-lifeline-api-student --resource-group rg-palm-lifeline-student --settings APP_NAME=palm-lifeline APP_VERSION=2026-02-16
```

## 4. Configure GitHub Secrets

Required secrets in repository settings:

- `AZURE_FUNCTIONAPP_NAME`
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`

Get publish profile:

```powershell
az functionapp deployment list-publishing-profiles --name palm-lifeline-api-student --resource-group rg-palm-lifeline-student --xml > publish-profile.xml
```

If `gh` is installed:

```powershell
gh secret set AZURE_FUNCTIONAPP_NAME --body "palm-lifeline-api-student"
gh secret set AZURE_FUNCTIONAPP_PUBLISH_PROFILE < publish-profile.xml
```

## 5. Deploy

Push to `main`. Workflow `.github/workflows/deploy-functions.yml` deploys automatically.

## 6. Verify

```bash
curl https://palm-lifeline-api-student.azurewebsites.net/api/health
curl https://palm-lifeline-api-student.azurewebsites.net/api/version
```

## Notes

- With light traffic, this usually stays very low cost on consumption plan + student credit.
- If execution count or outbound traffic increases, charges can occur.
