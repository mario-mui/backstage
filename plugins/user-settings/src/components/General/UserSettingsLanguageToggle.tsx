/*
 * Copyright 2020 The Backstage Authors
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

import React from 'react';
import useObservable from 'react-use/lib/useObservable';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  makeStyles,
} from '@material-ui/core';
import {
  appTranslationApiRef,
  useApi,
  usePluginTranslation,
} from '@backstage/core-plugin-api';
import { settingTranslationRef } from '../../translation';

type TooltipToggleButtonProps = {
  children: JSX.Element;
  title: string;
  value: string;
};

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    paddingRight: 16,
  },
  list: {
    width: 'initial',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      padding: `0 0 12px`,
    },
  },
  listItemText: {
    paddingRight: 0,
    paddingLeft: 0,
  },
  listItemSecondaryAction: {
    position: 'relative',
    transform: 'unset',
    top: 'auto',
    right: 'auto',
    paddingLeft: 16,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
    },
  },
}));

// ToggleButtonGroup uses React.children.map instead of context
// so wrapping with Tooltip breaks ToggleButton functionality.
const TooltipToggleButton = ({
  children,
  title,
  value,
  ...props
}: TooltipToggleButtonProps) => (
  <Tooltip placement="top" arrow title={title}>
    <ToggleButton value={value} {...props}>
      {children}
    </ToggleButton>
  </Tooltip>
);

/** @public */
export const UserSettingsLanguageToggle = () => {
  const classes = useStyles();
  const translationApi = useApi(appTranslationApiRef);
  const { t } = usePluginTranslation(settingTranslationRef);

  const activeLanguage = useObservable(
    translationApi.activeLanguage$(),
    translationApi.getActiveLanguage(),
  );

  const languages = translationApi.getLanguages();

  const handleSetLanguage = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string,
  ) => {
    if (!newValue || newValue === activeLanguage) {
      return;
    }
    if (languages.some(l => l === newValue)) {
      translationApi.setActiveLanguage(newValue);
    } else {
      translationApi.setActiveLanguage(undefined);
    }
  };

  if (!languages?.length) {
    return <></>;
  }

  return (
    <ListItem
      className={classes.list}
      classes={{ container: classes.container }}
    >
      <ListItemText
        className={classes.listItemText}
        primary={t('language', 'Language')}
        secondary={t('change_the_language', 'Change the language')}
      />
      <ListItemSecondaryAction className={classes.listItemSecondaryAction}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={activeLanguage}
          onChange={handleSetLanguage}
        >
          {languages.map(language => {
            return (
              <TooltipToggleButton
                key={language}
                title={`${t('select', 'Select')} ${language}`}
                value={language}
              >
                <>{t(language)}</>
              </TooltipToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </ListItemSecondaryAction>
    </ListItem>
  );
};
