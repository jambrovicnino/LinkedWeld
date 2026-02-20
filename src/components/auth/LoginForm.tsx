import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/router/routes';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      await login(data);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='space-y-2 text-center'>
        <h2 className='text-2xl font-bold'>Welcome back</h2>
        <p className='text-sm text-muted-foreground'>Sign in to your LinkedWeld account</p>
      </div>
      {error && <Alert variant='destructive'><AlertDescription>{error}</AlertDescription></Alert>}
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input id='email' type='email' placeholder='name@company.com' {...register('email')} />
        {errors.email && <p className='text-xs text-destructive'>{errors.email.message}</p>}
      </div>
      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <Input id='password' type='password' placeholder='Enter your password' {...register('password')} />
        {errors.password && <p className='text-xs text-destructive'>{errors.password.message}</p>}
      </div>
      <Button type='submit' variant='accent' className='w-full' disabled={isLoading}>
        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        Sign In
      </Button>
      <div className='text-center text-sm'>
        <Link to={ROUTES.FORGOT_PASSWORD} className='text-accent-500 hover:underline'>Forgot password?</Link>
      </div>
      <div className='text-center text-sm text-muted-foreground'>
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.REGISTER} className='text-accent-500 hover:underline'>Sign up</Link>
      </div>
    </form>
  );
}
