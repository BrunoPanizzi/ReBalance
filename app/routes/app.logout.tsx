import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { Form, useNavigate } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { Dialog } from '~/components/ui/dialog'

import { sessionStorage } from '~/services/cookies/session.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()

  const shouldLogOut = formData.get('shouldLogOut')

  console.log('shouldLogOut', shouldLogOut)

  if (shouldLogOut === 'true') {
    const session = await sessionStorage.getSession(
      request.headers.get('Cookie'),
    )

    return redirect('/', {
      headers: {
        'Set-Cookie': await sessionStorage.destroySession(session),
      },
    })
  }

  return redirect('/app')
}

export default function Index() {
  const navigate = useNavigate()

  const handleClose = () => navigate(-1)

  return (
    <Dialog.Root defaultOpen onOpenChange={(to) => !to && handleClose()}>
      <Dialog.Content renderCloseButton={false} className="w-fit">
        <Dialog.Title>Você realmente deseja sair?</Dialog.Title>

        <Form method="post" className="mt-4 flex justify-end gap-4">
          <Button name="shouldLogOut" value="false" variant="outline">
            Cancelar
          </Button>
          <Button name="shouldLogOut" value="true" variant="destructive">
            Sair
          </Button>
        </Form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
