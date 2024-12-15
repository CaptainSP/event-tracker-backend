import { SetMetadata } from '@nestjs/common';

export enum Permissions {
    TITLES_CREATE = 'titles.create',
    TITLES_VIEW = 'titles.view',
    TITLES_EDIT = 'titles.edit',
    TITLES_DELETE = 'titles.delete',
    CHAPTERS_CREATE = 'chapters.create',
    CHAPTERS_VIEW = 'chapters.view',
    CHAPTERS_EDIT = 'chapters.edit',
    CHAPTERS_DELETE = 'chapters.delete',
    PEOPLE_CREATE = 'people.create',
    PEOPLE_VIEW = 'people.view',
    PEOPLE_EDIT = 'people.edit',
    PEOPLE_DELETE = 'people.delete',
    TAGS_CREATE = 'tags.create',
    TAGS_VIEW = 'tags.view',
    TAGS_EDIT = 'tags.edit',
    TAGS_DELETE = 'tags.delete',
    USERS_CREATE = 'users.create',
    USERS_VIEW = 'users.view',
    USERS_EDIT = 'users.edit',
    USERS_DELETE = 'users.delete',
    ROLES_CREATE = 'roles.create',
    ROLES_VIEW = 'roles.view',
    ROLES_EDIT = 'roles.edit',
    ROLES_DELETE = 'roles.delete',
}

export const PERMISSION_KEY = 'roles';
export const Permission = (permission: Permissions) => SetMetadata(PERMISSION_KEY, permission);
