import React from 'react'

import Terms from '../components/views/Terms'

const Page: React.FC = () => {
  return <Terms />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Terms & Conditions',
      description: 'Terms and conditions for using the MyMultiSig app and its open-source multisig contracts.',
      path: '/terms'
    }
  }
}

export default Page
