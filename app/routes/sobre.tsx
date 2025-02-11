import { Route } from './+types/sobre'

import { sessionStorage } from '~/services/cookies/session.server'

import { NavBar } from '~/components/Header'
import Wrapper from '~/components/Wrapper'

export const meta: Route.MetaFunction = () => [{ title: 'Sobre o ReBalance' }]

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userSession = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  )
  return {
    isAuthenticated: !!userSession.data.user,
  }
}

export default function Sobre({ loaderData }: Route.ComponentProps) {
  const { isAuthenticated } = loaderData

  return (
    <>
      <NavBar isAuthenticated={isAuthenticated} />
      <Wrapper className="mt-2 gap-0 sm:w-[min(40rem,calc(100%-2rem))] sm:gap-0">
        <Section title="O que é o ReBalance?">
          Somos uma plataforma que auxilia no rebalanceamento de seu portifólio
          de investimentos, para que você perca menos tempo decidindo quais
          ativos deve comprar. Apenas defina sua estratégia e utilize nossa
          ferramenta para saber o que comprar para maximizar o retorno de seus
          investimentos, minimizando o risco.
        </Section>

        <Section title="Por que devo rebalancear minha carteira?">
          Se você investe com foco no longo prazo, é importante que você tenha
          uma estratégia clara e que a siga. Nós não vamos definir sua
          estratégia, isso é uma coisa extremamente pessoal que depende de
          fatores que só você pode avaliar, mas podemos te ajudar a manter ela.
          {}
          Com o tempo, os ativos que compõem sua carteira vão se valorizar ou
          desvalorizar em ritmos diferentes, o que pode fazer com que sua
          carteira se desvie do que você definiu como ideal. Rebalancear sua
          carteira é o processo de comprar ou vender ativos para que ela volte a
          ter a composição que você definiu como ideal.
        </Section>

        <Section title="Público alvo">
          Você provavelmente trabalha, estuda, gosta de sair com seus amigos,
          tem algum hobby e precisa limpar a casa de vez em quando. Ao mesmo
          tempo, também quer investir parte de seu dinheiro para garantir sua
          aposentadoria ou dar entrada em um imóvel.
          {}
          Seja lá qual for sua motivação, investir não deve tomar muito do seu
          tempo; apenas escolha bons ativos, rebalaceie sua carteira e deixe o
          tempo fazer o resto.
        </Section>
      </Wrapper>
    </>
  )
}

type SectionProps = {
  title: string
  children: string[] | string
}

function Section({ children, title }: SectionProps) {
  if (typeof children === 'string') {
    children = [children]
  }

  return (
    <>
      <h2 className="mt-12 font-display text-xl/none font-bold text-primary-100 selection:bg-primary-200 selection:text-primary-900 sm:text-2xl/none">
        {title}
      </h2>
      {children.map((paragraph, index) => (
        <p
          key={index}
          className="mt-2 selection:bg-primary-100 selection:text-primary-950 sm:text-lg"
        >
          {paragraph}
        </p>
      ))}
    </>
  )
}
