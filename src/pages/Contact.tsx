import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { FadeUp } from '@/components/MotionWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('contact_messages').insert(form);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <Layout>
      <section className="py-24 gradient-hero">
        <div className="container mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <h1 className="font-display font-extrabold text-4xl md:text-5xl mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Have questions? We'd love to hear from you.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <FadeUp delay={0.1}>
              <div className="space-y-8">
                <div className="glass-card p-6 flex items-start gap-4 hover-lift">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">hello@docsync.health</p>
                  </div>
                </div>
                <div className="glass-card p-6 flex items-start gap-4 hover-lift">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Phone</h3>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="glass-card p-6 flex items-start gap-4 hover-lift">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Office</h3>
                    <p className="text-sm text-muted-foreground">123 Health St, San Francisco, CA 94105</p>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <form onSubmit={handleSubmit} className="glass-card-elevated p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
                </div>
                <Button type="submit" className="w-full gradient-primary btn-press border-0 text-primary-foreground gap-2" disabled={submitting}>
                  <Send className="w-4 h-4" /> {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </FadeUp>
          </div>
        </div>
      </section>
    </Layout>
  );
}
