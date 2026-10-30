"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { HeroAndGeneral } from "@/components/HeroAndGeneral";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ClaimsNotesContact } from "@/components/ClaimsNotesContact";
import { FamilyRegistrationModal } from "@/components/FamilyRegistrationModal";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { DEFAULT_PLANS, InsurancePlan, PlanCode } from "@/lib/types";

export default function HomePage() {
  const [plans, setPlans] = useState<InsurancePlan[]>(DEFAULT_PLANS);
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>("A");
  const [chatOpen, setChatOpen] = useState(false);
  const [externalPrompt, setExternalPrompt] = useState<{
    text: string;
    nonce: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.plans) && data.plans.length > 0) {
          setPlans(data.plans);
        }
      })
      .catch(() => {
        // fallback to DEFAULT_PLANS
      });
  }, []);

  const handleOpenFamilyWithPlan = (planCode: PlanCode = "A") => {
    setSelectedPlan(planCode);
    setFamilyModalOpen(true);
  };

  const handleAskQuestionFromPage = (question: string) => {
    setChatOpen(true);
    setExternalPrompt({ text: question, nonce: Date.now() });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenFamilyModal={() => handleOpenFamilyWithPlan("A")} />

      <main id="main-content" className="flex-1">
        <HeroAndGeneral
          onOpenFamilyModal={() => handleOpenFamilyWithPlan("A")}
          onOpenChat={() => setChatOpen(true)}
        />

        <BenefitsSection
          plans={plans}
          onSelectPlanForFamily={(planCode) => handleOpenFamilyWithPlan(planCode)}
        />

        <ClaimsNotesContact
          onOpenFamilyModal={() => handleOpenFamilyWithPlan("A")}
          onAskQuestion={handleAskQuestionFromPage}
          onOpenChat={() => setChatOpen(true)}
        />
      </main>

      <FamilyRegistrationModal
        isOpen={familyModalOpen}
        initialPlan={selectedPlan}
        plans={plans}
        onClose={() => setFamilyModalOpen(false)}
      />

      <ChatbotWidget
        isOpen={chatOpen}
        onToggle={setChatOpen}
        externalPrompt={externalPrompt}
      />
    </div>
  );
}
