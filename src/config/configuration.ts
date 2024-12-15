const configration = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  },
  goggle: {
    apiKey: process.env.GOOGLE_API_KEY,
  }
});

export type configrationKeys = keyof ReturnType<typeof configration>;
type Paths<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${'' | `.${Paths<T[K]>}`}`;
    }[keyof T]
  : never;

type ReturnNestedType<
  T,
  K extends string,
> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? ReturnNestedType<T[First], Rest>
    : never
  : K extends keyof T
    ? T[K]
    : never;

// declare nestjs configuration service
declare module '@nestjs/config' {
  interface ConfigService {
    get<K extends Paths<ReturnType<typeof configration>>>(
      key: K,
    ): ReturnNestedType<ReturnType<typeof configration>, K>;
  }
}

export default configration;
