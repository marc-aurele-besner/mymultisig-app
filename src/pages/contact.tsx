import React from 'react'

import Contact from '../components/views/Contact'

const Page: React.FC = () => {
  return <Contact />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'Contact the MyMultiSig team',
      description: 'Get in touch with the MyMultiSig team: questions about the open-source multisig wallet, feedback, bug reports, or requests for a new EVM network.',
      path: '/contact'
    }
  }
}

export default Page
