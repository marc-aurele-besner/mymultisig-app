import React from 'react'

import UseYourMultiSig from '../components/views/UseYourMultiSig'

const Page: React.FC = () => {
  return <UseYourMultiSig />
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Open existing multisig' } }
}

export default Page
