import { db } from 'lib/app'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (
    context.params &&
    context.params.id &&
    typeof context.params.id === 'string'
  ) {
    const id = context.params.id

    const result = await db.collection('shortlinks').doc(id).get()

    const data = result.data()
    if (result.exists && data && data.url) {
      return {
        redirect: {
          destination: data.url,
          permanent: false,
        },
      }
    }
  }
  return {
    notFound: true,
  }
}

// Empty Page to suppress NextJS error
const Page = (): undefined => undefined

export default Page
