import React from 'react'

import Integration from '../components/views/Integration'

const Page: React.FC = () => {
  return <Integration />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'MyMultiSig - Integration',
      description:
        'Connect MyMultiSig to Slack, Discord, or email notifications, and build on top of it with open ABIs, standard EVM contract calls, and open-source API routes.',
      path: '/integration'
    }
  }
}

export default Page
