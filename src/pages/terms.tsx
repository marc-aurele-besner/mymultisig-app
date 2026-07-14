import React from 'react'

import Terms from '../components/views/Terms'

const Page: React.FC = () => {
  return <Terms />
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Terms & Conditions' } }
}

export default Page
