// Stub for `@wasp.sh/spec`, used for local typechecking and testing.
//
// It mirrors the public API of the real `@wasp.sh/spec` package (Wasp 0.24):
// the spec constructor functions and the types they operate on. In a real Wasp
// project this import resolves to the actual package; here it resolves to this
// stub via the `@wasp.sh/spec` path alias / linked devDependency.
//
// The runtime behaviour is intentionally minimal — the constructors return
// plainly-shaped spec objects. The real spec analysis is performed by Wasp, not
// by this package.

/* -------------------------------------------------------------------------- */
/*  Shared helper types                                                       */
/* -------------------------------------------------------------------------- */

// biome-ignore lint/suspicious/noExplicitAny: stub helper types mirror the real package
type AnyFunction = (...args: any[]) => any;
// biome-ignore lint/suspicious/noExplicitAny: stub helper types mirror the real package
type AnyObject = Record<string, any>;
type ZodSchema = { parse: AnyFunction };

/**
 * Seam for module augmentation (entities, etc.), mirrored from the real
 * package. Simplified — the real package derives `EntityName` from this.
 */
// biome-ignore lint/suspicious/noEmptyInterface: augmentation seam mirrored from the real package
export interface Register {}

/** Name of a Prisma entity. Simplified to `string` in the stub. */
export type EntityName = string;

/* -------------------------------------------------------------------------- */
/*  References                                                                */
/* -------------------------------------------------------------------------- */

/** Named import reference (`import { X } from "./m" with { type: "ref" }`). */
export interface NamedRefObjectDescriptor {
  import: string;
  alias?: string;
  from: string;
}

/** Default import reference (`import X from "./m" with { type: "ref" }`). */
export interface DefaultRefObjectDescriptor {
  importDefault: string;
  from: string;
}

export type RefObjectDescriptor =
  | NamedRefObjectDescriptor
  | DefaultRefObjectDescriptor;

export type RefObject = RefObjectDescriptor & { kind: 'refObject' };

/** A reference to app code, or (when statically resolvable) the value itself. */
export type Reference<AppValue> = RefObject | AppValue;

/** Creates a fallback reference object for a value from your app's `src`. */
export function ref(descriptor: RefObjectDescriptor): RefObject {
  return { ...descriptor, kind: 'refObject' };
}

/* -------------------------------------------------------------------------- */
/*  Spec elements                                                             */
/* -------------------------------------------------------------------------- */

interface BaseSpecElement<Kind extends string> {
  kind: Kind;
}

export interface Page extends BaseSpecElement<'page'> {
  component: Reference<AnyFunction>;
  authRequired?: boolean;
}

export interface Route extends BaseSpecElement<'route'> {
  name: string;
  path: string;
  page: Page;
  prerender?: boolean;
  lazy?: boolean;
}

export interface Query extends BaseSpecElement<'query'> {
  fn: Reference<AnyFunction>;
  entities?: EntityName[];
  auth?: boolean;
}

export interface Action extends BaseSpecElement<'action'> {
  fn: Reference<AnyFunction>;
  entities?: EntityName[];
  auth?: boolean;
}

export type HttpMethod = 'ALL' | 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface Api extends BaseSpecElement<'api'> {
  method: HttpMethod;
  path: string;
  fn: Reference<AnyFunction>;
  middlewareConfigFn?: Reference<AnyFunction>;
  entities?: EntityName[];
  auth?: boolean;
}

export interface ApiNamespace extends BaseSpecElement<'apiNamespace'> {
  middlewareConfigFn: Reference<AnyFunction>;
  path: string;
}

export type JobExecutor = 'PgBoss';

export interface ExecutorOptions {
  pgBoss: object;
}

export interface Schedule {
  cron: string;
  args?: object;
  executorOptions?: ExecutorOptions;
}

export interface Job extends BaseSpecElement<'job'> {
  fn: Reference<AnyFunction>;
  executor: JobExecutor;
  schedule?: Schedule;
  entities?: EntityName[];
  performExecutorOptions?: ExecutorOptions;
}

export interface CrudOperationOptions {
  isPublic?: boolean;
  overrideFn?: Reference<AnyFunction>;
}

export interface CrudOperations {
  get?: CrudOperationOptions;
  getAll?: CrudOperationOptions;
  create?: CrudOperationOptions;
  update?: CrudOperationOptions;
  delete?: CrudOperationOptions;
}

export interface Crud extends BaseSpecElement<'crud'> {
  name: string;
  entity: EntityName;
  operations: CrudOperations;
}

export type SpecElement =
  | Page
  | Route
  | Query
  | Action
  | Api
  | ApiNamespace
  | Job
  | Crud;

/** A single spec element, or an (optionally nested) array of them. */
export type Spec = SpecElement | Spec[];

/* -------------------------------------------------------------------------- */
/*  App-level configuration                                                   */
/* -------------------------------------------------------------------------- */

export interface Wasp {
  version: string;
}

interface BaseAuthMethodConfig {
  userSignupFields?: Reference<AnyObject>;
}

export interface UsernameAndPasswordConfig extends BaseAuthMethodConfig {}

export interface SocialAuthConfig extends BaseAuthMethodConfig {
  configFn?: Reference<AnyFunction>;
}

export interface EmailFlowConfig {
  getEmailContentFn?: Reference<AnyFunction>;
  clientRoute: string;
}

export interface EmailAuthConfig extends BaseAuthMethodConfig {
  fromField: EmailFromField;
  emailVerification: EmailFlowConfig;
  passwordReset: EmailFlowConfig;
}

type SocialAuthMethodName =
  | 'discord'
  | 'google'
  | 'gitHub'
  | 'keycloak'
  | 'microsoft'
  | 'slack';

export interface LocalAuthMethods {
  usernameAndPassword: UsernameAndPasswordConfig;
  email: EmailAuthConfig;
}

export type ExternalAuthMethods = Partial<
  Record<SocialAuthMethodName, SocialAuthConfig>
>;

// Simplified from the real package's `RequireOneOrNone<LocalAuthMethods>`.
export type AuthMethods = Partial<LocalAuthMethods> & ExternalAuthMethods;

interface AuthHooks {
  onBeforeSignup?: Reference<AnyFunction>;
  onAfterSignup?: Reference<AnyFunction>;
  onAfterEmailVerified?: Reference<AnyFunction>;
  onBeforeOAuthRedirect?: Reference<AnyFunction>;
  onBeforeLogin?: Reference<AnyFunction>;
  onAfterLogin?: Reference<AnyFunction>;
}

export interface Auth extends AuthHooks {
  userEntity: EntityName;
  methods: AuthMethods;
  onAuthFailedRedirectTo: string;
  onAuthSucceededRedirectTo?: string;
}

export interface Server {
  setupFn?: Reference<AnyFunction>;
  middlewareConfigFn?: Reference<AnyFunction>;
  envValidationSchema?: Reference<ZodSchema>;
}

export interface Client {
  rootComponent?: Reference<AnyFunction>;
  setupFn?: Reference<AnyFunction>;
  baseDir?: `/${string}`;
  envValidationSchema?: Reference<ZodSchema>;
}

export interface Db {
  seeds?: Reference<AnyFunction>[];
  prismaSetupFn?: Reference<AnyFunction>;
}

export type EmailSenderProviderName = 'SMTP' | 'SendGrid' | 'Mailgun' | 'Dummy';

export interface EmailFromField {
  name?: string;
  email: string;
}

export interface EmailSender {
  provider: EmailSenderProviderName;
  defaultFrom?: EmailFromField;
}

export interface WebSocket {
  fn: Reference<AnyFunction>;
  autoConnect?: boolean;
}

export interface App {
  name: string;
  wasp: Wasp;
  title: string;
  head?: string[];
  auth?: Auth;
  server?: Server;
  client?: Client;
  db?: Db;
  emailSender?: EmailSender;
  webSocket?: WebSocket;
  spec: Spec;
}

/* -------------------------------------------------------------------------- */
/*  Spec constructors                                                         */
/* -------------------------------------------------------------------------- */

/** Creates a Wasp {@link App}. Export the result as the default export. */
export function app(config: Omit<App, 'kind'>): App {
  return config as App;
}

/** Creates a {@link Page} definition. */
export function page(
  component: Page['component'],
  config?: Omit<Page, 'kind' | 'component'>
): Page {
  return { kind: 'page', component, ...config };
}

/** Creates a {@link Route} definition. */
export function route(
  name: Route['name'],
  path: Route['path'],
  page: Route['page'],
  config?: Omit<Route, 'kind' | 'name' | 'path' | 'page'>
): Route {
  return { kind: 'route', name, path, page, ...config };
}

/** Creates a {@link Query} definition. */
export function query(
  fn: Query['fn'],
  config?: Omit<Query, 'kind' | 'fn'>
): Query {
  return { kind: 'query', fn, ...config };
}

/** Creates an {@link Action} definition. */
export function action(
  fn: Action['fn'],
  config?: Omit<Action, 'kind' | 'fn'>
): Action {
  return { kind: 'action', fn, ...config };
}

/** Creates an {@link Api} endpoint definition. */
export function api(
  method: Api['method'],
  path: Api['path'],
  fn: Api['fn'],
  config?: Omit<Api, 'kind' | 'method' | 'path' | 'fn'>
): Api {
  return { kind: 'api', method, path, fn, ...config };
}

/** Creates an {@link ApiNamespace} definition. */
export function apiNamespace(
  path: ApiNamespace['path'],
  config: Omit<ApiNamespace, 'kind' | 'path'>
): ApiNamespace {
  return { kind: 'apiNamespace', path, ...config };
}

/** Creates a {@link Job} definition. */
export function job(fn: Job['fn'], config: Omit<Job, 'kind' | 'fn'>): Job {
  return { kind: 'job', fn, ...config };
}

/** Creates a {@link Crud} definition. */
export function crud(
  name: Crud['name'],
  entity: Crud['entity'],
  operations: Crud['operations']
): Crud {
  return { kind: 'crud', name, entity, operations };
}
