/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as AdminRouteImport } from './routes/admin'
import { Route as MyaccountIndexRouteImport } from './routes/myaccount/index'
import { Route as UserResendVerificationEmailRouteImport } from './routes/user/resend-verification-email'
import { Route as UserLogoutRouteImport } from './routes/user/logout'
import { Route as UserLoginRouteImport } from './routes/user/login'
import { Route as UserForgotPasswordRouteImport } from './routes/user/forgot-password'
import { Route as UserFindAllRouteImport } from './routes/user/findAll'
import { Route as PlayerFindAllRouteImport } from './routes/player/findAll'
import { Route as PlayerCreateRouteImport } from './routes/player/create'
import { Route as ClubFindAllRouteImport } from './routes/club/findAll'
import { Route as ClubCreateRouteImport } from './routes/club/create'
import { Route as UserVerifyEmailTokenRouteImport } from './routes/user/verify-email.$token'
import { Route as UserUpdateIdRouteImport } from './routes/user/update.$id'
import { Route as UserResetPasswordTokenRouteImport } from './routes/user/reset-password.$token'
import { Route as UserRegisterTokenRouteImport } from './routes/user/register.$token'
import { Route as UserDeleteIdRouteImport } from './routes/user/delete.$id'
import { Route as PlayerUpdateIdRouteImport } from './routes/player/update.$id'
import { Route as PlayerFindIdRouteImport } from './routes/player/find.$id'
import { Route as PlayerDeleteIdRouteImport } from './routes/player/delete.$id'
import { Route as ClubUpdateIdRouteImport } from './routes/club/update.$id'
import { Route as ClubFindOneIdRouteImport } from './routes/club/findOne.$id'
import { Route as ClubDeleteIdRouteImport } from './routes/club/delete.$id'

const AdminRoute = AdminRouteImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRouteImport,
} as any)
const MyaccountIndexRoute = MyaccountIndexRouteImport.update({
  id: '/myaccount/',
  path: '/myaccount/',
  getParentRoute: () => rootRouteImport,
} as any)
const UserResendVerificationEmailRoute =
  UserResendVerificationEmailRouteImport.update({
    id: '/user/resend-verification-email',
    path: '/user/resend-verification-email',
    getParentRoute: () => rootRouteImport,
  } as any)
const UserLogoutRoute = UserLogoutRouteImport.update({
  id: '/user/logout',
  path: '/user/logout',
  getParentRoute: () => rootRouteImport,
} as any)
const UserLoginRoute = UserLoginRouteImport.update({
  id: '/user/login',
  path: '/user/login',
  getParentRoute: () => rootRouteImport,
} as any)
const UserForgotPasswordRoute = UserForgotPasswordRouteImport.update({
  id: '/user/forgot-password',
  path: '/user/forgot-password',
  getParentRoute: () => rootRouteImport,
} as any)
const UserFindAllRoute = UserFindAllRouteImport.update({
  id: '/user/findAll',
  path: '/user/findAll',
  getParentRoute: () => rootRouteImport,
} as any)
const PlayerFindAllRoute = PlayerFindAllRouteImport.update({
  id: '/player/findAll',
  path: '/player/findAll',
  getParentRoute: () => rootRouteImport,
} as any)
const PlayerCreateRoute = PlayerCreateRouteImport.update({
  id: '/player/create',
  path: '/player/create',
  getParentRoute: () => rootRouteImport,
} as any)
const ClubFindAllRoute = ClubFindAllRouteImport.update({
  id: '/club/findAll',
  path: '/club/findAll',
  getParentRoute: () => rootRouteImport,
} as any)
const ClubCreateRoute = ClubCreateRouteImport.update({
  id: '/club/create',
  path: '/club/create',
  getParentRoute: () => rootRouteImport,
} as any)
const UserVerifyEmailTokenRoute = UserVerifyEmailTokenRouteImport.update({
  id: '/user/verify-email/$token',
  path: '/user/verify-email/$token',
  getParentRoute: () => rootRouteImport,
} as any)
const UserUpdateIdRoute = UserUpdateIdRouteImport.update({
  id: '/user/update/$id',
  path: '/user/update/$id',
  getParentRoute: () => rootRouteImport,
} as any)
const UserResetPasswordTokenRoute = UserResetPasswordTokenRouteImport.update({
  id: '/user/reset-password/$token',
  path: '/user/reset-password/$token',
  getParentRoute: () => rootRouteImport,
} as any)
const UserRegisterTokenRoute = UserRegisterTokenRouteImport.update({
  id: '/user/register/$token',
  path: '/user/register/$token',
  getParentRoute: () => rootRouteImport,
} as any)
const UserDeleteIdRoute = UserDeleteIdRouteImport.update({
  id: '/user/delete/$id',
  path: '/user/delete/$id',
  getParentRoute: () => rootRouteImport,
} as any)
const PlayerUpdateIdRoute = PlayerUpdateIdRouteImport.update({
  id: '/player/update/$id',
  path: '/player/update/$id',
  getParentRoute: () => rootRouteImport,
} as any)
const PlayerFindIdRoute = PlayerFindIdRouteImport.update({
  id: '/player/find/$id',
  path: '/player/find/$id',
  getParentRoute: () => rootRouteImport,
} as any)
const PlayerDeleteIdRoute = PlayerDeleteIdRouteImport.update({
  id: '/player/delete/$id',
  path: '/player/delete/$id',
  getParentRoute: () => rootRouteImport,
} as any)
const ClubUpdateIdRoute = ClubUpdateIdRouteImport.update({
  id: '/club/update/$id',
  path: '/club/update/$id',
  getParentRoute: () => rootRouteImport,
} as any)
const ClubFindOneIdRoute = ClubFindOneIdRouteImport.update({
  id: '/club/findOne/$id',
  path: '/club/findOne/$id',
  getParentRoute: () => rootRouteImport,
} as any)
const ClubDeleteIdRoute = ClubDeleteIdRouteImport.update({
  id: '/club/delete/$id',
  path: '/club/delete/$id',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/admin': typeof AdminRoute
  '/club/create': typeof ClubCreateRoute
  '/club/findAll': typeof ClubFindAllRoute
  '/player/create': typeof PlayerCreateRoute
  '/player/findAll': typeof PlayerFindAllRoute
  '/user/findAll': typeof UserFindAllRoute
  '/user/forgot-password': typeof UserForgotPasswordRoute
  '/user/login': typeof UserLoginRoute
  '/user/logout': typeof UserLogoutRoute
  '/user/resend-verification-email': typeof UserResendVerificationEmailRoute
  '/myaccount': typeof MyaccountIndexRoute
  '/club/delete/$id': typeof ClubDeleteIdRoute
  '/club/findOne/$id': typeof ClubFindOneIdRoute
  '/club/update/$id': typeof ClubUpdateIdRoute
  '/player/delete/$id': typeof PlayerDeleteIdRoute
  '/player/find/$id': typeof PlayerFindIdRoute
  '/player/update/$id': typeof PlayerUpdateIdRoute
  '/user/delete/$id': typeof UserDeleteIdRoute
  '/user/register/$token': typeof UserRegisterTokenRoute
  '/user/reset-password/$token': typeof UserResetPasswordTokenRoute
  '/user/update/$id': typeof UserUpdateIdRoute
  '/user/verify-email/$token': typeof UserVerifyEmailTokenRoute
}
export interface FileRoutesByTo {
  '/admin': typeof AdminRoute
  '/club/create': typeof ClubCreateRoute
  '/club/findAll': typeof ClubFindAllRoute
  '/player/create': typeof PlayerCreateRoute
  '/player/findAll': typeof PlayerFindAllRoute
  '/user/findAll': typeof UserFindAllRoute
  '/user/forgot-password': typeof UserForgotPasswordRoute
  '/user/login': typeof UserLoginRoute
  '/user/logout': typeof UserLogoutRoute
  '/user/resend-verification-email': typeof UserResendVerificationEmailRoute
  '/myaccount': typeof MyaccountIndexRoute
  '/club/delete/$id': typeof ClubDeleteIdRoute
  '/club/findOne/$id': typeof ClubFindOneIdRoute
  '/club/update/$id': typeof ClubUpdateIdRoute
  '/player/delete/$id': typeof PlayerDeleteIdRoute
  '/player/find/$id': typeof PlayerFindIdRoute
  '/player/update/$id': typeof PlayerUpdateIdRoute
  '/user/delete/$id': typeof UserDeleteIdRoute
  '/user/register/$token': typeof UserRegisterTokenRoute
  '/user/reset-password/$token': typeof UserResetPasswordTokenRoute
  '/user/update/$id': typeof UserUpdateIdRoute
  '/user/verify-email/$token': typeof UserVerifyEmailTokenRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/admin': typeof AdminRoute
  '/club/create': typeof ClubCreateRoute
  '/club/findAll': typeof ClubFindAllRoute
  '/player/create': typeof PlayerCreateRoute
  '/player/findAll': typeof PlayerFindAllRoute
  '/user/findAll': typeof UserFindAllRoute
  '/user/forgot-password': typeof UserForgotPasswordRoute
  '/user/login': typeof UserLoginRoute
  '/user/logout': typeof UserLogoutRoute
  '/user/resend-verification-email': typeof UserResendVerificationEmailRoute
  '/myaccount/': typeof MyaccountIndexRoute
  '/club/delete/$id': typeof ClubDeleteIdRoute
  '/club/findOne/$id': typeof ClubFindOneIdRoute
  '/club/update/$id': typeof ClubUpdateIdRoute
  '/player/delete/$id': typeof PlayerDeleteIdRoute
  '/player/find/$id': typeof PlayerFindIdRoute
  '/player/update/$id': typeof PlayerUpdateIdRoute
  '/user/delete/$id': typeof UserDeleteIdRoute
  '/user/register/$token': typeof UserRegisterTokenRoute
  '/user/reset-password/$token': typeof UserResetPasswordTokenRoute
  '/user/update/$id': typeof UserUpdateIdRoute
  '/user/verify-email/$token': typeof UserVerifyEmailTokenRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/admin'
    | '/club/create'
    | '/club/findAll'
    | '/player/create'
    | '/player/findAll'
    | '/user/findAll'
    | '/user/forgot-password'
    | '/user/login'
    | '/user/logout'
    | '/user/resend-verification-email'
    | '/myaccount'
    | '/club/delete/$id'
    | '/club/findOne/$id'
    | '/club/update/$id'
    | '/player/delete/$id'
    | '/player/find/$id'
    | '/player/update/$id'
    | '/user/delete/$id'
    | '/user/register/$token'
    | '/user/reset-password/$token'
    | '/user/update/$id'
    | '/user/verify-email/$token'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/admin'
    | '/club/create'
    | '/club/findAll'
    | '/player/create'
    | '/player/findAll'
    | '/user/findAll'
    | '/user/forgot-password'
    | '/user/login'
    | '/user/logout'
    | '/user/resend-verification-email'
    | '/myaccount'
    | '/club/delete/$id'
    | '/club/findOne/$id'
    | '/club/update/$id'
    | '/player/delete/$id'
    | '/player/find/$id'
    | '/player/update/$id'
    | '/user/delete/$id'
    | '/user/register/$token'
    | '/user/reset-password/$token'
    | '/user/update/$id'
    | '/user/verify-email/$token'
  id:
    | '__root__'
    | '/admin'
    | '/club/create'
    | '/club/findAll'
    | '/player/create'
    | '/player/findAll'
    | '/user/findAll'
    | '/user/forgot-password'
    | '/user/login'
    | '/user/logout'
    | '/user/resend-verification-email'
    | '/myaccount/'
    | '/club/delete/$id'
    | '/club/findOne/$id'
    | '/club/update/$id'
    | '/player/delete/$id'
    | '/player/find/$id'
    | '/player/update/$id'
    | '/user/delete/$id'
    | '/user/register/$token'
    | '/user/reset-password/$token'
    | '/user/update/$id'
    | '/user/verify-email/$token'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  AdminRoute: typeof AdminRoute
  ClubCreateRoute: typeof ClubCreateRoute
  ClubFindAllRoute: typeof ClubFindAllRoute
  PlayerCreateRoute: typeof PlayerCreateRoute
  PlayerFindAllRoute: typeof PlayerFindAllRoute
  UserFindAllRoute: typeof UserFindAllRoute
  UserForgotPasswordRoute: typeof UserForgotPasswordRoute
  UserLoginRoute: typeof UserLoginRoute
  UserLogoutRoute: typeof UserLogoutRoute
  UserResendVerificationEmailRoute: typeof UserResendVerificationEmailRoute
  MyaccountIndexRoute: typeof MyaccountIndexRoute
  ClubDeleteIdRoute: typeof ClubDeleteIdRoute
  ClubFindOneIdRoute: typeof ClubFindOneIdRoute
  ClubUpdateIdRoute: typeof ClubUpdateIdRoute
  PlayerDeleteIdRoute: typeof PlayerDeleteIdRoute
  PlayerFindIdRoute: typeof PlayerFindIdRoute
  PlayerUpdateIdRoute: typeof PlayerUpdateIdRoute
  UserDeleteIdRoute: typeof UserDeleteIdRoute
  UserRegisterTokenRoute: typeof UserRegisterTokenRoute
  UserResetPasswordTokenRoute: typeof UserResetPasswordTokenRoute
  UserUpdateIdRoute: typeof UserUpdateIdRoute
  UserVerifyEmailTokenRoute: typeof UserVerifyEmailTokenRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/myaccount/': {
      id: '/myaccount/'
      path: '/myaccount'
      fullPath: '/myaccount'
      preLoaderRoute: typeof MyaccountIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/user/resend-verification-email': {
      id: '/user/resend-verification-email'
      path: '/user/resend-verification-email'
      fullPath: '/user/resend-verification-email'
      preLoaderRoute: typeof UserResendVerificationEmailRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/user/logout': {
      id: '/user/logout'
      path: '/user/logout'
      fullPath: '/user/logout'
      preLoaderRoute: typeof UserLogoutRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/user/login': {
      id: '/user/login'
      path: '/user/login'
      fullPath: '/user/login'
      preLoaderRoute: typeof UserLoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/user/forgot-password': {
      id: '/user/forgot-password'
      path: '/user/forgot-password'
      fullPath: '/user/forgot-password'
      preLoaderRoute: typeof UserForgotPasswordRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/user/findAll': {
      id: '/user/findAll'
      path: '/user/findAll'
      fullPath: '/user/findAll'
      preLoaderRoute: typeof UserFindAllRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/player/findAll': {
      id: '/player/findAll'
      path: '/player/findAll'
      fullPath: '/player/findAll'
      preLoaderRoute: typeof PlayerFindAllRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/player/create': {
      id: '/player/create'
      path: '/player/create'
      fullPath: '/player/create'
      preLoaderRoute: typeof PlayerCreateRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/club/findAll': {
      id: '/club/findAll'
      path: '/club/findAll'
      fullPath: '/club/findAll'
      preLoaderRoute: typeof ClubFindAllRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/club/create': {
      id: '/club/create'
      path: '/club/create'
      fullPath: '/club/create'
      preLoaderRoute: typeof ClubCreateRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/user/verify-email/$token': {
      id: '/user/verify-email/$token'
      path: '/user/verify-email/$token'
      fullPath: '/user/verify-email/$token'
      preLoaderRoute: typeof UserVerifyEmailTokenRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/user/update/$id': {
      id: '/user/update/$id'
      path: '/user/update/$id'
      fullPath: '/user/update/$id'
      preLoaderRoute: typeof UserUpdateIdRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/user/reset-password/$token': {
      id: '/user/reset-password/$token'
      path: '/user/reset-password/$token'
      fullPath: '/user/reset-password/$token'
      preLoaderRoute: typeof UserResetPasswordTokenRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/user/register/$token': {
      id: '/user/register/$token'
      path: '/user/register/$token'
      fullPath: '/user/register/$token'
      preLoaderRoute: typeof UserRegisterTokenRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/user/delete/$id': {
      id: '/user/delete/$id'
      path: '/user/delete/$id'
      fullPath: '/user/delete/$id'
      preLoaderRoute: typeof UserDeleteIdRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/player/update/$id': {
      id: '/player/update/$id'
      path: '/player/update/$id'
      fullPath: '/player/update/$id'
      preLoaderRoute: typeof PlayerUpdateIdRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/player/find/$id': {
      id: '/player/find/$id'
      path: '/player/find/$id'
      fullPath: '/player/find/$id'
      preLoaderRoute: typeof PlayerFindIdRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/player/delete/$id': {
      id: '/player/delete/$id'
      path: '/player/delete/$id'
      fullPath: '/player/delete/$id'
      preLoaderRoute: typeof PlayerDeleteIdRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/club/update/$id': {
      id: '/club/update/$id'
      path: '/club/update/$id'
      fullPath: '/club/update/$id'
      preLoaderRoute: typeof ClubUpdateIdRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/club/findOne/$id': {
      id: '/club/findOne/$id'
      path: '/club/findOne/$id'
      fullPath: '/club/findOne/$id'
      preLoaderRoute: typeof ClubFindOneIdRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/club/delete/$id': {
      id: '/club/delete/$id'
      path: '/club/delete/$id'
      fullPath: '/club/delete/$id'
      preLoaderRoute: typeof ClubDeleteIdRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  AdminRoute: AdminRoute,
  ClubCreateRoute: ClubCreateRoute,
  ClubFindAllRoute: ClubFindAllRoute,
  PlayerCreateRoute: PlayerCreateRoute,
  PlayerFindAllRoute: PlayerFindAllRoute,
  UserFindAllRoute: UserFindAllRoute,
  UserForgotPasswordRoute: UserForgotPasswordRoute,
  UserLoginRoute: UserLoginRoute,
  UserLogoutRoute: UserLogoutRoute,
  UserResendVerificationEmailRoute: UserResendVerificationEmailRoute,
  MyaccountIndexRoute: MyaccountIndexRoute,
  ClubDeleteIdRoute: ClubDeleteIdRoute,
  ClubFindOneIdRoute: ClubFindOneIdRoute,
  ClubUpdateIdRoute: ClubUpdateIdRoute,
  PlayerDeleteIdRoute: PlayerDeleteIdRoute,
  PlayerFindIdRoute: PlayerFindIdRoute,
  PlayerUpdateIdRoute: PlayerUpdateIdRoute,
  UserDeleteIdRoute: UserDeleteIdRoute,
  UserRegisterTokenRoute: UserRegisterTokenRoute,
  UserResetPasswordTokenRoute: UserResetPasswordTokenRoute,
  UserUpdateIdRoute: UserUpdateIdRoute,
  UserVerifyEmailTokenRoute: UserVerifyEmailTokenRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
