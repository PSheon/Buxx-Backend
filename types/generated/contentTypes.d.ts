import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    blurhash: Attribute.Text;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    singularName: 'release';
    pluralName: 'releases';
    displayName: 'Release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    timezone: Attribute.String;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    singularName: 'release-action';
    pluralName: 'release-actions';
    displayName: 'Release Action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    contentType: Attribute.String & Attribute.Required;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    isEntryValid: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          min: 1;
          max: 50;
        },
        number
      >;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    lastForgotPasswordAt: Attribute.DateTime & Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    avatar: Attribute.Media<'images'>;
    fullName: Attribute.String;
    nationality: Attribute.String;
    phoneNumber: Attribute.String;
    idType: Attribute.Enumeration<
      ['Passport', 'ID Card', 'Permanent Resident Card', 'Driving License']
    >;
    idNumber: Attribute.String;
    contactAddress: Attribute.String;
    referralRank: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    referralPath: Attribute.String & Attribute.Unique;
    referralCode: Attribute.String &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 8;
        maxLength: 8;
      }>;
    exp: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    points: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    isHighlighted: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAccessLogAccessLog extends Schema.CollectionType {
  collectionName: 'access_logs';
  info: {
    singularName: 'access-log';
    pluralName: 'access-logs';
    displayName: 'AccessLog';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    action: Attribute.Enumeration<
      [
        'Login',
        'ForgotPassword',
        'ResetPassword',
        'ChangePassword',
        'VerifyEmail'
      ]
    >;
    responseMessage: Attribute.String;
    status: Attribute.Boolean;
    user: Attribute.Relation<
      'api::access-log.access-log',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    ip: Attribute.String;
    os: Attribute.String;
    browser: Attribute.String;
    isHighlighted: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::access-log.access-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::access-log.access-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiActivityLogActivityLog extends Schema.CollectionType {
  collectionName: 'activity_logs';
  info: {
    singularName: 'activity-log';
    pluralName: 'activity-logs';
    displayName: 'ActivityLog';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    status: Attribute.Enumeration<['Pending', 'Fulfilled', 'Rejected']> &
      Attribute.Required;
    action: Attribute.Enumeration<['Create', 'Update', 'Delete']> &
      Attribute.Required;
    refContentType: Attribute.Enumeration<['Fund', 'Article', 'Wallet']> &
      Attribute.Required;
    refId: Attribute.Integer & Attribute.Required;
    message: Attribute.String;
    payload: Attribute.JSON;
    user: Attribute.Relation<
      'api::activity-log.activity-log',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    isHighlighted: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::activity-log.activity-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::activity-log.activity-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiArticleArticle extends Schema.CollectionType {
  collectionName: 'articles';
  info: {
    singularName: 'article';
    pluralName: 'articles';
    displayName: 'Article';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    cover: Attribute.Media<'images'>;
    category: Attribute.Enumeration<
      [
        'Engineering',
        'Community',
        'Company News',
        'Customer Stories',
        'Changelog',
        'Press'
      ]
    > &
      Attribute.Required &
      Attribute.DefaultTo<'Changelog'>;
    displayName: Attribute.String & Attribute.Required;
    description: Attribute.String;
    content: Attribute.JSON;
    author: Attribute.Relation<
      'api::article.article',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    status: Attribute.Enumeration<
      ['Draft', 'Generating', 'Published', 'Archived']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'Draft'>;
    isHighlighted: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::article.article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::article.article',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBackupLogBackupLog extends Schema.CollectionType {
  collectionName: 'backup_logs';
  info: {
    singularName: 'backup-log';
    pluralName: 'backup-logs';
    displayName: 'BackupLog';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    message: Attribute.String;
    backupFilePath: Attribute.String;
    status: Attribute.Enumeration<
      ['Pending', 'Fulfilled', 'Rejected', 'Deleted']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'Pending'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::backup-log.backup-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::backup-log.backup-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCalculateTeamShareLogCalculateTeamShareLog
  extends Schema.CollectionType {
  collectionName: 'calculate_team_share_logs';
  info: {
    singularName: 'calculate-team-share-log';
    pluralName: 'calculate-team-share-logs';
    displayName: 'CalculateTeamShareLog';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    settlementStartDate: Attribute.DateTime & Attribute.Required;
    settlementEndDate: Attribute.DateTime & Attribute.Required;
    totalCalculateCount: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    totalQueryExecutionTimeMs: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::calculate-team-share-log.calculate-team-share-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::calculate-team-share-log.calculate-team-share-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiClaimedRewardRecordClaimedRewardRecord
  extends Schema.CollectionType {
  collectionName: 'claimed_reward_records';
  info: {
    singularName: 'claimed-reward-record';
    pluralName: 'claimed-reward-records';
    displayName: 'ClaimedRewardRecord';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    user: Attribute.Relation<
      'api::claimed-reward-record.claimed-reward-record',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    belongToFund: Attribute.Relation<
      'api::claimed-reward-record.claimed-reward-record',
      'oneToOne',
      'api::fund.fund'
    >;
    chain: Attribute.Enumeration<['Ethereum', 'Ethereum Sepolia', 'Blast']> &
      Attribute.Required;
    rewardCurrency: Attribute.Enumeration<
      ['ETH', 'DAI', 'USDC', 'USDT', 'BLT']
    > &
      Attribute.Required;
    balance: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::claimed-reward-record.claimed-reward-record',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::claimed-reward-record.claimed-reward-record',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDailyCheckRecordDailyCheckRecord
  extends Schema.CollectionType {
  collectionName: 'daily_check_records';
  info: {
    singularName: 'daily-check-record';
    pluralName: 'daily-check-records';
    displayName: 'DailyCheckRecord';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    user: Attribute.Relation<
      'api::daily-check-record.daily-check-record',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    isHighlighted: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::daily-check-record.daily-check-record',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::daily-check-record.daily-check-record',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiDvFundDvFund extends Schema.SingleType {
  collectionName: 'dv_funds';
  info: {
    singularName: 'dv-fund';
    pluralName: 'dv-funds';
    displayName: 'DVFund';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    banner: Attribute.Media<'images'>;
    displayName: Attribute.String & Attribute.Required;
    category: Attribute.Enumeration<
      [
        'Health and Medical',
        'Arts and Culture',
        'Finance and Technology',
        'Social Enterprise',
        'Emerging Industries',
        'Environment and Sustainability',
        'Food and Agriculture',
        'Education and Training',
        'Travel and Hospitality',
        'Entertainment and Recreation',
        'Fashion and Beauty',
        'Social and Communication',
        'Web3.0 and Blockchain'
      ]
    > &
      Attribute.DefaultTo<'Web3.0 and Blockchain'>;
    description: Attribute.String;
    chain: Attribute.Enumeration<['Ethereum', 'Ethereum Sepolia', 'Blast']> &
      Attribute.DefaultTo<'Ethereum'>;
    baseCurrency: Attribute.Enumeration<['ETH', 'DAI', 'USDC', 'USDT', 'BLT']> &
      Attribute.DefaultTo<'USDT'>;
    genesisDate: Attribute.DateTime;
    saleStartTime: Attribute.DateTime;
    maturityDate: Attribute.DateTime;
    performanceFeePercentage: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
          max: 100;
        },
        number
      > &
      Attribute.DefaultTo<10>;
    redemptionFrequencyInDays: Attribute.Integer & Attribute.DefaultTo<14>;
    estimatedAPY: Attribute.Integer & Attribute.DefaultTo<6>;
    detail: Attribute.JSON;
    defaultPackages: Attribute.Relation<
      'api::dv-fund.dv-fund',
      'oneToMany',
      'api::package.package'
    >;
    vault: Attribute.Component<'contract.vault'>;
    defaultReferrerAddress: Attribute.String;
    twitterUrl: Attribute.String;
    discordUrl: Attribute.String;
    isHighlighted: Attribute.Boolean & Attribute.DefaultTo<false>;
    status: Attribute.Enumeration<['Draft', 'Published', 'Archived']> &
      Attribute.DefaultTo<'Draft'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::dv-fund.dv-fund',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::dv-fund.dv-fund',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiEarningRecordEarningRecord extends Schema.CollectionType {
  collectionName: 'earning_records';
  info: {
    singularName: 'earning-record';
    pluralName: 'earning-records';
    displayName: 'EarningRecord';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    user: Attribute.Relation<
      'api::earning-record.earning-record',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    type: Attribute.Enumeration<
      [
        'ClaimReward',
        'TeamStakeShare',
        'JoinReferral',
        'ReferralLevelUp',
        'DailyCheck',
        'Referral',
        'MarketingCampaign'
      ]
    > &
      Attribute.Required;
    earningExp: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    earningPoints: Attribute.Float &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    receipt: Attribute.JSON;
    isHighlighted: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::earning-record.earning-record',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::earning-record.earning-record',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiEventLogEventLog extends Schema.CollectionType {
  collectionName: 'event_logs';
  info: {
    singularName: 'event-log';
    pluralName: 'event-logs';
    displayName: 'EventLog';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    action: Attribute.Enumeration<
      [
        'MintPackage',
        'TransferToken',
        'TransferValue',
        'Claim',
        'ChangeSlot',
        'Stake',
        'Unstake',
        'Burn'
      ]
    > &
      Attribute.Required;
    sftAddress: Attribute.String & Attribute.Required;
    blockNumber: Attribute.Integer & Attribute.Required;
    blockHash: Attribute.String;
    transactionIndex: Attribute.Integer;
    data: Attribute.String;
    transactionHash: Attribute.String;
    logIndex: Attribute.Integer;
    topics: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::event-log.event-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::event-log.event-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFundFund extends Schema.CollectionType {
  collectionName: 'funds';
  info: {
    singularName: 'fund';
    pluralName: 'funds';
    displayName: 'Fund';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    banner: Attribute.Media<'images'>;
    displayName: Attribute.String & Attribute.Required;
    category: Attribute.Enumeration<
      [
        'Health and Medical',
        'Arts and Culture',
        'Finance and Technology',
        'Social Enterprise',
        'Emerging Industries',
        'Environment and Sustainability',
        'Food and Agriculture',
        'Education and Training',
        'Travel and Hospitality',
        'Entertainment and Recreation',
        'Fashion and Beauty',
        'Social and Communication',
        'Web3.0 and Blockchain'
      ]
    > &
      Attribute.DefaultTo<'Web3.0 and Blockchain'>;
    description: Attribute.String;
    chain: Attribute.Enumeration<['Ethereum', 'Ethereum Sepolia', 'Blast']> &
      Attribute.DefaultTo<'Ethereum'>;
    baseCurrency: Attribute.Enumeration<['ETH', 'DAI', 'USDC', 'USDT', 'BLT']> &
      Attribute.DefaultTo<'USDT'>;
    genesisDate: Attribute.DateTime;
    saleStartTime: Attribute.DateTime;
    maturityDate: Attribute.DateTime;
    performanceFeePercentage: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
          max: 100;
        },
        number
      > &
      Attribute.DefaultTo<10>;
    redemptionFrequencyInDays: Attribute.Integer & Attribute.DefaultTo<14>;
    estimatedAPY: Attribute.Integer & Attribute.DefaultTo<6>;
    detail: Attribute.JSON;
    defaultPackages: Attribute.Relation<
      'api::fund.fund',
      'oneToMany',
      'api::package.package'
    >;
    sft: Attribute.Component<'contract.sft'>;
    vault: Attribute.Component<'contract.vault'>;
    twitterUrl: Attribute.String;
    discordUrl: Attribute.String;
    isHighlighted: Attribute.Boolean & Attribute.DefaultTo<false>;
    status: Attribute.Enumeration<['Draft', 'Published', 'Archived']> &
      Attribute.DefaultTo<'Draft'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::fund.fund', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::fund.fund', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiMetadataMetadata extends Schema.SingleType {
  collectionName: 'metadatas';
  info: {
    singularName: 'metadata';
    pluralName: 'metadatas';
    displayName: 'Metadata';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    contractFallbackContent: Attribute.JSON;
    slotFallbackContent: Attribute.JSON;
    tokenFallbackContent: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::metadata.metadata',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::metadata.metadata',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiNotificationNotification extends Schema.CollectionType {
  collectionName: 'notifications';
  info: {
    singularName: 'notification';
    pluralName: 'notifications';
    displayName: 'Notification';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    notifier: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    category: Attribute.Enumeration<['System', 'Fund']> &
      Attribute.Required &
      Attribute.DefaultTo<'System'>;
    title: Attribute.String & Attribute.Required;
    content: Attribute.JSON;
    isSeen: Attribute.Boolean & Attribute.DefaultTo<false>;
    isHighlighted: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPackagePackage extends Schema.CollectionType {
  collectionName: 'packages';
  info: {
    singularName: 'package';
    pluralName: 'packages';
    displayName: 'Package';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    displayName: Attribute.String & Attribute.Required;
    description: Attribute.String;
    packageId: Attribute.BigInteger & Attribute.Required;
    skin: Attribute.Enumeration<['Green', 'Purple', 'Orange']> &
      Attribute.Required;
    priceInUnit: Attribute.Decimal &
      Attribute.Required &
      Attribute.DefaultTo<0>;
    slots: Attribute.Component<'token.property', true>;
    status: Attribute.Enumeration<['Draft', 'Published', 'Archived']> &
      Attribute.Required &
      Attribute.DefaultTo<'Draft'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::package.package',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::package.package',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiReferralReferral extends Schema.CollectionType {
  collectionName: 'referrals';
  info: {
    singularName: 'referral';
    pluralName: 'referrals';
    displayName: 'Referral';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    user: Attribute.Relation<
      'api::referral.referral',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    referrer: Attribute.Relation<
      'api::referral.referral',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    stakedValue: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    rank: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    path: Attribute.String & Attribute.Required & Attribute.Unique;
    level: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 1;
          max: 9;
        },
        number
      > &
      Attribute.DefaultTo<1>;
    lastTeamShareSettlementDate: Attribute.DateTime;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    isHighlighted: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::referral.referral',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::referral.referral',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSyncEventLogTaskLogSyncEventLogTaskLog
  extends Schema.CollectionType {
  collectionName: 'sync_event_log_task_logs';
  info: {
    singularName: 'sync-event-log-task-log';
    pluralName: 'sync-event-log-task-logs';
    displayName: 'SyncEventLogTaskLog';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    trigger: Attribute.Enumeration<['CronJob', 'Manual']> &
      Attribute.Required &
      Attribute.DefaultTo<'CronJob'>;
    message: Attribute.Text & Attribute.Required;
    latestTokenEventLogBlockNumber: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    latestTokenEventLogIndex: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    totalSynced: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    status: Attribute.Enumeration<['Pending', 'Fulfilled', 'Rejected']> &
      Attribute.Required &
      Attribute.DefaultTo<'Fulfilled'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::sync-event-log-task-log.sync-event-log-task-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::sync-event-log-task-log.sync-event-log-task-log',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTokenToken extends Schema.CollectionType {
  collectionName: 'tokens';
  info: {
    singularName: 'token';
    pluralName: 'tokens';
    displayName: 'Token';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    belongToFund: Attribute.Relation<
      'api::token.token',
      'oneToOne',
      'api::fund.fund'
    >;
    package: Attribute.Relation<
      'api::token.token',
      'oneToOne',
      'api::package.package'
    >;
    contractAddress: Attribute.String;
    owner: Attribute.String;
    tokenId: Attribute.String;
    tokenValue: Attribute.String & Attribute.DefaultTo<'0'>;
    attributes: Attribute.Component<'token.attribute', true>;
    status: Attribute.Enumeration<['Holding', 'Staking', 'Burned']> &
      Attribute.DefaultTo<'Holding'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::token.token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::token.token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiWalletWallet extends Schema.CollectionType {
  collectionName: 'wallets';
  info: {
    singularName: 'wallet';
    pluralName: 'wallets';
    displayName: 'Wallet';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    user: Attribute.Relation<
      'api::wallet.wallet',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    chain: Attribute.Enumeration<['Ethereum']> &
      Attribute.Required &
      Attribute.DefaultTo<'Ethereum'>;
    address: Attribute.String & Attribute.Required;
    connector: Attribute.String;
    isConnected: Attribute.Boolean & Attribute.DefaultTo<true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::wallet.wallet',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::wallet.wallet',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'api::access-log.access-log': ApiAccessLogAccessLog;
      'api::activity-log.activity-log': ApiActivityLogActivityLog;
      'api::article.article': ApiArticleArticle;
      'api::backup-log.backup-log': ApiBackupLogBackupLog;
      'api::calculate-team-share-log.calculate-team-share-log': ApiCalculateTeamShareLogCalculateTeamShareLog;
      'api::claimed-reward-record.claimed-reward-record': ApiClaimedRewardRecordClaimedRewardRecord;
      'api::daily-check-record.daily-check-record': ApiDailyCheckRecordDailyCheckRecord;
      'api::dv-fund.dv-fund': ApiDvFundDvFund;
      'api::earning-record.earning-record': ApiEarningRecordEarningRecord;
      'api::event-log.event-log': ApiEventLogEventLog;
      'api::fund.fund': ApiFundFund;
      'api::metadata.metadata': ApiMetadataMetadata;
      'api::notification.notification': ApiNotificationNotification;
      'api::package.package': ApiPackagePackage;
      'api::referral.referral': ApiReferralReferral;
      'api::sync-event-log-task-log.sync-event-log-task-log': ApiSyncEventLogTaskLogSyncEventLogTaskLog;
      'api::token.token': ApiTokenToken;
      'api::wallet.wallet': ApiWalletWallet;
    }
  }
}
