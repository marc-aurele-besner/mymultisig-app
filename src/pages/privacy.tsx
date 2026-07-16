import React from 'react'

import Privacy from '../components/views/Privacy'

const Page: React.FC = () => {
  return <Privacy />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Privacy Policy',
      description: 'Privacy policy for MyMultiSig: what data the app stores, how it is used, and what stays onchain.',
      path: '/privacy'
    }
  }
}

export default Page
