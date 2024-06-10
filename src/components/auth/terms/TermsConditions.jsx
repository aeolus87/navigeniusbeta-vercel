import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/register');
  };

  return (
    <div className="container mx-auto my-16 px-4 py-8 bg-white text-gray-800 shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
      <p className="mb-4">Last updated: June 9, 2024</p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p>
          By accessing and using the Service, you agree to be bound by these
          Terms. If you disagree with any part of the Terms, then you do not
          have permission to access the Service.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">2. Use of Service</h2>
        <p>
          Navigenius allows parents or guardians to track the location of their
          children using a tracking device. You agree to use this Service solely
          for its intended purpose.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          3. User Responsibilities
        </h2>
        <p>
          <strong>Account Creation:</strong> To access the Service, you must
          create an account. You are responsible for maintaining the
          confidentiality of your account information and password.
        </p>
        <p>
          <strong>Accurate Information:</strong> You agree to provide accurate,
          current, and complete information during the registration process and
          to update such information to keep it accurate, current, and complete.
        </p>
        <p>
          <strong>Device Usage:</strong> You are responsible for ensuring that
          the tracking device is used in compliance with all applicable laws and
          regulations, including privacy laws.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          4. Privacy and Data Security
        </h2>
        <p>
          We are committed to protecting your privacy. Our Privacy Policy, which
          is incorporated into these Terms by reference, explains how we
          collect, use, and protect your information. By using the Service, you
          consent to the collection and use of your information as outlined in
          our Privacy Policy.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          5. Prohibited Activities
        </h2>
        <p>
          You agree not to use the Service for any unlawful purpose or any
          purpose prohibited under these Terms. You agree not to:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>
            Interfere with or disrupt the Service or servers or networks
            connected to the Service.
          </li>
          <li>
            Use the Service to transmit any content that is unlawful, harmful,
            threatening, abusive, harassing, defamatory, vulgar, obscene, or
            otherwise objectionable.
          </li>
          <li>
            Attempt to gain unauthorized access to any part of the Service,
            other accounts, computer systems, or networks connected to the
            Service.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          6. Intellectual Property
        </h2>
        <p>
          The Service and its original content, features, and functionality are
          and will remain the exclusive property of Navigenius and its
          licensors. The Service is protected by copyright, trademark, and other
          laws of both the United States and foreign countries.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">7. Termination</h2>
        <p>
          We may terminate or suspend your account and bar access to the Service
          immediately, without prior notice or liability, under our sole
          discretion, for any reason whatsoever, including without limitation if
          you breach the Terms.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          8. Limitation of Liability
        </h2>
        <p>
          In no event shall Navigenius, nor its directors, employees, partners,
          agents, suppliers, or affiliates, be liable for any indirect,
          incidental, special, consequential, or punitive damages, including
          without limitation, loss of profits, data, use, goodwill, or other
          intangible losses, resulting from (i) your use or inability to use the
          Service; (ii) any unauthorized access to or use of our servers and/or
          any personal information stored therein; (iii) any interruption or
          cessation of transmission to or from the Service; (iv) any bugs,
          viruses, trojan horses, or the like that may be transmitted to or
          through our Service by any third party; and/or (v) any errors or
          omissions in any content or for any loss or damage incurred as a
          result of the use of any content posted, emailed, transmitted, or
          otherwise made available through the Service.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">9. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the
          laws of Philippines, without regard to its conflict of law provisions.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          10. Changes to Terms and Conditions
        </h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace
          these Terms at any time. If a revision is material, we will provide at
          least 30 days' notice prior to any new terms taking effect. What
          constitutes a material change will be determined at our sole
          discretion.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">11. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at
          navigenius1@gmail.com.
        </p>
      </section>

      <section className="mb-6 flex justify-center">
        <button
          onClick={handleBack}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold mt-4 py-2 px-4 rounded"
        >
          Back
        </button>
      </section>
    </div>
  );
};

export default TermsAndConditions;
