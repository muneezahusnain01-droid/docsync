import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock, Pill, Video, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import HeroScene from '@/components/HeroScene';
import { FadeUp, ScaleIn } from '@/components/MotionWrapper';

const features = [
  { icon: Calendar, title: 'Smart Booking', desc: 'AI-powered scheduling with real-time availability and conflict prevention.', color: 'text-primary' },
  { icon: Video, title: 'Virtual Consults', desc: 'HD video consultations with integrated medical records.', color: 'text-secondary' },
  { icon: FileText, title: 'Digital Rx', desc: 'Paperless prescriptions delivered instantly to your pharmacy.', color: 'text-accent' },
  { icon: Pill, title: 'E-Pharmacy', desc: 'Order medications online with doorstep delivery.', color: 'text-primary' },
  { icon: Shield, title: 'HIPAA Secure', desc: 'Enterprise-grade encryption for all patient data.', color: 'text-secondary' },
  { icon: Clock, title: '24/7 Access', desc: 'Round-the-clock access to your health records and services.', color: 'text-accent' },
];

const stats = [
  { value: '50K+', label: 'Patients Served' },
  { value: '500+', label: 'Verified Doctors' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9★', label: 'Rating' },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center">
          <div className="z-10">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Now with AI-Powered Diagnostics
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-tight text-foreground mb-6">
                Healthcare,{' '}
                <span className="gradient-text">Reimagined</span>{' '}
                for the Digital Age
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="text-lg text-muted-foreground max-w-lg mb-8">
                Book appointments, consult doctors, manage prescriptions, and order medications — all from one seamless platform.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth?tab=signup">
                  <Button size="lg" className="gradient-primary btn-press border-0 text-primary-foreground gap-2 glow-primary">
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/doctors">
                  <Button size="lg" variant="outline" className="btn-press">
                    Browse Doctors
                  </Button>
                </Link>
              </div>
            </FadeUp>
          </div>

          <div className="relative h-[400px] lg:h-[500px]">
            <HeroScene />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-foreground/[0.02]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <ScaleIn key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="font-display font-extrabold text-3xl md:text-4xl gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Everything You Need in <span className="gradient-text">One Platform</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From booking your first appointment to receiving medication at your door.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <FadeUp key={feat.title} delay={i * 0.1}>
                <div className="glass-card p-6 hover-lift group cursor-default">
                  <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 ${feat.color} group-hover:scale-110 transition-transform`}>
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground">{feat.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <FadeUp>
            <div className="glass-card-elevated p-12 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 gradient-primary opacity-5" />
              <h2 className="relative font-display font-bold text-3xl md:text-4xl mb-4">
                Ready to Transform Your Healthcare?
              </h2>
              <p className="relative text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of patients and doctors already using DocSync.
              </p>
              <Link to="/auth?tab=signup">
                <Button size="lg" className="relative gradient-primary btn-press border-0 text-primary-foreground gap-2 glow-primary animate-pulse-glow">
                  Start Your Journey <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </Layout>
  );
}
