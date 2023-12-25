import type { Icon } from './types'

export const WalletIcon: React.FC<Icon> = (props) => (
  <svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      d='M9 12H15'
      stroke={props.color || '#FFFFFF'}
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
    <path
      d='M31.2499 13.5H27.3462C24.6698 13.5 22.5 15.5146 22.5 18C22.5 20.4854 24.6698 22.5 27.3462 22.5H31.2499C31.375 22.5 31.4374 22.5 31.4902 22.4969C32.2992 22.4475 32.9434 21.8493 32.9965 21.0981C33 21.0491 33 20.991 33 20.8751V15.1249C33 15.009 33 14.9509 32.9965 14.9019C32.9434 14.1508 32.2992 13.5524 31.4902 13.5032C31.4374 13.5 31.375 13.5 31.2499 13.5Z'
      stroke={props.color || '#FFFFFF'}
      stroke-width='2'
    />
    <path
      d='M31.4475 13.5C31.3309 10.6915 30.9549 8.96962 29.7426 7.75735C27.9853 6 25.1568 6 19.5 6H15C9.34314 6 6.51472 6 4.75735 7.75735C3 9.51472 3 12.3431 3 18C3 23.6568 3 26.4853 4.75735 28.2426C6.51472 30 9.34314 30 15 30H19.5C25.1568 30 27.9853 30 29.7426 28.2426C30.9549 27.0304 31.3309 25.3085 31.4475 22.5'
      stroke={props.color || '#FFFFFF'}
      stroke-width='2'
    />
    <path
      d='M26.9863 18H26.9998'
      stroke={props.color || '#FFFFFF'}
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
)
