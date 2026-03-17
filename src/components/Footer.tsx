import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">DocSync</span>
            </div>
            <p className="text-sm text-muted-foreground">Revolutionizing healthcare with cutting-edge digital solutions.</p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link to="/doctors" className="hover:text-primary transition-colors">Our Doctors</Link>
              <Link to="/pharmacy" className="hover:text-primary transition-colors">Pharmacy</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Services</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>Online Consultations</span>
              <span>Appointment Booking</span>
              <span>Digital Prescriptions</span>
              <span>E-Pharmacy</span>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@docsync.health</span>
              <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> +1 (555) 123-4567</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> San Francisco, CA</span>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} DocSync. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
