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

import { resolve as resolvePath } from 'path';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import webpack, { ProvidePlugin } from 'webpack';
import { BundlingPaths } from './paths';
import { transforms } from './transforms';
import { DynamicPluginOptions } from './types';
import ESLintPlugin from 'eslint-webpack-plugin';
import { DynamicRemotePlugin } from '@openshift/dynamic-plugin-sdk-webpack';

export const sharedModules = {
  react: {
    singleton: true,
    eager: true,
    requiredVersion: '*',
  },
  'react-dom': {
    singleton: true,
    eager: true,
    requiredVersion: '*',
  },
  'react-router-dom': {
    singleton: true,
    eager: true,
    requiredVersion: '*',
  },
  '@backstage/version-bridge': {
    singleton: true,
    eager: true,
    requiredVersion: '*',
  },
  '@backstage/core-plugin-api': {
    singleton: true,
    eager: true,
    requiredVersion: '*',
  },
  '@scalprum/react-core': {
    singleton: true,
    eager: true,
    requiredVersion: '*',
  },
  '@openshift/dynamic-plugin-sdk': {
    singleton: true,
    eager: true,
    requiredVersion: '*',
  },
};

export async function createMDFConfig(
  paths: BundlingPaths,
  options: DynamicPluginOptions,
): Promise<webpack.Configuration> {
  const { checksEnabled, isDev } = options;

  const { plugins, loaders } = transforms(options);

  if (checksEnabled) {
    plugins.push(
      new ForkTsCheckerWebpackPlugin({
        typescript: { configFile: paths.targetTsConfig, memoryLimit: 4096 },
      }),
      new ESLintPlugin({
        context: paths.targetPath,
        files: ['**/*.(ts|tsx|mts|cts|js|jsx|mjs|cjs)'],
      }),
    );
  }

  // TODO(blam): process is no longer auto polyfilled by webpack in v5.
  // we use the provide plugin to provide this polyfill, but lets look
  // to remove this eventually!
  plugins.push(
    new ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  );

  plugins.push(
    new webpack.EnvironmentPlugin({
      APP_CONFIG: options.frontendAppConfigs,
    }),
  );

  const drplugin = new DynamicRemotePlugin({
    extensions: [],
    sharedModules,
    entryScriptFilename: `${options.pluginMetadata.name}.[fullhash].js`,
    pluginMetadata: options.pluginMetadata,
  });

  plugins.push(drplugin)

  return {
    mode: isDev ? 'development' : 'production',
    profile: false,
    bail: false,
    performance: {
      hints: false, // we check the gzip size instead
    },
    devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
    context: paths.targetPath,
    entry: {},
    resolve: {
      extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json', '.wasm'],
    },
    module: {
      rules: loaders,
    },
    output: {
      path: paths.targetScalprumDist,
      publicPath: `http://localhost:8001/`,
      filename: isDev ? '[name].js' : 'static/[name].[fullhash:8].js',
      chunkFilename: isDev
        ? '[name].chunk.js'
        : 'static/[name].[chunkhash:8].chunk.js',
      ...(isDev
        ? {
            devtoolModuleFilenameTemplate: (info: any) =>
              `file:///${resolvePath(info.absoluteResourcePath).replace(
                /\\/g,
                '/',
              )}`,
          }
        : {}),
    },
    plugins,
  };
}
