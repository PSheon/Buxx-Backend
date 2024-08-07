import type { Schema, Attribute } from '@strapi/strapi';

export interface TokenProperty extends Schema.Component {
  collectionName: 'components_token_properties';
  info: {
    displayName: 'Property';
    description: '';
  };
  attributes: {
    propertyName: Attribute.Enumeration<
      ['DisplayName', 'APY', 'MinimumStakingPeriod']
    > &
      Attribute.Required;
    description: Attribute.String;
    value: Attribute.String & Attribute.Required;
    displayValue: Attribute.String;
    isIntrinsic: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>;
    order: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<1>;
    displayType: Attribute.Enumeration<['string', 'number']> &
      Attribute.Required &
      Attribute.DefaultTo<'string'>;
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

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'token.property': TokenProperty;
      'token.attribute': TokenAttribute;
      'contract.vault': ContractVault;
      'contract.sft': ContractSft;
    }
  }
}
