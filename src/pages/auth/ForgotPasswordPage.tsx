import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { useState } from 'react';
export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className='space-y-4'>
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold'>Reset Password</h2>
        <p className='text-sm text-muted-foreground'>Enter your email to receive a reset link</p>
      </div>
      {sent ? (
        <div className='text-center space-y-4'>
          <p className='text-sm text-green-500'>If an account exists with that email, a reset link has been sent.</p>
          <Link to={ROUTES.LOGIN} className='text-accent-500 hover:underline text-sm'>Back to login</Link>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' placeholder='name@company.com' required />
          </div>
          <Button type='submit' variant='accent' className='w-full'>Send Reset Link</Button>
          <div className='text-center'><Link to={ROUTES.LOGIN} className='text-sm text-muted-foreground hover:text-foreground'>Back to login</Link></div>
        </form>
      )}
    </div>
  );
}
