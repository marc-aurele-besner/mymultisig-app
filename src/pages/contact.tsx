import React from 'react'

import Contact from '../components/views/Contact'

const Page: React.FC = () => {
  return <Contact />
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Contact' } }
}

export default Page
