'use client';

import { useState, useMemo } from 'react';
import { MultiSelect } from '@/components/MultiSelect';
import { generateDataset } from '@/lib/generateData';

export default function Home() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const items = useMemo(() => generateDataset(10000), []);
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '48px 16px'
    }}>
      <main style={{
        maxWidth: '66.666667%',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          color: '#0f172a',
          marginBottom: '32px'
        }}>
          Multi-Select Dropdown
        </h1>
        
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '32px'
        }}>
          <MultiSelect
            items={items}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            placeholder="Search from 10,000 items..."
          />
        </div>
      </main>
    </div>
  );
}
