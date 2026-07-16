import React from 'react'

import About from '../components/views/About'

const Page: React.FC = () => {
  return <About />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - About',
      description:
        'Learn about MyMultiSig, an open-source multisig wallet project for Ethereum and EVM networks: why it exists, its design principles, and how to review the code.',
      path: '/about'
    }
  }
}

export default Page