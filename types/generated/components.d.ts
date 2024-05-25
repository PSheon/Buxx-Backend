import type { Schema, Attribute } from '@strapi/strapi';

export interface ContractSft extends Schema.Component {
  collectionName: 'components_contract_sfts';
  info: {
    displayName: 'Sft';
    description: '';
  };
  attributes: {
    contractName: Attribute.String & Attribute.Required;
    contractAddress: Attribute.String;
    contractRootSignerAddress: Attribute.String & Attribute.Private;
    contractRootSignerPrivateKey: Attribute.String & Attribute.Private;
    contractAbi: Attribute.JSON;
    version: Attribute.String;
  };
}

export interface ContractVault extends Schema.Component {
  collectionName: 'components_contract_vaults';
  info: {
    displayName: 'Vault';
    description: '';
  };
  attributes: {
    contractName: Attribute.String & Attribute.Required;
    contractAddress: Attribute.String;
    contractRootSignerAddress: Attribute.String & Attribute.Private;
    contractRootSignerPrivateKey: Attribute.String & Attribute.Private;
    contractAbi: Attribute.JSON;
    version: Attribute.String;
  };
}

export interface TokenAttribute extends Schema.Component {
  collectionName: 'components_token_attributes';
  info: {
    displayName: 'Attribute';
    description: '';
  };
  attributes: {
    traitType: Attribute.String & Attribute.Required;
    value: Attribute.String & Attribute.Required;
  };
}

export interface TokenProperty extends Schema.Component {
  collectionName: 'components_token_properties';
  info: {
    displayName: 'Property';
    description: '';
  };
  attributes: {
    propertyType: Attribute.Enumeration<['DisplayName', 'Period']> &
      Attribute.Required;
    value: Attribute.String & Attribute.Required;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'contract.sft': ContractSft;
      'contract.vault': ContractVault;
      'token.attribute': TokenAttribute;
      'token.property': TokenProperty;
    }
  }
}
