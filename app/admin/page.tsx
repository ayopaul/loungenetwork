'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SettingsShell from '@/components/admin/SettingsShell';
import ScheduleEditor from '@/components/admin/ScheduleEditor';
import StationManager from '@/components/admin/StationManager';
import { AdminAuthWrapper } from '@/components/admin/AdminAuthWrapper'; 

const BlogManager = dynamic(() => import('@/components/admin/BlogManager'), {
  loading: () => <p className="text-muted-foreground">Loading blog manager...</p>,
  ssr: false,
});

export default function AdminSettingsPage() {
  const [section, setSection] = useState<'shows' | 'blog' | 'stations'>('shows');

  return (
    <AdminAuthWrapper>
    <SettingsShell
      title="Settings"
      description="Manage your station settings and set show preferences."
      nav={[
        { label: 'Stations', value: 'stations' },
        { label: 'Shows', value: 'shows' },
        { label: 'Blog', value: 'blog' },
      ]}
      
      current={section}
      onSelect={(val) => setSection(val as 'shows' | 'blog' | 'stations')}
    >
      <div className="min-h-[500px] p-4 bg-background text-foreground rounded-md">
        {section === 'shows' && <ScheduleEditor />}
        {section === 'blog' && <BlogManager />}
        {section === 'stations' && <StationManager />}
      </div>
    </SettingsShell>|
    </AdminAuthWrapper>
  );
}
