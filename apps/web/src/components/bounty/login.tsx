import { authClient } from '@bounty/auth/client';
import { Badge } from '@bounty/ui/components/badge';
import { Button } from '@bounty/ui/components/button';
import { Input } from '@bounty/ui/components/input';
import Link from '@bounty/ui/components/link';
import { AtSignIcon, Eye, EyeOff, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SubmissionCard from '@/components/bounty/submission-card';
import Bounty from '@/components/icons/bounty';
import { LINKS } from '@/constants';
import { GithubIcon } from '../icons';
import GoogleIcon from '../icons/google';

const cards = {
  ahmet: {
    name: 'Ahmet',
    description: 'look sir coderabbit says my code good',
    bounty: 100,
    status: 'open',
    rank: 'Rank 500',
    image: 'https://avatars.githubusercontent.com/u/37756565?v=4',
    id: 'ahmet',
    screenshot:
      'https://pbs.twimg.com/media/Gwi-mbBWUBc90r_?format=jpg&name=large',
  },
  sergio: {
    name: 'Sergio',
    description: 'I made ur website use tweakcn now pay me!!',
    bounty: 25,
    status: 'open',
    rank: 'Rank 0',
    image:
      'https://pbs.twimg.com/profile_images/1939906364119109632/vu8pOSiH_400x400.jpg',
    id: 'ahmet',
    screenshot:
      'https://pbs.twimg.com/media/GwjyS7FX0AMIz4H?format=png&name=small',
  },
  nizzy: {
    name: 'nizzy',
    description: "Here's my submission",
    bounty: 1000,
    status: 'open',
    rank: 'Rank 186',
    image:
      'https://pbs.twimg.com/profile_images/1884987569961570304/TP3OWz64_400x400.jpg',
    id: 'ahmet',
    screenshot:
      'https://pbs.twimg.com/media/Gwl0qdhWgAAoJdK?format=jpg&name=large',
  },
};

export default function Login() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [lastUsedMethod, setLastUsedMethod] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailAlias, setEmailAlias] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  // Get callback URL from search params, default to dashboard
  const callbackUrl = searchParams.get('callback') || LINKS.DASHBOARD;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(containerRef.current && svgRef.current)) {
      return;
    }

    const svgRect = svgRef.current.getBoundingClientRect();
    const svgCenterX = svgRect.left + svgRect.width / 2;
    const svgCenterY = svgRect.top + svgRect.height / 2;

    const containerRect = containerRef.current.getBoundingClientRect();
    const maxDistance = Math.min(containerRect.width, containerRect.height) / 2;

    const deltaX = e.clientX - svgCenterX;
    const deltaY = e.clientY - svgCenterY;

    const x = deltaX / maxDistance;
    const y = deltaY / maxDistance;

    setMousePosition({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };
  useEffect(() => {
    // Load last used login method from localStorage
    const lastMethod = localStorage.getItem('bounty-last-login-method');
    setLastUsedMethod(lastMethod);

    if (!PublicKeyCredential.isConditionalMediationAvailable?.()) {
      return;
    }

    void authClient.signIn.passkey({ autoFill: true });
  }, []);

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const handleGitHubSignIn = async () => {
    try {
      setLoading(true);
      localStorage.setItem('bounty-last-login-method', 'github');

      await authClient.signIn.social(
        {
          provider: 'github',
          callbackURL: callbackUrl,
        },
        {
          onSuccess: () => {
            toast.success('Sign in successful');
          },
          onError: (error) => {
            toast.error(error.error.message || 'Sign in failed');
            setLoading(false);
          },
        }
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign in failed');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      localStorage.setItem('bounty-last-login-method', 'google');

      await authClient.signIn.social(
        {
          provider: 'google',
          callbackURL: callbackUrl,
        },
        {
          onSuccess: () => {
            toast.success('Sign in successful');
          },
          onError: (error) => {
            toast.error(error.error.message || 'Sign in failed');
            setLoading(false);
          },
        }
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign in failed');
      setLoading(false);
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      localStorage.setItem('bounty-last-login-method', 'password');

      if (isSignUp) {
        await authClient.signUp.email(
          {
            email,
            password,
            callbackURL: callbackUrl,
          },
          {
            onSuccess: () => {
              toast.success('Account created successfully!');
            },
            onError: (error) => {
              toast.error(error.error.message || 'Sign up failed');
              setLoading(false);
            },
          }
        );
      } else {
        await authClient.signIn.email(
          {
            email,
            password,
            callbackURL: callbackUrl,
          },
          {
            onSuccess: () => {
              toast.success('Sign in successful');
            },
            onError: (error) => {
              toast.error(error.error.message || 'Sign in failed');
              setLoading(false);
            },
          }
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
      setLoading(false);
    }
  };

  const detectEmailAlias = (email: string) => {
    const match = email.match(/^([^+]+)\+([^@]+)@(.+)$/);
    if (match) {
      const [, baseEmail, alias] = match;
      return alias;
    }
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const alias = detectEmailAlias(newEmail);
    setEmailAlias(alias);
  };

  const handleGoToDashboard = () => {
    router.push(callbackUrl);
  };

  // const handlePasskeySignIn = async () => {
  //   try {
  //     // Save login method to localStorage
  //     localStorage.setItem('bounty-last-login-method', 'passkey');

  //     await authClient.signIn.passkey({
  //       autoFill: false,
  //       fetchOptions: {
  //         onSuccess: () => {
  //           toast.success("Signed in successfully");
  //           router.push(callbackUrl);
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     toast.error(error instanceof Error ? error.message : "Sign in failed");
  //   }
  // };

  return (
    <div className="flex min-h-screen flex-col bg-[#111110] text-[#f3f3f3] md:flex-row">
      {/* Left Column: Login Section */}
      <div className="flex flex-1 items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Bounty Icon 
          <div className="lg:hidden flex justify-center mb-8">
            <Bounty className="w-24 h-28 text-primary" />
          </div>
          */}

          {isPending ? (
            <div className="w-full max-w-96 space-y-8">
              <div className="animate-pulse space-y-4 text-center">
                <div className="mx-auto h-16 w-16 rounded-lg bg-[#383838]" />
                <div className="mx-auto h-7 w-48 rounded bg-[#383838]" />
              </div>

              <div className="animate-pulse space-y-3">
                <div className="h-12 w-full rounded-lg bg-[#383838]" />
              </div>

              <div className="animate-pulse text-center">
                <div className="mx-auto h-4 w-64 rounded bg-[#383838]" />
              </div>
            </div>
          ) : session ? (
            <div className="w-full max-w-96 space-y-8">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg">
                  <Bounty className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h1 className="flex h-7 items-center justify-center font-medium text-sand-12 text-xl tracking-tight">
                    Welcome back!
                  </h1>
                  <p className="text-gray-400 text-sm">
                    You&apos;re already signed in
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 rounded-lg bg-[#1D1D1D] p-3">
                  {session.user.image && (
                    <Image
                      alt={session.user.name || 'User'}
                      className="h-10 w-10 rounded-full"
                      height={40}
                      src={session.user.image}
                      width={40}
                    />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-sm text-white">
                      {session.user.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full rounded-lg bg-[#2A2A28] py-3 font-medium text-gray-200 transition-colors hover:bg-[#383838]"
                    onClick={handleGoToDashboard}
                  >
                    Continue
                  </Button>
                  <Button
                    className="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-gray-400 transition-colors hover:text-gray-200"
                    onClick={() =>
                      authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            toast.success('Signed out successfully');
                            window.location.href = '/login';
                          },
                        },
                      })
                    }
                    variant="text"
                  >
                    <LogOut className="h-4 w-4" />
                    Nevermind, log me out.
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-96 space-y-8">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg">
                  <Bounty className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h1 className="flex h-7 items-center justify-center font-medium text-sand-12 text-xl tracking-tight">
                    Sign in to Bounty
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Welcome back! Please sign in to continue
                  </p>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Button
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#2A2A28] py-3 font-medium text-gray-200 transition-colors hover:bg-[#383838]"
                    disabled={loading}
                    onClick={handleGitHubSignIn}
                  >
                    {loading && lastUsedMethod === 'github' ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <GithubIcon className="h-5 w-5 fill-white" />
                    )}
                    GitHub
                  </Button>
                  {lastUsedMethod === 'github' && (
                    <Badge className="-top-2 -right-2 absolute bg-primary px-1 py-0.5 text-primary-foreground text-xs">
                      Last used
                    </Badge>
                  )}
                </div>
                <div className="relative flex-1">
                  <Button
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#2A2A28] py-3 font-medium text-gray-200 transition-colors hover:bg-[#383838]"
                    disabled={loading}
                    onClick={handleGoogleSignIn}
                  >
                    {loading && lastUsedMethod === 'google' ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <GoogleIcon className="h-5 w-5" />
                    )}
                    Google
                  </Button>
                  {lastUsedMethod === 'google' && (
                    <Badge className="-top-2 -right-2 absolute bg-primary px-1 py-0.5 text-primary-foreground text-xs">
                      Last used
                    </Badge>
                  )}
                </div>
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-700" />
                <span className="text-gray-400 text-sm">or</span>
                <div className="h-px flex-1 bg-gray-700" />
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handlePasswordAuth} className="space-y-4">
                <div className="space-y-2">
                  <label className="font-medium text-gray-200 text-sm">
                    Email address
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full rounded-lg bg-[#1D1D1D] border-[#383838] px-3 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      disabled={loading}
                      required
                    />
                    {emailAlias && (
                      <Badge className="-top-2 -right-2 absolute bg-[#40403F] px-2 py-1 text-white text-xs">
                        <AtSignIcon />{emailAlias}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-200 text-sm">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg bg-[#1D1D1D] border-[#383838] px-3 py-3 pr-12 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      disabled={loading}
                      required
                    />
                    <Button
                      type="button"
                      variant="text"
                      size="sm"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-auto p-0 text-gray-400 hover:text-gray-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-lg bg-black py-3 font-medium text-white transition-colors hover:bg-gray-800"
                  disabled={loading}
                >
                  {loading && lastUsedMethod === 'password' ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      Continue
                      <span className="ml-2">▶</span>
                    </>
                  )}
                </Button>
              </form>

              <div className="flex h-8 items-center justify-center text-center text-sm">
                <span className="text-gray-400">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                </span>
                <Button
                  variant="text"
                  className="rounded px-1 py-1 font-medium text-white outline-none transition-colors hover:bg-neutral-800 focus-visible:bg-neutral-800"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Showcase Section */}
      <div className="hidden flex-1 items-center justify-center lg:flex">
        <div
          className="relative flex min-h-[95%] flex-1 cursor-pointer items-center justify-center overflow-hidden border-1 border-[#383838] p-8 md:p-12"
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          ref={containerRef}
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #383838 1px, transparent 0)',
            backgroundSize: '16px 16px',
            borderRadius: '25px',
            margin: '20px',
            height: '95%',
            backgroundColor: '#1d1d1d',
          }}
        >
          <svg
            className="absolute z-0 transition-transform duration-300 ease-out"
            fill="none"
            height="179"
            ref={svgRef}
            style={{
              transform: `translate(${mousePosition.x * 8}px, ${mousePosition.y * 8}px)`,
            }}
            viewBox="0 0 153 179"
            width="153"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M91.1385 71.1097C107.031 77.947 125.457 70.6065 132.294 54.7141C139.132 38.8217 131.791 20.3956 115.899 13.5582C100.006 6.72079 81.5803 14.0613 74.7429 29.9537C67.9055 45.8461 75.2461 64.2723 91.1385 71.1097ZM91.1385 71.1097L29.921 44.7722M5 102.256L33.9985 114.732C49.8909 121.57 68.317 114.229 75.1544 98.3367C81.9918 82.4443 74.6513 64.0182 58.7589 57.1808L29.7603 44.7048M148.655 95.8569L119.657 83.3808C103.764 76.5434 85.338 83.8839 78.5006 99.7763L78.5182 179"
              stroke="url(#paint0_linear_34_3652)"
              strokeWidth="21.3696"
            />
            <defs>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear_34_3652"
                x1="35.4019"
                x2="150.598"
                y1="-16.1847"
                y2="205.685"
              >
                <stop stopColor="#8D8D8D" />
                <stop offset="1" stopColor="#E6E6E6" />
              </linearGradient>
            </defs>
          </svg>

          {/* top left */}
          <div
            className="-rotate-[22deg] -translate-x-1/2 -translate-y-1/2 absolute top-[30%] left-[0%] z-10 transform transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${-mousePosition.x * 25}px, ${-mousePosition.y * 25}px) rotate(-22deg)`,
            }}
          >
            <SubmissionCard
              avatarSrc="/public/images/grim-avatar.jpg"
              description="look sir coderabbit shows the code is good"
              hasBadge={true}
              previewSrc="https://i.redd.it/slm52i26jbtb1.jpg"
              rank="Rank 1000"
              user="Adam"
            />
          </div>

          {/* bottom right */}
          <div
            className="-rotate-[22deg] absolute right-[5%] bottom-[25%] z-10 translate-x-1/2 translate-y-1/2 transform transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px) rotate(-22deg)`,
            }}
          >
            <SubmissionCard
              avatarSrc={cards.sergio.image}
              description="I one shotted this with v0"
              hasBadge={false}
              previewSrc={cards.sergio.screenshot}
              rank={cards.sergio.rank}
              user={cards.sergio.name}
            />
          </div>

          {/* bottom left */}
          <div
            className="-translate-x-1/2 absolute bottom-[25%] left-[0%] z-10 translate-y-1/2 rotate-[22deg] transform transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${-mousePosition.x * 20}px, ${-mousePosition.y * 20}px) rotate(22deg)`,
            }}
          >
            <SubmissionCard
              avatarSrc="https://avatars.githubusercontent.com/u/37756565?v=4"
              description="Here is my try"
              previewSrc="https://i.redd.it/slm52i26jbtb1.jpg"
              rank="New user"
              user="Ahmet"
            />
          </div>

          {/* top right */}
          <div
            className="-translate-y-1/2 absolute top-[30%] right-[0%] z-10 translate-x-1/2 rotate-[22deg] transform transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${-mousePosition.x * 28}px, ${-mousePosition.y * 28}px) rotate(22deg)`,
            }}
          >
            <SubmissionCard
              avatarSrc={cards.ahmet.image}
              description={cards.ahmet.description}
              hasBadge={true}
              previewSrc={cards.ahmet.screenshot}
              rank={cards.ahmet.rank}
              user={cards.ahmet.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
