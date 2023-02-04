import React from 'react'

const Page: React.FC = () => {
  return <>Hello world</>
}

export async function getStaticProps() {
  return { props: { title: 'Index' } }
}

export default Page
