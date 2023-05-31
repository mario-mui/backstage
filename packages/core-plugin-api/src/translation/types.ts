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

export interface TranslationRefConfig<
  LazyMessages extends Record<string, string>,
  Messages extends Record<string, string>,
> {
  id: string;
  lazyResources: Record<string, () => Promise<{ messages: LazyMessages }>>;
  resources?: Record<string, Messages>;
}

export interface TranslationRef<
  LazyMessages extends Record<string, string> = Record<string, string>,
  Messages extends Record<string, string> = Record<string, string>,
> {
  getId(): string;

  getResources(): Record<string, Messages> | undefined;

  getLazyResources(): Record<string, () => Promise<{ messages: LazyMessages }>>;
}

export type Translations<T extends TranslationRef> = T extends TranslationRef<
  infer LazyMessages,
  infer Messages
>
  ? Partial<Record<keyof LazyMessages | keyof Messages, string>>
  : never;
