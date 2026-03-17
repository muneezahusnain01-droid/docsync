import Layout from '@/components/Layout';
import { FadeUp } from '@/components/MotionWrapper';
import { Shield, Users, Heart, Award, Globe, Zap } from 'lucide-react';

const values = [
  { icon: Heart, title: 'Patient First', desc: 'Every decision starts with patient well-being.' },
  { icon: Shield, title: 'Privacy & Security', desc: 'Your data is encrypted and HIPAA compliant.' },
  { icon: Zap, title: 'Innovation', desc: 'Leveraging AI and modern tech for better outcomes.' },
  { icon: Globe, title: 'Accessibility', desc: 'Healthcare should be available to everyone, everywhere.' },
];

export default function About() {
  return (
    <Layout>
      <section className="py-24 gradient-hero">
        <div className="container mx-auto px-4">
          <FadeUp className="max-w-3xl mx-auto text-center">
            <h1 className="font-display font-extrabold text-4xl md:text-5xl mb-6">
              About <span className="gradient-text">DocSync</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We're on a mission to make quality healthcare accessible through technology. Founded by a team of doctors and engineers, DocSync bridges the gap between patients and healthcare providers.
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl mb-4">Our Core Values</h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <FadeUp key={v.title} delay={i * 0.1}>
                <div className="glass-card p-6 text-center hover-lift">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <FadeUp>
              <div className="font-display font-extrabold text-5xl gradient-text">2024</div>
              <div className="text-muted-foreground mt-2">Founded</div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="font-display font-extrabold text-5xl gradient-text">50+</div>
              <div className="text-muted-foreground mt-2">Team Members</div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="font-display font-extrabold text-5xl gradient-text">12</div>
              <div className="text-muted-foreground mt-2">Countries</div>
            </FadeUp>
          </div>
        </div>
      </section>
    </Layout>
  );
}
