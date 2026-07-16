import React from 'react'

import PublicAddressBook from '../components/views/PublicAddressBook'

const Page: React.FC = () => {
  return <PublicAddressBook />
}

export async function getStaticProps() {
  return { props: { title: 'MyMultiSig - Admin', noIndex: true } }
}

export default Page
