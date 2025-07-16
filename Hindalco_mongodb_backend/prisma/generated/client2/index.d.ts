
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model UserTest
 * 
 */
export type UserTest = $Result.DefaultSelection<Prisma.$UserTestPayload>
/**
 * Model reportKpiDataNewData
 * 
 */
export type reportKpiDataNewData = $Result.DefaultSelection<Prisma.$reportKpiDataNewDataPayload>
/**
 * Model kpiSummary
 * 
 */
export type kpiSummary = $Result.DefaultSelection<Prisma.$kpiSummaryPayload>
/**
 * Model test
 * 
 */
export type test = $Result.DefaultSelection<Prisma.$testPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more UserTests
 * const userTests = await prisma.userTest.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more UserTests
   * const userTests = await prisma.userTest.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.userTest`: Exposes CRUD operations for the **UserTest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserTests
    * const userTests = await prisma.userTest.findMany()
    * ```
    */
  get userTest(): Prisma.UserTestDelegate<ExtArgs>;

  /**
   * `prisma.reportKpiDataNewData`: Exposes CRUD operations for the **reportKpiDataNewData** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReportKpiDataNewData
    * const reportKpiDataNewData = await prisma.reportKpiDataNewData.findMany()
    * ```
    */
  get reportKpiDataNewData(): Prisma.reportKpiDataNewDataDelegate<ExtArgs>;

  /**
   * `prisma.kpiSummary`: Exposes CRUD operations for the **kpiSummary** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more KpiSummaries
    * const kpiSummaries = await prisma.kpiSummary.findMany()
    * ```
    */
  get kpiSummary(): Prisma.kpiSummaryDelegate<ExtArgs>;

  /**
   * `prisma.test`: Exposes CRUD operations for the **test** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tests
    * const tests = await prisma.test.findMany()
    * ```
    */
  get test(): Prisma.testDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    UserTest: 'UserTest',
    reportKpiDataNewData: 'reportKpiDataNewData',
    kpiSummary: 'kpiSummary',
    test: 'test'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "userTest" | "reportKpiDataNewData" | "kpiSummary" | "test"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      UserTest: {
        payload: Prisma.$UserTestPayload<ExtArgs>
        fields: Prisma.UserTestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserTestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserTestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTestPayload>
          }
          findFirst: {
            args: Prisma.UserTestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserTestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTestPayload>
          }
          findMany: {
            args: Prisma.UserTestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTestPayload>[]
          }
          create: {
            args: Prisma.UserTestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTestPayload>
          }
          createMany: {
            args: Prisma.UserTestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserTestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTestPayload>
          }
          update: {
            args: Prisma.UserTestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTestPayload>
          }
          deleteMany: {
            args: Prisma.UserTestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserTestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserTestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTestPayload>
          }
          aggregate: {
            args: Prisma.UserTestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserTest>
          }
          groupBy: {
            args: Prisma.UserTestGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserTestGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserTestCountArgs<ExtArgs>
            result: $Utils.Optional<UserTestCountAggregateOutputType> | number
          }
        }
      }
      reportKpiDataNewData: {
        payload: Prisma.$reportKpiDataNewDataPayload<ExtArgs>
        fields: Prisma.reportKpiDataNewDataFieldRefs
        operations: {
          findUnique: {
            args: Prisma.reportKpiDataNewDataFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reportKpiDataNewDataPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.reportKpiDataNewDataFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reportKpiDataNewDataPayload>
          }
          findFirst: {
            args: Prisma.reportKpiDataNewDataFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reportKpiDataNewDataPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.reportKpiDataNewDataFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reportKpiDataNewDataPayload>
          }
          findMany: {
            args: Prisma.reportKpiDataNewDataFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reportKpiDataNewDataPayload>[]
          }
          create: {
            args: Prisma.reportKpiDataNewDataCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reportKpiDataNewDataPayload>
          }
          createMany: {
            args: Prisma.reportKpiDataNewDataCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.reportKpiDataNewDataDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reportKpiDataNewDataPayload>
          }
          update: {
            args: Prisma.reportKpiDataNewDataUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reportKpiDataNewDataPayload>
          }
          deleteMany: {
            args: Prisma.reportKpiDataNewDataDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.reportKpiDataNewDataUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.reportKpiDataNewDataUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$reportKpiDataNewDataPayload>
          }
          aggregate: {
            args: Prisma.ReportKpiDataNewDataAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReportKpiDataNewData>
          }
          groupBy: {
            args: Prisma.reportKpiDataNewDataGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReportKpiDataNewDataGroupByOutputType>[]
          }
          count: {
            args: Prisma.reportKpiDataNewDataCountArgs<ExtArgs>
            result: $Utils.Optional<ReportKpiDataNewDataCountAggregateOutputType> | number
          }
        }
      }
      kpiSummary: {
        payload: Prisma.$kpiSummaryPayload<ExtArgs>
        fields: Prisma.kpiSummaryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.kpiSummaryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$kpiSummaryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.kpiSummaryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$kpiSummaryPayload>
          }
          findFirst: {
            args: Prisma.kpiSummaryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$kpiSummaryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.kpiSummaryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$kpiSummaryPayload>
          }
          findMany: {
            args: Prisma.kpiSummaryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$kpiSummaryPayload>[]
          }
          create: {
            args: Prisma.kpiSummaryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$kpiSummaryPayload>
          }
          createMany: {
            args: Prisma.kpiSummaryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.kpiSummaryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$kpiSummaryPayload>
          }
          update: {
            args: Prisma.kpiSummaryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$kpiSummaryPayload>
          }
          deleteMany: {
            args: Prisma.kpiSummaryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.kpiSummaryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.kpiSummaryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$kpiSummaryPayload>
          }
          aggregate: {
            args: Prisma.KpiSummaryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKpiSummary>
          }
          groupBy: {
            args: Prisma.kpiSummaryGroupByArgs<ExtArgs>
            result: $Utils.Optional<KpiSummaryGroupByOutputType>[]
          }
          count: {
            args: Prisma.kpiSummaryCountArgs<ExtArgs>
            result: $Utils.Optional<KpiSummaryCountAggregateOutputType> | number
          }
        }
      }
      test: {
        payload: Prisma.$testPayload<ExtArgs>
        fields: Prisma.testFieldRefs
        operations: {
          findUnique: {
            args: Prisma.testFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$testPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.testFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$testPayload>
          }
          findFirst: {
            args: Prisma.testFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$testPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.testFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$testPayload>
          }
          findMany: {
            args: Prisma.testFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$testPayload>[]
          }
          create: {
            args: Prisma.testCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$testPayload>
          }
          createMany: {
            args: Prisma.testCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.testDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$testPayload>
          }
          update: {
            args: Prisma.testUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$testPayload>
          }
          deleteMany: {
            args: Prisma.testDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.testUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.testUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$testPayload>
          }
          aggregate: {
            args: Prisma.TestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTest>
          }
          groupBy: {
            args: Prisma.testGroupByArgs<ExtArgs>
            result: $Utils.Optional<TestGroupByOutputType>[]
          }
          count: {
            args: Prisma.testCountArgs<ExtArgs>
            result: $Utils.Optional<TestCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model UserTest
   */

  export type AggregateUserTest = {
    _count: UserTestCountAggregateOutputType | null
    _min: UserTestMinAggregateOutputType | null
    _max: UserTestMaxAggregateOutputType | null
  }

  export type UserTestMinAggregateOutputType = {
    id: string | null
    kcId: string | null
    email: string | null
    username: string | null
    firstname: string | null
    lastname: string | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    enabled: boolean | null
    organizationId: string | null
    locationId: string | null
    entityId: string | null
    userType: string | null
    status: boolean | null
    avatar: string | null
    deleted: boolean | null
  }

  export type UserTestMaxAggregateOutputType = {
    id: string | null
    kcId: string | null
    email: string | null
    username: string | null
    firstname: string | null
    lastname: string | null
    createdAt: Date | null
    createdBy: string | null
    updatedAt: Date | null
    updatedBy: string | null
    enabled: boolean | null
    organizationId: string | null
    locationId: string | null
    entityId: string | null
    userType: string | null
    status: boolean | null
    avatar: string | null
    deleted: boolean | null
  }

  export type UserTestCountAggregateOutputType = {
    id: number
    kcId: number
    email: number
    username: number
    firstname: number
    lastname: number
    createdAt: number
    createdBy: number
    updatedAt: number
    updatedBy: number
    enabled: number
    organizationId: number
    locationId: number
    entityId: number
    userType: number
    status: number
    avatar: number
    deleted: number
    _all: number
  }


  export type UserTestMinAggregateInputType = {
    id?: true
    kcId?: true
    email?: true
    username?: true
    firstname?: true
    lastname?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    enabled?: true
    organizationId?: true
    locationId?: true
    entityId?: true
    userType?: true
    status?: true
    avatar?: true
    deleted?: true
  }

  export type UserTestMaxAggregateInputType = {
    id?: true
    kcId?: true
    email?: true
    username?: true
    firstname?: true
    lastname?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    enabled?: true
    organizationId?: true
    locationId?: true
    entityId?: true
    userType?: true
    status?: true
    avatar?: true
    deleted?: true
  }

  export type UserTestCountAggregateInputType = {
    id?: true
    kcId?: true
    email?: true
    username?: true
    firstname?: true
    lastname?: true
    createdAt?: true
    createdBy?: true
    updatedAt?: true
    updatedBy?: true
    enabled?: true
    organizationId?: true
    locationId?: true
    entityId?: true
    userType?: true
    status?: true
    avatar?: true
    deleted?: true
    _all?: true
  }

  export type UserTestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTest to aggregate.
     */
    where?: UserTestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTests to fetch.
     */
    orderBy?: UserTestOrderByWithRelationInput | UserTestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserTestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserTests
    **/
    _count?: true | UserTestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserTestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserTestMaxAggregateInputType
  }

  export type GetUserTestAggregateType<T extends UserTestAggregateArgs> = {
        [P in keyof T & keyof AggregateUserTest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserTest[P]>
      : GetScalarType<T[P], AggregateUserTest[P]>
  }




  export type UserTestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTestWhereInput
    orderBy?: UserTestOrderByWithAggregationInput | UserTestOrderByWithAggregationInput[]
    by: UserTestScalarFieldEnum[] | UserTestScalarFieldEnum
    having?: UserTestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserTestCountAggregateInputType | true
    _min?: UserTestMinAggregateInputType
    _max?: UserTestMaxAggregateInputType
  }

  export type UserTestGroupByOutputType = {
    id: string
    kcId: string | null
    email: string | null
    username: string | null
    firstname: string | null
    lastname: string | null
    createdAt: Date
    createdBy: string | null
    updatedAt: Date
    updatedBy: string | null
    enabled: boolean | null
    organizationId: string | null
    locationId: string | null
    entityId: string | null
    userType: string | null
    status: boolean | null
    avatar: string | null
    deleted: boolean | null
    _count: UserTestCountAggregateOutputType | null
    _min: UserTestMinAggregateOutputType | null
    _max: UserTestMaxAggregateOutputType | null
  }

  type GetUserTestGroupByPayload<T extends UserTestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserTestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserTestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserTestGroupByOutputType[P]>
            : GetScalarType<T[P], UserTestGroupByOutputType[P]>
        }
      >
    >


  export type UserTestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    kcId?: boolean
    email?: boolean
    username?: boolean
    firstname?: boolean
    lastname?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    enabled?: boolean
    organizationId?: boolean
    locationId?: boolean
    entityId?: boolean
    userType?: boolean
    status?: boolean
    avatar?: boolean
    deleted?: boolean
  }, ExtArgs["result"]["userTest"]>


  export type UserTestSelectScalar = {
    id?: boolean
    kcId?: boolean
    email?: boolean
    username?: boolean
    firstname?: boolean
    lastname?: boolean
    createdAt?: boolean
    createdBy?: boolean
    updatedAt?: boolean
    updatedBy?: boolean
    enabled?: boolean
    organizationId?: boolean
    locationId?: boolean
    entityId?: boolean
    userType?: boolean
    status?: boolean
    avatar?: boolean
    deleted?: boolean
  }


  export type $UserTestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserTest"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      kcId: string | null
      email: string | null
      username: string | null
      firstname: string | null
      lastname: string | null
      createdAt: Date
      createdBy: string | null
      updatedAt: Date
      updatedBy: string | null
      enabled: boolean | null
      organizationId: string | null
      locationId: string | null
      entityId: string | null
      userType: string | null
      status: boolean | null
      avatar: string | null
      deleted: boolean | null
    }, ExtArgs["result"]["userTest"]>
    composites: {}
  }

  type UserTestGetPayload<S extends boolean | null | undefined | UserTestDefaultArgs> = $Result.GetResult<Prisma.$UserTestPayload, S>

  type UserTestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserTestFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserTestCountAggregateInputType | true
    }

  export interface UserTestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserTest'], meta: { name: 'UserTest' } }
    /**
     * Find zero or one UserTest that matches the filter.
     * @param {UserTestFindUniqueArgs} args - Arguments to find a UserTest
     * @example
     * // Get one UserTest
     * const userTest = await prisma.userTest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserTestFindUniqueArgs>(args: SelectSubset<T, UserTestFindUniqueArgs<ExtArgs>>): Prisma__UserTestClient<$Result.GetResult<Prisma.$UserTestPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserTest that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserTestFindUniqueOrThrowArgs} args - Arguments to find a UserTest
     * @example
     * // Get one UserTest
     * const userTest = await prisma.userTest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserTestFindUniqueOrThrowArgs>(args: SelectSubset<T, UserTestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserTestClient<$Result.GetResult<Prisma.$UserTestPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserTest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTestFindFirstArgs} args - Arguments to find a UserTest
     * @example
     * // Get one UserTest
     * const userTest = await prisma.userTest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserTestFindFirstArgs>(args?: SelectSubset<T, UserTestFindFirstArgs<ExtArgs>>): Prisma__UserTestClient<$Result.GetResult<Prisma.$UserTestPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserTest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTestFindFirstOrThrowArgs} args - Arguments to find a UserTest
     * @example
     * // Get one UserTest
     * const userTest = await prisma.userTest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserTestFindFirstOrThrowArgs>(args?: SelectSubset<T, UserTestFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserTestClient<$Result.GetResult<Prisma.$UserTestPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserTests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserTests
     * const userTests = await prisma.userTest.findMany()
     * 
     * // Get first 10 UserTests
     * const userTests = await prisma.userTest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userTestWithIdOnly = await prisma.userTest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserTestFindManyArgs>(args?: SelectSubset<T, UserTestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTestPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserTest.
     * @param {UserTestCreateArgs} args - Arguments to create a UserTest.
     * @example
     * // Create one UserTest
     * const UserTest = await prisma.userTest.create({
     *   data: {
     *     // ... data to create a UserTest
     *   }
     * })
     * 
     */
    create<T extends UserTestCreateArgs>(args: SelectSubset<T, UserTestCreateArgs<ExtArgs>>): Prisma__UserTestClient<$Result.GetResult<Prisma.$UserTestPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserTests.
     * @param {UserTestCreateManyArgs} args - Arguments to create many UserTests.
     * @example
     * // Create many UserTests
     * const userTest = await prisma.userTest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserTestCreateManyArgs>(args?: SelectSubset<T, UserTestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a UserTest.
     * @param {UserTestDeleteArgs} args - Arguments to delete one UserTest.
     * @example
     * // Delete one UserTest
     * const UserTest = await prisma.userTest.delete({
     *   where: {
     *     // ... filter to delete one UserTest
     *   }
     * })
     * 
     */
    delete<T extends UserTestDeleteArgs>(args: SelectSubset<T, UserTestDeleteArgs<ExtArgs>>): Prisma__UserTestClient<$Result.GetResult<Prisma.$UserTestPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserTest.
     * @param {UserTestUpdateArgs} args - Arguments to update one UserTest.
     * @example
     * // Update one UserTest
     * const userTest = await prisma.userTest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserTestUpdateArgs>(args: SelectSubset<T, UserTestUpdateArgs<ExtArgs>>): Prisma__UserTestClient<$Result.GetResult<Prisma.$UserTestPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserTests.
     * @param {UserTestDeleteManyArgs} args - Arguments to filter UserTests to delete.
     * @example
     * // Delete a few UserTests
     * const { count } = await prisma.userTest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserTestDeleteManyArgs>(args?: SelectSubset<T, UserTestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserTests
     * const userTest = await prisma.userTest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserTestUpdateManyArgs>(args: SelectSubset<T, UserTestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserTest.
     * @param {UserTestUpsertArgs} args - Arguments to update or create a UserTest.
     * @example
     * // Update or create a UserTest
     * const userTest = await prisma.userTest.upsert({
     *   create: {
     *     // ... data to create a UserTest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserTest we want to update
     *   }
     * })
     */
    upsert<T extends UserTestUpsertArgs>(args: SelectSubset<T, UserTestUpsertArgs<ExtArgs>>): Prisma__UserTestClient<$Result.GetResult<Prisma.$UserTestPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserTests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTestCountArgs} args - Arguments to filter UserTests to count.
     * @example
     * // Count the number of UserTests
     * const count = await prisma.userTest.count({
     *   where: {
     *     // ... the filter for the UserTests we want to count
     *   }
     * })
    **/
    count<T extends UserTestCountArgs>(
      args?: Subset<T, UserTestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserTestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserTest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserTestAggregateArgs>(args: Subset<T, UserTestAggregateArgs>): Prisma.PrismaPromise<GetUserTestAggregateType<T>>

    /**
     * Group by UserTest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserTestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserTestGroupByArgs['orderBy'] }
        : { orderBy?: UserTestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserTestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserTestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserTest model
   */
  readonly fields: UserTestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserTest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserTestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserTest model
   */ 
  interface UserTestFieldRefs {
    readonly id: FieldRef<"UserTest", 'String'>
    readonly kcId: FieldRef<"UserTest", 'String'>
    readonly email: FieldRef<"UserTest", 'String'>
    readonly username: FieldRef<"UserTest", 'String'>
    readonly firstname: FieldRef<"UserTest", 'String'>
    readonly lastname: FieldRef<"UserTest", 'String'>
    readonly createdAt: FieldRef<"UserTest", 'DateTime'>
    readonly createdBy: FieldRef<"UserTest", 'String'>
    readonly updatedAt: FieldRef<"UserTest", 'DateTime'>
    readonly updatedBy: FieldRef<"UserTest", 'String'>
    readonly enabled: FieldRef<"UserTest", 'Boolean'>
    readonly organizationId: FieldRef<"UserTest", 'String'>
    readonly locationId: FieldRef<"UserTest", 'String'>
    readonly entityId: FieldRef<"UserTest", 'String'>
    readonly userType: FieldRef<"UserTest", 'String'>
    readonly status: FieldRef<"UserTest", 'Boolean'>
    readonly avatar: FieldRef<"UserTest", 'String'>
    readonly deleted: FieldRef<"UserTest", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * UserTest findUnique
   */
  export type UserTestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTest
     */
    select?: UserTestSelect<ExtArgs> | null
    /**
     * Filter, which UserTest to fetch.
     */
    where: UserTestWhereUniqueInput
  }

  /**
   * UserTest findUniqueOrThrow
   */
  export type UserTestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTest
     */
    select?: UserTestSelect<ExtArgs> | null
    /**
     * Filter, which UserTest to fetch.
     */
    where: UserTestWhereUniqueInput
  }

  /**
   * UserTest findFirst
   */
  export type UserTestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTest
     */
    select?: UserTestSelect<ExtArgs> | null
    /**
     * Filter, which UserTest to fetch.
     */
    where?: UserTestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTests to fetch.
     */
    orderBy?: UserTestOrderByWithRelationInput | UserTestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTests.
     */
    cursor?: UserTestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTests.
     */
    distinct?: UserTestScalarFieldEnum | UserTestScalarFieldEnum[]
  }

  /**
   * UserTest findFirstOrThrow
   */
  export type UserTestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTest
     */
    select?: UserTestSelect<ExtArgs> | null
    /**
     * Filter, which UserTest to fetch.
     */
    where?: UserTestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTests to fetch.
     */
    orderBy?: UserTestOrderByWithRelationInput | UserTestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTests.
     */
    cursor?: UserTestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTests.
     */
    distinct?: UserTestScalarFieldEnum | UserTestScalarFieldEnum[]
  }

  /**
   * UserTest findMany
   */
  export type UserTestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTest
     */
    select?: UserTestSelect<ExtArgs> | null
    /**
     * Filter, which UserTests to fetch.
     */
    where?: UserTestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTests to fetch.
     */
    orderBy?: UserTestOrderByWithRelationInput | UserTestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserTests.
     */
    cursor?: UserTestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTests.
     */
    skip?: number
    distinct?: UserTestScalarFieldEnum | UserTestScalarFieldEnum[]
  }

  /**
   * UserTest create
   */
  export type UserTestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTest
     */
    select?: UserTestSelect<ExtArgs> | null
    /**
     * The data needed to create a UserTest.
     */
    data: XOR<UserTestCreateInput, UserTestUncheckedCreateInput>
  }

  /**
   * UserTest createMany
   */
  export type UserTestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserTests.
     */
    data: UserTestCreateManyInput | UserTestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserTest update
   */
  export type UserTestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTest
     */
    select?: UserTestSelect<ExtArgs> | null
    /**
     * The data needed to update a UserTest.
     */
    data: XOR<UserTestUpdateInput, UserTestUncheckedUpdateInput>
    /**
     * Choose, which UserTest to update.
     */
    where: UserTestWhereUniqueInput
  }

  /**
   * UserTest updateMany
   */
  export type UserTestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserTests.
     */
    data: XOR<UserTestUpdateManyMutationInput, UserTestUncheckedUpdateManyInput>
    /**
     * Filter which UserTests to update
     */
    where?: UserTestWhereInput
  }

  /**
   * UserTest upsert
   */
  export type UserTestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTest
     */
    select?: UserTestSelect<ExtArgs> | null
    /**
     * The filter to search for the UserTest to update in case it exists.
     */
    where: UserTestWhereUniqueInput
    /**
     * In case the UserTest found by the `where` argument doesn't exist, create a new UserTest with this data.
     */
    create: XOR<UserTestCreateInput, UserTestUncheckedCreateInput>
    /**
     * In case the UserTest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserTestUpdateInput, UserTestUncheckedUpdateInput>
  }

  /**
   * UserTest delete
   */
  export type UserTestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTest
     */
    select?: UserTestSelect<ExtArgs> | null
    /**
     * Filter which UserTest to delete.
     */
    where: UserTestWhereUniqueInput
  }

  /**
   * UserTest deleteMany
   */
  export type UserTestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTests to delete
     */
    where?: UserTestWhereInput
  }

  /**
   * UserTest without action
   */
  export type UserTestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTest
     */
    select?: UserTestSelect<ExtArgs> | null
  }


  /**
   * Model reportKpiDataNewData
   */

  export type AggregateReportKpiDataNewData = {
    _count: ReportKpiDataNewDataCountAggregateOutputType | null
    _avg: ReportKpiDataNewDataAvgAggregateOutputType | null
    _sum: ReportKpiDataNewDataSumAggregateOutputType | null
    _min: ReportKpiDataNewDataMinAggregateOutputType | null
    _max: ReportKpiDataNewDataMaxAggregateOutputType | null
  }

  export type ReportKpiDataNewDataAvgAggregateOutputType = {
    kpiValue: number | null
    minimumTarget: number | null
    target: number | null
    operationalTarget: number | null
    kpiWeightage: number | null
    kpiScore: number | null
    kpiVariance: number | null
    percentage: number | null
  }

  export type ReportKpiDataNewDataSumAggregateOutputType = {
    kpiValue: number | null
    minimumTarget: number | null
    target: number | null
    operationalTarget: number | null
    kpiWeightage: number | null
    kpiScore: number | null
    kpiVariance: number | null
    percentage: number | null
  }

  export type ReportKpiDataNewDataMinAggregateOutputType = {
    id: string | null
    kpiTemplateId: string | null
    kpiCategoryId: string | null
    kpiReportId: string | null
    kpiId: string | null
    kraId: string | null
    kpiLocation: string | null
    kpiOrganization: string | null
    kpiEntity: string | null
    kpibusiness: string | null
    kpiValue: number | null
    kpiComments: string | null
    kpiTargetType: string | null
    minimumTarget: number | null
    target: number | null
    operationalTarget: number | null
    kpiWeightage: number | null
    kpiScore: number | null
    kpiVariance: number | null
    percentage: number | null
    kpiStatus: string | null
    reportDate: Date | null
    reportFor: Date | null
    reportYear: string | null
  }

  export type ReportKpiDataNewDataMaxAggregateOutputType = {
    id: string | null
    kpiTemplateId: string | null
    kpiCategoryId: string | null
    kpiReportId: string | null
    kpiId: string | null
    kraId: string | null
    kpiLocation: string | null
    kpiOrganization: string | null
    kpiEntity: string | null
    kpibusiness: string | null
    kpiValue: number | null
    kpiComments: string | null
    kpiTargetType: string | null
    minimumTarget: number | null
    target: number | null
    operationalTarget: number | null
    kpiWeightage: number | null
    kpiScore: number | null
    kpiVariance: number | null
    percentage: number | null
    kpiStatus: string | null
    reportDate: Date | null
    reportFor: Date | null
    reportYear: string | null
  }

  export type ReportKpiDataNewDataCountAggregateOutputType = {
    id: number
    kpiTemplateId: number
    kpiCategoryId: number
    kpiReportId: number
    kpiId: number
    kraId: number
    kpiLocation: number
    kpiOrganization: number
    kpiEntity: number
    kpibusiness: number
    kpiValue: number
    kpiComments: number
    kpiTargetType: number
    minimumTarget: number
    target: number
    operationalTarget: number
    kpiWeightage: number
    kpiScore: number
    kpiVariance: number
    percentage: number
    kpiStatus: number
    objectiveId: number
    reportDate: number
    reportFor: number
    reportYear: number
    _all: number
  }


  export type ReportKpiDataNewDataAvgAggregateInputType = {
    kpiValue?: true
    minimumTarget?: true
    target?: true
    operationalTarget?: true
    kpiWeightage?: true
    kpiScore?: true
    kpiVariance?: true
    percentage?: true
  }

  export type ReportKpiDataNewDataSumAggregateInputType = {
    kpiValue?: true
    minimumTarget?: true
    target?: true
    operationalTarget?: true
    kpiWeightage?: true
    kpiScore?: true
    kpiVariance?: true
    percentage?: true
  }

  export type ReportKpiDataNewDataMinAggregateInputType = {
    id?: true
    kpiTemplateId?: true
    kpiCategoryId?: true
    kpiReportId?: true
    kpiId?: true
    kraId?: true
    kpiLocation?: true
    kpiOrganization?: true
    kpiEntity?: true
    kpibusiness?: true
    kpiValue?: true
    kpiComments?: true
    kpiTargetType?: true
    minimumTarget?: true
    target?: true
    operationalTarget?: true
    kpiWeightage?: true
    kpiScore?: true
    kpiVariance?: true
    percentage?: true
    kpiStatus?: true
    reportDate?: true
    reportFor?: true
    reportYear?: true
  }

  export type ReportKpiDataNewDataMaxAggregateInputType = {
    id?: true
    kpiTemplateId?: true
    kpiCategoryId?: true
    kpiReportId?: true
    kpiId?: true
    kraId?: true
    kpiLocation?: true
    kpiOrganization?: true
    kpiEntity?: true
    kpibusiness?: true
    kpiValue?: true
    kpiComments?: true
    kpiTargetType?: true
    minimumTarget?: true
    target?: true
    operationalTarget?: true
    kpiWeightage?: true
    kpiScore?: true
    kpiVariance?: true
    percentage?: true
    kpiStatus?: true
    reportDate?: true
    reportFor?: true
    reportYear?: true
  }

  export type ReportKpiDataNewDataCountAggregateInputType = {
    id?: true
    kpiTemplateId?: true
    kpiCategoryId?: true
    kpiReportId?: true
    kpiId?: true
    kraId?: true
    kpiLocation?: true
    kpiOrganization?: true
    kpiEntity?: true
    kpibusiness?: true
    kpiValue?: true
    kpiComments?: true
    kpiTargetType?: true
    minimumTarget?: true
    target?: true
    operationalTarget?: true
    kpiWeightage?: true
    kpiScore?: true
    kpiVariance?: true
    percentage?: true
    kpiStatus?: true
    objectiveId?: true
    reportDate?: true
    reportFor?: true
    reportYear?: true
    _all?: true
  }

  export type ReportKpiDataNewDataAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which reportKpiDataNewData to aggregate.
     */
    where?: reportKpiDataNewDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reportKpiDataNewData to fetch.
     */
    orderBy?: reportKpiDataNewDataOrderByWithRelationInput | reportKpiDataNewDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: reportKpiDataNewDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reportKpiDataNewData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reportKpiDataNewData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned reportKpiDataNewData
    **/
    _count?: true | ReportKpiDataNewDataCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReportKpiDataNewDataAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReportKpiDataNewDataSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReportKpiDataNewDataMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReportKpiDataNewDataMaxAggregateInputType
  }

  export type GetReportKpiDataNewDataAggregateType<T extends ReportKpiDataNewDataAggregateArgs> = {
        [P in keyof T & keyof AggregateReportKpiDataNewData]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReportKpiDataNewData[P]>
      : GetScalarType<T[P], AggregateReportKpiDataNewData[P]>
  }




  export type reportKpiDataNewDataGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: reportKpiDataNewDataWhereInput
    orderBy?: reportKpiDataNewDataOrderByWithAggregationInput | reportKpiDataNewDataOrderByWithAggregationInput[]
    by: ReportKpiDataNewDataScalarFieldEnum[] | ReportKpiDataNewDataScalarFieldEnum
    having?: reportKpiDataNewDataScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReportKpiDataNewDataCountAggregateInputType | true
    _avg?: ReportKpiDataNewDataAvgAggregateInputType
    _sum?: ReportKpiDataNewDataSumAggregateInputType
    _min?: ReportKpiDataNewDataMinAggregateInputType
    _max?: ReportKpiDataNewDataMaxAggregateInputType
  }

  export type ReportKpiDataNewDataGroupByOutputType = {
    id: string
    kpiTemplateId: string
    kpiCategoryId: string
    kpiReportId: string
    kpiId: string
    kraId: string | null
    kpiLocation: string | null
    kpiOrganization: string | null
    kpiEntity: string | null
    kpibusiness: string | null
    kpiValue: number
    kpiComments: string | null
    kpiTargetType: string | null
    minimumTarget: number | null
    target: number | null
    operationalTarget: number | null
    kpiWeightage: number | null
    kpiScore: number | null
    kpiVariance: number | null
    percentage: number | null
    kpiStatus: string | null
    objectiveId: JsonValue | null
    reportDate: Date
    reportFor: Date
    reportYear: string | null
    _count: ReportKpiDataNewDataCountAggregateOutputType | null
    _avg: ReportKpiDataNewDataAvgAggregateOutputType | null
    _sum: ReportKpiDataNewDataSumAggregateOutputType | null
    _min: ReportKpiDataNewDataMinAggregateOutputType | null
    _max: ReportKpiDataNewDataMaxAggregateOutputType | null
  }

  type GetReportKpiDataNewDataGroupByPayload<T extends reportKpiDataNewDataGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReportKpiDataNewDataGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReportKpiDataNewDataGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReportKpiDataNewDataGroupByOutputType[P]>
            : GetScalarType<T[P], ReportKpiDataNewDataGroupByOutputType[P]>
        }
      >
    >


  export type reportKpiDataNewDataSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    kpiTemplateId?: boolean
    kpiCategoryId?: boolean
    kpiReportId?: boolean
    kpiId?: boolean
    kraId?: boolean
    kpiLocation?: boolean
    kpiOrganization?: boolean
    kpiEntity?: boolean
    kpibusiness?: boolean
    kpiValue?: boolean
    kpiComments?: boolean
    kpiTargetType?: boolean
    minimumTarget?: boolean
    target?: boolean
    operationalTarget?: boolean
    kpiWeightage?: boolean
    kpiScore?: boolean
    kpiVariance?: boolean
    percentage?: boolean
    kpiStatus?: boolean
    objectiveId?: boolean
    reportDate?: boolean
    reportFor?: boolean
    reportYear?: boolean
  }, ExtArgs["result"]["reportKpiDataNewData"]>


  export type reportKpiDataNewDataSelectScalar = {
    id?: boolean
    kpiTemplateId?: boolean
    kpiCategoryId?: boolean
    kpiReportId?: boolean
    kpiId?: boolean
    kraId?: boolean
    kpiLocation?: boolean
    kpiOrganization?: boolean
    kpiEntity?: boolean
    kpibusiness?: boolean
    kpiValue?: boolean
    kpiComments?: boolean
    kpiTargetType?: boolean
    minimumTarget?: boolean
    target?: boolean
    operationalTarget?: boolean
    kpiWeightage?: boolean
    kpiScore?: boolean
    kpiVariance?: boolean
    percentage?: boolean
    kpiStatus?: boolean
    objectiveId?: boolean
    reportDate?: boolean
    reportFor?: boolean
    reportYear?: boolean
  }


  export type $reportKpiDataNewDataPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "reportKpiDataNewData"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      kpiTemplateId: string
      kpiCategoryId: string
      kpiReportId: string
      kpiId: string
      kraId: string | null
      kpiLocation: string | null
      kpiOrganization: string | null
      kpiEntity: string | null
      kpibusiness: string | null
      kpiValue: number
      kpiComments: string | null
      kpiTargetType: string | null
      minimumTarget: number | null
      target: number | null
      operationalTarget: number | null
      kpiWeightage: number | null
      kpiScore: number | null
      kpiVariance: number | null
      percentage: number | null
      kpiStatus: string | null
      objectiveId: Prisma.JsonValue | null
      reportDate: Date
      reportFor: Date
      reportYear: string | null
    }, ExtArgs["result"]["reportKpiDataNewData"]>
    composites: {}
  }

  type reportKpiDataNewDataGetPayload<S extends boolean | null | undefined | reportKpiDataNewDataDefaultArgs> = $Result.GetResult<Prisma.$reportKpiDataNewDataPayload, S>

  type reportKpiDataNewDataCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<reportKpiDataNewDataFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ReportKpiDataNewDataCountAggregateInputType | true
    }

  export interface reportKpiDataNewDataDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['reportKpiDataNewData'], meta: { name: 'reportKpiDataNewData' } }
    /**
     * Find zero or one ReportKpiDataNewData that matches the filter.
     * @param {reportKpiDataNewDataFindUniqueArgs} args - Arguments to find a ReportKpiDataNewData
     * @example
     * // Get one ReportKpiDataNewData
     * const reportKpiDataNewData = await prisma.reportKpiDataNewData.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends reportKpiDataNewDataFindUniqueArgs>(args: SelectSubset<T, reportKpiDataNewDataFindUniqueArgs<ExtArgs>>): Prisma__reportKpiDataNewDataClient<$Result.GetResult<Prisma.$reportKpiDataNewDataPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ReportKpiDataNewData that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {reportKpiDataNewDataFindUniqueOrThrowArgs} args - Arguments to find a ReportKpiDataNewData
     * @example
     * // Get one ReportKpiDataNewData
     * const reportKpiDataNewData = await prisma.reportKpiDataNewData.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends reportKpiDataNewDataFindUniqueOrThrowArgs>(args: SelectSubset<T, reportKpiDataNewDataFindUniqueOrThrowArgs<ExtArgs>>): Prisma__reportKpiDataNewDataClient<$Result.GetResult<Prisma.$reportKpiDataNewDataPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ReportKpiDataNewData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reportKpiDataNewDataFindFirstArgs} args - Arguments to find a ReportKpiDataNewData
     * @example
     * // Get one ReportKpiDataNewData
     * const reportKpiDataNewData = await prisma.reportKpiDataNewData.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends reportKpiDataNewDataFindFirstArgs>(args?: SelectSubset<T, reportKpiDataNewDataFindFirstArgs<ExtArgs>>): Prisma__reportKpiDataNewDataClient<$Result.GetResult<Prisma.$reportKpiDataNewDataPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ReportKpiDataNewData that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reportKpiDataNewDataFindFirstOrThrowArgs} args - Arguments to find a ReportKpiDataNewData
     * @example
     * // Get one ReportKpiDataNewData
     * const reportKpiDataNewData = await prisma.reportKpiDataNewData.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends reportKpiDataNewDataFindFirstOrThrowArgs>(args?: SelectSubset<T, reportKpiDataNewDataFindFirstOrThrowArgs<ExtArgs>>): Prisma__reportKpiDataNewDataClient<$Result.GetResult<Prisma.$reportKpiDataNewDataPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ReportKpiDataNewData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reportKpiDataNewDataFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReportKpiDataNewData
     * const reportKpiDataNewData = await prisma.reportKpiDataNewData.findMany()
     * 
     * // Get first 10 ReportKpiDataNewData
     * const reportKpiDataNewData = await prisma.reportKpiDataNewData.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reportKpiDataNewDataWithIdOnly = await prisma.reportKpiDataNewData.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends reportKpiDataNewDataFindManyArgs>(args?: SelectSubset<T, reportKpiDataNewDataFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$reportKpiDataNewDataPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ReportKpiDataNewData.
     * @param {reportKpiDataNewDataCreateArgs} args - Arguments to create a ReportKpiDataNewData.
     * @example
     * // Create one ReportKpiDataNewData
     * const ReportKpiDataNewData = await prisma.reportKpiDataNewData.create({
     *   data: {
     *     // ... data to create a ReportKpiDataNewData
     *   }
     * })
     * 
     */
    create<T extends reportKpiDataNewDataCreateArgs>(args: SelectSubset<T, reportKpiDataNewDataCreateArgs<ExtArgs>>): Prisma__reportKpiDataNewDataClient<$Result.GetResult<Prisma.$reportKpiDataNewDataPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ReportKpiDataNewData.
     * @param {reportKpiDataNewDataCreateManyArgs} args - Arguments to create many ReportKpiDataNewData.
     * @example
     * // Create many ReportKpiDataNewData
     * const reportKpiDataNewData = await prisma.reportKpiDataNewData.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends reportKpiDataNewDataCreateManyArgs>(args?: SelectSubset<T, reportKpiDataNewDataCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ReportKpiDataNewData.
     * @param {reportKpiDataNewDataDeleteArgs} args - Arguments to delete one ReportKpiDataNewData.
     * @example
     * // Delete one ReportKpiDataNewData
     * const ReportKpiDataNewData = await prisma.reportKpiDataNewData.delete({
     *   where: {
     *     // ... filter to delete one ReportKpiDataNewData
     *   }
     * })
     * 
     */
    delete<T extends reportKpiDataNewDataDeleteArgs>(args: SelectSubset<T, reportKpiDataNewDataDeleteArgs<ExtArgs>>): Prisma__reportKpiDataNewDataClient<$Result.GetResult<Prisma.$reportKpiDataNewDataPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ReportKpiDataNewData.
     * @param {reportKpiDataNewDataUpdateArgs} args - Arguments to update one ReportKpiDataNewData.
     * @example
     * // Update one ReportKpiDataNewData
     * const reportKpiDataNewData = await prisma.reportKpiDataNewData.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends reportKpiDataNewDataUpdateArgs>(args: SelectSubset<T, reportKpiDataNewDataUpdateArgs<ExtArgs>>): Prisma__reportKpiDataNewDataClient<$Result.GetResult<Prisma.$reportKpiDataNewDataPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ReportKpiDataNewData.
     * @param {reportKpiDataNewDataDeleteManyArgs} args - Arguments to filter ReportKpiDataNewData to delete.
     * @example
     * // Delete a few ReportKpiDataNewData
     * const { count } = await prisma.reportKpiDataNewData.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends reportKpiDataNewDataDeleteManyArgs>(args?: SelectSubset<T, reportKpiDataNewDataDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReportKpiDataNewData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reportKpiDataNewDataUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReportKpiDataNewData
     * const reportKpiDataNewData = await prisma.reportKpiDataNewData.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends reportKpiDataNewDataUpdateManyArgs>(args: SelectSubset<T, reportKpiDataNewDataUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ReportKpiDataNewData.
     * @param {reportKpiDataNewDataUpsertArgs} args - Arguments to update or create a ReportKpiDataNewData.
     * @example
     * // Update or create a ReportKpiDataNewData
     * const reportKpiDataNewData = await prisma.reportKpiDataNewData.upsert({
     *   create: {
     *     // ... data to create a ReportKpiDataNewData
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReportKpiDataNewData we want to update
     *   }
     * })
     */
    upsert<T extends reportKpiDataNewDataUpsertArgs>(args: SelectSubset<T, reportKpiDataNewDataUpsertArgs<ExtArgs>>): Prisma__reportKpiDataNewDataClient<$Result.GetResult<Prisma.$reportKpiDataNewDataPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ReportKpiDataNewData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reportKpiDataNewDataCountArgs} args - Arguments to filter ReportKpiDataNewData to count.
     * @example
     * // Count the number of ReportKpiDataNewData
     * const count = await prisma.reportKpiDataNewData.count({
     *   where: {
     *     // ... the filter for the ReportKpiDataNewData we want to count
     *   }
     * })
    **/
    count<T extends reportKpiDataNewDataCountArgs>(
      args?: Subset<T, reportKpiDataNewDataCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReportKpiDataNewDataCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReportKpiDataNewData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReportKpiDataNewDataAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReportKpiDataNewDataAggregateArgs>(args: Subset<T, ReportKpiDataNewDataAggregateArgs>): Prisma.PrismaPromise<GetReportKpiDataNewDataAggregateType<T>>

    /**
     * Group by ReportKpiDataNewData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {reportKpiDataNewDataGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends reportKpiDataNewDataGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: reportKpiDataNewDataGroupByArgs['orderBy'] }
        : { orderBy?: reportKpiDataNewDataGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, reportKpiDataNewDataGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReportKpiDataNewDataGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the reportKpiDataNewData model
   */
  readonly fields: reportKpiDataNewDataFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for reportKpiDataNewData.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__reportKpiDataNewDataClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the reportKpiDataNewData model
   */ 
  interface reportKpiDataNewDataFieldRefs {
    readonly id: FieldRef<"reportKpiDataNewData", 'String'>
    readonly kpiTemplateId: FieldRef<"reportKpiDataNewData", 'String'>
    readonly kpiCategoryId: FieldRef<"reportKpiDataNewData", 'String'>
    readonly kpiReportId: FieldRef<"reportKpiDataNewData", 'String'>
    readonly kpiId: FieldRef<"reportKpiDataNewData", 'String'>
    readonly kraId: FieldRef<"reportKpiDataNewData", 'String'>
    readonly kpiLocation: FieldRef<"reportKpiDataNewData", 'String'>
    readonly kpiOrganization: FieldRef<"reportKpiDataNewData", 'String'>
    readonly kpiEntity: FieldRef<"reportKpiDataNewData", 'String'>
    readonly kpibusiness: FieldRef<"reportKpiDataNewData", 'String'>
    readonly kpiValue: FieldRef<"reportKpiDataNewData", 'Float'>
    readonly kpiComments: FieldRef<"reportKpiDataNewData", 'String'>
    readonly kpiTargetType: FieldRef<"reportKpiDataNewData", 'String'>
    readonly minimumTarget: FieldRef<"reportKpiDataNewData", 'Float'>
    readonly target: FieldRef<"reportKpiDataNewData", 'Float'>
    readonly operationalTarget: FieldRef<"reportKpiDataNewData", 'Float'>
    readonly kpiWeightage: FieldRef<"reportKpiDataNewData", 'Float'>
    readonly kpiScore: FieldRef<"reportKpiDataNewData", 'Float'>
    readonly kpiVariance: FieldRef<"reportKpiDataNewData", 'Float'>
    readonly percentage: FieldRef<"reportKpiDataNewData", 'Float'>
    readonly kpiStatus: FieldRef<"reportKpiDataNewData", 'String'>
    readonly objectiveId: FieldRef<"reportKpiDataNewData", 'Json'>
    readonly reportDate: FieldRef<"reportKpiDataNewData", 'DateTime'>
    readonly reportFor: FieldRef<"reportKpiDataNewData", 'DateTime'>
    readonly reportYear: FieldRef<"reportKpiDataNewData", 'String'>
  }
    

  // Custom InputTypes
  /**
   * reportKpiDataNewData findUnique
   */
  export type reportKpiDataNewDataFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reportKpiDataNewData
     */
    select?: reportKpiDataNewDataSelect<ExtArgs> | null
    /**
     * Filter, which reportKpiDataNewData to fetch.
     */
    where: reportKpiDataNewDataWhereUniqueInput
  }

  /**
   * reportKpiDataNewData findUniqueOrThrow
   */
  export type reportKpiDataNewDataFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reportKpiDataNewData
     */
    select?: reportKpiDataNewDataSelect<ExtArgs> | null
    /**
     * Filter, which reportKpiDataNewData to fetch.
     */
    where: reportKpiDataNewDataWhereUniqueInput
  }

  /**
   * reportKpiDataNewData findFirst
   */
  export type reportKpiDataNewDataFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reportKpiDataNewData
     */
    select?: reportKpiDataNewDataSelect<ExtArgs> | null
    /**
     * Filter, which reportKpiDataNewData to fetch.
     */
    where?: reportKpiDataNewDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reportKpiDataNewData to fetch.
     */
    orderBy?: reportKpiDataNewDataOrderByWithRelationInput | reportKpiDataNewDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for reportKpiDataNewData.
     */
    cursor?: reportKpiDataNewDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reportKpiDataNewData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reportKpiDataNewData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of reportKpiDataNewData.
     */
    distinct?: ReportKpiDataNewDataScalarFieldEnum | ReportKpiDataNewDataScalarFieldEnum[]
  }

  /**
   * reportKpiDataNewData findFirstOrThrow
   */
  export type reportKpiDataNewDataFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reportKpiDataNewData
     */
    select?: reportKpiDataNewDataSelect<ExtArgs> | null
    /**
     * Filter, which reportKpiDataNewData to fetch.
     */
    where?: reportKpiDataNewDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reportKpiDataNewData to fetch.
     */
    orderBy?: reportKpiDataNewDataOrderByWithRelationInput | reportKpiDataNewDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for reportKpiDataNewData.
     */
    cursor?: reportKpiDataNewDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reportKpiDataNewData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reportKpiDataNewData.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of reportKpiDataNewData.
     */
    distinct?: ReportKpiDataNewDataScalarFieldEnum | ReportKpiDataNewDataScalarFieldEnum[]
  }

  /**
   * reportKpiDataNewData findMany
   */
  export type reportKpiDataNewDataFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reportKpiDataNewData
     */
    select?: reportKpiDataNewDataSelect<ExtArgs> | null
    /**
     * Filter, which reportKpiDataNewData to fetch.
     */
    where?: reportKpiDataNewDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of reportKpiDataNewData to fetch.
     */
    orderBy?: reportKpiDataNewDataOrderByWithRelationInput | reportKpiDataNewDataOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing reportKpiDataNewData.
     */
    cursor?: reportKpiDataNewDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` reportKpiDataNewData from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` reportKpiDataNewData.
     */
    skip?: number
    distinct?: ReportKpiDataNewDataScalarFieldEnum | ReportKpiDataNewDataScalarFieldEnum[]
  }

  /**
   * reportKpiDataNewData create
   */
  export type reportKpiDataNewDataCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reportKpiDataNewData
     */
    select?: reportKpiDataNewDataSelect<ExtArgs> | null
    /**
     * The data needed to create a reportKpiDataNewData.
     */
    data: XOR<reportKpiDataNewDataCreateInput, reportKpiDataNewDataUncheckedCreateInput>
  }

  /**
   * reportKpiDataNewData createMany
   */
  export type reportKpiDataNewDataCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many reportKpiDataNewData.
     */
    data: reportKpiDataNewDataCreateManyInput | reportKpiDataNewDataCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * reportKpiDataNewData update
   */
  export type reportKpiDataNewDataUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reportKpiDataNewData
     */
    select?: reportKpiDataNewDataSelect<ExtArgs> | null
    /**
     * The data needed to update a reportKpiDataNewData.
     */
    data: XOR<reportKpiDataNewDataUpdateInput, reportKpiDataNewDataUncheckedUpdateInput>
    /**
     * Choose, which reportKpiDataNewData to update.
     */
    where: reportKpiDataNewDataWhereUniqueInput
  }

  /**
   * reportKpiDataNewData updateMany
   */
  export type reportKpiDataNewDataUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update reportKpiDataNewData.
     */
    data: XOR<reportKpiDataNewDataUpdateManyMutationInput, reportKpiDataNewDataUncheckedUpdateManyInput>
    /**
     * Filter which reportKpiDataNewData to update
     */
    where?: reportKpiDataNewDataWhereInput
  }

  /**
   * reportKpiDataNewData upsert
   */
  export type reportKpiDataNewDataUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reportKpiDataNewData
     */
    select?: reportKpiDataNewDataSelect<ExtArgs> | null
    /**
     * The filter to search for the reportKpiDataNewData to update in case it exists.
     */
    where: reportKpiDataNewDataWhereUniqueInput
    /**
     * In case the reportKpiDataNewData found by the `where` argument doesn't exist, create a new reportKpiDataNewData with this data.
     */
    create: XOR<reportKpiDataNewDataCreateInput, reportKpiDataNewDataUncheckedCreateInput>
    /**
     * In case the reportKpiDataNewData was found with the provided `where` argument, update it with this data.
     */
    update: XOR<reportKpiDataNewDataUpdateInput, reportKpiDataNewDataUncheckedUpdateInput>
  }

  /**
   * reportKpiDataNewData delete
   */
  export type reportKpiDataNewDataDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reportKpiDataNewData
     */
    select?: reportKpiDataNewDataSelect<ExtArgs> | null
    /**
     * Filter which reportKpiDataNewData to delete.
     */
    where: reportKpiDataNewDataWhereUniqueInput
  }

  /**
   * reportKpiDataNewData deleteMany
   */
  export type reportKpiDataNewDataDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which reportKpiDataNewData to delete
     */
    where?: reportKpiDataNewDataWhereInput
  }

  /**
   * reportKpiDataNewData without action
   */
  export type reportKpiDataNewDataDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the reportKpiDataNewData
     */
    select?: reportKpiDataNewDataSelect<ExtArgs> | null
  }


  /**
   * Model kpiSummary
   */

  export type AggregateKpiSummary = {
    _count: KpiSummaryCountAggregateOutputType | null
    _avg: KpiSummaryAvgAggregateOutputType | null
    _sum: KpiSummarySumAggregateOutputType | null
    _min: KpiSummaryMinAggregateOutputType | null
    _max: KpiSummaryMaxAggregateOutputType | null
  }

  export type KpiSummaryAvgAggregateOutputType = {
    kpiMonthYear: number | null
    monthlySum: number | null
    monthlyAverage: number | null
    monthlyVariance: number | null
    monthlyTarget: number | null
    monthlyMinimumTarget: number | null
    monthlyOperationalTarget: number | null
    monthlyWeightedScore: number | null
    percentage: number | null
    count: number | null
    kpiYear: number | null
    kpiPeriod: number | null
    kpiSemiAnnual: number | null
  }

  export type KpiSummarySumAggregateOutputType = {
    kpiMonthYear: number | null
    monthlySum: number | null
    monthlyAverage: number | null
    monthlyVariance: number | null
    monthlyTarget: number | null
    monthlyMinimumTarget: number | null
    monthlyOperationalTarget: number | null
    monthlyWeightedScore: number | null
    percentage: number | null
    count: number | null
    kpiYear: number | null
    kpiPeriod: number | null
    kpiSemiAnnual: number | null
  }

  export type KpiSummaryMinAggregateOutputType = {
    id: string | null
    kpiId: string | null
    kraId: string | null
    kpiEntity: string | null
    kpibusiness: string | null
    kpiLocation: string | null
    kpiOrganization: string | null
    kpiMonthYear: number | null
    monthlySum: number | null
    monthlyAverage: number | null
    monthlyVariance: number | null
    monthlyTarget: number | null
    monthlyMinimumTarget: number | null
    monthlyOperationalTarget: number | null
    monthlyWeightedScore: number | null
    percentage: number | null
    kpiComments: string | null
    count: number | null
    kpiYear: number | null
    kpiPeriod: number | null
    kpiSemiAnnual: number | null
  }

  export type KpiSummaryMaxAggregateOutputType = {
    id: string | null
    kpiId: string | null
    kraId: string | null
    kpiEntity: string | null
    kpibusiness: string | null
    kpiLocation: string | null
    kpiOrganization: string | null
    kpiMonthYear: number | null
    monthlySum: number | null
    monthlyAverage: number | null
    monthlyVariance: number | null
    monthlyTarget: number | null
    monthlyMinimumTarget: number | null
    monthlyOperationalTarget: number | null
    monthlyWeightedScore: number | null
    percentage: number | null
    kpiComments: string | null
    count: number | null
    kpiYear: number | null
    kpiPeriod: number | null
    kpiSemiAnnual: number | null
  }

  export type KpiSummaryCountAggregateOutputType = {
    id: number
    kpiId: number
    kraId: number
    objectiveId: number
    kpiEntity: number
    kpibusiness: number
    kpiLocation: number
    kpiOrganization: number
    kpiMonthYear: number
    monthlySum: number
    monthlyAverage: number
    monthlyVariance: number
    monthlyTarget: number
    monthlyMinimumTarget: number
    monthlyOperationalTarget: number
    monthlyWeightedScore: number
    percentage: number
    kpiComments: number
    count: number
    kpiYear: number
    kpiPeriod: number
    kpiSemiAnnual: number
    _all: number
  }


  export type KpiSummaryAvgAggregateInputType = {
    kpiMonthYear?: true
    monthlySum?: true
    monthlyAverage?: true
    monthlyVariance?: true
    monthlyTarget?: true
    monthlyMinimumTarget?: true
    monthlyOperationalTarget?: true
    monthlyWeightedScore?: true
    percentage?: true
    count?: true
    kpiYear?: true
    kpiPeriod?: true
    kpiSemiAnnual?: true
  }

  export type KpiSummarySumAggregateInputType = {
    kpiMonthYear?: true
    monthlySum?: true
    monthlyAverage?: true
    monthlyVariance?: true
    monthlyTarget?: true
    monthlyMinimumTarget?: true
    monthlyOperationalTarget?: true
    monthlyWeightedScore?: true
    percentage?: true
    count?: true
    kpiYear?: true
    kpiPeriod?: true
    kpiSemiAnnual?: true
  }

  export type KpiSummaryMinAggregateInputType = {
    id?: true
    kpiId?: true
    kraId?: true
    kpiEntity?: true
    kpibusiness?: true
    kpiLocation?: true
    kpiOrganization?: true
    kpiMonthYear?: true
    monthlySum?: true
    monthlyAverage?: true
    monthlyVariance?: true
    monthlyTarget?: true
    monthlyMinimumTarget?: true
    monthlyOperationalTarget?: true
    monthlyWeightedScore?: true
    percentage?: true
    kpiComments?: true
    count?: true
    kpiYear?: true
    kpiPeriod?: true
    kpiSemiAnnual?: true
  }

  export type KpiSummaryMaxAggregateInputType = {
    id?: true
    kpiId?: true
    kraId?: true
    kpiEntity?: true
    kpibusiness?: true
    kpiLocation?: true
    kpiOrganization?: true
    kpiMonthYear?: true
    monthlySum?: true
    monthlyAverage?: true
    monthlyVariance?: true
    monthlyTarget?: true
    monthlyMinimumTarget?: true
    monthlyOperationalTarget?: true
    monthlyWeightedScore?: true
    percentage?: true
    kpiComments?: true
    count?: true
    kpiYear?: true
    kpiPeriod?: true
    kpiSemiAnnual?: true
  }

  export type KpiSummaryCountAggregateInputType = {
    id?: true
    kpiId?: true
    kraId?: true
    objectiveId?: true
    kpiEntity?: true
    kpibusiness?: true
    kpiLocation?: true
    kpiOrganization?: true
    kpiMonthYear?: true
    monthlySum?: true
    monthlyAverage?: true
    monthlyVariance?: true
    monthlyTarget?: true
    monthlyMinimumTarget?: true
    monthlyOperationalTarget?: true
    monthlyWeightedScore?: true
    percentage?: true
    kpiComments?: true
    count?: true
    kpiYear?: true
    kpiPeriod?: true
    kpiSemiAnnual?: true
    _all?: true
  }

  export type KpiSummaryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which kpiSummary to aggregate.
     */
    where?: kpiSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of kpiSummaries to fetch.
     */
    orderBy?: kpiSummaryOrderByWithRelationInput | kpiSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: kpiSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` kpiSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` kpiSummaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned kpiSummaries
    **/
    _count?: true | KpiSummaryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: KpiSummaryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: KpiSummarySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KpiSummaryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KpiSummaryMaxAggregateInputType
  }

  export type GetKpiSummaryAggregateType<T extends KpiSummaryAggregateArgs> = {
        [P in keyof T & keyof AggregateKpiSummary]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKpiSummary[P]>
      : GetScalarType<T[P], AggregateKpiSummary[P]>
  }




  export type kpiSummaryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: kpiSummaryWhereInput
    orderBy?: kpiSummaryOrderByWithAggregationInput | kpiSummaryOrderByWithAggregationInput[]
    by: KpiSummaryScalarFieldEnum[] | KpiSummaryScalarFieldEnum
    having?: kpiSummaryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KpiSummaryCountAggregateInputType | true
    _avg?: KpiSummaryAvgAggregateInputType
    _sum?: KpiSummarySumAggregateInputType
    _min?: KpiSummaryMinAggregateInputType
    _max?: KpiSummaryMaxAggregateInputType
  }

  export type KpiSummaryGroupByOutputType = {
    id: string
    kpiId: string
    kraId: string | null
    objectiveId: JsonValue | null
    kpiEntity: string | null
    kpibusiness: string | null
    kpiLocation: string | null
    kpiOrganization: string | null
    kpiMonthYear: number | null
    monthlySum: number | null
    monthlyAverage: number | null
    monthlyVariance: number | null
    monthlyTarget: number | null
    monthlyMinimumTarget: number | null
    monthlyOperationalTarget: number | null
    monthlyWeightedScore: number | null
    percentage: number | null
    kpiComments: string | null
    count: number
    kpiYear: number | null
    kpiPeriod: number | null
    kpiSemiAnnual: number | null
    _count: KpiSummaryCountAggregateOutputType | null
    _avg: KpiSummaryAvgAggregateOutputType | null
    _sum: KpiSummarySumAggregateOutputType | null
    _min: KpiSummaryMinAggregateOutputType | null
    _max: KpiSummaryMaxAggregateOutputType | null
  }

  type GetKpiSummaryGroupByPayload<T extends kpiSummaryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KpiSummaryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KpiSummaryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KpiSummaryGroupByOutputType[P]>
            : GetScalarType<T[P], KpiSummaryGroupByOutputType[P]>
        }
      >
    >


  export type kpiSummarySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    kpiId?: boolean
    kraId?: boolean
    objectiveId?: boolean
    kpiEntity?: boolean
    kpibusiness?: boolean
    kpiLocation?: boolean
    kpiOrganization?: boolean
    kpiMonthYear?: boolean
    monthlySum?: boolean
    monthlyAverage?: boolean
    monthlyVariance?: boolean
    monthlyTarget?: boolean
    monthlyMinimumTarget?: boolean
    monthlyOperationalTarget?: boolean
    monthlyWeightedScore?: boolean
    percentage?: boolean
    kpiComments?: boolean
    count?: boolean
    kpiYear?: boolean
    kpiPeriod?: boolean
    kpiSemiAnnual?: boolean
  }, ExtArgs["result"]["kpiSummary"]>


  export type kpiSummarySelectScalar = {
    id?: boolean
    kpiId?: boolean
    kraId?: boolean
    objectiveId?: boolean
    kpiEntity?: boolean
    kpibusiness?: boolean
    kpiLocation?: boolean
    kpiOrganization?: boolean
    kpiMonthYear?: boolean
    monthlySum?: boolean
    monthlyAverage?: boolean
    monthlyVariance?: boolean
    monthlyTarget?: boolean
    monthlyMinimumTarget?: boolean
    monthlyOperationalTarget?: boolean
    monthlyWeightedScore?: boolean
    percentage?: boolean
    kpiComments?: boolean
    count?: boolean
    kpiYear?: boolean
    kpiPeriod?: boolean
    kpiSemiAnnual?: boolean
  }


  export type $kpiSummaryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "kpiSummary"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      kpiId: string
      kraId: string | null
      objectiveId: Prisma.JsonValue | null
      kpiEntity: string | null
      kpibusiness: string | null
      kpiLocation: string | null
      kpiOrganization: string | null
      kpiMonthYear: number | null
      monthlySum: number | null
      monthlyAverage: number | null
      monthlyVariance: number | null
      monthlyTarget: number | null
      monthlyMinimumTarget: number | null
      monthlyOperationalTarget: number | null
      monthlyWeightedScore: number | null
      percentage: number | null
      kpiComments: string | null
      count: number
      kpiYear: number | null
      kpiPeriod: number | null
      kpiSemiAnnual: number | null
    }, ExtArgs["result"]["kpiSummary"]>
    composites: {}
  }

  type kpiSummaryGetPayload<S extends boolean | null | undefined | kpiSummaryDefaultArgs> = $Result.GetResult<Prisma.$kpiSummaryPayload, S>

  type kpiSummaryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<kpiSummaryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: KpiSummaryCountAggregateInputType | true
    }

  export interface kpiSummaryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['kpiSummary'], meta: { name: 'kpiSummary' } }
    /**
     * Find zero or one KpiSummary that matches the filter.
     * @param {kpiSummaryFindUniqueArgs} args - Arguments to find a KpiSummary
     * @example
     * // Get one KpiSummary
     * const kpiSummary = await prisma.kpiSummary.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends kpiSummaryFindUniqueArgs>(args: SelectSubset<T, kpiSummaryFindUniqueArgs<ExtArgs>>): Prisma__kpiSummaryClient<$Result.GetResult<Prisma.$kpiSummaryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one KpiSummary that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {kpiSummaryFindUniqueOrThrowArgs} args - Arguments to find a KpiSummary
     * @example
     * // Get one KpiSummary
     * const kpiSummary = await prisma.kpiSummary.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends kpiSummaryFindUniqueOrThrowArgs>(args: SelectSubset<T, kpiSummaryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__kpiSummaryClient<$Result.GetResult<Prisma.$kpiSummaryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first KpiSummary that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {kpiSummaryFindFirstArgs} args - Arguments to find a KpiSummary
     * @example
     * // Get one KpiSummary
     * const kpiSummary = await prisma.kpiSummary.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends kpiSummaryFindFirstArgs>(args?: SelectSubset<T, kpiSummaryFindFirstArgs<ExtArgs>>): Prisma__kpiSummaryClient<$Result.GetResult<Prisma.$kpiSummaryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first KpiSummary that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {kpiSummaryFindFirstOrThrowArgs} args - Arguments to find a KpiSummary
     * @example
     * // Get one KpiSummary
     * const kpiSummary = await prisma.kpiSummary.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends kpiSummaryFindFirstOrThrowArgs>(args?: SelectSubset<T, kpiSummaryFindFirstOrThrowArgs<ExtArgs>>): Prisma__kpiSummaryClient<$Result.GetResult<Prisma.$kpiSummaryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more KpiSummaries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {kpiSummaryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all KpiSummaries
     * const kpiSummaries = await prisma.kpiSummary.findMany()
     * 
     * // Get first 10 KpiSummaries
     * const kpiSummaries = await prisma.kpiSummary.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const kpiSummaryWithIdOnly = await prisma.kpiSummary.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends kpiSummaryFindManyArgs>(args?: SelectSubset<T, kpiSummaryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$kpiSummaryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a KpiSummary.
     * @param {kpiSummaryCreateArgs} args - Arguments to create a KpiSummary.
     * @example
     * // Create one KpiSummary
     * const KpiSummary = await prisma.kpiSummary.create({
     *   data: {
     *     // ... data to create a KpiSummary
     *   }
     * })
     * 
     */
    create<T extends kpiSummaryCreateArgs>(args: SelectSubset<T, kpiSummaryCreateArgs<ExtArgs>>): Prisma__kpiSummaryClient<$Result.GetResult<Prisma.$kpiSummaryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many KpiSummaries.
     * @param {kpiSummaryCreateManyArgs} args - Arguments to create many KpiSummaries.
     * @example
     * // Create many KpiSummaries
     * const kpiSummary = await prisma.kpiSummary.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends kpiSummaryCreateManyArgs>(args?: SelectSubset<T, kpiSummaryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a KpiSummary.
     * @param {kpiSummaryDeleteArgs} args - Arguments to delete one KpiSummary.
     * @example
     * // Delete one KpiSummary
     * const KpiSummary = await prisma.kpiSummary.delete({
     *   where: {
     *     // ... filter to delete one KpiSummary
     *   }
     * })
     * 
     */
    delete<T extends kpiSummaryDeleteArgs>(args: SelectSubset<T, kpiSummaryDeleteArgs<ExtArgs>>): Prisma__kpiSummaryClient<$Result.GetResult<Prisma.$kpiSummaryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one KpiSummary.
     * @param {kpiSummaryUpdateArgs} args - Arguments to update one KpiSummary.
     * @example
     * // Update one KpiSummary
     * const kpiSummary = await prisma.kpiSummary.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends kpiSummaryUpdateArgs>(args: SelectSubset<T, kpiSummaryUpdateArgs<ExtArgs>>): Prisma__kpiSummaryClient<$Result.GetResult<Prisma.$kpiSummaryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more KpiSummaries.
     * @param {kpiSummaryDeleteManyArgs} args - Arguments to filter KpiSummaries to delete.
     * @example
     * // Delete a few KpiSummaries
     * const { count } = await prisma.kpiSummary.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends kpiSummaryDeleteManyArgs>(args?: SelectSubset<T, kpiSummaryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KpiSummaries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {kpiSummaryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many KpiSummaries
     * const kpiSummary = await prisma.kpiSummary.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends kpiSummaryUpdateManyArgs>(args: SelectSubset<T, kpiSummaryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one KpiSummary.
     * @param {kpiSummaryUpsertArgs} args - Arguments to update or create a KpiSummary.
     * @example
     * // Update or create a KpiSummary
     * const kpiSummary = await prisma.kpiSummary.upsert({
     *   create: {
     *     // ... data to create a KpiSummary
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the KpiSummary we want to update
     *   }
     * })
     */
    upsert<T extends kpiSummaryUpsertArgs>(args: SelectSubset<T, kpiSummaryUpsertArgs<ExtArgs>>): Prisma__kpiSummaryClient<$Result.GetResult<Prisma.$kpiSummaryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of KpiSummaries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {kpiSummaryCountArgs} args - Arguments to filter KpiSummaries to count.
     * @example
     * // Count the number of KpiSummaries
     * const count = await prisma.kpiSummary.count({
     *   where: {
     *     // ... the filter for the KpiSummaries we want to count
     *   }
     * })
    **/
    count<T extends kpiSummaryCountArgs>(
      args?: Subset<T, kpiSummaryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KpiSummaryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a KpiSummary.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KpiSummaryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends KpiSummaryAggregateArgs>(args: Subset<T, KpiSummaryAggregateArgs>): Prisma.PrismaPromise<GetKpiSummaryAggregateType<T>>

    /**
     * Group by KpiSummary.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {kpiSummaryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends kpiSummaryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: kpiSummaryGroupByArgs['orderBy'] }
        : { orderBy?: kpiSummaryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, kpiSummaryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKpiSummaryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the kpiSummary model
   */
  readonly fields: kpiSummaryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for kpiSummary.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__kpiSummaryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the kpiSummary model
   */ 
  interface kpiSummaryFieldRefs {
    readonly id: FieldRef<"kpiSummary", 'String'>
    readonly kpiId: FieldRef<"kpiSummary", 'String'>
    readonly kraId: FieldRef<"kpiSummary", 'String'>
    readonly objectiveId: FieldRef<"kpiSummary", 'Json'>
    readonly kpiEntity: FieldRef<"kpiSummary", 'String'>
    readonly kpibusiness: FieldRef<"kpiSummary", 'String'>
    readonly kpiLocation: FieldRef<"kpiSummary", 'String'>
    readonly kpiOrganization: FieldRef<"kpiSummary", 'String'>
    readonly kpiMonthYear: FieldRef<"kpiSummary", 'Int'>
    readonly monthlySum: FieldRef<"kpiSummary", 'Float'>
    readonly monthlyAverage: FieldRef<"kpiSummary", 'Float'>
    readonly monthlyVariance: FieldRef<"kpiSummary", 'Float'>
    readonly monthlyTarget: FieldRef<"kpiSummary", 'Float'>
    readonly monthlyMinimumTarget: FieldRef<"kpiSummary", 'Float'>
    readonly monthlyOperationalTarget: FieldRef<"kpiSummary", 'Float'>
    readonly monthlyWeightedScore: FieldRef<"kpiSummary", 'Float'>
    readonly percentage: FieldRef<"kpiSummary", 'Float'>
    readonly kpiComments: FieldRef<"kpiSummary", 'String'>
    readonly count: FieldRef<"kpiSummary", 'Int'>
    readonly kpiYear: FieldRef<"kpiSummary", 'Int'>
    readonly kpiPeriod: FieldRef<"kpiSummary", 'Int'>
    readonly kpiSemiAnnual: FieldRef<"kpiSummary", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * kpiSummary findUnique
   */
  export type kpiSummaryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the kpiSummary
     */
    select?: kpiSummarySelect<ExtArgs> | null
    /**
     * Filter, which kpiSummary to fetch.
     */
    where: kpiSummaryWhereUniqueInput
  }

  /**
   * kpiSummary findUniqueOrThrow
   */
  export type kpiSummaryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the kpiSummary
     */
    select?: kpiSummarySelect<ExtArgs> | null
    /**
     * Filter, which kpiSummary to fetch.
     */
    where: kpiSummaryWhereUniqueInput
  }

  /**
   * kpiSummary findFirst
   */
  export type kpiSummaryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the kpiSummary
     */
    select?: kpiSummarySelect<ExtArgs> | null
    /**
     * Filter, which kpiSummary to fetch.
     */
    where?: kpiSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of kpiSummaries to fetch.
     */
    orderBy?: kpiSummaryOrderByWithRelationInput | kpiSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for kpiSummaries.
     */
    cursor?: kpiSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` kpiSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` kpiSummaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of kpiSummaries.
     */
    distinct?: KpiSummaryScalarFieldEnum | KpiSummaryScalarFieldEnum[]
  }

  /**
   * kpiSummary findFirstOrThrow
   */
  export type kpiSummaryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the kpiSummary
     */
    select?: kpiSummarySelect<ExtArgs> | null
    /**
     * Filter, which kpiSummary to fetch.
     */
    where?: kpiSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of kpiSummaries to fetch.
     */
    orderBy?: kpiSummaryOrderByWithRelationInput | kpiSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for kpiSummaries.
     */
    cursor?: kpiSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` kpiSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` kpiSummaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of kpiSummaries.
     */
    distinct?: KpiSummaryScalarFieldEnum | KpiSummaryScalarFieldEnum[]
  }

  /**
   * kpiSummary findMany
   */
  export type kpiSummaryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the kpiSummary
     */
    select?: kpiSummarySelect<ExtArgs> | null
    /**
     * Filter, which kpiSummaries to fetch.
     */
    where?: kpiSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of kpiSummaries to fetch.
     */
    orderBy?: kpiSummaryOrderByWithRelationInput | kpiSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing kpiSummaries.
     */
    cursor?: kpiSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` kpiSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` kpiSummaries.
     */
    skip?: number
    distinct?: KpiSummaryScalarFieldEnum | KpiSummaryScalarFieldEnum[]
  }

  /**
   * kpiSummary create
   */
  export type kpiSummaryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the kpiSummary
     */
    select?: kpiSummarySelect<ExtArgs> | null
    /**
     * The data needed to create a kpiSummary.
     */
    data: XOR<kpiSummaryCreateInput, kpiSummaryUncheckedCreateInput>
  }

  /**
   * kpiSummary createMany
   */
  export type kpiSummaryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many kpiSummaries.
     */
    data: kpiSummaryCreateManyInput | kpiSummaryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * kpiSummary update
   */
  export type kpiSummaryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the kpiSummary
     */
    select?: kpiSummarySelect<ExtArgs> | null
    /**
     * The data needed to update a kpiSummary.
     */
    data: XOR<kpiSummaryUpdateInput, kpiSummaryUncheckedUpdateInput>
    /**
     * Choose, which kpiSummary to update.
     */
    where: kpiSummaryWhereUniqueInput
  }

  /**
   * kpiSummary updateMany
   */
  export type kpiSummaryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update kpiSummaries.
     */
    data: XOR<kpiSummaryUpdateManyMutationInput, kpiSummaryUncheckedUpdateManyInput>
    /**
     * Filter which kpiSummaries to update
     */
    where?: kpiSummaryWhereInput
  }

  /**
   * kpiSummary upsert
   */
  export type kpiSummaryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the kpiSummary
     */
    select?: kpiSummarySelect<ExtArgs> | null
    /**
     * The filter to search for the kpiSummary to update in case it exists.
     */
    where: kpiSummaryWhereUniqueInput
    /**
     * In case the kpiSummary found by the `where` argument doesn't exist, create a new kpiSummary with this data.
     */
    create: XOR<kpiSummaryCreateInput, kpiSummaryUncheckedCreateInput>
    /**
     * In case the kpiSummary was found with the provided `where` argument, update it with this data.
     */
    update: XOR<kpiSummaryUpdateInput, kpiSummaryUncheckedUpdateInput>
  }

  /**
   * kpiSummary delete
   */
  export type kpiSummaryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the kpiSummary
     */
    select?: kpiSummarySelect<ExtArgs> | null
    /**
     * Filter which kpiSummary to delete.
     */
    where: kpiSummaryWhereUniqueInput
  }

  /**
   * kpiSummary deleteMany
   */
  export type kpiSummaryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which kpiSummaries to delete
     */
    where?: kpiSummaryWhereInput
  }

  /**
   * kpiSummary without action
   */
  export type kpiSummaryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the kpiSummary
     */
    select?: kpiSummarySelect<ExtArgs> | null
  }


  /**
   * Model test
   */

  export type AggregateTest = {
    _count: TestCountAggregateOutputType | null
    _min: TestMinAggregateOutputType | null
    _max: TestMaxAggregateOutputType | null
  }

  export type TestMinAggregateOutputType = {
    id: string | null
    name: string | null
  }

  export type TestMaxAggregateOutputType = {
    id: string | null
    name: string | null
  }

  export type TestCountAggregateOutputType = {
    id: number
    name: number
    _all: number
  }


  export type TestMinAggregateInputType = {
    id?: true
    name?: true
  }

  export type TestMaxAggregateInputType = {
    id?: true
    name?: true
  }

  export type TestCountAggregateInputType = {
    id?: true
    name?: true
    _all?: true
  }

  export type TestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which test to aggregate.
     */
    where?: testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tests to fetch.
     */
    orderBy?: testOrderByWithRelationInput | testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tests
    **/
    _count?: true | TestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TestMaxAggregateInputType
  }

  export type GetTestAggregateType<T extends TestAggregateArgs> = {
        [P in keyof T & keyof AggregateTest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTest[P]>
      : GetScalarType<T[P], AggregateTest[P]>
  }




  export type testGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: testWhereInput
    orderBy?: testOrderByWithAggregationInput | testOrderByWithAggregationInput[]
    by: TestScalarFieldEnum[] | TestScalarFieldEnum
    having?: testScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TestCountAggregateInputType | true
    _min?: TestMinAggregateInputType
    _max?: TestMaxAggregateInputType
  }

  export type TestGroupByOutputType = {
    id: string
    name: string
    _count: TestCountAggregateOutputType | null
    _min: TestMinAggregateOutputType | null
    _max: TestMaxAggregateOutputType | null
  }

  type GetTestGroupByPayload<T extends testGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TestGroupByOutputType[P]>
            : GetScalarType<T[P], TestGroupByOutputType[P]>
        }
      >
    >


  export type testSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
  }, ExtArgs["result"]["test"]>


  export type testSelectScalar = {
    id?: boolean
    name?: boolean
  }


  export type $testPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "test"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
    }, ExtArgs["result"]["test"]>
    composites: {}
  }

  type testGetPayload<S extends boolean | null | undefined | testDefaultArgs> = $Result.GetResult<Prisma.$testPayload, S>

  type testCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<testFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TestCountAggregateInputType | true
    }

  export interface testDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['test'], meta: { name: 'test' } }
    /**
     * Find zero or one Test that matches the filter.
     * @param {testFindUniqueArgs} args - Arguments to find a Test
     * @example
     * // Get one Test
     * const test = await prisma.test.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends testFindUniqueArgs>(args: SelectSubset<T, testFindUniqueArgs<ExtArgs>>): Prisma__testClient<$Result.GetResult<Prisma.$testPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Test that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {testFindUniqueOrThrowArgs} args - Arguments to find a Test
     * @example
     * // Get one Test
     * const test = await prisma.test.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends testFindUniqueOrThrowArgs>(args: SelectSubset<T, testFindUniqueOrThrowArgs<ExtArgs>>): Prisma__testClient<$Result.GetResult<Prisma.$testPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Test that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {testFindFirstArgs} args - Arguments to find a Test
     * @example
     * // Get one Test
     * const test = await prisma.test.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends testFindFirstArgs>(args?: SelectSubset<T, testFindFirstArgs<ExtArgs>>): Prisma__testClient<$Result.GetResult<Prisma.$testPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Test that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {testFindFirstOrThrowArgs} args - Arguments to find a Test
     * @example
     * // Get one Test
     * const test = await prisma.test.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends testFindFirstOrThrowArgs>(args?: SelectSubset<T, testFindFirstOrThrowArgs<ExtArgs>>): Prisma__testClient<$Result.GetResult<Prisma.$testPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {testFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tests
     * const tests = await prisma.test.findMany()
     * 
     * // Get first 10 Tests
     * const tests = await prisma.test.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const testWithIdOnly = await prisma.test.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends testFindManyArgs>(args?: SelectSubset<T, testFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$testPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Test.
     * @param {testCreateArgs} args - Arguments to create a Test.
     * @example
     * // Create one Test
     * const Test = await prisma.test.create({
     *   data: {
     *     // ... data to create a Test
     *   }
     * })
     * 
     */
    create<T extends testCreateArgs>(args: SelectSubset<T, testCreateArgs<ExtArgs>>): Prisma__testClient<$Result.GetResult<Prisma.$testPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tests.
     * @param {testCreateManyArgs} args - Arguments to create many Tests.
     * @example
     * // Create many Tests
     * const test = await prisma.test.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends testCreateManyArgs>(args?: SelectSubset<T, testCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Test.
     * @param {testDeleteArgs} args - Arguments to delete one Test.
     * @example
     * // Delete one Test
     * const Test = await prisma.test.delete({
     *   where: {
     *     // ... filter to delete one Test
     *   }
     * })
     * 
     */
    delete<T extends testDeleteArgs>(args: SelectSubset<T, testDeleteArgs<ExtArgs>>): Prisma__testClient<$Result.GetResult<Prisma.$testPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Test.
     * @param {testUpdateArgs} args - Arguments to update one Test.
     * @example
     * // Update one Test
     * const test = await prisma.test.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends testUpdateArgs>(args: SelectSubset<T, testUpdateArgs<ExtArgs>>): Prisma__testClient<$Result.GetResult<Prisma.$testPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tests.
     * @param {testDeleteManyArgs} args - Arguments to filter Tests to delete.
     * @example
     * // Delete a few Tests
     * const { count } = await prisma.test.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends testDeleteManyArgs>(args?: SelectSubset<T, testDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {testUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tests
     * const test = await prisma.test.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends testUpdateManyArgs>(args: SelectSubset<T, testUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Test.
     * @param {testUpsertArgs} args - Arguments to update or create a Test.
     * @example
     * // Update or create a Test
     * const test = await prisma.test.upsert({
     *   create: {
     *     // ... data to create a Test
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Test we want to update
     *   }
     * })
     */
    upsert<T extends testUpsertArgs>(args: SelectSubset<T, testUpsertArgs<ExtArgs>>): Prisma__testClient<$Result.GetResult<Prisma.$testPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {testCountArgs} args - Arguments to filter Tests to count.
     * @example
     * // Count the number of Tests
     * const count = await prisma.test.count({
     *   where: {
     *     // ... the filter for the Tests we want to count
     *   }
     * })
    **/
    count<T extends testCountArgs>(
      args?: Subset<T, testCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Test.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TestAggregateArgs>(args: Subset<T, TestAggregateArgs>): Prisma.PrismaPromise<GetTestAggregateType<T>>

    /**
     * Group by Test.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {testGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends testGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: testGroupByArgs['orderBy'] }
        : { orderBy?: testGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, testGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the test model
   */
  readonly fields: testFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for test.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__testClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the test model
   */ 
  interface testFieldRefs {
    readonly id: FieldRef<"test", 'String'>
    readonly name: FieldRef<"test", 'String'>
  }
    

  // Custom InputTypes
  /**
   * test findUnique
   */
  export type testFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the test
     */
    select?: testSelect<ExtArgs> | null
    /**
     * Filter, which test to fetch.
     */
    where: testWhereUniqueInput
  }

  /**
   * test findUniqueOrThrow
   */
  export type testFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the test
     */
    select?: testSelect<ExtArgs> | null
    /**
     * Filter, which test to fetch.
     */
    where: testWhereUniqueInput
  }

  /**
   * test findFirst
   */
  export type testFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the test
     */
    select?: testSelect<ExtArgs> | null
    /**
     * Filter, which test to fetch.
     */
    where?: testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tests to fetch.
     */
    orderBy?: testOrderByWithRelationInput | testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tests.
     */
    cursor?: testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tests.
     */
    distinct?: TestScalarFieldEnum | TestScalarFieldEnum[]
  }

  /**
   * test findFirstOrThrow
   */
  export type testFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the test
     */
    select?: testSelect<ExtArgs> | null
    /**
     * Filter, which test to fetch.
     */
    where?: testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tests to fetch.
     */
    orderBy?: testOrderByWithRelationInput | testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tests.
     */
    cursor?: testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tests.
     */
    distinct?: TestScalarFieldEnum | TestScalarFieldEnum[]
  }

  /**
   * test findMany
   */
  export type testFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the test
     */
    select?: testSelect<ExtArgs> | null
    /**
     * Filter, which tests to fetch.
     */
    where?: testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tests to fetch.
     */
    orderBy?: testOrderByWithRelationInput | testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tests.
     */
    cursor?: testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tests.
     */
    skip?: number
    distinct?: TestScalarFieldEnum | TestScalarFieldEnum[]
  }

  /**
   * test create
   */
  export type testCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the test
     */
    select?: testSelect<ExtArgs> | null
    /**
     * The data needed to create a test.
     */
    data: XOR<testCreateInput, testUncheckedCreateInput>
  }

  /**
   * test createMany
   */
  export type testCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tests.
     */
    data: testCreateManyInput | testCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * test update
   */
  export type testUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the test
     */
    select?: testSelect<ExtArgs> | null
    /**
     * The data needed to update a test.
     */
    data: XOR<testUpdateInput, testUncheckedUpdateInput>
    /**
     * Choose, which test to update.
     */
    where: testWhereUniqueInput
  }

  /**
   * test updateMany
   */
  export type testUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tests.
     */
    data: XOR<testUpdateManyMutationInput, testUncheckedUpdateManyInput>
    /**
     * Filter which tests to update
     */
    where?: testWhereInput
  }

  /**
   * test upsert
   */
  export type testUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the test
     */
    select?: testSelect<ExtArgs> | null
    /**
     * The filter to search for the test to update in case it exists.
     */
    where: testWhereUniqueInput
    /**
     * In case the test found by the `where` argument doesn't exist, create a new test with this data.
     */
    create: XOR<testCreateInput, testUncheckedCreateInput>
    /**
     * In case the test was found with the provided `where` argument, update it with this data.
     */
    update: XOR<testUpdateInput, testUncheckedUpdateInput>
  }

  /**
   * test delete
   */
  export type testDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the test
     */
    select?: testSelect<ExtArgs> | null
    /**
     * Filter which test to delete.
     */
    where: testWhereUniqueInput
  }

  /**
   * test deleteMany
   */
  export type testDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tests to delete
     */
    where?: testWhereInput
  }

  /**
   * test without action
   */
  export type testDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the test
     */
    select?: testSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserTestScalarFieldEnum: {
    id: 'id',
    kcId: 'kcId',
    email: 'email',
    username: 'username',
    firstname: 'firstname',
    lastname: 'lastname',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    enabled: 'enabled',
    organizationId: 'organizationId',
    locationId: 'locationId',
    entityId: 'entityId',
    userType: 'userType',
    status: 'status',
    avatar: 'avatar',
    deleted: 'deleted'
  };

  export type UserTestScalarFieldEnum = (typeof UserTestScalarFieldEnum)[keyof typeof UserTestScalarFieldEnum]


  export const ReportKpiDataNewDataScalarFieldEnum: {
    id: 'id',
    kpiTemplateId: 'kpiTemplateId',
    kpiCategoryId: 'kpiCategoryId',
    kpiReportId: 'kpiReportId',
    kpiId: 'kpiId',
    kraId: 'kraId',
    kpiLocation: 'kpiLocation',
    kpiOrganization: 'kpiOrganization',
    kpiEntity: 'kpiEntity',
    kpibusiness: 'kpibusiness',
    kpiValue: 'kpiValue',
    kpiComments: 'kpiComments',
    kpiTargetType: 'kpiTargetType',
    minimumTarget: 'minimumTarget',
    target: 'target',
    operationalTarget: 'operationalTarget',
    kpiWeightage: 'kpiWeightage',
    kpiScore: 'kpiScore',
    kpiVariance: 'kpiVariance',
    percentage: 'percentage',
    kpiStatus: 'kpiStatus',
    objectiveId: 'objectiveId',
    reportDate: 'reportDate',
    reportFor: 'reportFor',
    reportYear: 'reportYear'
  };

  export type ReportKpiDataNewDataScalarFieldEnum = (typeof ReportKpiDataNewDataScalarFieldEnum)[keyof typeof ReportKpiDataNewDataScalarFieldEnum]


  export const KpiSummaryScalarFieldEnum: {
    id: 'id',
    kpiId: 'kpiId',
    kraId: 'kraId',
    objectiveId: 'objectiveId',
    kpiEntity: 'kpiEntity',
    kpibusiness: 'kpibusiness',
    kpiLocation: 'kpiLocation',
    kpiOrganization: 'kpiOrganization',
    kpiMonthYear: 'kpiMonthYear',
    monthlySum: 'monthlySum',
    monthlyAverage: 'monthlyAverage',
    monthlyVariance: 'monthlyVariance',
    monthlyTarget: 'monthlyTarget',
    monthlyMinimumTarget: 'monthlyMinimumTarget',
    monthlyOperationalTarget: 'monthlyOperationalTarget',
    monthlyWeightedScore: 'monthlyWeightedScore',
    percentage: 'percentage',
    kpiComments: 'kpiComments',
    count: 'count',
    kpiYear: 'kpiYear',
    kpiPeriod: 'kpiPeriod',
    kpiSemiAnnual: 'kpiSemiAnnual'
  };

  export type KpiSummaryScalarFieldEnum = (typeof KpiSummaryScalarFieldEnum)[keyof typeof KpiSummaryScalarFieldEnum]


  export const TestScalarFieldEnum: {
    id: 'id',
    name: 'name'
  };

  export type TestScalarFieldEnum = (typeof TestScalarFieldEnum)[keyof typeof TestScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    
  /**
   * Deep Input Types
   */


  export type UserTestWhereInput = {
    AND?: UserTestWhereInput | UserTestWhereInput[]
    OR?: UserTestWhereInput[]
    NOT?: UserTestWhereInput | UserTestWhereInput[]
    id?: StringFilter<"UserTest"> | string
    kcId?: StringNullableFilter<"UserTest"> | string | null
    email?: StringNullableFilter<"UserTest"> | string | null
    username?: StringNullableFilter<"UserTest"> | string | null
    firstname?: StringNullableFilter<"UserTest"> | string | null
    lastname?: StringNullableFilter<"UserTest"> | string | null
    createdAt?: DateTimeFilter<"UserTest"> | Date | string
    createdBy?: StringNullableFilter<"UserTest"> | string | null
    updatedAt?: DateTimeFilter<"UserTest"> | Date | string
    updatedBy?: StringNullableFilter<"UserTest"> | string | null
    enabled?: BoolNullableFilter<"UserTest"> | boolean | null
    organizationId?: StringNullableFilter<"UserTest"> | string | null
    locationId?: StringNullableFilter<"UserTest"> | string | null
    entityId?: StringNullableFilter<"UserTest"> | string | null
    userType?: StringNullableFilter<"UserTest"> | string | null
    status?: BoolNullableFilter<"UserTest"> | boolean | null
    avatar?: StringNullableFilter<"UserTest"> | string | null
    deleted?: BoolNullableFilter<"UserTest"> | boolean | null
  }

  export type UserTestOrderByWithRelationInput = {
    id?: SortOrder
    kcId?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    username?: SortOrderInput | SortOrder
    firstname?: SortOrderInput | SortOrder
    lastname?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    enabled?: SortOrderInput | SortOrder
    organizationId?: SortOrderInput | SortOrder
    locationId?: SortOrderInput | SortOrder
    entityId?: SortOrderInput | SortOrder
    userType?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    avatar?: SortOrderInput | SortOrder
    deleted?: SortOrderInput | SortOrder
  }

  export type UserTestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserTestWhereInput | UserTestWhereInput[]
    OR?: UserTestWhereInput[]
    NOT?: UserTestWhereInput | UserTestWhereInput[]
    kcId?: StringNullableFilter<"UserTest"> | string | null
    email?: StringNullableFilter<"UserTest"> | string | null
    username?: StringNullableFilter<"UserTest"> | string | null
    firstname?: StringNullableFilter<"UserTest"> | string | null
    lastname?: StringNullableFilter<"UserTest"> | string | null
    createdAt?: DateTimeFilter<"UserTest"> | Date | string
    createdBy?: StringNullableFilter<"UserTest"> | string | null
    updatedAt?: DateTimeFilter<"UserTest"> | Date | string
    updatedBy?: StringNullableFilter<"UserTest"> | string | null
    enabled?: BoolNullableFilter<"UserTest"> | boolean | null
    organizationId?: StringNullableFilter<"UserTest"> | string | null
    locationId?: StringNullableFilter<"UserTest"> | string | null
    entityId?: StringNullableFilter<"UserTest"> | string | null
    userType?: StringNullableFilter<"UserTest"> | string | null
    status?: BoolNullableFilter<"UserTest"> | boolean | null
    avatar?: StringNullableFilter<"UserTest"> | string | null
    deleted?: BoolNullableFilter<"UserTest"> | boolean | null
  }, "id">

  export type UserTestOrderByWithAggregationInput = {
    id?: SortOrder
    kcId?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    username?: SortOrderInput | SortOrder
    firstname?: SortOrderInput | SortOrder
    lastname?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrderInput | SortOrder
    enabled?: SortOrderInput | SortOrder
    organizationId?: SortOrderInput | SortOrder
    locationId?: SortOrderInput | SortOrder
    entityId?: SortOrderInput | SortOrder
    userType?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    avatar?: SortOrderInput | SortOrder
    deleted?: SortOrderInput | SortOrder
    _count?: UserTestCountOrderByAggregateInput
    _max?: UserTestMaxOrderByAggregateInput
    _min?: UserTestMinOrderByAggregateInput
  }

  export type UserTestScalarWhereWithAggregatesInput = {
    AND?: UserTestScalarWhereWithAggregatesInput | UserTestScalarWhereWithAggregatesInput[]
    OR?: UserTestScalarWhereWithAggregatesInput[]
    NOT?: UserTestScalarWhereWithAggregatesInput | UserTestScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserTest"> | string
    kcId?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    email?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    username?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    firstname?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    lastname?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"UserTest"> | Date | string
    createdBy?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"UserTest"> | Date | string
    updatedBy?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    enabled?: BoolNullableWithAggregatesFilter<"UserTest"> | boolean | null
    organizationId?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    locationId?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    entityId?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    userType?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    status?: BoolNullableWithAggregatesFilter<"UserTest"> | boolean | null
    avatar?: StringNullableWithAggregatesFilter<"UserTest"> | string | null
    deleted?: BoolNullableWithAggregatesFilter<"UserTest"> | boolean | null
  }

  export type reportKpiDataNewDataWhereInput = {
    AND?: reportKpiDataNewDataWhereInput | reportKpiDataNewDataWhereInput[]
    OR?: reportKpiDataNewDataWhereInput[]
    NOT?: reportKpiDataNewDataWhereInput | reportKpiDataNewDataWhereInput[]
    id?: StringFilter<"reportKpiDataNewData"> | string
    kpiTemplateId?: StringFilter<"reportKpiDataNewData"> | string
    kpiCategoryId?: StringFilter<"reportKpiDataNewData"> | string
    kpiReportId?: StringFilter<"reportKpiDataNewData"> | string
    kpiId?: StringFilter<"reportKpiDataNewData"> | string
    kraId?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpiLocation?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpiOrganization?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpiEntity?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpibusiness?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpiValue?: FloatFilter<"reportKpiDataNewData"> | number
    kpiComments?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpiTargetType?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    minimumTarget?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    target?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    operationalTarget?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    kpiWeightage?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    kpiScore?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    kpiVariance?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    percentage?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    kpiStatus?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    objectiveId?: JsonNullableFilter<"reportKpiDataNewData">
    reportDate?: DateTimeFilter<"reportKpiDataNewData"> | Date | string
    reportFor?: DateTimeFilter<"reportKpiDataNewData"> | Date | string
    reportYear?: StringNullableFilter<"reportKpiDataNewData"> | string | null
  }

  export type reportKpiDataNewDataOrderByWithRelationInput = {
    id?: SortOrder
    kpiTemplateId?: SortOrder
    kpiCategoryId?: SortOrder
    kpiReportId?: SortOrder
    kpiId?: SortOrder
    kraId?: SortOrderInput | SortOrder
    kpiLocation?: SortOrderInput | SortOrder
    kpiOrganization?: SortOrderInput | SortOrder
    kpiEntity?: SortOrderInput | SortOrder
    kpibusiness?: SortOrderInput | SortOrder
    kpiValue?: SortOrder
    kpiComments?: SortOrderInput | SortOrder
    kpiTargetType?: SortOrderInput | SortOrder
    minimumTarget?: SortOrderInput | SortOrder
    target?: SortOrderInput | SortOrder
    operationalTarget?: SortOrderInput | SortOrder
    kpiWeightage?: SortOrderInput | SortOrder
    kpiScore?: SortOrderInput | SortOrder
    kpiVariance?: SortOrderInput | SortOrder
    percentage?: SortOrderInput | SortOrder
    kpiStatus?: SortOrderInput | SortOrder
    objectiveId?: SortOrderInput | SortOrder
    reportDate?: SortOrder
    reportFor?: SortOrder
    reportYear?: SortOrderInput | SortOrder
  }

  export type reportKpiDataNewDataWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: reportKpiDataNewDataWhereInput | reportKpiDataNewDataWhereInput[]
    OR?: reportKpiDataNewDataWhereInput[]
    NOT?: reportKpiDataNewDataWhereInput | reportKpiDataNewDataWhereInput[]
    kpiTemplateId?: StringFilter<"reportKpiDataNewData"> | string
    kpiCategoryId?: StringFilter<"reportKpiDataNewData"> | string
    kpiReportId?: StringFilter<"reportKpiDataNewData"> | string
    kpiId?: StringFilter<"reportKpiDataNewData"> | string
    kraId?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpiLocation?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpiOrganization?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpiEntity?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpibusiness?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpiValue?: FloatFilter<"reportKpiDataNewData"> | number
    kpiComments?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    kpiTargetType?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    minimumTarget?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    target?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    operationalTarget?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    kpiWeightage?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    kpiScore?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    kpiVariance?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    percentage?: FloatNullableFilter<"reportKpiDataNewData"> | number | null
    kpiStatus?: StringNullableFilter<"reportKpiDataNewData"> | string | null
    objectiveId?: JsonNullableFilter<"reportKpiDataNewData">
    reportDate?: DateTimeFilter<"reportKpiDataNewData"> | Date | string
    reportFor?: DateTimeFilter<"reportKpiDataNewData"> | Date | string
    reportYear?: StringNullableFilter<"reportKpiDataNewData"> | string | null
  }, "id">

  export type reportKpiDataNewDataOrderByWithAggregationInput = {
    id?: SortOrder
    kpiTemplateId?: SortOrder
    kpiCategoryId?: SortOrder
    kpiReportId?: SortOrder
    kpiId?: SortOrder
    kraId?: SortOrderInput | SortOrder
    kpiLocation?: SortOrderInput | SortOrder
    kpiOrganization?: SortOrderInput | SortOrder
    kpiEntity?: SortOrderInput | SortOrder
    kpibusiness?: SortOrderInput | SortOrder
    kpiValue?: SortOrder
    kpiComments?: SortOrderInput | SortOrder
    kpiTargetType?: SortOrderInput | SortOrder
    minimumTarget?: SortOrderInput | SortOrder
    target?: SortOrderInput | SortOrder
    operationalTarget?: SortOrderInput | SortOrder
    kpiWeightage?: SortOrderInput | SortOrder
    kpiScore?: SortOrderInput | SortOrder
    kpiVariance?: SortOrderInput | SortOrder
    percentage?: SortOrderInput | SortOrder
    kpiStatus?: SortOrderInput | SortOrder
    objectiveId?: SortOrderInput | SortOrder
    reportDate?: SortOrder
    reportFor?: SortOrder
    reportYear?: SortOrderInput | SortOrder
    _count?: reportKpiDataNewDataCountOrderByAggregateInput
    _avg?: reportKpiDataNewDataAvgOrderByAggregateInput
    _max?: reportKpiDataNewDataMaxOrderByAggregateInput
    _min?: reportKpiDataNewDataMinOrderByAggregateInput
    _sum?: reportKpiDataNewDataSumOrderByAggregateInput
  }

  export type reportKpiDataNewDataScalarWhereWithAggregatesInput = {
    AND?: reportKpiDataNewDataScalarWhereWithAggregatesInput | reportKpiDataNewDataScalarWhereWithAggregatesInput[]
    OR?: reportKpiDataNewDataScalarWhereWithAggregatesInput[]
    NOT?: reportKpiDataNewDataScalarWhereWithAggregatesInput | reportKpiDataNewDataScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"reportKpiDataNewData"> | string
    kpiTemplateId?: StringWithAggregatesFilter<"reportKpiDataNewData"> | string
    kpiCategoryId?: StringWithAggregatesFilter<"reportKpiDataNewData"> | string
    kpiReportId?: StringWithAggregatesFilter<"reportKpiDataNewData"> | string
    kpiId?: StringWithAggregatesFilter<"reportKpiDataNewData"> | string
    kraId?: StringNullableWithAggregatesFilter<"reportKpiDataNewData"> | string | null
    kpiLocation?: StringNullableWithAggregatesFilter<"reportKpiDataNewData"> | string | null
    kpiOrganization?: StringNullableWithAggregatesFilter<"reportKpiDataNewData"> | string | null
    kpiEntity?: StringNullableWithAggregatesFilter<"reportKpiDataNewData"> | string | null
    kpibusiness?: StringNullableWithAggregatesFilter<"reportKpiDataNewData"> | string | null
    kpiValue?: FloatWithAggregatesFilter<"reportKpiDataNewData"> | number
    kpiComments?: StringNullableWithAggregatesFilter<"reportKpiDataNewData"> | string | null
    kpiTargetType?: StringNullableWithAggregatesFilter<"reportKpiDataNewData"> | string | null
    minimumTarget?: FloatNullableWithAggregatesFilter<"reportKpiDataNewData"> | number | null
    target?: FloatNullableWithAggregatesFilter<"reportKpiDataNewData"> | number | null
    operationalTarget?: FloatNullableWithAggregatesFilter<"reportKpiDataNewData"> | number | null
    kpiWeightage?: FloatNullableWithAggregatesFilter<"reportKpiDataNewData"> | number | null
    kpiScore?: FloatNullableWithAggregatesFilter<"reportKpiDataNewData"> | number | null
    kpiVariance?: FloatNullableWithAggregatesFilter<"reportKpiDataNewData"> | number | null
    percentage?: FloatNullableWithAggregatesFilter<"reportKpiDataNewData"> | number | null
    kpiStatus?: StringNullableWithAggregatesFilter<"reportKpiDataNewData"> | string | null
    objectiveId?: JsonNullableWithAggregatesFilter<"reportKpiDataNewData">
    reportDate?: DateTimeWithAggregatesFilter<"reportKpiDataNewData"> | Date | string
    reportFor?: DateTimeWithAggregatesFilter<"reportKpiDataNewData"> | Date | string
    reportYear?: StringNullableWithAggregatesFilter<"reportKpiDataNewData"> | string | null
  }

  export type kpiSummaryWhereInput = {
    AND?: kpiSummaryWhereInput | kpiSummaryWhereInput[]
    OR?: kpiSummaryWhereInput[]
    NOT?: kpiSummaryWhereInput | kpiSummaryWhereInput[]
    id?: StringFilter<"kpiSummary"> | string
    kpiId?: StringFilter<"kpiSummary"> | string
    kraId?: StringNullableFilter<"kpiSummary"> | string | null
    objectiveId?: JsonNullableFilter<"kpiSummary">
    kpiEntity?: StringNullableFilter<"kpiSummary"> | string | null
    kpibusiness?: StringNullableFilter<"kpiSummary"> | string | null
    kpiLocation?: StringNullableFilter<"kpiSummary"> | string | null
    kpiOrganization?: StringNullableFilter<"kpiSummary"> | string | null
    kpiMonthYear?: IntNullableFilter<"kpiSummary"> | number | null
    monthlySum?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyAverage?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyVariance?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyTarget?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyMinimumTarget?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyOperationalTarget?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyWeightedScore?: FloatNullableFilter<"kpiSummary"> | number | null
    percentage?: FloatNullableFilter<"kpiSummary"> | number | null
    kpiComments?: StringNullableFilter<"kpiSummary"> | string | null
    count?: IntFilter<"kpiSummary"> | number
    kpiYear?: IntNullableFilter<"kpiSummary"> | number | null
    kpiPeriod?: IntNullableFilter<"kpiSummary"> | number | null
    kpiSemiAnnual?: IntNullableFilter<"kpiSummary"> | number | null
  }

  export type kpiSummaryOrderByWithRelationInput = {
    id?: SortOrder
    kpiId?: SortOrder
    kraId?: SortOrderInput | SortOrder
    objectiveId?: SortOrderInput | SortOrder
    kpiEntity?: SortOrderInput | SortOrder
    kpibusiness?: SortOrderInput | SortOrder
    kpiLocation?: SortOrderInput | SortOrder
    kpiOrganization?: SortOrderInput | SortOrder
    kpiMonthYear?: SortOrderInput | SortOrder
    monthlySum?: SortOrderInput | SortOrder
    monthlyAverage?: SortOrderInput | SortOrder
    monthlyVariance?: SortOrderInput | SortOrder
    monthlyTarget?: SortOrderInput | SortOrder
    monthlyMinimumTarget?: SortOrderInput | SortOrder
    monthlyOperationalTarget?: SortOrderInput | SortOrder
    monthlyWeightedScore?: SortOrderInput | SortOrder
    percentage?: SortOrderInput | SortOrder
    kpiComments?: SortOrderInput | SortOrder
    count?: SortOrder
    kpiYear?: SortOrderInput | SortOrder
    kpiPeriod?: SortOrderInput | SortOrder
    kpiSemiAnnual?: SortOrderInput | SortOrder
  }

  export type kpiSummaryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: kpiSummaryWhereInput | kpiSummaryWhereInput[]
    OR?: kpiSummaryWhereInput[]
    NOT?: kpiSummaryWhereInput | kpiSummaryWhereInput[]
    kpiId?: StringFilter<"kpiSummary"> | string
    kraId?: StringNullableFilter<"kpiSummary"> | string | null
    objectiveId?: JsonNullableFilter<"kpiSummary">
    kpiEntity?: StringNullableFilter<"kpiSummary"> | string | null
    kpibusiness?: StringNullableFilter<"kpiSummary"> | string | null
    kpiLocation?: StringNullableFilter<"kpiSummary"> | string | null
    kpiOrganization?: StringNullableFilter<"kpiSummary"> | string | null
    kpiMonthYear?: IntNullableFilter<"kpiSummary"> | number | null
    monthlySum?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyAverage?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyVariance?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyTarget?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyMinimumTarget?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyOperationalTarget?: FloatNullableFilter<"kpiSummary"> | number | null
    monthlyWeightedScore?: FloatNullableFilter<"kpiSummary"> | number | null
    percentage?: FloatNullableFilter<"kpiSummary"> | number | null
    kpiComments?: StringNullableFilter<"kpiSummary"> | string | null
    count?: IntFilter<"kpiSummary"> | number
    kpiYear?: IntNullableFilter<"kpiSummary"> | number | null
    kpiPeriod?: IntNullableFilter<"kpiSummary"> | number | null
    kpiSemiAnnual?: IntNullableFilter<"kpiSummary"> | number | null
  }, "id">

  export type kpiSummaryOrderByWithAggregationInput = {
    id?: SortOrder
    kpiId?: SortOrder
    kraId?: SortOrderInput | SortOrder
    objectiveId?: SortOrderInput | SortOrder
    kpiEntity?: SortOrderInput | SortOrder
    kpibusiness?: SortOrderInput | SortOrder
    kpiLocation?: SortOrderInput | SortOrder
    kpiOrganization?: SortOrderInput | SortOrder
    kpiMonthYear?: SortOrderInput | SortOrder
    monthlySum?: SortOrderInput | SortOrder
    monthlyAverage?: SortOrderInput | SortOrder
    monthlyVariance?: SortOrderInput | SortOrder
    monthlyTarget?: SortOrderInput | SortOrder
    monthlyMinimumTarget?: SortOrderInput | SortOrder
    monthlyOperationalTarget?: SortOrderInput | SortOrder
    monthlyWeightedScore?: SortOrderInput | SortOrder
    percentage?: SortOrderInput | SortOrder
    kpiComments?: SortOrderInput | SortOrder
    count?: SortOrder
    kpiYear?: SortOrderInput | SortOrder
    kpiPeriod?: SortOrderInput | SortOrder
    kpiSemiAnnual?: SortOrderInput | SortOrder
    _count?: kpiSummaryCountOrderByAggregateInput
    _avg?: kpiSummaryAvgOrderByAggregateInput
    _max?: kpiSummaryMaxOrderByAggregateInput
    _min?: kpiSummaryMinOrderByAggregateInput
    _sum?: kpiSummarySumOrderByAggregateInput
  }

  export type kpiSummaryScalarWhereWithAggregatesInput = {
    AND?: kpiSummaryScalarWhereWithAggregatesInput | kpiSummaryScalarWhereWithAggregatesInput[]
    OR?: kpiSummaryScalarWhereWithAggregatesInput[]
    NOT?: kpiSummaryScalarWhereWithAggregatesInput | kpiSummaryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"kpiSummary"> | string
    kpiId?: StringWithAggregatesFilter<"kpiSummary"> | string
    kraId?: StringNullableWithAggregatesFilter<"kpiSummary"> | string | null
    objectiveId?: JsonNullableWithAggregatesFilter<"kpiSummary">
    kpiEntity?: StringNullableWithAggregatesFilter<"kpiSummary"> | string | null
    kpibusiness?: StringNullableWithAggregatesFilter<"kpiSummary"> | string | null
    kpiLocation?: StringNullableWithAggregatesFilter<"kpiSummary"> | string | null
    kpiOrganization?: StringNullableWithAggregatesFilter<"kpiSummary"> | string | null
    kpiMonthYear?: IntNullableWithAggregatesFilter<"kpiSummary"> | number | null
    monthlySum?: FloatNullableWithAggregatesFilter<"kpiSummary"> | number | null
    monthlyAverage?: FloatNullableWithAggregatesFilter<"kpiSummary"> | number | null
    monthlyVariance?: FloatNullableWithAggregatesFilter<"kpiSummary"> | number | null
    monthlyTarget?: FloatNullableWithAggregatesFilter<"kpiSummary"> | number | null
    monthlyMinimumTarget?: FloatNullableWithAggregatesFilter<"kpiSummary"> | number | null
    monthlyOperationalTarget?: FloatNullableWithAggregatesFilter<"kpiSummary"> | number | null
    monthlyWeightedScore?: FloatNullableWithAggregatesFilter<"kpiSummary"> | number | null
    percentage?: FloatNullableWithAggregatesFilter<"kpiSummary"> | number | null
    kpiComments?: StringNullableWithAggregatesFilter<"kpiSummary"> | string | null
    count?: IntWithAggregatesFilter<"kpiSummary"> | number
    kpiYear?: IntNullableWithAggregatesFilter<"kpiSummary"> | number | null
    kpiPeriod?: IntNullableWithAggregatesFilter<"kpiSummary"> | number | null
    kpiSemiAnnual?: IntNullableWithAggregatesFilter<"kpiSummary"> | number | null
  }

  export type testWhereInput = {
    AND?: testWhereInput | testWhereInput[]
    OR?: testWhereInput[]
    NOT?: testWhereInput | testWhereInput[]
    id?: StringFilter<"test"> | string
    name?: StringFilter<"test"> | string
  }

  export type testOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type testWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: testWhereInput | testWhereInput[]
    OR?: testWhereInput[]
    NOT?: testWhereInput | testWhereInput[]
    name?: StringFilter<"test"> | string
  }, "id">

  export type testOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    _count?: testCountOrderByAggregateInput
    _max?: testMaxOrderByAggregateInput
    _min?: testMinOrderByAggregateInput
  }

  export type testScalarWhereWithAggregatesInput = {
    AND?: testScalarWhereWithAggregatesInput | testScalarWhereWithAggregatesInput[]
    OR?: testScalarWhereWithAggregatesInput[]
    NOT?: testScalarWhereWithAggregatesInput | testScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"test"> | string
    name?: StringWithAggregatesFilter<"test"> | string
  }

  export type UserTestCreateInput = {
    id: string
    kcId?: string | null
    email?: string | null
    username?: string | null
    firstname?: string | null
    lastname?: string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    enabled?: boolean | null
    organizationId?: string | null
    locationId?: string | null
    entityId?: string | null
    userType?: string | null
    status?: boolean | null
    avatar?: string | null
    deleted?: boolean | null
  }

  export type UserTestUncheckedCreateInput = {
    id: string
    kcId?: string | null
    email?: string | null
    username?: string | null
    firstname?: string | null
    lastname?: string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    enabled?: boolean | null
    organizationId?: string | null
    locationId?: string | null
    entityId?: string | null
    userType?: string | null
    status?: boolean | null
    avatar?: string | null
    deleted?: boolean | null
  }

  export type UserTestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    kcId?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    firstname?: NullableStringFieldUpdateOperationsInput | string | null
    lastname?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    enabled?: NullableBoolFieldUpdateOperationsInput | boolean | null
    organizationId?: NullableStringFieldUpdateOperationsInput | string | null
    locationId?: NullableStringFieldUpdateOperationsInput | string | null
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableBoolFieldUpdateOperationsInput | boolean | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    deleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type UserTestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    kcId?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    firstname?: NullableStringFieldUpdateOperationsInput | string | null
    lastname?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    enabled?: NullableBoolFieldUpdateOperationsInput | boolean | null
    organizationId?: NullableStringFieldUpdateOperationsInput | string | null
    locationId?: NullableStringFieldUpdateOperationsInput | string | null
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableBoolFieldUpdateOperationsInput | boolean | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    deleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type UserTestCreateManyInput = {
    id: string
    kcId?: string | null
    email?: string | null
    username?: string | null
    firstname?: string | null
    lastname?: string | null
    createdAt?: Date | string
    createdBy?: string | null
    updatedAt?: Date | string
    updatedBy?: string | null
    enabled?: boolean | null
    organizationId?: string | null
    locationId?: string | null
    entityId?: string | null
    userType?: string | null
    status?: boolean | null
    avatar?: string | null
    deleted?: boolean | null
  }

  export type UserTestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    kcId?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    firstname?: NullableStringFieldUpdateOperationsInput | string | null
    lastname?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    enabled?: NullableBoolFieldUpdateOperationsInput | boolean | null
    organizationId?: NullableStringFieldUpdateOperationsInput | string | null
    locationId?: NullableStringFieldUpdateOperationsInput | string | null
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableBoolFieldUpdateOperationsInput | boolean | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    deleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type UserTestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    kcId?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    firstname?: NullableStringFieldUpdateOperationsInput | string | null
    lastname?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    enabled?: NullableBoolFieldUpdateOperationsInput | boolean | null
    organizationId?: NullableStringFieldUpdateOperationsInput | string | null
    locationId?: NullableStringFieldUpdateOperationsInput | string | null
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    userType?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableBoolFieldUpdateOperationsInput | boolean | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    deleted?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type reportKpiDataNewDataCreateInput = {
    id?: string
    kpiTemplateId: string
    kpiCategoryId: string
    kpiReportId: string
    kpiId: string
    kraId?: string | null
    kpiLocation?: string | null
    kpiOrganization?: string | null
    kpiEntity?: string | null
    kpibusiness?: string | null
    kpiValue: number
    kpiComments?: string | null
    kpiTargetType?: string | null
    minimumTarget?: number | null
    target?: number | null
    operationalTarget?: number | null
    kpiWeightage?: number | null
    kpiScore?: number | null
    kpiVariance?: number | null
    percentage?: number | null
    kpiStatus?: string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    reportDate?: Date | string
    reportFor?: Date | string
    reportYear?: string | null
  }

  export type reportKpiDataNewDataUncheckedCreateInput = {
    id?: string
    kpiTemplateId: string
    kpiCategoryId: string
    kpiReportId: string
    kpiId: string
    kraId?: string | null
    kpiLocation?: string | null
    kpiOrganization?: string | null
    kpiEntity?: string | null
    kpibusiness?: string | null
    kpiValue: number
    kpiComments?: string | null
    kpiTargetType?: string | null
    minimumTarget?: number | null
    target?: number | null
    operationalTarget?: number | null
    kpiWeightage?: number | null
    kpiScore?: number | null
    kpiVariance?: number | null
    percentage?: number | null
    kpiStatus?: string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    reportDate?: Date | string
    reportFor?: Date | string
    reportYear?: string | null
  }

  export type reportKpiDataNewDataUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    kpiTemplateId?: StringFieldUpdateOperationsInput | string
    kpiCategoryId?: StringFieldUpdateOperationsInput | string
    kpiReportId?: StringFieldUpdateOperationsInput | string
    kpiId?: StringFieldUpdateOperationsInput | string
    kraId?: NullableStringFieldUpdateOperationsInput | string | null
    kpiLocation?: NullableStringFieldUpdateOperationsInput | string | null
    kpiOrganization?: NullableStringFieldUpdateOperationsInput | string | null
    kpiEntity?: NullableStringFieldUpdateOperationsInput | string | null
    kpibusiness?: NullableStringFieldUpdateOperationsInput | string | null
    kpiValue?: FloatFieldUpdateOperationsInput | number
    kpiComments?: NullableStringFieldUpdateOperationsInput | string | null
    kpiTargetType?: NullableStringFieldUpdateOperationsInput | string | null
    minimumTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    target?: NullableFloatFieldUpdateOperationsInput | number | null
    operationalTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiWeightage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiScore?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiVariance?: NullableFloatFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiStatus?: NullableStringFieldUpdateOperationsInput | string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    reportDate?: DateTimeFieldUpdateOperationsInput | Date | string
    reportFor?: DateTimeFieldUpdateOperationsInput | Date | string
    reportYear?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type reportKpiDataNewDataUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    kpiTemplateId?: StringFieldUpdateOperationsInput | string
    kpiCategoryId?: StringFieldUpdateOperationsInput | string
    kpiReportId?: StringFieldUpdateOperationsInput | string
    kpiId?: StringFieldUpdateOperationsInput | string
    kraId?: NullableStringFieldUpdateOperationsInput | string | null
    kpiLocation?: NullableStringFieldUpdateOperationsInput | string | null
    kpiOrganization?: NullableStringFieldUpdateOperationsInput | string | null
    kpiEntity?: NullableStringFieldUpdateOperationsInput | string | null
    kpibusiness?: NullableStringFieldUpdateOperationsInput | string | null
    kpiValue?: FloatFieldUpdateOperationsInput | number
    kpiComments?: NullableStringFieldUpdateOperationsInput | string | null
    kpiTargetType?: NullableStringFieldUpdateOperationsInput | string | null
    minimumTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    target?: NullableFloatFieldUpdateOperationsInput | number | null
    operationalTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiWeightage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiScore?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiVariance?: NullableFloatFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiStatus?: NullableStringFieldUpdateOperationsInput | string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    reportDate?: DateTimeFieldUpdateOperationsInput | Date | string
    reportFor?: DateTimeFieldUpdateOperationsInput | Date | string
    reportYear?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type reportKpiDataNewDataCreateManyInput = {
    id?: string
    kpiTemplateId: string
    kpiCategoryId: string
    kpiReportId: string
    kpiId: string
    kraId?: string | null
    kpiLocation?: string | null
    kpiOrganization?: string | null
    kpiEntity?: string | null
    kpibusiness?: string | null
    kpiValue: number
    kpiComments?: string | null
    kpiTargetType?: string | null
    minimumTarget?: number | null
    target?: number | null
    operationalTarget?: number | null
    kpiWeightage?: number | null
    kpiScore?: number | null
    kpiVariance?: number | null
    percentage?: number | null
    kpiStatus?: string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    reportDate?: Date | string
    reportFor?: Date | string
    reportYear?: string | null
  }

  export type reportKpiDataNewDataUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    kpiTemplateId?: StringFieldUpdateOperationsInput | string
    kpiCategoryId?: StringFieldUpdateOperationsInput | string
    kpiReportId?: StringFieldUpdateOperationsInput | string
    kpiId?: StringFieldUpdateOperationsInput | string
    kraId?: NullableStringFieldUpdateOperationsInput | string | null
    kpiLocation?: NullableStringFieldUpdateOperationsInput | string | null
    kpiOrganization?: NullableStringFieldUpdateOperationsInput | string | null
    kpiEntity?: NullableStringFieldUpdateOperationsInput | string | null
    kpibusiness?: NullableStringFieldUpdateOperationsInput | string | null
    kpiValue?: FloatFieldUpdateOperationsInput | number
    kpiComments?: NullableStringFieldUpdateOperationsInput | string | null
    kpiTargetType?: NullableStringFieldUpdateOperationsInput | string | null
    minimumTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    target?: NullableFloatFieldUpdateOperationsInput | number | null
    operationalTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiWeightage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiScore?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiVariance?: NullableFloatFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiStatus?: NullableStringFieldUpdateOperationsInput | string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    reportDate?: DateTimeFieldUpdateOperationsInput | Date | string
    reportFor?: DateTimeFieldUpdateOperationsInput | Date | string
    reportYear?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type reportKpiDataNewDataUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    kpiTemplateId?: StringFieldUpdateOperationsInput | string
    kpiCategoryId?: StringFieldUpdateOperationsInput | string
    kpiReportId?: StringFieldUpdateOperationsInput | string
    kpiId?: StringFieldUpdateOperationsInput | string
    kraId?: NullableStringFieldUpdateOperationsInput | string | null
    kpiLocation?: NullableStringFieldUpdateOperationsInput | string | null
    kpiOrganization?: NullableStringFieldUpdateOperationsInput | string | null
    kpiEntity?: NullableStringFieldUpdateOperationsInput | string | null
    kpibusiness?: NullableStringFieldUpdateOperationsInput | string | null
    kpiValue?: FloatFieldUpdateOperationsInput | number
    kpiComments?: NullableStringFieldUpdateOperationsInput | string | null
    kpiTargetType?: NullableStringFieldUpdateOperationsInput | string | null
    minimumTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    target?: NullableFloatFieldUpdateOperationsInput | number | null
    operationalTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiWeightage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiScore?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiVariance?: NullableFloatFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiStatus?: NullableStringFieldUpdateOperationsInput | string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    reportDate?: DateTimeFieldUpdateOperationsInput | Date | string
    reportFor?: DateTimeFieldUpdateOperationsInput | Date | string
    reportYear?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type kpiSummaryCreateInput = {
    id?: string
    kpiId: string
    kraId?: string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    kpiEntity?: string | null
    kpibusiness?: string | null
    kpiLocation?: string | null
    kpiOrganization?: string | null
    kpiMonthYear?: number | null
    monthlySum?: number | null
    monthlyAverage?: number | null
    monthlyVariance?: number | null
    monthlyTarget?: number | null
    monthlyMinimumTarget?: number | null
    monthlyOperationalTarget?: number | null
    monthlyWeightedScore?: number | null
    percentage?: number | null
    kpiComments?: string | null
    count?: number
    kpiYear?: number | null
    kpiPeriod?: number | null
    kpiSemiAnnual?: number | null
  }

  export type kpiSummaryUncheckedCreateInput = {
    id?: string
    kpiId: string
    kraId?: string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    kpiEntity?: string | null
    kpibusiness?: string | null
    kpiLocation?: string | null
    kpiOrganization?: string | null
    kpiMonthYear?: number | null
    monthlySum?: number | null
    monthlyAverage?: number | null
    monthlyVariance?: number | null
    monthlyTarget?: number | null
    monthlyMinimumTarget?: number | null
    monthlyOperationalTarget?: number | null
    monthlyWeightedScore?: number | null
    percentage?: number | null
    kpiComments?: string | null
    count?: number
    kpiYear?: number | null
    kpiPeriod?: number | null
    kpiSemiAnnual?: number | null
  }

  export type kpiSummaryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    kpiId?: StringFieldUpdateOperationsInput | string
    kraId?: NullableStringFieldUpdateOperationsInput | string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    kpiEntity?: NullableStringFieldUpdateOperationsInput | string | null
    kpibusiness?: NullableStringFieldUpdateOperationsInput | string | null
    kpiLocation?: NullableStringFieldUpdateOperationsInput | string | null
    kpiOrganization?: NullableStringFieldUpdateOperationsInput | string | null
    kpiMonthYear?: NullableIntFieldUpdateOperationsInput | number | null
    monthlySum?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyAverage?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyVariance?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyMinimumTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyOperationalTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyWeightedScore?: NullableFloatFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiComments?: NullableStringFieldUpdateOperationsInput | string | null
    count?: IntFieldUpdateOperationsInput | number
    kpiYear?: NullableIntFieldUpdateOperationsInput | number | null
    kpiPeriod?: NullableIntFieldUpdateOperationsInput | number | null
    kpiSemiAnnual?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type kpiSummaryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    kpiId?: StringFieldUpdateOperationsInput | string
    kraId?: NullableStringFieldUpdateOperationsInput | string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    kpiEntity?: NullableStringFieldUpdateOperationsInput | string | null
    kpibusiness?: NullableStringFieldUpdateOperationsInput | string | null
    kpiLocation?: NullableStringFieldUpdateOperationsInput | string | null
    kpiOrganization?: NullableStringFieldUpdateOperationsInput | string | null
    kpiMonthYear?: NullableIntFieldUpdateOperationsInput | number | null
    monthlySum?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyAverage?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyVariance?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyMinimumTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyOperationalTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyWeightedScore?: NullableFloatFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiComments?: NullableStringFieldUpdateOperationsInput | string | null
    count?: IntFieldUpdateOperationsInput | number
    kpiYear?: NullableIntFieldUpdateOperationsInput | number | null
    kpiPeriod?: NullableIntFieldUpdateOperationsInput | number | null
    kpiSemiAnnual?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type kpiSummaryCreateManyInput = {
    id?: string
    kpiId: string
    kraId?: string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    kpiEntity?: string | null
    kpibusiness?: string | null
    kpiLocation?: string | null
    kpiOrganization?: string | null
    kpiMonthYear?: number | null
    monthlySum?: number | null
    monthlyAverage?: number | null
    monthlyVariance?: number | null
    monthlyTarget?: number | null
    monthlyMinimumTarget?: number | null
    monthlyOperationalTarget?: number | null
    monthlyWeightedScore?: number | null
    percentage?: number | null
    kpiComments?: string | null
    count?: number
    kpiYear?: number | null
    kpiPeriod?: number | null
    kpiSemiAnnual?: number | null
  }

  export type kpiSummaryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    kpiId?: StringFieldUpdateOperationsInput | string
    kraId?: NullableStringFieldUpdateOperationsInput | string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    kpiEntity?: NullableStringFieldUpdateOperationsInput | string | null
    kpibusiness?: NullableStringFieldUpdateOperationsInput | string | null
    kpiLocation?: NullableStringFieldUpdateOperationsInput | string | null
    kpiOrganization?: NullableStringFieldUpdateOperationsInput | string | null
    kpiMonthYear?: NullableIntFieldUpdateOperationsInput | number | null
    monthlySum?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyAverage?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyVariance?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyMinimumTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyOperationalTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyWeightedScore?: NullableFloatFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiComments?: NullableStringFieldUpdateOperationsInput | string | null
    count?: IntFieldUpdateOperationsInput | number
    kpiYear?: NullableIntFieldUpdateOperationsInput | number | null
    kpiPeriod?: NullableIntFieldUpdateOperationsInput | number | null
    kpiSemiAnnual?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type kpiSummaryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    kpiId?: StringFieldUpdateOperationsInput | string
    kraId?: NullableStringFieldUpdateOperationsInput | string | null
    objectiveId?: NullableJsonNullValueInput | InputJsonValue
    kpiEntity?: NullableStringFieldUpdateOperationsInput | string | null
    kpibusiness?: NullableStringFieldUpdateOperationsInput | string | null
    kpiLocation?: NullableStringFieldUpdateOperationsInput | string | null
    kpiOrganization?: NullableStringFieldUpdateOperationsInput | string | null
    kpiMonthYear?: NullableIntFieldUpdateOperationsInput | number | null
    monthlySum?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyAverage?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyVariance?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyMinimumTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyOperationalTarget?: NullableFloatFieldUpdateOperationsInput | number | null
    monthlyWeightedScore?: NullableFloatFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    kpiComments?: NullableStringFieldUpdateOperationsInput | string | null
    count?: IntFieldUpdateOperationsInput | number
    kpiYear?: NullableIntFieldUpdateOperationsInput | number | null
    kpiPeriod?: NullableIntFieldUpdateOperationsInput | number | null
    kpiSemiAnnual?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type testCreateInput = {
    id: string
    name: string
  }

  export type testUncheckedCreateInput = {
    id: string
    name: string
  }

  export type testUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type testUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type testCreateManyInput = {
    id: string
    name: string
  }

  export type testUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type testUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserTestCountOrderByAggregateInput = {
    id?: SortOrder
    kcId?: SortOrder
    email?: SortOrder
    username?: SortOrder
    firstname?: SortOrder
    lastname?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    enabled?: SortOrder
    organizationId?: SortOrder
    locationId?: SortOrder
    entityId?: SortOrder
    userType?: SortOrder
    status?: SortOrder
    avatar?: SortOrder
    deleted?: SortOrder
  }

  export type UserTestMaxOrderByAggregateInput = {
    id?: SortOrder
    kcId?: SortOrder
    email?: SortOrder
    username?: SortOrder
    firstname?: SortOrder
    lastname?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    enabled?: SortOrder
    organizationId?: SortOrder
    locationId?: SortOrder
    entityId?: SortOrder
    userType?: SortOrder
    status?: SortOrder
    avatar?: SortOrder
    deleted?: SortOrder
  }

  export type UserTestMinOrderByAggregateInput = {
    id?: SortOrder
    kcId?: SortOrder
    email?: SortOrder
    username?: SortOrder
    firstname?: SortOrder
    lastname?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    updatedAt?: SortOrder
    updatedBy?: SortOrder
    enabled?: SortOrder
    organizationId?: SortOrder
    locationId?: SortOrder
    entityId?: SortOrder
    userType?: SortOrder
    status?: SortOrder
    avatar?: SortOrder
    deleted?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type reportKpiDataNewDataCountOrderByAggregateInput = {
    id?: SortOrder
    kpiTemplateId?: SortOrder
    kpiCategoryId?: SortOrder
    kpiReportId?: SortOrder
    kpiId?: SortOrder
    kraId?: SortOrder
    kpiLocation?: SortOrder
    kpiOrganization?: SortOrder
    kpiEntity?: SortOrder
    kpibusiness?: SortOrder
    kpiValue?: SortOrder
    kpiComments?: SortOrder
    kpiTargetType?: SortOrder
    minimumTarget?: SortOrder
    target?: SortOrder
    operationalTarget?: SortOrder
    kpiWeightage?: SortOrder
    kpiScore?: SortOrder
    kpiVariance?: SortOrder
    percentage?: SortOrder
    kpiStatus?: SortOrder
    objectiveId?: SortOrder
    reportDate?: SortOrder
    reportFor?: SortOrder
    reportYear?: SortOrder
  }

  export type reportKpiDataNewDataAvgOrderByAggregateInput = {
    kpiValue?: SortOrder
    minimumTarget?: SortOrder
    target?: SortOrder
    operationalTarget?: SortOrder
    kpiWeightage?: SortOrder
    kpiScore?: SortOrder
    kpiVariance?: SortOrder
    percentage?: SortOrder
  }

  export type reportKpiDataNewDataMaxOrderByAggregateInput = {
    id?: SortOrder
    kpiTemplateId?: SortOrder
    kpiCategoryId?: SortOrder
    kpiReportId?: SortOrder
    kpiId?: SortOrder
    kraId?: SortOrder
    kpiLocation?: SortOrder
    kpiOrganization?: SortOrder
    kpiEntity?: SortOrder
    kpibusiness?: SortOrder
    kpiValue?: SortOrder
    kpiComments?: SortOrder
    kpiTargetType?: SortOrder
    minimumTarget?: SortOrder
    target?: SortOrder
    operationalTarget?: SortOrder
    kpiWeightage?: SortOrder
    kpiScore?: SortOrder
    kpiVariance?: SortOrder
    percentage?: SortOrder
    kpiStatus?: SortOrder
    reportDate?: SortOrder
    reportFor?: SortOrder
    reportYear?: SortOrder
  }

  export type reportKpiDataNewDataMinOrderByAggregateInput = {
    id?: SortOrder
    kpiTemplateId?: SortOrder
    kpiCategoryId?: SortOrder
    kpiReportId?: SortOrder
    kpiId?: SortOrder
    kraId?: SortOrder
    kpiLocation?: SortOrder
    kpiOrganization?: SortOrder
    kpiEntity?: SortOrder
    kpibusiness?: SortOrder
    kpiValue?: SortOrder
    kpiComments?: SortOrder
    kpiTargetType?: SortOrder
    minimumTarget?: SortOrder
    target?: SortOrder
    operationalTarget?: SortOrder
    kpiWeightage?: SortOrder
    kpiScore?: SortOrder
    kpiVariance?: SortOrder
    percentage?: SortOrder
    kpiStatus?: SortOrder
    reportDate?: SortOrder
    reportFor?: SortOrder
    reportYear?: SortOrder
  }

  export type reportKpiDataNewDataSumOrderByAggregateInput = {
    kpiValue?: SortOrder
    minimumTarget?: SortOrder
    target?: SortOrder
    operationalTarget?: SortOrder
    kpiWeightage?: SortOrder
    kpiScore?: SortOrder
    kpiVariance?: SortOrder
    percentage?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type kpiSummaryCountOrderByAggregateInput = {
    id?: SortOrder
    kpiId?: SortOrder
    kraId?: SortOrder
    objectiveId?: SortOrder
    kpiEntity?: SortOrder
    kpibusiness?: SortOrder
    kpiLocation?: SortOrder
    kpiOrganization?: SortOrder
    kpiMonthYear?: SortOrder
    monthlySum?: SortOrder
    monthlyAverage?: SortOrder
    monthlyVariance?: SortOrder
    monthlyTarget?: SortOrder
    monthlyMinimumTarget?: SortOrder
    monthlyOperationalTarget?: SortOrder
    monthlyWeightedScore?: SortOrder
    percentage?: SortOrder
    kpiComments?: SortOrder
    count?: SortOrder
    kpiYear?: SortOrder
    kpiPeriod?: SortOrder
    kpiSemiAnnual?: SortOrder
  }

  export type kpiSummaryAvgOrderByAggregateInput = {
    kpiMonthYear?: SortOrder
    monthlySum?: SortOrder
    monthlyAverage?: SortOrder
    monthlyVariance?: SortOrder
    monthlyTarget?: SortOrder
    monthlyMinimumTarget?: SortOrder
    monthlyOperationalTarget?: SortOrder
    monthlyWeightedScore?: SortOrder
    percentage?: SortOrder
    count?: SortOrder
    kpiYear?: SortOrder
    kpiPeriod?: SortOrder
    kpiSemiAnnual?: SortOrder
  }

  export type kpiSummaryMaxOrderByAggregateInput = {
    id?: SortOrder
    kpiId?: SortOrder
    kraId?: SortOrder
    kpiEntity?: SortOrder
    kpibusiness?: SortOrder
    kpiLocation?: SortOrder
    kpiOrganization?: SortOrder
    kpiMonthYear?: SortOrder
    monthlySum?: SortOrder
    monthlyAverage?: SortOrder
    monthlyVariance?: SortOrder
    monthlyTarget?: SortOrder
    monthlyMinimumTarget?: SortOrder
    monthlyOperationalTarget?: SortOrder
    monthlyWeightedScore?: SortOrder
    percentage?: SortOrder
    kpiComments?: SortOrder
    count?: SortOrder
    kpiYear?: SortOrder
    kpiPeriod?: SortOrder
    kpiSemiAnnual?: SortOrder
  }

  export type kpiSummaryMinOrderByAggregateInput = {
    id?: SortOrder
    kpiId?: SortOrder
    kraId?: SortOrder
    kpiEntity?: SortOrder
    kpibusiness?: SortOrder
    kpiLocation?: SortOrder
    kpiOrganization?: SortOrder
    kpiMonthYear?: SortOrder
    monthlySum?: SortOrder
    monthlyAverage?: SortOrder
    monthlyVariance?: SortOrder
    monthlyTarget?: SortOrder
    monthlyMinimumTarget?: SortOrder
    monthlyOperationalTarget?: SortOrder
    monthlyWeightedScore?: SortOrder
    percentage?: SortOrder
    kpiComments?: SortOrder
    count?: SortOrder
    kpiYear?: SortOrder
    kpiPeriod?: SortOrder
    kpiSemiAnnual?: SortOrder
  }

  export type kpiSummarySumOrderByAggregateInput = {
    kpiMonthYear?: SortOrder
    monthlySum?: SortOrder
    monthlyAverage?: SortOrder
    monthlyVariance?: SortOrder
    monthlyTarget?: SortOrder
    monthlyMinimumTarget?: SortOrder
    monthlyOperationalTarget?: SortOrder
    monthlyWeightedScore?: SortOrder
    percentage?: SortOrder
    count?: SortOrder
    kpiYear?: SortOrder
    kpiPeriod?: SortOrder
    kpiSemiAnnual?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type testCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type testMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type testMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserTestDefaultArgs instead
     */
    export type UserTestArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserTestDefaultArgs<ExtArgs>
    /**
     * @deprecated Use reportKpiDataNewDataDefaultArgs instead
     */
    export type reportKpiDataNewDataArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = reportKpiDataNewDataDefaultArgs<ExtArgs>
    /**
     * @deprecated Use kpiSummaryDefaultArgs instead
     */
    export type kpiSummaryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = kpiSummaryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use testDefaultArgs instead
     */
    export type testArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = testDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}