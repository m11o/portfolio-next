import React, { useEffect, useState } from 'react'
import { Heading, Flex, Tag, Text, Box, Code } from '@chakra-ui/react'

import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import { Entry, EntryFields, EntryCollection } from 'contentful'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { GetStaticProps, GetStaticPaths } from 'next'

import contentfulClient from '../../src/lib/contentful_client'
import markdownTheme from '../../src/lib/markdown_theme'

type postType = {
  title: string,
  tags: string[],
  markdown: string,
  updatedAt: string
}
type blogDetailProps = {
  title: string,
  tags: string[],
  markdown: string,
  updatedAt: string
}
const BlogDetail: React.FC<blogDetailProps> = ({ title, tags, markdown, updatedAt }) => {
  const customMarkdownTheme = {
    ...markdownTheme,
    code: (props: any) => {    // eslint-disable-line @typescript-eslint/no-explicit-any
      const { inline, children, className } = props
      if (inline) return <Code p={2}>{children}</Code>

      const languageMatch = className.match(/language-(\w+)/)
      let language = ''
      if (languageMatch) {
        language = languageMatch[1]
      }
      return (
        <SyntaxHighlighter
          style={atomOneDark}
          customStyle={{ margin: '18px 0' }}
          language={language}
          codeTagProps={{ style: {
            padding: '10px',
            margin: '15px 0',
            display: 'block',
            backgroundColor: 'gray.600',
            borderRadius: '3px',
            overflowX: 'auto'
          } }}
          PreTag={React.Fragment}
          CodeTag={Code}
        >
          {children}
        </SyntaxHighlighter>
      )
    }
  }

  return (
    <>
      <Box mb={{ base: 10, md: 20 }}>
        <Heading as='h1' size='xl' mb={{ base: 2, md: 4 }}>{title}</Heading>
        <Flex justifyContent='space-between' alignItems='flex-end'>
          <Box>
            {tags.length ? (tags.map((tag) => <Tag key={tag} mx={1} my={1}>{tag}</Tag>)) : ''}
          </Box>
          <Text fontWeight='bold'>{updatedAt}</Text>
        </Flex>
      </Box>
      <ReactMarkdown components={ChakraUIRenderer(customMarkdownTheme)} remarkPlugins={[gfm]}>{markdown}</ReactMarkdown>
    </>
  )
}
export default BlogDetail

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id: string = String(params?.id)

  const post = await contentfulClient.getEntry(id)
    .then((response: Entry<EntryFields.Object>) => {
      const { title, tags, markdown } = response.fields
      const updatedAt = new Date(response.sys.updatedAt).toLocaleDateString('ja-JP')

      return { title, tags, markdown, updatedAt }
    })
    .catch(err => {
      console.error(err)
      return { notFound: true }
    })
  return { props: post }
}
export const getStaticPaths: GetStaticPaths = async () => {
  const query = {
    content_type: 'blog',
    order: '-sys.createdAt',
  }
  const { items }: EntryCollection<EntryFields.Object> = await contentfulClient.getEntries(query)
  const paths = items.map(item => ({ params: { id: item.sys.id } }))
  return {
    paths,
    fallback: false
  }
}