
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('doctor', 'patient');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role app_role NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Doctor details
CREATE TABLE public.doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  specialization TEXT NOT NULL DEFAULT 'General',
  bio TEXT DEFAULT '',
  experience_years INT DEFAULT 0,
  consultation_fee NUMERIC(10,2) DEFAULT 0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, appointment_date, time_slot)
);

-- Prescriptions
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  medication TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'Once daily',
  duration TEXT NOT NULL DEFAULT '7 days',
  instructions TEXT,
  diagnosis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pharmacy products
CREATE TABLE public.pharmacy_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  image_url TEXT,
  stock INT NOT NULL DEFAULT 0,
  requires_prescription BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cart items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.pharmacy_products(id) ON DELETE CASCADE NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  shipping_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.pharmacy_products(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  price_at_purchase NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security definer helper to get profile for current user
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- DOCTOR_PROFILES policies
CREATE POLICY "Anyone authenticated can view doctors" ON public.doctor_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doctors can update own profile" ON public.doctor_profiles FOR UPDATE TO authenticated USING (profile_id = public.get_my_profile_id());
CREATE POLICY "Doctors can insert own profile" ON public.doctor_profiles FOR INSERT TO authenticated WITH CHECK (profile_id = public.get_my_profile_id() AND public.get_my_role() = 'doctor');

-- APPOINTMENTS policies
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT TO authenticated USING (patient_id = public.get_my_profile_id() OR doctor_id = public.get_my_profile_id());
CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (patient_id = public.get_my_profile_id() AND public.get_my_role() = 'patient');
CREATE POLICY "Users can update own appointments" ON public.appointments FOR UPDATE TO authenticated USING (patient_id = public.get_my_profile_id() OR doctor_id = public.get_my_profile_id());

-- PRESCRIPTIONS policies
CREATE POLICY "Users can view own prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (patient_id = public.get_my_profile_id() OR doctor_id = public.get_my_profile_id());
CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions FOR INSERT TO authenticated WITH CHECK (doctor_id = public.get_my_profile_id() AND public.get_my_role() = 'doctor');

-- PHARMACY_PRODUCTS policies (public read)
CREATE POLICY "Anyone can view products" ON public.pharmacy_products FOR SELECT USING (true);

-- CART_ITEMS policies
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT TO authenticated USING (user_id = public.get_my_profile_id());
CREATE POLICY "Users can add to cart" ON public.cart_items FOR INSERT TO authenticated WITH CHECK (user_id = public.get_my_profile_id());
CREATE POLICY "Users can update own cart" ON public.cart_items FOR UPDATE TO authenticated USING (user_id = public.get_my_profile_id());
CREATE POLICY "Users can delete from cart" ON public.cart_items FOR DELETE TO authenticated USING (user_id = public.get_my_profile_id());

-- ORDERS policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = public.get_my_profile_id());
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = public.get_my_profile_id());

-- ORDER_ITEMS policies
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT TO authenticated USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = public.get_my_profile_id())
);
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE user_id = public.get_my_profile_id())
);

-- CONTACT_MESSAGES policies (anyone can insert)
CREATE POLICY "Anyone can send contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Seed pharmacy products
INSERT INTO public.pharmacy_products (name, description, price, category, stock, requires_prescription) VALUES
  ('Paracetamol 500mg', 'Pain relief and fever reducer. Pack of 20 tablets.', 5.99, 'Pain Relief', 200, false),
  ('Amoxicillin 250mg', 'Broad-spectrum antibiotic. Pack of 14 capsules.', 12.99, 'Antibiotics', 100, true),
  ('Vitamin D3 1000IU', 'Essential vitamin supplement. 60 softgels.', 8.49, 'Vitamins', 300, false),
  ('Omeprazole 20mg', 'Acid reflux relief. Pack of 28 capsules.', 9.99, 'Digestive', 150, false),
  ('Cetirizine 10mg', 'Antihistamine for allergies. Pack of 30 tablets.', 6.49, 'Allergy', 250, false),
  ('Multivitamin Complex', 'Complete daily vitamin formula. 90 tablets.', 14.99, 'Vitamins', 180, false),
  ('Ibuprofen 400mg', 'Anti-inflammatory pain relief. Pack of 24 tablets.', 7.49, 'Pain Relief', 220, false),
  ('Cough Syrup 200ml', 'Soothing relief for dry and wet coughs.', 8.99, 'Cold & Flu', 120, false),
  ('Probiotic Capsules', 'Gut health supplement. 30 capsules.', 18.99, 'Digestive', 90, false),
  ('Omega-3 Fish Oil', 'Heart & brain health. 60 softgels.', 16.99, 'Vitamins', 140, false),
  ('Bandage Roll 5m', 'Sterile cotton bandage for wound care.', 3.49, 'First Aid', 400, false),
  ('Hand Sanitizer 500ml', 'Antibacterial gel, 70% alcohol.', 4.99, 'Hygiene', 350, false);
