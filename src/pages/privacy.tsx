import React from 'react'

import Privacy from '../components/views/Privacy'

const Page: React.FC = () => {
  return <Privacy />
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Privacy Policy' } }
}

export default Page
