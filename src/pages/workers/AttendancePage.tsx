import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle } from 'lucide-react';
export function AttendancePage() {
  const [checkedIn, setCheckedIn] = useState(false);
  return (
    <div className='space-y-6'>
      <PageHeader title='Attendance' description='Check in and out of job sites' />
      <Card className='border-accent-500/30'><CardContent className='p-8 text-center'>
        {checkedIn ? <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' /> : <MapPin className='h-16 w-16 text-accent-500 mx-auto mb-4' />}
        <h2 className='text-xl font-bold mb-2'>{checkedIn ? 'Checked In' : 'Ready to Check In'}</h2>
        <p className='text-muted-foreground mb-6'>{checkedIn ? 'Shipyard Phase 2' : 'Tap to record attendance'}</p>
        <Button variant={checkedIn ? 'destructive' : 'accent'} size='lg' onClick={() => setCheckedIn(!checkedIn)}><MapPin className='mr-2 h-5 w-5' />{checkedIn ? 'Check Out' : 'Check In'}</Button>
        {checkedIn && <p className='text-sm text-muted-foreground mt-4'><Clock className='inline h-4 w-4 mr-1' />08:30 AM</p>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Recent</CardTitle></CardHeader><CardContent className='space-y-2'>
        {[{d:'Feb 19',s:'Shipyard',h:'8.5h'},{d:'Feb 18',s:'Shipyard',h:'9h'},{d:'Feb 17',s:'Pipeline',h:'7.5h'}].map((r,i) => (
          <div key={i} className='flex justify-between py-2 border-b last:border-0'><div><p className='text-sm'>{r.s}</p><p className='text-xs text-muted-foreground'>{r.d}</p></div><Badge variant='outline'>{r.h}</Badge></div>
        ))}
      </CardContent></Card>
    </div>
  );
}
