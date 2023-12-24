import React from 'react'
import { Text, Box, Flex, Image, LinkBox, LinkOverlay, Heading, Tag } from '@chakra-ui/react'
import { EntryFields, Asset, Entry } from 'contentful'

import contentfulClient from '../../src/lib/contentful_client'
import {Metadata} from "next";

const getWorks = async () => {
  const query = {
    content_type: 'work',
    order: '-sys.createdAt'
  }

  let works: EntryFields.Array<EntryFields.Object> = [];
  let thumbnailLinks: { [key: string]: string } = {};

  contentfulClient
    .getEntries(query)
    .then((response: EntryFields.Object): Promise<string[]> => {
      works = response.items

      return new Promise((resolve, reject) => {
        if (response.items.length) {
          resolve(
            response.items.map((work: Entry<EntryFields.Object>) => {
              const { thumbnail } = work.fields
              if (!thumbnail) return

              return thumbnail.sys.id
            })
          )
        } else {
          reject(Error('error: without items.'))
        }
      })
    })
    .then((thumbnailIds: string[]): Promise<Promise<Asset>[]> => {
      const thumbnails = thumbnailIds.map((thumnailId: string) => contentfulClient.getAsset(thumnailId))
      return new Promise(resolve => resolve(thumbnails))
    })
    .then((thumbnails: Promise<Asset>[]) => {
      Promise.all(thumbnails).then((assets: Asset[]) => {
        assets.forEach((asset: Asset) => {
          thumbnailLinks[asset.sys.id] = asset.fields.file.url
        })
      })
      .catch(err => console.error(err))
    })
    .catch(err => console.error(err))

  return { works, thumbnailLinks }
}

export const metadata: Metadata = {
  title: 'Works - Love Beautiful Code',
  description: '作品一覧',
}

const Works = async () => {
  const { works, thumbnailLinks } = await getWorks();

  return (
    <>
      {works.length || thumbnailLinks.length ? (
        <>
          <Box w='100%'>
            <Heading as='h1' size='md' mb={8}>ポートフォリオ</Heading>
            <Flex direction={{ base: 'column', md: 'row' }} justifyContent='space-between'>
              {works.map((work: EntryFields.Object) => {
                const { name, thumbnail, libs, link, description } = work.fields

                return (
                  <LinkBox key={name} as='article' borderWidth='3px' rounded='md' h='auto' maxH={{ base: '400px', md: '500px' }} w={{ base: '100%', md: '45%' }} mb={{ base: 5, md: 0 }}>
                    <Image borderBottomWidth='2px' alt='thumbnail' src={thumbnail && thumbnail.sys.id ? (thumbnailLinks[thumbnail.sys.id]) : '/images/portfolio_icon1.jpg'} borderTopRadius='md' h='50%' w='100%' fit='fill' />
                    <Box p={4}>
                      <Heading as='h4' size='md' mb={2}>
                        <LinkOverlay href={link} isExternal>
                          {name}
                        </LinkOverlay>
                      </Heading>
                      <Text fontSize='sm' noOfLines={{ base: 4, md: 3 }}>{description}</Text>
                      <Flex flexWrap='wrap' mt={4} alignItems='baseline'>
                        <Heading as='h6' size='sm' mr={1}>使用技術:</Heading>
                        {libs.length ? (
                          libs.map((lib: string) => <Tag colorScheme='green' size='sm' mr={1} mb={1} key={lib}>{lib}</Tag>)
                        ) : ''}
                      </Flex>
                    </Box>
                  </LinkBox>
                )})}
            </Flex>
          </Box>
        </>
      ) : (
        <Text fontSize='sm' color='gray.400' textAlign='center'>現在、表示できるPortfolioがありません</Text>
      )
      }
    </>
  )
}
export default Works;
