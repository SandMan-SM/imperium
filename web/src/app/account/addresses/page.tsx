"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, MapPin, Plus, Edit2, Trash2, X, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Address = {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  is_default: boolean;
};

const mockAddresses: Address[] = [
  {
    id: "addr-1",
    name: "Home",
    first_name: "John",
    last_name: "Doe",
    address: "123 Main Street, Apt 4B",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "US",
    phone: "(555) 123-4567",
    is_default: true,
  },
  {
    id: "addr-2",
    name: "Office",
    first_name: "John",
    last_name: "Doe",
    address: "456 Business Ave, Floor 10",
    city: "New York",
    state: "NY",
    zip: "10002",
    country: "US",
    phone: "(555) 987-6543",
    is_default: false,
  },
];

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    first_name: "",
    last_name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
    is_default: false,
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?redirect=/account/addresses");
        return;
      }
      
      setAddresses(mockAddresses);
      setLoading(false);
    }
    
    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddress) {
      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id ? { ...formData, id: editingAddress.id } : addr
      ));
    } else {
      const newAddress = { ...formData, id: `addr-${Date.now()}` };
      if (formData.is_default) {
        setAddresses(addresses.map(addr => ({ ...addr, is_default: false })).concat(newAddress));
      } else {
        setAddresses([...addresses, newAddress]);
      }
    }
    
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setFormData({
      name: "",
      first_name: "",
      last_name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "US",
      phone: "",
      is_default: false,
    });
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      is_default: addr.id === id,
    })));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-imperium-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px] pb-20">
      {/* Header */}
      <div className="border-b border-white/10 py-4">
        <div className="container mx-auto px-4">
          <Link
            href="/account"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Account
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-white font-bold">Addresses</h1>
            <p className="text-white/40 mt-1">{addresses.length} saved addresses</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-imperium-gold text-imperium-bg font-bold rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>

        {/* Address List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/5 rounded-2xl p-6 relative ${
                address.is_default ? "border-2 border-imperium-gold" : ""
              }`}
            >
              {address.is_default && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-imperium-gold/10 text-imperium-gold text-xs font-bold rounded">
                  DEFAULT
                </span>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <MapPin className="w-5 h-5 text-imperium-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-bold">{address.name}</h3>
                  <p className="text-white/60 text-sm">
                    {address.first_name} {address.last_name}
                  </p>
                </div>
              </div>
              
              <div className="text-white/60 text-sm space-y-1 mb-4">
                <p>{address.address}</p>
                <p>{address.city}, {address.state} {address.zip}</p>
                <p>{address.country}</p>
                {address.phone && <p>{address.phone}</p>}
              </div>
              
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleEdit(address)}
                  className="flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="flex items-center gap-1 text-white/60 hover:text-red-400 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="ml-auto text-imperium-gold hover:underline text-sm"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          
          {/* Add New Card */}
          {addresses.length < 4 && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-white/5 rounded-2xl p-6 border-2 border-dashed border-white/10 hover:border-imperium-gold/30 transition-colors flex flex-col items-center justify-center min-h-[200px]"
            >
              <Plus className="w-8 h-8 text-imperium-gold mb-4" />
              <span className="text-white/60">Add new address</span>
            </button>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-white font-bold">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Address Label</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Home, Office, etc."
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/60 text-sm mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">ZIP</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/60 text-sm mb-2">Phone (optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-imperium-gold focus:outline-none"
                  />
                </div>
                
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-black/20 text-imperium-gold focus:ring-imperium-gold"
                  />
                  <span className="text-white/60 text-sm">Set as default address</span>
                </label>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 border border-white/10 text-white/60 hover:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-imperium-gold text-imperium-bg font-bold rounded-lg hover:bg-imperium-gold/90 transition-colors"
                  >
                    {editingAddress ? "Save Changes" : "Add Address"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
