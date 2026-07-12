import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'MyMultiSig UI',
    brandUrl: 'https://mymultisig.app',
  })
})
