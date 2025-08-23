import React from 'react'

import About from '../components/views/About'

const Page: React.FC = () => {
  return <About />
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - About' } }
}

export default Page