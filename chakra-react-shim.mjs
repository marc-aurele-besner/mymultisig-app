// ESM shim to re-export everything from @chakra-ui/react plus forwardRef for @chakra-ui/icons compatibility
// This file is used as an alias ONLY for imports from @chakra-ui/icons
// @chakra-ui/icons v2 imports createIcon, Icon, and forwardRef from @chakra-ui/react
// @chakra-ui/icons/index.mjs also does "export * from '@chakra-ui/react'" which requires all exports
import * as React from 'react'

// Import using a special alias that webpack won't intercept
// We'll set up '@chakra-ui/react-real' to point to the actual package in webpack config
import * as ChakraUIReal from '@chakra-ui/react-real'

// Re-export everything from the real @chakra-ui/react
export * from '@chakra-ui/react-real'

// Then add forwardRef which @chakra-ui/react doesn't export (it's from React)
export const forwardRef = React.forwardRef

