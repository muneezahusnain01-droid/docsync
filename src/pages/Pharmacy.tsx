import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { FadeUp } from '@/components/MotionWrapper';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ShoppingCart, Plus, Minus, Package, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  requires_prescription: boolean;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export default function Pharmacy() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    supabase.from('pharmacy_products').select('*').order('name').then(({ data }) => {
      setProducts((data || []) as Product[]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!profile) return;
    supabase.from('cart_items').select('*').eq('user_id', profile.id).then(({ data }) => {
      setCart((data || []) as CartItem[]);
    });
  }, [profile]);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const addToCart = async (productId: string) => {
    if (!profile) { toast.error('Please sign in'); return; }
    const existing = cart.find(c => c.product_id === productId);
    if (existing) {
      const { error } = await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
      if (error) { toast.error(error.message); return; }
      setCart(prev => prev.map(c => c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      const { data, error } = await supabase.from('cart_items').insert({ user_id: profile.id, product_id: productId, quantity: 1 }).select().single();
      if (error) { toast.error(error.message); return; }
      setCart(prev => [...prev, data as CartItem]);
    }
    toast.success('Added to cart');
  };

  const updateQty = async (itemId: string, qty: number) => {
    if (qty <= 0) {
      await supabase.from('cart_items').delete().eq('id', itemId);
      setCart(prev => prev.filter(c => c.id !== itemId));
    } else {
      await supabase.from('cart_items').update({ quantity: qty }).eq('id', itemId);
      setCart(prev => prev.map(c => c.id === itemId ? { ...c, quantity: qty } : c));
    }
  };

  const checkout = async () => {
    if (!profile || cart.length === 0) return;
    const total = cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: profile.id,
      total_amount: total,
    }).select().single();
    if (error) { toast.error(error.message); return; }

    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: products.find(p => p.id === item.product_id)?.price || 0,
    }));
    await supabase.from('order_items').insert(orderItems);
    await supabase.from('cart_items').delete().eq('user_id', profile.id);
    setCart([]);
    setShowCart(false);
    toast.success('Order placed successfully!');
  };

  const cartTotal = cart.reduce((sum, item) => {
    const p = products.find(p => p.id === item.product_id);
    return sum + (p?.price || 0) * item.quantity;
  }, 0);

  return (
    <Layout>
      <section className="py-24 gradient-hero">
        <div className="container mx-auto px-4">
          <FadeUp>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <h1 className="font-display font-extrabold text-4xl">
                  E-<span className="gradient-text">Pharmacy</span>
                </h1>
                <p className="text-muted-foreground">Quality medications delivered to your door</p>
              </div>
              <Button variant="outline" className="gap-2 relative btn-press" onClick={() => setShowCart(!showCart)}>
                <ShoppingCart className="w-4 h-4" />
                Cart
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full gradient-primary text-primary-foreground text-xs flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
            </div>
          </FadeUp>

          {/* Categories */}
          <FadeUp delay={0.1}>
            <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all btn-press ${
                    category === cat ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </FadeUp>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Products */}
            <div className={showCart ? 'lg:col-span-3' : 'lg:col-span-4'}>
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="glass-card p-6 h-48 animate-pulse" />)}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((product, i) => (
                    <FadeUp key={product.id} delay={i * 0.05}>
                      <div className="neumorphic p-6 hover-lift">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          {product.requires_prescription && (
                            <Badge variant="secondary" className="text-xs">Rx Required</Badge>
                          )}
                        </div>
                        <h3 className="font-display font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="font-display font-bold text-lg text-primary">${product.price.toFixed(2)}</span>
                          <Button size="sm" className="gradient-primary btn-press border-0 text-primary-foreground gap-1"
                            onClick={() => addToCart(product.id)} disabled={product.stock === 0}>
                            <Plus className="w-3 h-3" /> Add
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                      </div>
                    </FadeUp>
                  ))}
                </div>
              )}
            </div>

            {/* Cart sidebar */}
            {showCart && (
              <FadeUp>
                <div className="glass-card-elevated p-6 sticky top-24">
                  <h3 className="font-display font-bold text-lg mb-4">Your Cart</h3>
                  {cart.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {cart.map(item => {
                          const product = products.find(p => p.id === item.product_id);
                          return (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{product?.name}</p>
                                <p className="text-xs text-muted-foreground">${((product?.price || 0) * item.quantity).toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-6 h-6 rounded bg-muted flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                                <span className="text-sm w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-6 h-6 rounded bg-muted flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex justify-between font-display font-bold">
                          <span>Total</span>
                          <span className="text-primary">${cartTotal.toFixed(2)}</span>
                        </div>
                        <Button onClick={checkout} className="w-full mt-4 gradient-primary btn-press border-0 text-primary-foreground">
                          Checkout
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </FadeUp>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
