import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ShieldCheck,
  Zap,
  CreditCard,
  Building,
  Mail,
  Download,
  Key,
  Copy,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Server,
  DollarSign,
  Lock,
  Layers,
  Award
} from 'lucide-react';
import {
  COMMERCIAL_TIERS,
  generateCryptographicLicenseKey,
  INITIAL_DEFAULT_LICENSE
} from '../../data/EnterpriseSubscriptionTiers';
import { CommercialLicense, CommercialTierPlan } from '../../types';

interface CommercialPricingLicensingProps {
  currentLicense: CommercialLicense;
  onUpdateLicense: (license: CommercialLicense) => void;
  onClose?: () => void;
}

export const CommercialPricingLicensing: React.FC<CommercialPricingLicensingProps> = ({
  currentLicense,
  onUpdateLicense,
  onClose,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlanId, setSelectedPlanId] = useState<'community' | 'pro' | 'enterprise' | 'sovereign'>('enterprise');

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'success'>('details');

  // Billing form state
  const [orgName, setOrgName] = useState(currentLicense.organization || 'Acme Engineering Corp');
  const [contactEmail, setContactEmail] = useState(currentLicense.contactEmail || 'lead.architect@acme-corp.com');
  const [vatId, setVatId] = useState(currentLicense.vatId || 'US-842910382');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'invoice' | 'crypto'>('card');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [isProcessing, setIsProcessing] = useState(false);

  // Manual license activation state
  const [manualKeyInput, setManualKeyInput] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Newly activated license placeholder
  const [newlyActivatedLicense, setNewlyActivatedLicense] = useState<CommercialLicense | null>(null);

  const selectedTier = COMMERCIAL_TIERS.find((t) => t.id === selectedPlanId) || COMMERCIAL_TIERS[2];
  const effectivePrice =
    billingPeriod === 'annual'
      ? selectedTier.annualPriceUsd
      : selectedTier.monthlyPriceUsd;

  const handleStartCheckout = (planId: 'community' | 'pro' | 'enterprise' | 'sovereign') => {
    setSelectedPlanId(planId);
    setCheckoutStep('details');
    setIsCheckoutOpen(true);
  };

  const handleProcessOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedKey = generateCryptographicLicenseKey(selectedPlanId, orgName);
      const newLicense: CommercialLicense = {
        tier: selectedPlanId,
        tierName: selectedTier.name,
        licenseKey: generatedKey,
        organization: orgName,
        contactEmail,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (billingPeriod === 'annual' ? 365 : 30) * 86400000).toISOString(),
        isActive: true,
        vatId,
        signatureHash: `sha256_${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        billingPeriod,
        seats: selectedPlanId === 'community' ? 1 : selectedPlanId === 'pro' ? 5 : 999,
        maxNodes: selectedPlanId === 'community' ? 1 : selectedPlanId === 'pro' ? 4 : 999,
        features: selectedTier.highlights,
      };

      onUpdateLicense(newLicense);
      setNewlyActivatedLicense(newLicense);
      setIsProcessing(false);
      setCheckoutStep('success');
    }, 1200);
  };

  const handleManualActivate = () => {
    setManualError(null);
    const key = manualKeyInput.trim().toUpperCase();
    if (!key) {
      setManualError('Please provide a valid license key.');
      return;
    }

    if (!key.startsWith('SK-') || key.length < 16) {
      setManualError('Invalid format. License keys follow the format SK-TIER-YYYY-XXXX-XXXX-TAG.');
      return;
    }

    let detectedTier: 'community' | 'pro' | 'enterprise' | 'sovereign' = 'pro';
    if (key.includes('SOV')) detectedTier = 'sovereign';
    else if (key.includes('ENT') || key.includes('DO178C')) detectedTier = 'enterprise';
    else if (key.includes('COM')) detectedTier = 'community';

    const activated: CommercialLicense = {
      tier: detectedTier,
      tierName: detectedTier === 'enterprise' ? 'Enterprise Bio-Cloud' : detectedTier === 'sovereign' ? 'Defense Sovereign Cloud' : 'Professional VPS',
      licenseKey: key,
      organization: orgName || 'Licensed Enterprise Entity',
      contactEmail: contactEmail || 'licensed@entity.org',
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      isActive: true,
      signatureHash: `verified_${Math.random().toString(16).substring(2, 12)}`,
      billingPeriod: 'annual',
      seats: detectedTier === 'enterprise' ? 100 : 5,
      maxNodes: detectedTier === 'enterprise' ? 999 : 4,
      features: detectedTier === 'enterprise' ? COMMERCIAL_TIERS[2].highlights : COMMERCIAL_TIERS[1].highlights,
    };

    onUpdateLicense(activated);
    setNewlyActivatedLicense(activated);
    setManualKeyInput('');
  };

  const handleCopyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDownloadInvoice = (lic: CommercialLicense) => {
    const invoiceText = `================================================================================
SERVERspace Cloud Systems - Official Commercial License Agreement & Tax Invoice
================================================================================
Invoice / License ID  : INV-${lic.licenseKey.replace(/-/g, '')}
Issue Timestamp       : ${new Date().toISOString()}
License Status        : ACTIVE (VALIDATED)
Licensed Organization : ${lic.organization}
Primary Contact       : ${lic.contactEmail}
VAT / Tax Identifier  : ${lic.vatId || 'N/A'}
Cryptographic Token   : ${lic.licenseKey}
Signature Hash        : ${lic.signatureHash}
Sovereign SLA Class   : ${lic.tier.toUpperCase()} (DO-178C DAL-A / ISO 26262 ASIL-D)
Expiration / Renewal  : ${lic.expiresAt}
Billing Frequency     : ${lic.billingPeriod.toUpperCase()}

LICENSED ENTITLEMENTS & CAPABILITIES:
${lic.features.map((f, i) => `  [${i + 1}] ${f}`).join('\n')}

WARRANTY & LIABILITY TERMS:
1. Uptime Assurance: SERVERspace commits to ${lic.tier === 'enterprise' ? '99.999%' : '99.95%'} uptime availability.
2. Formal Verification: Structural operational semantics guaranteed under DO-178C DAL-A.
3. Data Governance: 100% Client-side sandbox isolation with zero unauthorized telemetry egress.

Authorized Seal:
[SERVERSPACE-COMMERCIAL-VALIDATED-SIG-${lic.signatureHash.substring(0, 16)}]
================================================================================`;

    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SERVERspace_${lic.tier}_License_${lic.organization.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Header & Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Commercial Licensing &amp; Enterprise Subscriptions</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Transparent Pricing. Sovereign Security.
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl">
            Choose the right tier for your organization. From solo kernel developers to mission-critical aerospace clusters with DO-178C DAL-A mathematical verification.
          </p>
        </div>

        {/* Current Active License Badge */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 min-w-[280px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Active License:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[10px] border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {currentLicense.tier.toUpperCase()}
            </span>
          </div>

          <div className="font-mono text-xs font-bold text-white truncate" title={currentLicense.licenseKey}>
            {currentLicense.licenseKey}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5">
            <span>Org: {currentLicense.organization}</span>
            <button
              onClick={() => handleDownloadInvoice(currentLicense)}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              title="Download Agreement & Invoice"
            >
              <Download className="w-3 h-3" />
              <span>Agreement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Billing Period Toggle (Monthly vs Annual with 20% discount) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
              billingPeriod === 'monthly'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              billingPeriod === 'annual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COMMERCIAL_TIERS.map((tier) => {
          const isCurrent = currentLicense.tier === tier.id;
          const isEnterprise = tier.id === 'enterprise';
          const price = billingPeriod === 'annual' ? tier.annualPriceUsd : tier.monthlyPriceUsd;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-3xl p-6 transition-all ${
                isEnterprise
                  ? 'bg-gradient-to-b from-blue-950/60 to-slate-900/90 border-2 border-blue-500 shadow-xl shadow-blue-500/10'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md ${
                      isEnterprise
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 min-h-[32px] mt-1">{tier.tagline}</p>
                </div>

                {/* Price Display */}
                <div className="border-t border-b border-slate-800/80 py-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white font-mono">
                      ${price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      /{billingPeriod === 'annual' ? 'year' : 'month'}
                    </span>
                  </div>
                  <p className="text-[11px] text-cyan-400 font-mono mt-1">
                    {tier.nodeLimitText} &bull; {tier.seatsText}
                  </p>
                </div>

                {/* Spec Highlights List */}
                <div className="space-y-2.5">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
                    Features Included:
                  </span>
                  {tier.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  onClick={() => handleStartCheckout(tier.id)}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : isEnterprise
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Active License</span>
                    </>
                  ) : (
                    <>
                      <span>Select {tier.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual License Key Validation & Activation Section */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Already Have an Enterprise License Token?</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enter your enterprise key or purchase order token to activate offline features instantly without server roundtrips.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={manualKeyInput}
              onChange={(e) => setManualKeyInput(e.target.value)}
              placeholder="e.g. SK-ENT-2026-9A82-F02E-DO178C"
              className="bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder-slate-600 outline-none w-full md:w-80"
            />
            <button
              onClick={handleManualActivate}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Activate
            </button>
          </div>
        </div>

        {manualError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{manualError}</span>
          </div>
        )}
      </div>

      {/* Interactive Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            {checkoutStep === 'details' && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Commercial License Checkout</h3>
                    <p className="text-xs text-slate-400">
                      Tier: <span className="text-cyan-400 font-bold">{selectedTier.name}</span> &bull; {billingPeriod.toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Organization / Legal Entity</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Primary Technical Contact Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">Tax / VAT ID (Optional)</label>
                      <input
                        type="text"
                        value={vatId}
                        onChange={(e) => setVatId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">Billing Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-medium">Payment Channel</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Credit Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('invoice')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethod === 'invoice'
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5" />
                        <span>Corporate Net-30</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('crypto')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethod === 'crypto'
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>USDC / Crypto</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>{selectedTier.name} ({billingPeriod}):</span>
                      <span className="font-mono text-white font-semibold">${effectivePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tax / VAT (0% Enterprise B2B):</span>
                      <span className="font-mono text-white font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between text-white font-bold border-t border-slate-800/80 pt-2">
                      <span>Total Due Today:</span>
                      <span className="font-mono text-emerald-400 text-sm">${effectivePrice.toLocaleString()} {currency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessOrder}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating Cryptographic Key...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Complete Order &amp; Activate License</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 'success' && newlyActivatedLicense && (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white">License Successfully Activated!</h3>
                  <p className="text-xs text-slate-400">
                    Welcome to <span className="text-white font-semibold">{newlyActivatedLicense.tierName}</span>. Your cryptographic token is active in this browser.
                  </p>
                </div>

                {/* Key Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
                  <span className="text-[11px] font-mono text-slate-400">Cryptographic License Key:</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-cyan-300 truncate">
                      {newlyActivatedLicense.licenseKey}
                    </span>
                    <button
                      onClick={() => handleCopyLicenseKey(newlyActivatedLicense.licenseKey)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                      title="Copy Key"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copySuccess && (
                    <span className="text-[10px] text-emerald-400 font-mono block">Copied to clipboard!</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleDownloadInvoice(newlyActivatedLicense)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Download Agreement &amp; Invoice</span>
                  </button>

                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-lg"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
