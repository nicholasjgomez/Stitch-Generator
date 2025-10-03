import React, { useState } from 'react';
import { UserIcon, MailIcon } from './Icons';

const ContactScreen: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      // In a real app, you would handle form submission here (e.g., API call)
      setSubmitted(true);
    } else {
      alert('Please fill out all fields.');
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-lg mx-auto text-center">
        <h2 className="text-2xl font-bold text-sky-600 mb-2">Thank You!</h2>
        <p className="text-slate-600">Your message has been sent. We'll get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-lg mx-auto">
      <p className="text-center text-slate-600 mb-6">Have a question or feedback? We'd love to hear from you!</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border-slate-300 pl-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              placeholder="Jane Doe"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MailIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-slate-300 pl-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
          <div className="mt-1">
            <textarea
              rows={4}
              name="message"
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              placeholder="Your message here..."
              required
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactScreen;
