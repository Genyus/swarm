// Stub wasp-config for development and testing
// This file provides the same interface as the real wasp-config package
// In production (Wasp project): will resolve to real wasp-config package

export interface ActionConfig {
  fn: {
    import: string;
    from: string;
  };
  entities?: string[];
  auth: boolean;
}

export interface ApiConfig {
  fn: {
    import: string;
    from: string;
  };
  entities?: string[];
  httpRoute: {
    method: string;
    route: string;
  };
  auth: boolean;
}

export interface ApiNamespaceConfig {
  path: string;
  middlewareConfigFn: {
    import: string;
    from: string;
  };
}

export interface Wasp {
  version: string;
}

export interface AppConfig {
  title: string;
  wasp: Wasp;
  head?: string[];
}

export interface AuthMethods {
  usernameAndPassword?: UsernameAndPasswordConfig;
  discord?: ExternalAuthConfig;
  google?: ExternalAuthConfig;
  gitHub?: ExternalAuthConfig;
  keycloak?: ExternalAuthConfig;
  email?: EmailAuthConfig;
}

export interface AuthConfig {
  userEntity: string;
  methods: AuthMethods;
  externalAuthEntity?: string;
  onAuthFailedRedirectTo: string;
  onAuthSucceededRedirectTo?: string;
  onBeforeSignup?: ExtImport;
  onAfterSignup?: ExtImport;
  onAfterEmailVerified?: ExtImport;
  onBeforeOAuthRedirect?: ExtImport;
  onBeforeLogin?: ExtImport;
  onAfterLogin?: ExtImport;
}

export interface UsernameAndPasswordConfig {
  userSignupFields?: ExtImport;
}

export interface EmailAuthConfig {
  userSignupFields?: ExtImport;
  fromField: EmailFromField;
  emailVerification: EmailVerificationConfig;
  passwordReset: PasswordResetConfig;
}

export interface EmailVerificationConfig {
  getEmailContentFn?: ExtImport;
  clientRoute: string;
}

export interface PasswordResetConfig {
  getEmailContentFn?: ExtImport;
  clientRoute: string;
}

export interface ExternalAuthConfig {
  configFn?: ExtImport;
  userSignupFields?: ExtImport;
}

export type ExtImport =
  | {
      import: string;
      from: AppSpecExtImport['path'];
    }
  | {
      importDefault: string;
      from: AppSpecExtImport['path'];
    };

export interface EmailFromField {
  name?: string;
  email: string;
}

export type ExtImportKind = 'named' | 'default';
export interface AppSpecExtImport {
  kind: ExtImportKind;
  name: string;
  path: `@src/${string}`;
}

export interface ClientConfig {
  rootComponent: string;
}

export interface CrudConfig {
  entity: string;
  operations: {
    getAll?: CrudOperationOptions;
    get?: CrudOperationOptions;
    create?: CrudOperationOptions;
    update?: CrudOperationOptions;
    delete?: CrudOperationOptions;
  };
}

export interface CrudOperationOptions {
  entities?: string[];
}

export interface DbConfig {
  system: string;
}

export interface EmailSenderConfig {
  // Add email sender config properties as needed
  [key: string]: unknown;
}

export interface JobConfig {
  executor: string;
  perform: {
    fn: {
      import: string;
      from: string;
    };
  };
  entities?: string[];
  schedule?: {
    cron: string;
    args: Record<string, unknown>;
  };
}

export interface QueryConfig {
  fn: {
    import: string;
    from: string;
  };
  entities?: string[];
  auth: boolean;
}

export interface RouteConfig {
  path: string;
  to: {
    authRequired: boolean;
    component: {
      import: string;
      from: string;
    };
  };
}

export class App {
  name: string;
  config: AppConfig;

  constructor(name: string, config: AppConfig) {
    this.name = name;
    this.config = config;
  }

  auth(_authConfig: AuthConfig): this {
    return this;
  }
  client(_clientConfig: ClientConfig): this {
    return this;
  }
  db(_dbConfig: DbConfig): this {
    return this;
  }
  emailSender(_emailSenderConfig: EmailSenderConfig): this {
    return this;
  }
  job(_name: string, _jobConfig: JobConfig): this {
    return this;
  }
  query(_name: string, _queryConfig: QueryConfig): this {
    return this;
  }
  route(_name: string, _routeConfig: RouteConfig): this {
    return this;
  }
  api(_name: string, _apiConfig: ApiConfig): this {
    return this;
  }
  apiNamespace(_name: string, _apiNamespaceConfig: ApiNamespaceConfig): this {
    return this;
  }
  crud(_name: string, _crudConfig: CrudConfig): this {
    return this;
  }
  action(_name: string, _actionConfig: ActionConfig): this {
    return this;
  }
  page(
    _componentName: string,
    options: {
      authRequired: boolean;
      component: { import: string; from: string };
    }
  ) {
    return { authRequired: options.authRequired, component: options.component };
  }
}
