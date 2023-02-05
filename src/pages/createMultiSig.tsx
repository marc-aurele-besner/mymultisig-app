import React from 'react'

import CreateMultiSig from '../components/views/CreateMultiSig'

const Page: React.FC = () => {
  return <CreateMultiSig />
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Create a Multi Signature' } }
}

export default Page
