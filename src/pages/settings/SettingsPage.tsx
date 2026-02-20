import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';
export function SettingsPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Settings' description='Manage your account preferences' />
      <Tabs defaultValue='profile'>
        <TabsList><TabsTrigger value='profile'>Profile</TabsTrigger><TabsTrigger value='notifications'>Notifications</TabsTrigger><TabsTrigger value='security'>Security</TabsTrigger></TabsList>
        <TabsContent value='profile'><Card><CardHeader><CardTitle>Profile Information</CardTitle></CardHeader><CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'><Label>First Name</Label><Input /></div>
            <div className='space-y-2'><Label>Last Name</Label><Input /></div>
            <div className='space-y-2'><Label>Email</Label><Input type='email' /></div>
            <div className='space-y-2'><Label>Phone</Label><Input /></div>
          </div>
          <div className='flex justify-end'><Button variant='accent'><Save className='mr-2 h-4 w-4' />Save</Button></div>
        </CardContent></Card></TabsContent>
        <TabsContent value='notifications'><Card><CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader><CardContent className='space-y-4'>
          {['Project Updates','Assignment Alerts','Expense Alerts','Certificate Reminders','System Notices'].map(n=>(
            <div key={n} className='flex items-center justify-between py-2'><Label>{n}</Label><Switch defaultChecked /></div>
          ))}
        </CardContent></Card></TabsContent>
        <TabsContent value='security'><Card><CardHeader><CardTitle>Change Password</CardTitle></CardHeader><CardContent className='space-y-4'>
          <div className='space-y-2'><Label>Current Password</Label><Input type='password' /></div>
          <div className='space-y-2'><Label>New Password</Label><Input type='password' /></div>
          <div className='space-y-2'><Label>Confirm New Password</Label><Input type='password' /></div>
          <div className='flex justify-end'><Button variant='accent'>Update Password</Button></div>
        </CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
