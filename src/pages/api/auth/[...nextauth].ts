import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import TwitterProvider from 'next-auth/providers/twitter'
import SlackProvider from 'next-auth/providers/slack'

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) throw new Error('GITHUB_ID and GITHUB_SECRET must be defined')
if (!process.env.GOOGLE_ID || !process.env.GOOGLE_SECRET) throw new Error('GOOGLE_ID and GOOGLE_SECRET must be defined')
if (!process.env.DISCORD_ID || !process.env.DISCORD_SECRET)
  throw new Error('DISCORD_ID and DISCORD_SECRET must be defined')
if (!process.env.TWITTER_ID || !process.env.TWITTER_SECRET)
  throw new Error('TWITTER_ID and TWITTER_SECRET must be defined')
if (!process.env.SLACK_ID || !process.env.SLACK_SECRET) throw new Error('SLACK_ID and SLACK_SECRET must be defined')

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_ID,
      clientSecret: process.env.DISCORD_SECRET
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET
    }),
    SlackProvider({
      clientId: process.env.SLACK_ID,
      clientSecret: process.env.SLACK_SECRET
    })
  ]
}

export default NextAuth(authOptions)
