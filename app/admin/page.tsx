'use client';

import { useState } from 'react';
import SettingsShell from '@/components/admin/SettingsShell';
import ScheduleEditor from '@/components/admin/ScheduleEditor'; // shows
// import BlogEditor from '@/components/admin/BlogEditor'; // blog (later)
// import StationEditor from '@/components/admin/StationEditor'; // stations (later)

export default function AdminSettingsPage() {
  const [section, setSection] = useState<'shows' | 'blog' | 'stations'>('shows');

  return (
    <SettingsShell
      title="Settings"
      description="Manage your station settings and set show preferences."
      nav={[
        { label: 'Shows', value: 'shows' },
        { label: 'Blog', value: 'blog' },
        { label: 'Stations', value: 'stations' },
      ]}
      current={section}
      onSelect={(val) => setSection(val as "shows" | "blog" | "stations")}
    >
      {section === 'shows' && <ScheduleEditor />}
      {/* {section === 'blog' && <BlogEditor />} */}
      {/* {section === 'stations' && <StationEditor />} */}
    </SettingsShell>
  );
}
