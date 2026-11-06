/* eslint-disable react/jsx-filename-extension */
import { Components, Theme } from '@mui/material/styles'
import merge from 'lodash/merge'

import Select from './Select'
import Divider from './Divider'
import Button from './Button'
import Badge from './Badge'
import Tab from './Tab'
import Tabs from './Tabs'
import Surfaces from './Surfaces'
import Forms from './Forms'
import Chip from './Chip'
import Table from './Table'

const ComponentsOverrides = (theme: Theme) =>
  merge(
    Select(theme),
    Button() as unknown as Components,
    Divider(theme),
    Tab(theme),
    Tabs(theme),
    Badge(),
    Surfaces(theme) as unknown as Components,
    Forms(theme),
    Chip(theme) as unknown as Components,
    Table(theme),
  )
export default ComponentsOverrides
