import type { Route } from './+types/app.logout'
import { redirect } from 'react-router'
import { Form, useNavigate, useNavigation } from 'react-router'

import { Button } from '~/components/ui/button'
import { Dialog } from '~/components/ui/dialog'

import { sessionStorage } from '~/services/cookies/session.server'

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const shouldLogOut = formData.get('shouldLogOut')

  if (shouldLogOut === 'true') {
    const session = await sessionStorage.getSession(
      request.headers.get('Cookie'),
    )

    await new Promise((r) => setTimeout(r, 200))

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
  const navigation = useNavigation()

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
            {navigation.state === 'submitting' ? 'Saindo...' : 'Sair'}
          </Button>
        </Form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
