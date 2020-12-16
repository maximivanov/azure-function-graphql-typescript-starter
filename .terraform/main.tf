terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      # Root module should specify the maximum provider version
      # The ~> operator is a convenient shorthand for allowing only patch releases within a specific minor release.
      version = "~> 2.26"
    }
  }
}

provider "azurerm" {
  features {}
}

locals {
  postgresql_username = "azgraphql"
}

resource "azurerm_resource_group" "resource_group" {
  name     = "${var.project}-${var.environment}-resource-group"
  location = var.location
}

resource "azurerm_storage_account" "storage_account" {
  name                     = "${var.project}${var.environment}storage"
  resource_group_name      = azurerm_resource_group.resource_group.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_postgresql_server" "postgresql_server" {
  name                             = "${var.project}-${var.environment}-postgresql-server"
  resource_group_name              = azurerm_resource_group.resource_group.name
  location                         = var.location
  sku_name                         = "B_Gen5_1" # Smallest instance available: Basic tier, latest generation, 1 CPU core
  version                          = 11
  administrator_login              = local.postgresql_username
  administrator_login_password     = var.postgresql_password
  ssl_enforcement_enabled          = true
  ssl_minimal_tls_version_enforced = "TLS1_2"
  storage_mb                       = 5120 # Min for the Basic SKU
}

resource "azurerm_postgresql_firewall_rule" "postgresql_firewall_rule" {
  name                = "${var.project}-${var.environment}-postgresql-firewall-rule"
  resource_group_name = azurerm_resource_group.resource_group.name
  server_name         = azurerm_postgresql_server.postgresql_server.name
  start_ip_address    = "0.0.0.0" # this allows access from Azure services only
  end_ip_address      = "0.0.0.0"
}

resource "azurerm_application_insights" "application_insights" {
  name                = "${var.project}-${var.environment}-application-insights"
  location            = var.location
  resource_group_name = azurerm_resource_group.resource_group.name
  application_type    = "Node.JS"
}

resource "azurerm_app_service_plan" "app_service_plan" {
  name                = "${var.project}-${var.environment}-app-service-plan"
  resource_group_name = azurerm_resource_group.resource_group.name
  location            = var.location
  kind                = "FunctionApp"
  reserved            = true
  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}

resource "azurerm_function_app" "function_app" {
  name                       = "${var.project}-${var.environment}-function-app"
  resource_group_name        = azurerm_resource_group.resource_group.name
  location                   = var.location
  app_service_plan_id        = azurerm_app_service_plan.app_service_plan.id
  app_settings               = {
    "WEBSITE_RUN_FROM_PACKAGE"       = "",
    "FUNCTIONS_WORKER_RUNTIME"       = "node",
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.application_insights.instrumentation_key,
    "NODE_ENV"                       = "production",
    "DB_DATABASE"                    = "postgres",
    "DB_HOST"                        = azurerm_postgresql_server.postgresql_server.fqdn,
    "DB_PASSWORD"                    = var.postgresql_password, # in production setup you should reference Key Vault instead
    "DB_PORT"                        = "5432",
    "DB_USERNAME"                    = "${local.postgresql_username}@${split(".",azurerm_postgresql_server.postgresql_server.fqdn,)[0]}",
  }
  os_type                    = "linux"
  storage_account_name       = azurerm_storage_account.storage_account.name
  storage_account_access_key = azurerm_storage_account.storage_account.primary_access_key
  version                    = "~3"

  lifecycle {
    ignore_changes = [
      app_settings["WEBSITE_RUN_FROM_PACKAGE"], # prevent TF reporting configuration drift after app code is deployed
    ]
  }
}
