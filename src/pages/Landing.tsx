import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { connectPhantom, hasPhantom } from "@/lib/wallet";
import { ShieldCheck, Zap, Repeat, Layers, ArrowRight, LineChart, Cpu, Boxes, BookOpen, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { StatusBanner } from "@/components/StatusBanner";
import { MetricsCard } from "@/components/MetricsCard";

// Summary feature grid removed per request; using compact deep-dive instead.

const Landing = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [billingYearly, setBillingYearly] = useState(false);

  const handleConnect = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      await connectPhantom();
      navigate("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
        {/* Top nav */}
        <div className="sticky top-0 z-10 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="font-bold tracking-wide">SafeTx Protocol</span>
              <Badge variant="outline" className="ml-2">Testnet</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: 'smooth' })}>Features</Button>
              <Button variant="ghost" size="sm" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: 'smooth' })}>Pricing</Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: 'smooth' })}>How it works</Button>
              <Button variant="ghost" size="sm" onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: 'smooth' })}>FAQ</Button>
              <Button size="sm" onClick={handleConnect} disabled={!hasPhantom() || connecting} className="gap-2">
                {connecting ? "Connecting..." : "Connect Phantom"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                SafeTx Protocol
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              A Solana testnet dashboard that detects congestion, queues transactions, and auto-retries for a smoother user experience.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">Prototype</Badge>
              <Badge variant="outline" className="text-xs">Open UI</Badge>
              <Badge variant="outline" className="text-xs">SDK Ready</Badge>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              {!hasPhantom() && (
                <p className="text-sm text-warning">Phantom wallet not detected. Install Phantom to connect.</p>
              )}
              <Button size="lg" onClick={handleConnect} disabled={!hasPhantom() || connecting} className="gap-2">
                {connecting ? "Connecting..." : "Connect Phantom"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">After connecting, you’ll be redirected to the live dashboard.</p>
          </div>
        </section>

        {/* Feature grid (summary) removed */}

        {/* Feature deep dive (compact) */}
        <section id="features" className="max-w-6xl mx-auto px-4 mt-10">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-semibold">Feature Deep Dive</h3>
            <p className="text-sm text-muted-foreground">Short and sweet: how SafeTx improves reliability.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{ icon: Zap, color: 'text-primary', title: 'Detect Congestion', bullets: ['TPS/slot/success → Health Score', 'Smart submit vs. queue'] },
              { icon: Layers, color: 'text-secondary', title: 'Queue Smartly', bullets: ['Bounded queue + dedupe', 'Optional persistence/Anchor'] },
              { icon: Repeat, color: 'text-accent', title: 'Auto-Retry', bullets: ['Backoff + jitter', 'Leader-aware timing'] },
              { icon: ShieldCheck, color: 'text-success', title: 'Safer UX', bullets: ['Clear statuses & alerts', 'Predictable during spikes'] }].map((f, i) => (
                <Card key={i} className="bg-card/50 border-2 border-border/40">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <f.icon className={`h-5 w-5 ${f.color}`} />
                      <h4 className="font-semibold">{f.title}</h4>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {f.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" /> <span>{b}</span></li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>

        {/* Toolkit (compact, enhanced UI) */}
        <section className="max-w-6xl mx-auto px-4 mt-10">
          <Card className="bg-card/60 border-2 border-accent/30 glow-accent">
            <CardHeader>
              <CardTitle>Everything you need for resilient Solana UX</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Detect, queue, retry — with a clean developer experience.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><LineChart className="h-4 w-4 text-primary" /> Network Intelligence</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" /> <span>Real-time metrics + Health Score</span></li>
                    <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" /> <span>Leader schedule awareness</span></li>
                    <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" /> <span>Color-coded congestion</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><Repeat className="h-4 w-4 text-secondary" /> Queue & Retry</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" /> <span>Bounded queue + backoff</span></li>
                    <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" /> <span>Auto-retry on recovery</span></li>
                    <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" /> <span>Manual Retry/Flush</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-4 w-4 text-accent" /> Developer Friendly</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" /> <span>SDK-ready client</span></li>
                    <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" /> <span>Clean React components</span></li>
                    <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-success" /> <span>Extensible data sources</span></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Mini live preview */}
        <section className="max-w-6xl mx-auto px-4 mt-14">
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 glow-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <LineChart className="h-5 w-5" /> Live Preview (Sample)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <StatusBanner status="yellow" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricsCard title="Transactions/Sec" value={1205} unit="TPS" icon={Zap} status="yellow" />
                <MetricsCard title="Slot Time" value={0.42} unit="ms" icon={Cpu} status="green" />
                <MetricsCard title="Success Rate" value={98.1} unit="%" icon={ShieldCheck} status="green" />
                <MetricsCard title="Queue Size" value={2} icon={Layers} status="green" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-6xl mx-auto px-4 mt-16">
          <Card className="bg-card/50 border-2 border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pricing</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <span className={!billingYearly ? "text-foreground" : "text-muted-foreground"}>Monthly</span>
                  <Switch checked={billingYearly} onCheckedChange={setBillingYearly} />
                  <span className={billingYearly ? "text-foreground" : "text-muted-foreground"}>Yearly</span>
                  {billingYearly && (
                    <Badge variant="outline" className="ml-2">Save 2 months</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Free tier */}
                <Card className="bg-background/60 border border-border/40">
                  <CardHeader>
                    <CardTitle>Free</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-3">$0</div>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Landing + Dashboard (Testnet)</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Basic metrics & charts</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Manual queue controls</li>
                    </ul>
                    <Button className="mt-4 w-full" variant="outline" onClick={handleConnect}>Get Started</Button>
                  </CardContent>
                </Card>

                {/* Pro tier */}
                <Card className="bg-background/80 border-2 border-primary/30 glow-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Pro</CardTitle>
                      <Badge variant="outline">Popular</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-3">
                      {billingYearly ? "$290" : "$29"}
                      <span className="text-sm">/{billingYearly ? "yr" : "mo"}</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> All Free features</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Auto-retry + backoff controls</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Deeper analytics & alerts</li>
                    </ul>
                    <Button className="mt-4 w-full" onClick={handleConnect}>Start Pro {billingYearly ? "Yearly" : "Monthly"} Plan</Button>
                  </CardContent>
                </Card>

                {/* Team tier */}
                <Card className="bg-background/60 border border-border/40">
                  <CardHeader>
                    <CardTitle>Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-3">
                      {billingYearly ? "$990" : "$99"}
                      <span className="text-sm">/{billingYearly ? "yr" : "mo"}</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> All Pro features</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Multi-project support</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Email/priority support</li>
                    </ul>
                    <Button className="mt-4 w-full" variant="outline" onClick={handleConnect}>Contact Sales</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How it works */}
        <section id="how" className="max-w-6xl mx-auto px-4 mt-14">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-semibold">How SafeTx Works</h3>
            <p className="text-sm text-muted-foreground">Three layers that turn congestion into a smoother experience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-2 border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  <span className="text-xs font-mono text-primary">STEP 01</span>
                </div>
                <h4 className="font-semibold mb-2">Monitor Network</h4>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Poll TPS, slot time, success rate, leader schedule</li>
                  <li>Derive Health Score and congestion level</li>
                  <li>Emit alerts for spikes and anomalies</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-2 border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-5 w-5 text-secondary" />
                  <span className="text-xs font-mono text-secondary">STEP 02</span>
                </div>
                <h4 className="font-semibold mb-2">Queue & Retry</h4>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Buffer tx metadata during congestion</li>
                  <li>Retry with backoff once conditions improve</li>
                  <li>Manual controls: Retry Pending, Flush Queue</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-2 border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <span className="text-xs font-mono text-accent">STEP 03</span>
                </div>
                <h4 className="font-semibold mb-2">Clear Feedback</h4>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Transparent statuses: processed, queued, failed</li>
                  <li>Color-coded health and live timelines</li>
                  <li>Fewer stuck txs, improved user trust</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Architecture overview */}
        <section className="max-w-6xl mx-auto px-4 mt-14">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-semibold">Core Architecture</h3>
            <p className="text-sm text-muted-foreground">Four components working together to keep transactions smooth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{ icon: LineChart, title: 'Network Monitor', desc: 'Node/TS service fetching RPC metrics.' },
              { icon: Boxes, title: 'Anchor Program', desc: 'Optional queue + status events.' },
              { icon: BookOpen, title: 'Dashboard UI', desc: 'Charts, tables, alerts, and health.' },
              { icon: Repeat, title: 'SafeTx SDK', desc: 'Auto-retry client for DApps.' }].map((a, i) => (
                <Card key={i} className="bg-card/50 border-2 border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <a.icon className="h-5 w-5 text-accent" />
                      <h3 className="font-semibold">{a.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-4 mt-16">
          <Card className="bg-card/50 border-2 border-border/40">
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Do I need Phantom to use the dashboard?</AccordionTrigger>
                  <AccordionContent>
                    You can browse this landing page without Phantom, but connecting is required to access the live dashboard.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is this connected to mainnet?</AccordionTrigger>
                  <AccordionContent>
                    This prototype targets Solana testnet. Mainnet integration would follow once validated.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Does SafeTx sign transactions for me?</AccordionTrigger>
                  <AccordionContent>
                    No. The wallet handles signing. SafeTx focuses on timing, queuing, and retry strategies to reduce failures.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>How hard is SDK integration?</AccordionTrigger>
                  <AccordionContent>
                    A lightweight client wraps your send logic. It detects congestion, queues, and retries. Minimal code changes expected.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-4 mt-14 mb-20">
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-semibold">Ready to try SafeTx?</h3>
            <p className="text-sm text-muted-foreground">Connect your Phantom wallet to access the live dashboard.</p>
            <Button size="lg" onClick={handleConnect} disabled={!hasPhantom() || connecting} className="gap-2">
              {connecting ? "Connecting..." : "Connect Phantom"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">After connecting, you’ll be redirected to the live dashboard.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              © {new Date().getFullYear()} SafeTx Protocol — Testnet Prototype
            </span>
            <div className="flex items-center gap-4">
              <a className="hover:text-primary" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
              <a className="hover:text-primary" href="https://solana.com/" target="_blank" rel="noreferrer">Solana</a>
              <a className="hover:text-primary" href="https://github.com/" target="_blank" rel="noreferrer">Docs (README)</a>
            </div>
          </div>
        </footer>
    </div>
  );
};

export default Landing;
