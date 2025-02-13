import {
  CreditCardIcon,
  ListBulletIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import { PrimaryButton } from 'polarkit/components/ui'
import { WhiteCard } from 'polarkit/components/ui/Cards'
import GitHubIcon from '../Icons/GitHubIcon'
import screenshot from './dashboard.png'

const ThankYouUpsell = (props: {
  onEmailSignin: () => void
  emailSigninLoading: boolean
}) => {
  const { onEmailSignin, emailSigninLoading } = props
  return (
    <>
      <WhiteCard
        className="mt-11 flex flex-row overflow-hidden"
        padding={false}
      >
        <div className="flex w-full flex-col space-y-4 p-5 md:w-2/5 md:p-6">
          <h2 className="text-xl">
            Welcome! You now have an account with Polar 🎉
          </h2>
          <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Sign in anytime in the future by requesting a magic link to your
            inbox.
          </p>

          <ul>
            <li className="flex flex-row items-center space-x-2">
              <PlusCircleIcon
                height={18}
                width={18}
                className="text-blue-500"
              />

              <div className="text-sm">Fund any issue</div>
            </li>

            <li className="mt-3 flex flex-row items-center space-x-2">
              <ListBulletIcon
                height={18}
                width={18}
                className="text-blue-500"
              />

              <div className="text-sm">Follow progress of funded issues</div>
            </li>

            <li className="mb-2 mt-3 flex flex-row items-center space-x-2">
              <CreditCardIcon
                height={18}
                width={18}
                className="text-blue-500"
              />
              <div className="text-sm">Save payment method on file</div>
            </li>

            <li className="mb-2 mt-3 flex flex-row items-center space-x-2">
              <GitHubIcon height={18} width={18} className="text-blue-500" />
              <div className="text-sm">Connect GitHub account for more</div>
            </li>
          </ul>
          <PrimaryButton
            type="button"
            disabled={emailSigninLoading}
            loading={emailSigninLoading}
            onClick={onEmailSignin}
          >
            Sign in with email
          </PrimaryButton>
        </div>
        <div className="bg-grid-pattern dark:bg-grid-pattern-dark relative hidden w-3/5 overflow-hidden border-l border-blue-100 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/20 md:block">
          <Image
            src={screenshot}
            alt="Polar dashboard screenshot"
            priority={true}
            className="absolute w-full"
          />
        </div>
      </WhiteCard>
    </>
  )
}

export default ThankYouUpsell
