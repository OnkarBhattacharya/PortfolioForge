
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth, initiateEmailSignIn, initiateGoogleSignIn, initiateMicrosoftSignIn, initiateAppleSignIn } from '@/firebase';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

type FormValues = z.infer<typeof formSchema>;

const ProviderButton = ({ provider, icon, onClick, children }: { provider: string, icon: React.ReactNode, onClick: () => void, children: React.ReactNode }) => (
    <Button variant="outline" className="w-full" onClick={onClick}>
        {icon}
        {children}
    </Button>
);

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.8 0-5.18-1.88-6.04-4.42H2.34v2.84C4.13 20.98 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.96 14.18c-.21-.66-.33-1.35-.33-2.04s.12-1.38.33-2.04V7.26H2.34C1.5 8.83 1 10.59 1 12.44s.5 3.61 1.34 5.18l3.62-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4.13 3.02 2.34 5.86l3.62 2.84c.86-2.54 3.24-4.42 6.04-4.42z" />
    </svg>
);

const MicrosoftIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path fill="#F25022" d="M11.2 11.2H1.5V1.5h9.7v9.7z" />
        <path fill="#7FBA00" d="M22.5 11.2h-9.7V1.5h9.7v9.7z" />
        <path fill="#00A4EF" d="M11.2 22.5H1.5v-9.7h9.7v9.7z" />
        <path fill="#FFB900" d="M22.5 22.5h-9.7v-9.7h9.7v9.7z" />
    </svg>
);

const AppleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path fill="currentColor" d="M17.486 16.143c-.01-.002-1.12-1.04-1.13-2.547-.008-1.385.83-2.203 1.053-2.522C16.32 10.02 15.34 9 14.25 9c-1.334 0-2.38.995-3.25.995-.87 0-1.748-.995-2.917-.995-1.528 0-2.88.94-3.583 2.33C3.06 14.347 4.384 18.99 6.27 18.99c.813 0 1.286-.533 2.11-.533s.98.534 2.126.534c1.147 0 1.522-.552 2.226-.552.89 0 1.25.534 2.003.534.82 0 1.83-1.03 2.05-2.038a1.36 1.36 0 0 0-1.513-.79zm-2.88-9.014c.66-.783 1.06-1.84 1.012-2.88-.93.047-1.95.606-2.564 1.37-.58.71-.97 1.765-1.01 2.766.972.057 1.89-.472 2.562-1.256z" />
    </svg>
);

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSocialSignIn = async (provider: 'google' | 'microsoft' | 'apple') => {
    setProviderLoading(provider);
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not connect to authentication service.",
        });
        setProviderLoading(null);
        return;
    }

    let signInFunction;
    switch (provider) {
        case 'google':
            signInFunction = initiateGoogleSignIn;
            break;
        case 'microsoft':
            signInFunction = initiateMicrosoftSignIn;
            break;
        case 'apple':
            signInFunction = initiateAppleSignIn;
            break;
    }

    try {
        await signInFunction(auth);
        toast({
            title: 'Login Successful',
            description: "Welcome back!",
        });
        router.push('/');
    } catch (error: any) {
        console.error('Social sign-in failed:', error);
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.code === 'auth/popup-closed-by-user' 
                ? 'Sign-in was cancelled.' 
                : error.message || 'An unknown error occurred.',
        });
    } finally {
        setProviderLoading(null);
    }
  };

  async function onSubmit(values: FormValues) {
    setLoading(true);
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not connect to authentication service.",
        });
        setLoading(false);
        return;
    }
    try {
      await initiateEmailSignIn(auth, values.email, values.password);
      toast({
        title: 'Login Successful',
        description: "Welcome back!",
      });
      router.push('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unknown error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        disabled={!!providerLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={!!providerLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading || !!providerLoading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="space-y-2">
             <ProviderButton provider="google" onClick={() => handleSocialSignIn('google')} icon={ providerLoading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GoogleIcon />}>
                Login with Google
            </ProviderButton>
             <ProviderButton provider="microsoft" onClick={() => handleSocialSignIn('microsoft')} icon={ providerLoading === 'microsoft' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MicrosoftIcon />}>
                Login with Microsoft
            </ProviderButton>
             <ProviderButton provider="apple" onClick={() => handleSocialSignIn('apple')} icon={ providerLoading === 'apple' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <AppleIcon />}>
                Login with Apple
            </ProviderButton>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
