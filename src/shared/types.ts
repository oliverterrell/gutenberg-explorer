import { LS_APP_PAGE_TOAST, LS_LOGIN_PAGE_TOAST } from '@/lib/constants';
import { JSX } from 'react';

export type VoidOrPromise = (() => void) | (() => Promise<void>);

export type Any = any;

export type AnyFunction = (
  | VoidOrPromise
  | ((args?: any | undefined) => any)
  | ((args?: any | undefined) => Promise<any>)
  | ((...args: any | undefined) => any)
  | ((...args: any | undefined) => Promise<any>)
) &
  Function;

export type FormInput = Record<string, any>;
export type OnSubmitForm = any;
export type ComponentRender = (args?: any) => JSX.Element;
export type LSMessageKey = typeof LS_APP_PAGE_TOAST | typeof LS_LOGIN_PAGE_TOAST | undefined;
