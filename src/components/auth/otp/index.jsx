import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

function EmailVerificationPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleEmailVerification = async () => {
            try {
                // Get the action code from the URL.
                const actionCode = new URL(window.location.href).searchParams.get('oobCode');
                
                // Apply the email verification code.
                await firebase.auth().applyActionCode(actionCode);
                
                // Redirect to home page after successful email verification.
                navigate('/dashboard');
            } catch (error) {
                console.error(error);
                // Handle error as needed, such as displaying an error message.
            }
        };

        handleEmailVerification();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Email Verification
                    </h2>
                    <p className="mt-5 text-center text-sm text-black-500">
                        Verifying your email address...
                    </p>
                </div>
            </div>
        </div>
    );
}

export default EmailVerificationPage;
