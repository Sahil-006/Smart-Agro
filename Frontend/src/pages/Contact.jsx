import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTranslation } from "react-i18next";
import { Mail, User, MessageSquare, MapPin, Phone, Send } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

const ContactUs = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/contact`, {
        name,
        email,
        message,
      });

      if (res.status === 200) {
        setStatus({ type: 'success', msg: t("contact.alert.success") });
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: t("contact.alert.error") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-16 flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-3 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white/90 backdrop-blur-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-3xl sm:rounded-[2.5rem] border border-white overflow-hidden flex flex-col md:flex-row"
      >
        
        {/* LEFT SIDE: CONTACT INFO (Green Sidebar) */}
        <div className="w-full md:w-2/5 bg-green-600 p-6 sm:p-8 md:p-10 text-white flex flex-col justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              {t("contact.title")}
            </h1>
            <p className="text-green-100 font-medium mb-8 sm:mb-12 text-sm sm:text-base">
              {t("contact.subtitle")}
            </p>

            <div className="space-y-6 sm:space-y-8">
              <ContactLink 
                icon={<MapPin size={22} className="shrink-0" />} 
                title={t("contact.addressTitle")}
                detail="Madhuben and Bhanubhai Patel Institute of Technology, V V Nagar" 
              />
              <ContactLink 
                icon={<Phone size={22} className="shrink-0" />} 
                title={t("contact.phoneTitle")}
                detail="+91 98765 43210" 
              />
              <ContactLink 
                icon={<Mail size={22} className="shrink-0" />} 
                title={t("contact.emailTitle")}
                detail="smartagro@gmail.com" 
              />
            </div>
          </div>

          <div className="mt-8 sm:mt-12 pt-6 border-t border-green-500/50 md:border-none md:pt-0">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 sm:mb-6 text-green-200">
              {t("contact.follow")}
            </h2>
            <div className="flex gap-3 sm:gap-4 flex-wrap">
              <SocialIcon href="#" icon={<FaFacebookF />} label="Facebook" />
              <SocialIcon href="#" icon={<FaXTwitter />} label="X" />
              <SocialIcon href="#" icon={<FaInstagram />} label="Instagram" />
              <SocialIcon href="#" icon={<FaLinkedin />} label="LinkedIn" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: CONTACT FORM */}
        <div className="w-full md:w-3/5 p-6 sm:p-8 md:p-10 bg-white/50">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8">Send us a message</h2>

          {/* Status Message Display */}
          {status.msg && (
            <div className={`mb-6 p-4 rounded-2xl text-sm font-semibold border ${
              status.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              {status.msg}
            </div>
          )}

          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none">
                <User size={20} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50 text-base"
                placeholder={t("contact.form.namePlaceholder")}
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50 text-base"
                placeholder={t("contact.form.email")}
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-4 sm:top-5 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none">
                <MessageSquare size={20} />
              </div>
              <textarea
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50 text-base resize-y"
                placeholder={t("contact.form.messagePlaceholder")}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] bg-green-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold shadow-xl shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group cursor-pointer"
            >
              {loading ? "Sending..." : (
                <>
                  <span>{t("contact.form.submit")}</span> 
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
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
  <div className="flex gap-4 sm:gap-5 items-start">
    <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-green-200 mb-1">{title}</h4>
      <p className="text-sm sm:text-base md:text-lg font-medium break-words leading-snug">{detail}</p>
    </div>
  </div>
);

const SocialIcon = ({ href, icon, label }) => (
  <a 
    href={href} 
    aria-label={label}
    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-white/10 border border-white/10 hover:bg-white hover:text-green-600 transition-all text-lg shadow-lg active:scale-95"
  >
    {icon}
  </a>
);

export default ContactUs;
