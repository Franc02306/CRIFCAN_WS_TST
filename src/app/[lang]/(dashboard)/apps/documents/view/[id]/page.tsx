'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import { TiptapCollabProvider } from '@hocuspocus/provider'

import 'iframe-resizer/js/iframeResizer.contentWindow'

import { Doc as YDoc } from 'yjs'

import { createPortal } from 'react-dom'



import { useSession } from 'next-auth/react'

import { Skeleton } from '@mui/material'

import { BlockEditor } from '@/components/block-editor'
import { Surface } from '@/components/ui/Surface'
import { Toolbar } from '@/components/ui/Toolbar'
import { Icon } from '@/components/ui/Icon'

export default function Document({ params }: { params: { id: string } }) {

  const [provider, setProvider] = useState<TiptapCollabProvider | null>(null);
  const [collabToken, setCollabToken] = useState<string | null | undefined>();
  const [aiToken, setAiToken] = useState<string | null | undefined>();
  const searchParams = useSearchParams();

  const hasCollab = parseInt(searchParams?.get('noCollab') as string) !== 1 && collabToken !== null;



  const { data: session } = useSession();
  const { id } = useParams();

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const response = await fetch('/api/collaboration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('No collaboration token provided, please set TIPTAP_COLLAB_SECRET in your environment');
        }

        const data = await response.json();
        const { token } = data;

        setCollabToken(token);
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        }

        setCollabToken(null);

        return;
      }
    };

    dataFetch();
  }, [id]);

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',

            'Authorization': `Bearer ${session?.accessToken}`

          },
        })

        if (!response.ok) {
          throw new Error('No AI token provided, please set TIPTAP_AI_SECRET in your environment')
        }

        const data = await response.json()

        const { token } = data

        // set state when the data received
        setAiToken(token)
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message)
        }

        setAiToken(null)

        return
      }
    }

    dataFetch()
  }, [session?.accessToken])

  const ydoc = useMemo(() => new YDoc(), [])

  useLayoutEffect(() => {
    if (hasCollab && collabToken) {
      setProvider(
        new TiptapCollabProvider({
          name: `${process.env.NEXT_PUBLIC_COLLAB_DOC_PREFIX}${id}`,
          appId: process.env.NEXT_PUBLIC_TIPTAP_COLLAB_APP_ID ?? '',
          token: collabToken,
          document: ydoc,
        }),
      )
    }
  }, [setProvider, collabToken, ydoc, id, hasCollab])

  if ((hasCollab && !provider) || aiToken === undefined || collabToken === undefined) {
    return <Skeleton animation="wave" />;
  }


  return (
    <>

      <BlockEditor aiToken={aiToken ?? undefined} hasCollab={hasCollab} ydoc={ydoc} provider={provider} />
    </>
  )
}
