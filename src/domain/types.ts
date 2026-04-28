declare const brand: unique symbol;

export type Brand<T, TBrand> = T & { [brand]: TBrand };

export type UserId = Brand<string, 'UserId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type MessageId = Brand<number, 'MessageId'>;
