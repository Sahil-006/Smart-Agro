import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTranslation } from "react-i18next"; // Added Translation Hook
import { Mail, User, MessageSquare, MapPin, Phone, Send } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

const ContactUs = () => {
  const { t } = useTranslation(); // Initialize Translation
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  // --- Backend Logic (Merged) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      // Using the robust URL construction while keeping the endpoint from Code 1
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contact`, {
        name,
        email,
        message,
      });

      if (res.status === 200) {
        // Use translation keys for success message
        setStatus({ type: 'success', msg: t("contact.alert.success") });
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch (err) {
      console.error(err);
      // Use translation keys for error message
      setStatus({ type: 'error', msg: t("contact.alert.error") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-24 flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white/90 backdrop-blur-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] border border-white overflow-hidden flex flex-col md:flex-row"
      >
        
        {/* LEFT SIDE: CONTACT INFO (Green Sidebar) */}
        <div className="md:w-2/5 bg-green-600 p-10 text-white flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-4">
              {t("contact.title")}
            </h1>
            <p className="text-green-100 font-medium mb-12">
              {t("contact.subtitle")}
            </p>

            <div className="space-y-8">
              <ContactLink 
                icon={<MapPin size={24} />} 
                title={t("contact.addressTitle")}
                detail="Madhuben and Bhanubhai Patel Institute of Technology, V V Nagar" 
              />
              <ContactLink 
                icon={<Phone size={24} />} 
                title={t("contact.phoneTitle")}
                detail="+91 98765 43210" 
              />
              <ContactLink 
                icon={<Mail size={24} />} 
                title={t("contact.emailTitle")}
                detail="smartagro@gmail.com" 
              />
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 text-green-200">
              {t("contact.follow")}
            </h2>
            <div className="flex gap-5">
              <SocialIcon href="#" icon={<FaFacebookF />} />
              <SocialIcon href="#" icon={<FaXTwitter />} />
              <SocialIcon href="#" icon={<FaInstagram />} />
              <SocialIcon href="#" icon={<FaLinkedin />} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: CONTACT FORM */}
        <div className="md:w-3/5 p-10 bg-white/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Send us a message</h2>

          {/* Status Message Display */}
          {status.msg && (
            <div className={`mb-6 p-4 rounded-2xl text-sm font-semibold border ${
              status.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              {status.msg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50"
                placeholder={t("contact.form.namePlaceholder")}
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50"
                placeholder={t("contact.form.email")}
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-5 text-gray-400 group-focus-within:text-green-600 transition-colors">
                <MessageSquare size={20} />
              </div>
              <textarea
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50"
                placeholder={t("contact.form.messagePlaceholder")}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-200 hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
            >
              {loading ? "Sending..." : (
                <>
                  {t("contact.form.submit")} 
                  <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

/* --- HELPER COMPONENTS --- */

const ContactLink = ({ icon, title, detail }) => (
  <div className="flex gap-5 items-start">
    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
      {icon}
    </div>
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest text-green-200 mb-1">{title}</h4>
      <p className="text-lg font-medium">{detail}</p>
    </div>
  </div>
);

const SocialIcon = ({ href, icon }) => (
  <a 
    href={href} 
    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 border border-white/10 hover:bg-white hover:text-green-600 transition-all text-xl shadow-lg"
  >
    {icon}
  </a>
);

export default ContactUs;