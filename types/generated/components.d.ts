import type { Schema, Attribute } from '@strapi/strapi';

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
      'token.attribute': TokenAttribute;
      'token.property': TokenProperty;
    }
  }
}
