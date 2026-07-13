import React from 'react'
import type { StoryFn, Meta } from '@storybook/react'

import ImageButton from './ImageButton'

const meta: Meta<typeof ImageButton> = {
  title: 'Buttons/ImageButton',
  component: ImageButton,
}

export default meta

export const Import: StoryFn<typeof ImageButton> = () => (
  <ImageButton placeholder='Import' imagePath='/images/import.png' />
)

export const Create: StoryFn<typeof ImageButton> = () => (
  <ImageButton placeholder='Create' imagePath='/images/create.png' />
)

export const Integration: StoryFn<typeof ImageButton> = () => (
  <ImageButton placeholder='Integration' imagePath='/images/integration.png' />
)
