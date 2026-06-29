"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Mail, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      }
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-20">
      {/* Header */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-manrope text-xs tracking-[0.3em] uppercase text-secondary mb-4">
              Get in Touch
            </p>
            <h1 className="font-cormorant text-5xl md:text-7xl lg:text-8xl font-light text-dark mb-6">
              Let&apos;s Connect
            </h1>
            <p className="font-inter text-lg text-muted max-w-lg">
              Have a custom idea or want to collaborate? I&apos;d love to hear from
              you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 md:pb-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {isSubmitted ? (
                <div className="text-center py-16">
                  <h3 className="font-cormorant text-3xl text-dark mb-4">
                    Thank you!
                  </h3>
                  <p className="font-inter text-muted">
                    Your message has been sent. I&apos;ll get back to you within 24
                    hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="font-manrope text-xs tracking-wide text-dark mb-2 block">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-0 py-3 border-b border-border bg-transparent font-inter text-sm focus:outline-none focus:border-dark transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="font-manrope text-xs tracking-wide text-dark mb-2 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-0 py-3 border-b border-border bg-transparent font-inter text-sm focus:outline-none focus:border-dark transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="font-manrope text-xs tracking-wide text-dark mb-2 block">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-0 py-3 border-b border-border bg-transparent font-inter text-sm focus:outline-none focus:border-dark transition-colors"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="font-manrope text-xs tracking-wide text-dark mb-2 block">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full px-0 py-3 border-b border-border bg-transparent font-inter text-sm focus:outline-none focus:border-dark transition-colors"
                        placeholder="Custom piece inquiry"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-manrope text-xs tracking-wide text-dark mb-2 block">
                      Your Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-0 py-3 border-b border-border bg-transparent font-inter text-sm focus:outline-none focus:border-dark transition-colors resize-none"
                      placeholder="Tell me about your vision..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex items-center gap-3 bg-primary px-10 py-5 font-manrope text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-10"
            >
              {/* Quick Contact */}
              <div className="space-y-6">
                <a
                  href="https://wa.me/918884942210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 flex items-center justify-center border border-border group-hover:border-primary transition-colors">
                    <MessageCircle className="h-5 w-5 text-dark" />
                  </div>
                  <div>
                    <p className="font-manrope text-xs tracking-wide text-muted mb-1">
                      WhatsApp
                    </p>
                    <p className="font-inter text-sm text-dark">+91 88849 42210</p>
                  </div>
                </a>

                <a
                  href="https://instagram.com/crestyve"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 flex items-center justify-center border border-border group-hover:border-primary transition-colors">
                    <svg className="h-5 w-5 text-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </div>
                  <div>
                    <p className="font-manrope text-xs tracking-wide text-muted mb-1">
                      Instagram
                    </p>
                    <p className="font-inter text-sm text-dark">@crestyve</p>
                  </div>
                </a>

                <a
                  href="mailto:hello@crestyve.com"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 flex items-center justify-center border border-border group-hover:border-primary transition-colors">
                    <Mail className="h-5 w-5 text-dark" />
                  </div>
                  <div>
                    <p className="font-manrope text-xs tracking-wide text-muted mb-1">
                      Email
                    </p>
                    <p className="font-inter text-sm text-dark">hello@crestyve.com</p>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex items-center justify-center border border-border">
                    <MapPin className="h-5 w-5 text-dark" />
                  </div>
                  <div>
                    <p className="font-manrope text-xs tracking-wide text-muted mb-1">
                      Studio
                    </p>
                    <p className="font-inter text-sm text-dark">Ahmedabad, India</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="aspect-[4/3] bg-dark/5 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235013.7091439556!2d72.41395149578148!3d23.020473503898198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1704000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Studio Location"
                />
              </div>

              {/* FAQ */}
              <div>
                <h3 className="font-cormorant text-2xl text-dark mb-6">
                  Frequently Asked
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      q: "How long does a custom piece take?",
                      a: "Typically 2-4 weeks depending on complexity. Each piece requires 40-80 hours of hand-painting.",
                    },
                    {
                      q: "Do you ship internationally?",
                      a: "Yes, we ship worldwide with premium packaging to ensure your piece arrives safely.",
                    },
                    {
                      q: "Can I provide my own garment?",
                      a: "Absolutely! We can paint on your existing garments or source premium pieces for you.",
                    },
                  ].map((faq) => (
                    <details key={faq.q} className="group border-b border-border pb-4">
                      <summary className="flex items-center justify-between cursor-pointer font-manrope text-sm text-dark">
                        {faq.q}
                        <span className="text-muted group-open:rotate-45 transition-transform duration-300">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 font-inter text-sm text-muted leading-relaxed">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
