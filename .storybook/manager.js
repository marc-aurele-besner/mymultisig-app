import { addons } from '@storybook/addons'
import { create } from '@storybook/theming/create'

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'MyMultiSig UI',
    brandUrl: 'https://mymultisig.app',
  })
})