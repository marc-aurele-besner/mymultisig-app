// Providers are now handled via transports in wagmi v3
// This file is kept for reference but not currently used
// In wagmi v3, use http() with custom RPC URLs in the transports config

import { http } from 'wagmi'

// Example usage in Web3Provider:
// transports: {
//   [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
//   [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
// }

const providers: any[] = []

export default providers
