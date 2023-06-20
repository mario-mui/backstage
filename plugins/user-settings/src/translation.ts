/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createTranslationRef } from '@backstage/core-plugin-api';

// why can not use interface

export type UserSettingPluginMessages = {
  language: string;
  change_the_language: string;
  theme: string;
  theme_light: string;
  theme_dark: string;
  theme_auto: string;
  change_the_theme_mode: string;
  select_theme_light: string;
  select_theme_dark: string;
  select_theme_auto: string;
  lng: string;
  select_lng: string;
};

export const userSettingsTranslationRef =
  createTranslationRef<UserSettingPluginMessages>({
    id: 'user-settings',
    lazyResources: {
      zh: () => import('./translations/zh'),
    },
  });
