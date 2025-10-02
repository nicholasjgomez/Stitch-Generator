import React from 'react';

const PrivacyPolicyScreen: React.FC = () => {
  return (
    <div className="flex flex-col space-y-4 text-slate-700 leading-relaxed">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-2">Privacy Policy</h2>
      <p><strong>Last Updated: [Date]</strong></p>
      
      <p>This is a placeholder for your application's Privacy Policy. It's important to provide users with clear and transparent information about how you collect, use, and protect their data.</p>

      <h3 className="text-lg font-semibold pt-4">1. Information We Collect</h3>
      <p>We may collect information you provide directly to us, such as when you create an account, upload content, or contact us. This may include personal information like your name and email address.</p>

      <h3 className="text-lg font-semibold pt-4">2. How We Use Your Information</h3>
      <p>We use the information we collect to operate, maintain, and provide the features and functionality of the service, to communicate with you, and to personalize your experience.</p>
      
      <h3 className="text-lg font-semibold pt-4">3. Data Sharing</h3>
      <p>We do not share your personal information with third parties except as described in this Privacy Policy or with your consent. We may share anonymized, aggregate data for analytics purposes.</p>

      <h3 className="text-lg font-semibold pt-4">4. Your Choices</h3>
      <p>You may, of course, decline to submit personal information through the service, in which case we may not be able to provide certain services to you. You can update or correct your account information at any time by logging into your account.</p>

      <p className="pt-4">Please replace this placeholder text with your own comprehensive Privacy Policy.</p>
    </div>
  );
};

export default PrivacyPolicyScreen;
