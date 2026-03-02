// CommonJS shim to re-export createIcon, Icon, and forwardRef for @chakra-ui/icons compatibility
// @chakra-ui/icons v2 imports createIcon, Icon, and forwardRef from @chakra-ui/react
const React = require('react')
const ChakraUI = require('@chakra-ui/react')

module.exports = {
  createIcon: ChakraUI.createIcon,
  Icon: ChakraUI.Icon,
  forwardRef: React.forwardRef
}

