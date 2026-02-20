import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/router/routes';

export function VerifyEmailPage() {
  const { verifyEmail, isLoading, verificationCode, user, isVerified, logout } = useAuthStore();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isVerified) navigate(ROUTES.DASHBOARD, { replace: true });
  }, [isVerified, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    const nextEmpty = newCode.findIndex(c => !c);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    try {
      await verifyEmail(fullCode);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: any) {
      const resp = err.response?.data;
      const msg = typeof resp?.error === 'string' ? resp.error
        : typeof resp?.message === 'string' ? resp.message
        : typeof err.message === 'string' ? err.message
        : 'Verification failed.';
      setError(msg);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md bg-white border-gray-200 shadow-xl shadow-blue-500/5'>
        <CardHeader className='text-center space-y-4'>
          <div className='mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center'>
            <Mail className='h-8 w-8 text-blue-500' />
          </div>
          <CardTitle className='text-2xl text-gray-800'>Verify your email</CardTitle>
          <p className='text-sm text-gray-500'>
            We sent a verification code to <span className='font-medium text-gray-700'>{user?.email}</span>
          </p>
        </CardHeader>
        <CardContent className='space-y-6'>
          {verificationCode && (
            <Alert className='bg-blue-50 border-blue-200'>
              <ShieldCheck className='h-4 w-4 text-blue-500' />
              <AlertDescription className='text-blue-700'>
                Demo mode — your code is: <span className='font-mono font-bold text-lg'>{verificationCode}</span>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='flex justify-center gap-3' onPaste={handlePaste}>
              {code.map((digit, i) => (
                <Input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type='text'
                  inputMode='numeric'
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className='w-12 h-14 text-center text-2xl font-mono font-bold border-gray-200 focus:border-blue-400 focus:ring-blue-400'
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <Button type='submit' className='w-full bg-blue-500 hover:bg-blue-600 text-white' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Verify Email
            </Button>
          </form>

          <div className='text-center'>
            <button
              type='button'
              onClick={() => { logout(); navigate(ROUTES.LOGIN); }}
              className='text-sm text-gray-400 hover:text-blue-500 transition-colors'
            >
              Sign out and use a different account
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
