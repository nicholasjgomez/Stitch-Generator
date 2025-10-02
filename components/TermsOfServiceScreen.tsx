import React from 'react';

const TermsOfServiceScreen: React.FC = () => {
  return (
    <div className="flex flex-col space-y-4 text-slate-700 leading-relaxed">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-2">Terms of Service</h2>
      <p><strong>Last Updated: [Date]</strong></p>

      <p>This is a placeholder for your application's Terms of Service. This agreement sets the rules for using your app.</p>

      <h3 className="text-lg font-semibold pt-4">1. Acceptance of Terms</h3>
      <p>By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.</p>

      <h3 className="text-lg font-semibold pt-4">2. User Content</h3>
      <p>You are responsible for the content that you upload to the service, including its legality, reliability, and appropriateness. You retain any and all of your rights to any content you submit.</p>

      <h3 className="text-lg font-semibold pt-4">3. Prohibited Uses</h3>
      <p>You may not use the service for any illegal or unauthorized purpose. You agree to comply with all laws, rules, and regulations applicable to your use of the service.</p>
      
      <h3 className="text-lg font-semibold pt-4">4. Termination</h3>
      <p>We may terminate or suspend your access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

      <p className="pt-4">Please replace this placeholder text with your own comprehensive Terms of Service.</p>
    </div>
  );
};

export default TermsOfServiceScreen;
