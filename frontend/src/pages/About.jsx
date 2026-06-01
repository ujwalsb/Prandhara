import React from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiHeart, FiShield, FiTruck, FiCheckCircle } from 'react-icons/fi';

const About = () => {
  const stats = [
    { label: 'Years Experience', value: '15+' },
    { label: 'Happy Customers', value: '50K+' },
    { label: 'Medicine Varieties', value: '50+' },
    { label: 'Trusted Partners', value: '200+' },
  ];

  const values = [
    { icon: FiHeart, title: 'Quality Care', desc: 'We prioritize your health with genuine, high-quality medicines and healthcare products.' },
    { icon: FiShield, title: 'Trust & Safety', desc: 'Every product is verified. Your safety is our topmost priority.' },
    { icon: FiTruck, title: 'Fast Delivery', desc: 'Same-day delivery across the city. We value your time.' },
    { icon: FiAward, title: 'Certified', desc: 'Licensed pharmacy with GMP-certified storage and handling.' },
  ];

  const team = [
    { name: 'Dr. Rajesh Sharma', role: 'Founder & Chief Pharmacist', img: '👨‍⚕️' },
    { name: 'Priya Patel', role: 'Operations Manager', img: '👩‍💼' },
    { name: 'Amit Verma', role: 'Head of Procurement', img: '👨‍🔬' },
    { name: 'Sneha Gupta', role: 'Customer Care Lead', img: '👩‍⚕️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold">About Prandhara</h1>
          <p className="mt-4 text-xl text-emerald-100 max-w-2xl mx-auto">
            Your trusted healthcare partner — committed to providing genuine medicines and quality healthcare since 2010.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-100">
              <p className="text-3xl font-bold text-emerald-600">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
            <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
              <p>
                Founded in 2010 by Dr. Rajesh Sharma, Prandhara Medical Store began as a small pharmacy 
                with a simple mission — to provide affordable, genuine medicines to our community.
              </p>
              <p>
                What started as a single shop has grown into a trusted healthcare destination serving 
                over 50,000 customers. We partner with 200+ pharmaceutical companies to ensure we 
                always stock the medicines you need.
              </p>
              <p>
                In 2024, we launched our online platform to make healthcare more accessible. Now you 
                can order medicines from home, upload prescriptions, and get doorstep delivery — while 
                still enjoying the personalized service we&apos;re known for.
              </p>
              <p className="font-medium text-emerald-700">
                &ldquo;Healthcare shouldn&apos;t be complicated. We&apos;re here to make it simple, 
                affordable, and trustworthy.&rdquo;
              </p>
            </div>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-all"
            >
              Browse Our Products
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <div className="text-center p-8">
                <span className="text-6xl">🏥</span>
                <p className="mt-4 text-lg font-semibold text-emerald-800">Prandhara Store</p>
                <p className="text-sm text-emerald-600">Est. 2010</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">Why Choose Us</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{v.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">Meet Our Team</h2>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((m) => (
            <div key={m.name} className="text-center group">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-4xl group-hover:scale-110 transition-transform">
                {m.img}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{m.name}</h3>
              <p className="text-sm text-gray-500">{m.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">Certifications & Licenses</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {['GMP Certified', 'FDA Licensed', 'ISO 9001:2024', 'Drug License', 'GST Registered', 'MSME'].map((cert) => (
              <div key={cert} className="flex items-center gap-2 bg-white rounded-lg px-5 py-3 shadow-sm border border-gray-100">
                <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium text-gray-700">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Ready to experience better healthcare?</h2>
        <p className="mt-3 text-gray-500">Visit our store or order online for doorstep delivery.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/shop" className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-all">
            Start Shopping
          </Link>
          <Link to="/contact" className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
