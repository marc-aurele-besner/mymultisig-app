import React from 'react'

import Integration from '../components/views/Integration'

const Page: React.FC = () => {
  return <Integration />
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Integration' } }
}

export default Page
