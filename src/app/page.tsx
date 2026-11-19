'use client';

import { useState } from 'react';
import { OhtaniScrollytellingSection } from '@/components/landing/OhtaniScrollytellingSection';
import { MandalartExplainerSection } from '@/components/mandalart/MandalartExplainerSection';
import { MandalartPlannerSection } from '@/components/mandalart/MandalartPlannerSection';

export interface PlayerDraftPayload {
  name: string;
  jerseyNumber: string;
  coreGoal: string;
  triggerCount: number;
}

const HomePage = () => {
  const [playerDraft, setPlayerDraft] = useState<PlayerDraftPayload>({
    name: '',
    jerseyNumber: '17',
    coreGoal: '',
    triggerCount: 0,
  });

  const scrollToElement = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartMyDraft = (
    name: string,
    jerseyNumber: string,
    coreGoal: string
  ) => {
    setPlayerDraft((prev) => ({
      name: name.trim(),
      jerseyNumber: jerseyNumber.trim() || '17',
      coreGoal: coreGoal.trim(),
      triggerCount: prev.triggerCount + 1,
    }));
    scrollToElement('mandalart-planner');
  };

  return (
    <main className="relative min-h-screen bg-[#0b0c0e]">
      <OhtaniScrollytellingSection
        onJumpToPlanner={() => scrollToElement('mandalart-planner')}
        onJumpToExplainer={() => scrollToElement('mandalart-explainer')}
        onStartMyDraft={handleStartMyDraft}
      />
      <MandalartExplainerSection />
      <MandalartPlannerSection playerDraft={playerDraft} />
    </main>
  );
};

export default HomePage;
