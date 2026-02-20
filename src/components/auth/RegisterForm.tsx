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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/router/routes';
import type { UserRole } from '@/types';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['welder', 'subcontractor', 'client', 'accountant'] as const),
  phone: z.string().optional(),
  companyName: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('welder');
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'welder' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    try {
      const { confirmPassword, ...payload } = data;
      await registerUser(payload);
      navigate('/verify');
    } catch (err: any) {
      const resp = err.response?.data;
      const msg = typeof resp?.error === 'string' ? resp.error
        : typeof resp?.message === 'string' ? resp.message
        : typeof err.message === 'string' ? err.message
        : 'Registration failed.';
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='space-y-2 text-center'>
        <h2 className='text-2xl font-bold'>Create account</h2>
        <p className='text-sm text-muted-foreground'>Join the LinkedWeld platform</p>
      </div>
      {error && <Alert variant='destructive'><AlertDescription>{error}</AlertDescription></Alert>}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-2'>
          <Label htmlFor='firstName'>First Name</Label>
          <Input id='firstName' {...register('firstName')} />
          {errors.firstName && <p className='text-xs text-destructive'>{errors.firstName.message}</p>}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='lastName'>Last Name</Label>
          <Input id='lastName' {...register('lastName')} />
          {errors.lastName && <p className='text-xs text-destructive'>{errors.lastName.message}</p>}
        </div>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input id='email' type='email' {...register('email')} />
        {errors.email && <p className='text-xs text-destructive'>{errors.email.message}</p>}
      </div>
      <div className='space-y-2'>
        <Label>Role</Label>
        <Select value={selectedRole} onValueChange={(v) => { setSelectedRole(v as UserRole); setValue('role', v as any); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value='welder'>Welder / Pipefitter</SelectItem>
            <SelectItem value='subcontractor'>Subcontractor</SelectItem>
            <SelectItem value='client'>Client</SelectItem>
            <SelectItem value='accountant'>Accountant / Director</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(selectedRole === 'subcontractor' || selectedRole === 'client') && (
        <div className='space-y-2'>
          <Label htmlFor='companyName'>Company Name</Label>
          <Input id='companyName' {...register('companyName')} />
        </div>
      )}
      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <Input id='password' type='password' {...register('password')} />
        {errors.password && <p className='text-xs text-destructive'>{errors.password.message}</p>}
      </div>
      <div className='space-y-2'>
        <Label htmlFor='confirmPassword'>Confirm Password</Label>
        <Input id='confirmPassword' type='password' {...register('confirmPassword')} />
        {errors.confirmPassword && <p className='text-xs text-destructive'>{errors.confirmPassword.message}</p>}
      </div>
      <Button type='submit' variant='accent' className='w-full' disabled={isLoading}>
        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        Create Account
      </Button>
      <div className='text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className='text-accent-500 hover:underline'>Sign in</Link>
      </div>
    </form>
  );
}
