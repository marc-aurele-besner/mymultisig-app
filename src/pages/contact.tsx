import React from 'react'

import Contact from '../components/views/Contact'

const Page: React.FC = () => {
  return <Contact />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Contact',
      description: 'Get in touch with the MyMultiSig team — questions, feedback, or issues with the multisig wallet.',
      path: '/contact'
    }
  }
}

export default Page
