import React from 'react'

import Integration from '../components/views/Integration'

const Page: React.FC = () => {
  return <Integration />
}

export async function getStaticProps() {
  return {
    props: {
      title: 'Multisig alerts in Slack, Discord, Telegram and email',
      description:
        'Get multisig request alerts in Slack, Discord, Telegram or email, and build on MyMultiSig with open ABIs, standard EVM contract calls and open API routes.',
      path: '/integration'
    }
  }
}

export default Page
