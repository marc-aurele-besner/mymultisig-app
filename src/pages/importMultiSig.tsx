import React from 'react'

import ImportMultiSig from '../components/views/ImportMultiSig'

const Page: React.FC = () => {
  return <ImportMultiSig />
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Import your MultiSig' } }
}

export default Page
