'use client';
import { useEffect, useRef } from 'react';
import { mountWorkspace } from './ws';

export default function Workspace({ businessId }: { businessId: number | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!ref.current) return; const un = mountWorkspace(ref.current, businessId); return () => un && un(); }, [businessId]);
  return <div className="ws" ref={ref} />;
}
