import { useState } from "react";
import axios from "axios";
import { API_BASE_URL as apiUrl } from "../components/api";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Mail, User, MessageSquare, MapPin, Phone, Send } from "lucide-react";
import { FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import GlassButton from "../components/ui/GlassButton";
import GlassInput from "../components/ui/GlassInput";
import StatusBadge from "../components/ui/StatusBadge";
import { springSmooth } from "../constants/motion";

export function ContactUs() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      const res = await axios.post(`${apiUrl}/api/contact`, {
        name,
        email,
        message,
      });

      if (res.status === 200) {
        setStatus({ type: "success", msg: t("contact.alert.success") });
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: t("contact.alert.error") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-24 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSmooth}
        className="glass-card rounded-[36px] overflow-hidden grid grid-cols-1 md:grid-cols-5 border border-slate-900/10 dark:border-white/10"
      >
        {/* =========================================================================
            LEFT COLUMN: SATELLITE SUPPORT & CONTACT INFORMATION
            ========================================================================= */}
        <div className="md:col-span-2 p-6 sm:p-10 bg-gradient-to-br from-emerald-600/90 to-green-700/90 text-white flex flex-col justify-between relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle noise mesh */}
          <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mb-4">
              Direct Inquiries
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
              {t("contact.title")}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed mb-8">
              {t("contact.subtitle")}
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </div>
                <span>+91 98765 43210</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <span className="break-all sm:truncate">support@smartagro-solar.org</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <span>Gujarat Technological University, India</span>
              </div>
            </div>
          </div>

          {/* Social Icons */}
          <div className="mt-8 pt-6 border-t border-white/20 flex items-center gap-2 relative z-10">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white hover:text-emerald-700 transition-all flex items-center justify-center cursor-pointer"
            >
              <FaLinkedin size={15} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white hover:text-emerald-700 transition-all flex items-center justify-center cursor-pointer"
            >
              <FaGithub size={15} />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white hover:text-emerald-700 transition-all flex items-center justify-center cursor-pointer"
            >
              <FaXTwitter size={15} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white hover:text-emerald-700 transition-all flex items-center justify-center cursor-pointer"
            >
              <FaInstagram size={15} />
            </a>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: CONTACT TRANSMISSION FORM
            ========================================================================= */}
        <div className="md:col-span-3 p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
              Transmit a Message
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
              Our engineering & agronomy field teams respond within 24 operational hours.
            </p>
          </div>

          {status.msg && (
            <div
              className={`mb-5 p-3 rounded-2xl text-xs sm:text-sm font-semibold text-center border ${
                status.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-300"
                  : "bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-400"
              }`}
            >
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput
              label="Full Name"
              icon={User}
              name="name"
              placeholder="e.g. Rajesh Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <GlassInput
              label="Email Address"
              icon={Mail}
              type="email"
              name="email"
              placeholder="rajesh@farmmail.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
                Message Content
              </label>
              <textarea
                name="message"
                rows={4}
                placeholder="Describe your farm acreage, soil questions, or solar microgrid inquiry..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="glass-input text-[16px] leading-relaxed resize-none p-3.5 min-h-[120px]"
                style={{ padding: "0.875rem" }}
              />
            </div>

            <div className="pt-2">
              <GlassButton
                variant="primary"
                size="lg"
                type="submit"
                isLoading={loading}
                icon={Send}
                className="w-full sm:w-auto"
              >
                {loading ? "Transmitting..." : "Send Message"}
              </GlassButton>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ContactUs;
