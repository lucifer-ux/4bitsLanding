import { useEffect, useState, useRef  } from 'react';
// (react-globe.gl not used when embedding official example)
import { motion } from 'framer-motion';
// (three removed after migrating to globe.gl)
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// User Types
interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}
// (removed previous timeout-based email fetch helper per user request)



// Google OAuth Handler
declare global {
  interface Window {
    google?: any;
  }
}

const handleGoogleSignIn = async () => {
  try {
    console.log('Starting Google OAuth...');
    console.log('Current origin:', window.location.origin);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    console.log('Google OAuth response:', { data, error });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Supabase Authentication Functions
const signUp = async (email: string, password: string, name: string) => {
  try {
    // Test credentials for development - check first
    if (email === 'test4bits123@g.com' && password === 'qwert12345') {
      console.log('Using test credentials for development');
      const testUser = {
        id: 'test-user-123',
        email: 'test4bits123@g.com',
        user_metadata: { name: 'Test User' }
      };
      return { user: testUser, session: { user: testUser } };
    }

    // Only call Supabase if not test credentials
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

const signIn = async (email: string, password: string) => {
  try {
    // Test credentials for development - check first
    if (email === 'test4bits123@g.com' && password === 'qwert12345') {
      console.log('Using test credentials for development');
      const testUser = {
        id: 'test-user-123',
        email: 'test4bits123@g.com',
        user_metadata: { name: 'Test User' }
      };
      return { user: testUser, session: { user: testUser } };
    }

    // Only call Supabase if not test credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};


// Store user data in Supabase database
const storeUserData = async (user: User) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

// Authentication Popup Component
function AuthPopup({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: (user: User) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        const { user } = await signUp(formData.email, formData.password, formData.name);
        
        alert('Please check your email to verify your account!');
        onSuccess({
          id: user?.id || '',
          email: user?.email || '',
          name: formData.name
        });
      } else {
        // Sign in
        const { user } = await signIn(formData.email, formData.password);
        
        onSuccess({
          id: user?.id || '',
          email: user?.email || '',
          name: user?.user_metadata?.name || ''
        });
      }
      onClose();
    } catch (error: any) {
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-white/70">
            {isSignUp ? 'Sign up to place your preorder' : 'Sign in to continue'}
          </p>
        </div>

        {/* Google Sign-in Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={async () => {
              setIsLoading(true);
              try {
                await handleGoogleSignIn();
              } catch (error) {
                setError('Google sign-in failed. Please try again.');
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-white/70">or</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-white/80 text-sm mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={isSignUp}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-white/80 text-sm mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              placeholder="Enter your password"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-white/80 text-sm mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required={isSignUp}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Confirm your password"
              />
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle between sign in and sign up */}
        <div className="text-center mt-6">
          <p className="text-white/70 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className="text-cyan-400 hover:text-cyan-300 ml-1 font-semibold"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Terms */}
        <p className="text-xs text-white/50 text-center mt-4">
          By signing in, you agree to our Terms & Conditions and Privacy Policy
        </p>
      </motion.div>
    </motion.div>
  );
}

// Razorpay Payment Handler (Frontend-Only Secure Implementation)
const openRazorpayCheckout = (amount: number, currency: string = 'INR', user: User | null) => {
  const razorpayKeyId = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
  
  if (!razorpayKeyId) {
    alert('Razorpay key ID not configured. Please add VITE_RAZORPAY_KEY_ID to your environment variables.');
    return;
  }

  try {
    // Generate unique order ID for tracking
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Razorpay Payment Details:', {
      key_id: razorpayKeyId,
      order_id: orderId,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency
    });

    // Frontend-only Razorpay integration (secure)
    const options = {
      key: razorpayKeyId, // Public key only - safe for frontend
      amount: amount * 100, // Amount in paise (₹4 = 400 paise)
      currency: currency,
      name: '4bits',
      description: 'Preorder - 4bits Storage Device',
      // Remove order_id for frontend-only integration
      handler: async function (response: any) {
        console.log('Razorpay payment success:', response);
        
        // Validate payment response (security check)
        if (!response.razorpay_payment_id) {
          console.error('Invalid payment response:', response);
          alert('Payment verification failed. Please contact support.');
          return;
        }
        
        // Store payment record in database
        try {
          const { data: dbUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', user?.id)
            .single();
          
          if (!userError && dbUser) {
            // Store payment record with all Razorpay details
            const { error: paymentError } = await supabase
              .from('payment_records')
              .insert([
                {
                  user_id: dbUser.id,
                  order_id: orderId, // Use our generated order ID
                  amount: amount,
                  currency: currency,
                  status: 'success',
                  payment_gateway: 'razorpay',
                  payment_id: response.razorpay_payment_id,
                  signature: response.razorpay_signature || null
                }
              ]);
            
            if (!paymentError) {
              // Mark user as paid
              const { error: markPaidError } = await supabase
                .from('users')
                .update({ paid: true, updated_at: new Date().toISOString() })
                .eq('auth_user_id', user?.id);
              
              if (!markPaidError) {
                console.log('Payment processed successfully');
                alert('Payment successful! Thank you for your preorder.');
                // Refresh the page to update UI
                window.location.reload();
              } else {
                console.error('Error marking user as paid:', markPaidError);
                alert('Payment successful but error updating status. Please contact support.');
              }
            } else {
              console.error('Error storing payment record:', paymentError);
              alert('Payment successful but error storing record. Please contact support.');
            }
          } else {
            console.error('User not found in database:', userError);
            alert('Payment successful but user not found. Please contact support.');
          }
        } catch (error) {
          console.error('Error processing payment:', error);
          alert('Payment successful but error updating status. Please contact support.');
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
        }
      }
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
    
  } catch (error) {
    console.error('Razorpay checkout error:', error);
    alert('Payment failed to initialize. Please try again.');
  }
};


// 3D Glassy Button Component - Reusable for both header and main buttons
function GlassyButton({ size = 'large', user, onAuthRequired, hasPreordered }: { 
  size?: 'large' | 'small'; 
  user: User | null;
  onAuthRequired: () => void;
  hasPreordered?: boolean;
}) {
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const handleClick = async () => {
    setIsClicked(true);
    
    // If user has already preordered, don't perform any action
    if (hasPreordered) {
      console.log('User has already preordered, no action taken');
      setTimeout(() => setIsClicked(false), 1000);
      return;
    }
    
    // If user is logged in, run the DB check (blocking, no timeout)
    if (user) {
      console.log('User is logged in, running email lookup before proceeding...', user);
      try {
        console.log('🔎 Supabase email lookup START');
        const { data: foundUser, error: lookupError } = await supabase
          .from('users')
          .select('id,email,name,auth_user_id,paid,created_at,updated_at')
          .eq('email', 'shashwat1499@gmail.com')
          .maybeSingle();

        console.log('🔎 Supabase email lookup END', { hasData: !!foundUser, hasError: !!lookupError });

        if (lookupError) {
          console.warn('Email lookup error; not proceeding:', lookupError);
          setTimeout(() => setIsClicked(false), 600);
          return;
        }

        if (!foundUser) {
          console.log('Email not found in DB (empty array/null).');
        } else {
          console.log('Email matched DB row:', foundUser);
        }

        // Stop here per your debug requirement
        setTimeout(() => setIsClicked(false), 600);
        return;
      } catch (e) {
        console.error('Unexpected failure during handleClick email lookup:', e);
        setTimeout(() => setIsClicked(false), 600);
        return;
      }
    }
    
    // If not logged in, show auth popup
    console.log('User not logged in, showing auth popup...');
    onAuthRequired();
    
    // Reset after animation
    setTimeout(() => setIsClicked(false), 1000);
  };

  const handleAuthSuccess = async (user: User) => {
    console.log('User signed in:', user);
    
    // Store user data in Supabase database
    try {
      await storeUserData(user);
      console.log('User data stored successfully');
    } catch (error) {
      console.error('Failed to store user data:', error);
      // Continue with payment even if storage fails
    }
    
    // Now proceed to payment
    openRazorpayCheckout(4, 'INR', user); // ₹4 for preorder
  };

  const handleAuthClose = () => {
    setShowAuthPopup(false);
  };


  // Size-based styling
  const isSmall = size === 'small';
  const buttonStyles = isSmall ? {
    borderRadius: '30px 10px 30px 10px',
    padding: '10px 30px',
    fontSize: '16px',
    minWidth: '140px',
    height: '45px'
  } : {
    borderRadius: '60px 20px 60px 20px',
    padding: '20px 60px',
    fontSize: '20px',
    minWidth: '280px',
    height: '70px'
  };

  const animationValues = isSmall ? {
    width: ['140px', '100px', '75px', '60px', '140px'],
    height: ['45px', '38px', '32px', '28px', '45px'],
    borderRadius: ['30px 10px 30px 10px', '25px', '20px', '18px', '30px 10px 30px 10px'],
    dropletSize: ['30px', '40px', '30px', 0],
    particleCount: 8
  } : {
    width: ['280px', '200px', '150px', '120px', '280px'],
    height: ['70px', '60px', '50px', '40px', '70px'],
    borderRadius: ['60px 20px 60px 20px', '50px', '40px', '35px', '60px 20px 60px 20px'],
    dropletSize: ['60px', '80px', '60px', 0],
    particleCount: 12
  };

  return (
    <>
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: buttonStyles.borderRadius,
        padding: buttonStyles.padding,
        fontSize: buttonStyles.fontSize,
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0 0 15px rgba(255, 255, 255, 0.6)',
        boxShadow: `
          0 15px 40px rgba(0, 0, 0, 0.4),
          inset 0 2px 0 rgba(255, 255, 255, 0.3),
          inset 0 -2px 0 rgba(0, 0, 0, 0.2),
          0 0 30px rgba(122, 246, 216, 0.3)
        `,
        position: 'relative',
        overflow: 'hidden',
        minWidth: buttonStyles.minWidth,
        height: buttonStyles.height,
        zIndex: 50, // Much higher z-index
        pointerEvents: 'auto' // Ensure button can receive clicks
      }}
      animate={{
        scale: isClicked ? [1, 0.7, 0.9, 0.8, 1] : isHovered ? 1.02 : 1,
        rotateX: isClicked ? [0, 20, -15, 10, 0] : 0,
        rotateY: isClicked ? [0, 10, -8, 5, 0] : 0,
        borderRadius: isClicked 
          ? animationValues.borderRadius
          : buttonStyles.borderRadius,
        background: isClicked 
          ? [
              'rgba(255, 255, 255, 0.08)', 
              'rgba(122, 246, 216, 0.4)', 
              'rgba(122, 246, 216, 0.6)',
              'rgba(122, 246, 216, 0.4)',
              'rgba(255, 255, 255, 0.08)'
            ]
          : 'rgba(255, 255, 255, 0.08)',
        width: isClicked ? animationValues.width : buttonStyles.minWidth,
        height: isClicked ? animationValues.height : buttonStyles.height,
        // Add floating animation
        y: [0, -8, 0]
      }}
      transition={{
        duration: isClicked ? 3 : 0.3,
        ease: isClicked ? "easeInOut" : "easeOut",
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {/* Glass highlight - more pronounced */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 30%, rgba(255,255,255,0.2) 70%, transparent 100%)',
          borderRadius: 'inherit',
          opacity: isHovered ? 0.9 : 0.7
        }}
        animate={{
          opacity: isClicked ? [0.7, 1, 0.4, 0.8, 0.7] : isHovered ? 0.9 : 0.7,
          background: isClicked 
            ? [
                'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 30%, rgba(255,255,255,0.2) 70%, transparent 100%)',
                'linear-gradient(135deg, rgba(122, 246, 216,0.8) 0%, transparent 30%, rgba(122, 246, 216,0.4) 70%, transparent 100%)',
                'linear-gradient(135deg, rgba(122, 246, 216,0.9) 0%, transparent 30%, rgba(122, 246, 216,0.6) 70%, transparent 100%)',
                'linear-gradient(135deg, rgba(122, 246, 216,0.8) 0%, transparent 30%, rgba(122, 246, 216,0.4) 70%, transparent 100%)',
                'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 30%, rgba(255,255,255,0.2) 70%, transparent 100%)'
              ]
            : 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 30%, rgba(255,255,255,0.2) 70%, transparent 100%)'
        }}
        transition={{ duration: isClicked ? 3 : 0.3 }}
      />
      
      {/* Enhanced cyan glow effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(122, 246, 216, 0.4), transparent)',
          borderRadius: 'inherit',
          boxShadow: '0 0 40px rgba(122, 246, 216, 0.6), inset 0 0 20px rgba(122, 246, 216, 0.2)'
        }}
        animate={{
          opacity: isClicked ? [0.4, 1, 0.6, 1, 0.4] : 0.4,
          scale: isClicked ? [1, 1.3, 0.7, 1.1, 1] : 1,
          boxShadow: isClicked 
            ? [
                '0 0 40px rgba(122, 246, 216, 0.6), inset 0 0 20px rgba(122, 246, 216, 0.2)',
                '0 0 60px rgba(122, 246, 216, 0.8), inset 0 0 30px rgba(122, 246, 216, 0.4)',
                '0 0 80px rgba(122, 246, 216, 1), inset 0 0 40px rgba(122, 246, 216, 0.6)',
                '0 0 60px rgba(122, 246, 216, 0.8), inset 0 0 30px rgba(122, 246, 216, 0.4)',
                '0 0 40px rgba(122, 246, 216, 0.6), inset 0 0 20px rgba(122, 246, 216, 0.2)'
              ]
            : '0 0 40px rgba(122, 246, 216, 0.6), inset 0 0 20px rgba(122, 246, 216, 0.2)'
        }}
        transition={{ duration: isClicked ? 3 : 0.3 }}
      />

      {/* Water droplet transformation */}
      {isClicked && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3 }}
        >
          {/* Main droplet */}
          <motion.div
            className="absolute bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: 'center'
            }}
            animate={{
              width: [0, animationValues.dropletSize[0], animationValues.dropletSize[1], animationValues.dropletSize[2], 0],
              height: [0, animationValues.dropletSize[0], animationValues.dropletSize[1], animationValues.dropletSize[2], 0],
              x: ['-50%', '-50%', '-50%', '-50%', '-50%'],
              y: ['-50%', '-50%', '-50%', '-50%', '-50%'],
              opacity: [0, 0.8, 1, 0.8, 0],
              borderRadius: ['0%', '50%', '50%', '50%', '0%']
            }}
            transition={{
              duration: 3,
              ease: "easeInOut"
            }}
          />
          
          {/* Water particles */}
          {[...Array(animationValues.particleCount)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-cyan-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: 'center'
              }}
              animate={{
                width: [0, isSmall ? '2px' : '4px', isSmall ? '3px' : '6px', isSmall ? '2px' : '4px', 0],
                height: [0, isSmall ? '2px' : '4px', isSmall ? '3px' : '6px', isSmall ? '2px' : '4px', 0],
                x: [0, (Math.random() - 0.5) * (isSmall ? 150 : 300)],
                y: [0, (Math.random() - 0.5) * (isSmall ? 150 : 300)],
                opacity: [0, 1, 0.8, 0.4, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Text */}
      <motion.span
        className="relative z-10 flex items-center justify-center h-full"
        animate={{
          scale: isClicked ? [1, 0.7, 0.9, 0.8, 1] : 1,
          color: isClicked 
            ? ['white', '#7AF6D8', '#7AF6D8', '#7AF6D8', 'white'] 
            : 'white',
          opacity: isClicked ? [1, 0.3, 0.6, 0.4, 1] : 1
        }}
        transition={{ duration: isClicked ? 3 : 0.3 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {hasPreordered ? 'Already Paid' : 'preorder'}
      </motion.span>
    </motion.button>
    
    {/* Auth Popup */}
    <AuthPopup 
      isOpen={showAuthPopup}
      onClose={handleAuthClose}
      onSuccess={handleAuthSuccess}
    />
  </>
  );
}

// User Account Menu Component
function UserAccountMenu({ user, onSignOut }: { 
  user: User | null; 
  onSignOut: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        const target = event.target as Element;
        if (!target.closest('.user-account-menu')) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="relative user-account-menu z-50">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 text-white hover:text-cyan-400 transition-colors touch-manipulation"
        style={{ minHeight: '44px', minWidth: '44px' }}
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-medium">{user.name}</div>
          <div className="text-xs text-white/70">{user.email}</div>
        </div>
        {/* Mobile: Show user initial only */}
        <div className="sm:hidden">
          <div className="text-xs text-white/70 truncate max-w-20">{user.name}</div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <motion.div
          className="absolute right-0 top-full mt-2 w-[calc(100vw-4rem)] sm:w-64 max-w-64 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 z-50"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
        >
          <div className="p-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-white font-medium">{user.name}</div>
                <div className="text-white/70 text-sm">{user.email}</div>
              </div>
            </div>

            {/* Sign Out Button */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  if (isSigningOut) return; // Prevent double clicks
                  setIsSigningOut(true);
                  setIsOpen(false);
                  
                  // Call sign out and don't wait for it
                  onSignOut();
                  
                  // Reset button state after a short delay
                  setTimeout(() => {
                    setIsSigningOut(false);
                  }, 1000);
                }}
                disabled={isSigningOut}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  isSigningOut 
                    ? 'text-red-300 bg-red-500/20 cursor-not-allowed' 
                    : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                }`}
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Header Component with Logo, User Account, and Preorder Button
function Header({ user, onAuthRequired, onSignOut, hasPreordered }: { 
  user: User | null; 
  onAuthRequired: () => void;
  onSignOut: () => void;
  hasPreordered: boolean;
}) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-2 sm:p-4">
      {/* Logo */}
      <motion.div
        className="relative flex items-center justify-start"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
              <motion.img
                src="/4bits_without_bg.png"
                alt="4bits"
          className="w-20 h-10 sm:w-40 sm:h-20 md:w-48 md:h-24"
          initial={{ y: -2, scale: 0.98, opacity: 1 }}
          animate={{ y: [0, -6, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
        />
      </motion.div>

      {/* Right side - User Account and Preorder Button */}
      <div className="flex items-center space-x-1 sm:space-x-4">
        {/* User Account Menu (if logged in) */}
        {user && (
          <UserAccountMenu 
            user={user} 
            onSignOut={onSignOut}
          />
        )}
        
        
        {/* Header Preorder Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <GlassyButton 
            size="small" 
            user={user} 
            onAuthRequired={onAuthRequired}
            hasPreordered={hasPreordered}
        />
      </motion.div>
      </div>
    </div>
  );
}


// Custom Mouse Cursor with bubble effect - Mobile optimized
function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // no visibility gating; always render on desktop
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if device is mobile/touch
    const checkIsMobile = () => {
      return window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    setIsMobile(checkIsMobile());

    // Don't show custom cursor on mobile devices
    if (checkIsMobile()) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {};

    const handleMouseEnter = () => {};

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Always render (desktop); hide on mobile
  if (isMobile) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Main cursor circle with bubble effect */}
      <motion.div
        className="relative"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Outer bubble ring */}
        <motion.div
          className="absolute inset-0 w-16 h-16 rounded-full border-2 border-white/30 bg-white/5"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Middle bubble ring */}
        <motion.div
          className="absolute inset-2 w-12 h-12 rounded-full border border-blue-400/40 bg-blue-400/10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          }}
        />

        {/* Inner cursor circle */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400/20 to-green-400/20 border border-white/50 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            className="w-4 h-4 rounded-full bg-white/50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Sparkle effects */}
        <motion.div
          className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-300 rounded-full"
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>
    </div>
  );
}

// Blue ocean sphere base
// (Old OceanSphere removed)

// Ultra-dense Earth landmass particles with realistic geography
// (Removed unused Three/R3F remnants after migrating to globe.gl)

// Green storage nodes specifically placed in India
// (Removed unused Three/R3F remnants after migrating to globe.gl)

// (Old Three.js EarthScene removed after migrating to globe.gl)


// Memory Panel Component with manual navigation
// (Old MemoryPanel removed)

function InteractiveEarthWebsite() {
  // User authentication state
  const [user, setUser] = useState<User | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [hasPreordered, setHasPreordered] = useState(false);
  const [showMemoriesText, setShowMemoriesText] = useState(true);

  // Simplified state (UI overlays removed)
  const [typewriterText, setTypewriterText] = useState('');
  // preorder removed
  // (old memory panel removed)
  // scroll zoom typing removed
  // (revealed dots removed)
  const fullText = "Own Your Storage";
  // (old CTA slider removed)
  // (previous arcs/rings removed for satellites view)
  // (no longer tracking previous click)
  // (custom satellites removed; using official example via iframe)

  // Authentication handlers
  const handleAuthRequired = () => {
    setShowAuthPopup(true);
  };

  // Immediate payment status check on page load
  useEffect(() => {
    const checkInitialPaymentStatus = async () => {
      try {
        console.log('🔧 DEBUG: Starting initial payment status check');
        console.log('🔧 DEBUG: Supabase client:', supabase);
        console.log('🔧 DEBUG: User state:', user);
        console.log('🔧 DEBUG: Environment variables:');
        console.log('🔧 DEBUG: VITE_SUPABASE_URL:', (import.meta as any).env?.VITE_SUPABASE_URL);
        console.log('🔧 DEBUG: VITE_SUPABASE_ANON_KEY:', (import.meta as any).env?.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
        const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'shashwat1499@gmail.com')
  
        console.log(data, "datalogg");
        if (error) {
          console.error('Error fetching user data:', error);
        }
  
        
      } catch (error) {
        console.error('Error checking initial payment status:', error);
      }
    };
    
    checkInitialPaymentStatus();
  }, []); // Run only once on mount

  // Debug user state
  useEffect(() => {
    console.log('User state changed:', user);
    
    // Check payment status immediately when user state changes
    if (user) {
      const checkPaymentStatusImmediately = async () => {
        try {
          const { data: dbUser, error: userError } = await supabase
            .from('users')
            .select('paid, updated_at')
            .eq('auth_user_id', user.id)
            .single();
          
          console.log('🔍 SUPABASE RESPONSE - User Change Check:');
          console.log('Raw Supabase response:', { data: dbUser, error: userError });
          console.log('User ID being queried:', user.id);
          console.log('Database user found:', !!dbUser);
          console.log('Raw paid value from DB:', dbUser?.paid);
          console.log('Type of paid value:', typeof dbUser?.paid);
          console.log('Updated at:', dbUser?.updated_at);
          
          if (userError) {
            console.error('❌ Error getting database user on user change:', userError);
            setHasPreordered(false);
            return;
          }
          
          const hasPaid = dbUser?.paid || false;
          setHasPreordered(hasPaid);
          console.log('✅ Payment status check on user change:', hasPaid);
          console.log('hasPreordered state set to:', hasPaid);
          
          if (hasPaid) {
            console.log('🎉 User has already paid - UI will update immediately');
          } else {
            console.log('❌ User has not paid yet');
          }
        } catch (error) {
          console.error('❌ Error checking payment status on user change:', error);
        }
      };
      
      checkPaymentStatusImmediately();
    } else {
      setHasPreordered(false);
    }
  }, [user]);

  // Check if user has preordered from database
  useEffect(() => {
    const checkPreorderStatus = async (retryCount = 0) => {
      if (user) {
        try {
          // Check if user has paid using the paid field in users table
          const { data: dbUser, error: userError } = await supabase
            .from('users')
            .select('paid, updated_at')
            .eq('auth_user_id', user.id)
            .single();
          
          if (userError) {
            console.error('Error getting database user:', userError);
            setHasPreordered(false);
            return;
          }
          
          const hasPaid = dbUser?.paid || false;
          setHasPreordered(hasPaid);
          
          console.log(`🔍 SUPABASE RESPONSE - Payment Status Check (attempt ${retryCount + 1}):`);
          console.log('Raw Supabase response:', { data: dbUser, error: userError });
          console.log('User ID being queried:', user.id);
          console.log('Database user found:', !!dbUser);
          console.log('Raw paid value from DB:', dbUser?.paid);
          console.log('Type of paid value:', typeof dbUser?.paid);
          console.log('Processed hasPaid value:', hasPaid);
          console.log('hasPreordered state set to:', hasPaid);
          console.log('Last updated:', dbUser?.updated_at);
          
          // If not paid and we haven't reached max retries, poll again
          if (!hasPaid && retryCount < 2) {
            console.log(`Payment not found, retrying in 2 seconds... (${retryCount + 1}/3)`);
            setTimeout(() => {
              checkPreorderStatus(retryCount + 1);
            }, 2000);
          } else if (hasPaid) {
            console.log('Payment confirmed! UI should update now.');
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          // Retry on error if we haven't reached max retries
          if (retryCount < 2) {
            console.log(`Error occurred, retrying in 2 seconds... (${retryCount + 1}/3)`);
            setTimeout(() => {
              checkPreorderStatus(retryCount + 1);
            }, 2000);
          }
        }
      } else {
        setHasPreordered(false);
      }
    };
    checkPreorderStatus();
    
    // Also check payment status periodically (every 30 seconds)
    const paymentCheckInterval = setInterval(() => {
      if (user && !hasPreordered) {
        console.log('Periodic payment status check...');
        checkPreorderStatus();
      }
    }, 30000);

    // Check payment status when user returns to the page (e.g., from payment page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user && !hasPreordered) {
        console.log('Page became visible, checking payment status...');
        checkPreorderStatus();
      }
    };

    const handleFocus = () => {
      if (user && !hasPreordered) {
        console.log('Window focused, checking payment status...');
        checkPreorderStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(paymentCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, hasPreordered]);

  // Hide memories text on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 0) {
        setShowMemoriesText(false);
      } else {
        setShowMemoriesText(true);
      }
    };

    const handleWheel = () => {
      setShowMemoriesText(false);
    };

    // Mobile touch events
    const handleTouchStart = () => {
      setShowMemoriesText(false);
    };

    const handleTouchMove = () => {
      setShowMemoriesText(false);
    };

    // Only add scroll listener if user has preordered
    if (hasPreordered) {
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('wheel', handleWheel, { passive: true });
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [hasPreordered]);

  // Listen for auth state changes (Google OAuth redirect)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', { event, session });
        console.log('Session user:', session?.user);
        console.log('Session data:', session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully:', session.user);
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || ''
          };
          
          // Store user data
          try {
            await storeUserData(user);
            console.log('User data stored successfully');
          } catch (error) {
            console.error('Failed to store user data:', error);
          }
          
          // Just close the popup, don't redirect to payment yet
          setShowAuthPopup(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out via auth state change');
          console.log('Clearing user state from auth listener...');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = (newUser: User) => {
    setUser(newUser);
    setShowAuthPopup(false);
  };

  const handleSignOut = async () => {
    try {
      console.log('Signing out user...');
      
      // Clear user state immediately for better UX
      setUser(null);
      
      // Clear cached user
      localStorage.removeItem('cachedUser');
      
      // Try Supabase sign out (but don't wait for it)
      supabase.auth.signOut().catch(error => {
        console.error('Supabase sign out error:', error);
        // Don't throw error, just log it
      });
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      // Ensure user state is cleared even if there's an error
      setUser(null);
      localStorage.removeItem('cachedUser');
    }
  };


  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check localStorage for cached user
        const cachedUser = localStorage.getItem('cachedUser');
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            console.log('Found cached user:', userData);
            setUser(userData);
            return; // Use cached user immediately
          } catch (error) {
            console.error('Error parsing cached user:', error);
            localStorage.removeItem('cachedUser');
          }
        }

        // If no cached user, check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Session found on mount:', session.user);
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User'
          };
          setUser(userData);
          // Cache the user data
          localStorage.setItem('cachedUser', JSON.stringify(userData));
        } else {
          // No Supabase session found, user is not logged in
          console.log('No Supabase session found on mount');
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        // Session check complete
      }
    };

    // Removed unused checkInitialPaymentStatus function

    checkSession();
    
    // Also check session when page becomes visible (returning from payment)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, checking session...');
        checkSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also check session when window regains focus (returning from payment)
    const handleFocus = () => {
      console.log('Window gained focus, checking session...');
      checkSession();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Store user in our database
            const { data: dbUser, error } = await supabase
              .rpc('get_or_create_user', {
                auth_user_id: session.user.id,
                user_email: session.user.email || '',
                user_name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
                user_provider: session.user.app_metadata?.provider || 'email',
                user_avatar_url: session.user.user_metadata?.avatar_url || null
              });

            if (error) {
              console.error('Error storing user in database:', error);
            } else {
              console.log('User stored/retrieved from database:', dbUser);
            }

            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User'
            };
            setUser(userData);
            // Cache the user data
            localStorage.setItem('cachedUser', JSON.stringify(userData));
          } catch (error) {
            console.error('Error in auth state change:', error);
            // Still set user even if database storage fails
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User'
            };
            setUser(userData);
            // Cache the user data
            localStorage.setItem('cachedUser', JSON.stringify(userData));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          // Clear cached user
          localStorage.removeItem('cachedUser');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Parallax state
  const [parallaxProgress, setParallaxProgress] = useState(0); // 0 -> 1 across designed scroll range
  const [freeMode] = useState(false); // when true, allow full globe interaction
  const iframeRef = useRef<HTMLIFrameElement|null>(null);
  // Removed firstReady logic - step system handles all timing
  const [viewportH, setViewportH] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  
  // Step scroll state
  const [currentStep, setCurrentStep] = useState(0);
  const scrollTimeoutRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);
  
  // Horizontal scroll state for globe interaction
  const [globeRotation, setGlobeRotation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Step scroll system - 5 distinct steps (0-4)
  const totalSteps = 5;
  const stepHeight = viewportH;
  
  // Step system working correctly
  
  // Initialize scroll position on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setCurrentStep(0);
    setParallaxProgress(0);
  }, []);

  // Update scroll position when currentStep changes (for TypeScript)
  useEffect(() => {
    // This effect ensures currentStep is "used" to satisfy TypeScript
    // The actual scroll handling is done in the wheel event handler
  }, [currentStep]);

  useEffect(() => {
    const handleStepScroll = (e: WheelEvent) => {
      // Prevent default scroll behavior
      e.preventDefault();
      
      // Add debouncing to prevent rapid scrolling
      if (isScrollingRef.current) return;
      
      isScrollingRef.current = true;
      
      // Get current step from state at the time of the event
      setCurrentStep(currentStep => {
        if (e.deltaY > 0 && currentStep < totalSteps - 1) {
          // Scroll down to next step
          const nextStep = currentStep + 1;
          setParallaxProgress(nextStep / (totalSteps - 1));
          
          window.scrollTo({
            top: nextStep * stepHeight,
            behavior: 'smooth'
          });
          
          return nextStep;
        } else if (e.deltaY < 0 && currentStep > 0) {
          // Scroll up to previous step
          const prevStep = currentStep - 1;
          setParallaxProgress(prevStep / (totalSteps - 1));
          
          window.scrollTo({
            top: prevStep * stepHeight,
            behavior: 'smooth'
          });
          
          return prevStep;
        }
        return currentStep;
      });
      
      // Reset scrolling state after animation completes
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);
    };
    
    window.addEventListener('wheel', handleStepScroll, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleStepScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [viewportH, totalSteps, stepHeight]);

  // Mobile touch step scroll handler - enhanced
  useEffect(() => {
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchStartX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default to avoid page scrolling
      e.preventDefault();
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndTime = Date.now();
      const deltaY = touchStartY - touchEndY;
      const deltaX = touchStartX - touchEndX;
      const deltaTime = touchEndTime - touchStartTime;
      
      // Check if it's primarily vertical movement
      if (Math.abs(deltaY) > Math.abs(deltaX) && deltaTime < 1000 && Math.abs(deltaY) > 20) {
        if (isScrollingRef.current) return;
        
        isScrollingRef.current = true;
        
        setCurrentStep(currentStep => {
          if (deltaY > 0 && currentStep < totalSteps - 1) {
            // Swipe up (scroll down)
            const nextStep = currentStep + 1;
            setParallaxProgress(nextStep / (totalSteps - 1));
            window.scrollTo({
              top: nextStep * stepHeight,
              behavior: 'smooth'
            });
            return nextStep;
          } else if (deltaY < 0 && currentStep > 0) {
            // Swipe down (scroll up)
            const prevStep = currentStep - 1;
            setParallaxProgress(prevStep / (totalSteps - 1));
            window.scrollTo({
              top: prevStep * stepHeight,
              behavior: 'smooth'
            });
            return prevStep;
          }
          return currentStep;
        });
        
        // Reset scrolling state after animation completes
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = window.setTimeout(() => {
          isScrollingRef.current = false;
        }, 600);
      }
    };
    
    // Add touch events to document for better capture
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [viewportH, totalSteps, stepHeight]);

  // Smooth horizontal scroll detection for globe interaction
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let isDragging = false;
    let animationFrame: number | null = null;
    let rotationAccumulator = 0;

    const handleWheel = (e: WheelEvent) => {
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      
      // Only handle horizontal scrolling if we're not in the middle of step scrolling
      if (isHorizontal) {
        e.preventDefault();
        
        // Accumulate rotation for smooth movement
        rotationAccumulator += e.deltaX * 0.5;
        
        // Update rotation smoothly
        setGlobeRotation(prev => ({
          lat: prev.lat,
          lng: prev.lng + e.deltaX * 0.5
        }));

        // Clear any existing timeout
        if (animationFrame) clearTimeout(animationFrame);
        animationFrame = window.setTimeout(() => {
          // Rotation timeout - no state update needed
        }, 200);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        isDragging = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - lastX;
        const deltaY = currentY - lastY;
        
        // Check if it's primarily horizontal movement
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
          e.preventDefault();
          isDragging = true;
          
          // Smooth rotation based on touch movement
          const rotationDelta = deltaX * 0.3;
          setGlobeRotation(prev => ({
            lat: prev.lat,
            lng: prev.lng + rotationDelta
          }));
          
          lastX = currentX;
          lastY = currentY;
        }
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        if (animationFrame) clearTimeout(animationFrame);
        animationFrame = window.setTimeout(() => {
          // Touch end timeout - no state update needed
        }, 200);
      }
    };

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (animationFrame) clearTimeout(animationFrame);
    };
  }, []);

  // Communicate rotation data to embedded globe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'GLOBE_ROTATION',
          rotation: globeRotation
        }, '*');
      } catch (error) {
        // Silently handle cross-origin issues
      }
    }
  }, [globeRotation]);

  // Remove firstReady logic - step system handles all timing

  // (controls logic removed when using embedded satellites example)

  // Scales: base 1 -> max ~3.0, then gently back to ~2.4 as it exits
  const MAX_SCALE = 3.0;
  const EXIT_SCALE = 2.4;
  const calcScale = (p: number) => {
    if (p <= 0.25) {
      const t = p / 0.25; // 0..1
      return 1 + t * (MAX_SCALE - 1); // 1 -> MAX_SCALE
    } else if (p <= 0.7) {
      const t = (p - 0.25) / 0.45; // 0..1
      return MAX_SCALE - t * (MAX_SCALE - EXIT_SCALE); // MAX -> EXIT_SCALE
    }
    return EXIT_SCALE;
  };

  const globeTransform = () => {
    const p = parallaxProgress;
    const scale = calcScale(p);
    
    let translateY = 0;
    if (p <= 0.25) {
      translateY = 0;
    } else if (p <= 0.7) {
      const t = (p - 0.25) / 0.45;
      translateY = -t * (viewportH * 1.2);
          } else {
      translateY = -viewportH * 1.2;
    }
    
    return `translateY(${translateY}px) scale(${scale})`;
  };

  // Stage triggers based on scroll progress directly to ensure late stages are reachable
  const currentScale = calcScale(parallaxProgress);
  const zoomThreshold = 1.5; // start text when zoomed-in notably
  // Use parallaxProgress as the stage driver for text sequence (0..1)
  const stageBase = parallaxProgress;
  // All texts now use smoothBox timing for strict sequential rendering
  // No latching needed - each text appears and disappears based on its window timing

  // Crossfade helper to show only one message at a time as we scroll
  // Non-overlapping smooth box window so only one message is visible at a time
  const smoothBox = (start: number, end: number, fade = 0.04, stayVisible = false) => {
    // Ensure non-overlap by using distinct [start,end] per message
    const a = start;
    const b = start + fade;
    const c = end - fade;
    const d = end;
    
    // Special case for elements that should stay visible once shown
    if (stayVisible && stageBase >= a) return 1;
    
    if (stageBase <= a || stageBase >= d) return 0;
    if (stageBase < b) return (stageBase - a) / (b - a);
    if (stageBase > c) return (d - stageBase) / (d - c);
    return 1;
  };

  // Define step-based windows (each step gets its own section)
  const W1: [number, number] = [0.2, 0.4]; // Step 1: 400 million terabytes
  const W2: [number, number] = [0.4, 0.6]; // Step 2: Receipt popup
  const W3: [number, number] = [0.6, 0.8]; // Step 3: They can delete account
  const W4: [number, number] = [0.8, 1.0]; // Step 4: Combined section (all stay visible)
  
  // Step system working correctly

  // Mobile gesture routing: vertical swipes scroll page; horizontal/diagonal drags control globe
  const [allowGlobeTouch, setAllowGlobeTouch] = useState(false);
  const touchStartRef = useRef<{x:number;y:number}|null>(null);
  const decisionMadeRef = useRef(false);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    decisionMadeRef.current = false;
    setAllowGlobeTouch(false);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || decisionMadeRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const threshold = 8;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
    decisionMadeRef.current = true;
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal intent → pass through to globe iframe
      setAllowGlobeTouch(true);
        } else {
      // Vertical intent → handle step scrolling
      setAllowGlobeTouch(false);
      e.preventDefault(); // Prevent default scroll
      
      if (isScrollingRef.current) return;
      
      isScrollingRef.current = true;
      
      setCurrentStep(currentStep => {
        if (dy > 30 && currentStep < totalSteps - 1) {
          // Swipe down
          const nextStep = currentStep + 1;
          setParallaxProgress(nextStep / (totalSteps - 1));
          
          window.scrollTo({
            top: nextStep * stepHeight,
            behavior: 'smooth'
          });
          return nextStep;
        } else if (dy < -30 && currentStep > 0) {
          // Swipe up
          const prevStep = currentStep - 1;
          setParallaxProgress(prevStep / (totalSteps - 1));
          
          window.scrollTo({
            top: prevStep * stepHeight,
            behavior: 'smooth'
          });
          return prevStep;
        }
        return currentStep;
      });
      
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);
    }
  };
  const onTouchEnd = () => {
    touchStartRef.current = null;
    decisionMadeRef.current = false;
    setAllowGlobeTouch(false);
  };

  // Billing follows same appear/disappear logic shape as headline (no latching)

  // Smooth fade-out for globe around threshold instead of abrupt hide
  const FADE_START = zoomThreshold;           // begin fading at threshold
  const FADE_END = zoomThreshold + 0.35;      // longer fade window
  const MIN_OPACITY = 0.25;                   // keep globe slightly visible
  const globeOpacity = (() => {
    if (currentScale <= FADE_START) return 1;
    if (currentScale >= FADE_END) return MIN_OPACITY;
    const t = (currentScale - FADE_START) / (FADE_END - FADE_START);
    return 1 - t * (1 - MIN_OPACITY);
  })();

  // Emit-arc behavior adapted from globe.gl example
  // (emit arcs removed)
  
  // Ensure full text is always shown after a certain time or scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typewriterText.length < fullText.length) {
        setTypewriterText(fullText);
      }
    }, 3000); // Show full text after 3 seconds regardless of scroll

    return () => clearTimeout(timer);
  }, [typewriterText.length, fullText]);

  // (no custom position updater)

  // Manual sync removed


  // Extra scroll handlers removed

  // (explore handlers removed)

  // (Old R3F node click handler removed)

  // (old next/prev handlers removed)

  // (old next/prev handlers removed)


  return (
    <div
      className="relative w-full cursor-none sm:cursor-none"
      style={{
        height: `${viewportH * totalSteps}px`, // exact height for step scrolling
        touchAction: 'auto',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        willChange: 'scroll-position'
      }}
    >
      {/* Globe.gl implementation (replacing previous Canvas-based globe) */}
      <div
        className="fixed top-0 left-0 w-full h-screen"
        style={{
          // Allow page to handle vertical swipes (pan-y); gesture overlay below decides when to enable globe interaction
          pointerEvents: globeOpacity > 0.05 ? 'auto' : 'none',
          touchAction: 'pan-y',
          transform: globeTransform(),
          transformOrigin: 'center center',
          transition: 'transform 300ms ease-out, opacity 300ms ease-out',
          opacity: globeOpacity,
          visibility: globeOpacity < 0.01 ? 'hidden' : 'visible'
        }}
      >
        <iframe
          title="Satellites Globe"
          src={hasPreordered ? "https://globe.gl/example/earth-shield/" : "/satellites/index.html"}
          ref={iframeRef}
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none', 
            position: 'absolute', 
            inset: 0, 
            zIndex: 1, 
            pointerEvents: (allowGlobeTouch || freeMode) ? 'auto' : 'none'
          }}
          allowFullScreen
        />
        {/* Starry background overlay to restyle the embedded globe's backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('//unpkg.com/three-globe/example/img/night-sky.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.6,
            mixBlendMode: 'screen',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />
        
        {/* Gesture router: detects intent; lets horizontal/diagonal drags reach the globe, vertical drags scroll page */}
        {!freeMode && (
          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ 
              position: 'absolute', 
              inset: 0, 
              zIndex: 3, 
              background: 'transparent', 
              // Allow clicks to pass through to buttons
              pointerEvents: 'none'
            }}
          />
        )}
        {/* No extra overlays needed; timer removed in self-hosted page */}
        {/* Removed bottom-right mask */}
      </div>

      {/* Parallax overlay: messages crossfade one at a time */}
      <div className="fixed top-0 left-0 w-full h-screen pointer-events-none z-10 flex items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center px-4">
          {/* Step 1: 400 million terabytes */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: smoothBox(W1[0], W1[1]), y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-white text-2xl sm:text-3xl md:text-5xl font-black text-center max-w-[90%] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] absolute"
          >
            400 million terabytes created today. You own none of it.
          </motion.div>

          {/* Step 2: Receipt popup - positioned differently */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: smoothBox(W2[0], W2[1]), y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full flex justify-center"
            style={{ position: 'relative', top: '0px' }}
          >
            <BillingReceipt opacity={smoothBox(W2[0], W2[1])} />
          </motion.div>

          {/* Step 3: They can delete account */}
            <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: smoothBox(W3[0], W3[1]), y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-white text-xl sm:text-2xl md:text-3xl font-black text-center max-w-[90%] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] absolute"
          >
            They can delete your account tomorrow. Raise prices next month. Disappear forever.
            </motion.div>

          {/* Step 4: Combined section - All three elements together */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: smoothBox(W4[0], W4[1], 0.04, true), 
              y: 0, 
              scale: 1
            }}
            transition={{ 
              duration: 0.4, 
              ease: 'easeOut'
            }}
            className="absolute flex flex-col items-center gap-6"
          >
            {/* First text: Your photos your files your hardware , own everything you rent. */}
            <div className="text-white text-lg sm:text-xl md:text-2xl font-semibold text-center max-w-[90%] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Your photos, your files, your hardware , own everything you rent.
          </div>

            {/* OWN YOUR MEMORY text */}
            <div
              className="text-2xl sm:text-3xl md:text-4xl font-black text-center tracking-wider max-w-[90%] px-4 relative"
            style={{ 
                color: '#7AF6D8',
                textShadow: '0 0 8px rgba(122, 246, 216, 0.6)',
                filter: 'none'
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'easeInOut'
                }}
            style={{ 
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  transform: 'skewX(-20deg)',
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none' // Allow clicks to pass through
                }}
              />
              <span className="relative z-10">OWN YOUR MEMORY</span>
            </div>

            {/* Preorder button */}
            <GlassyButton 
              user={user} 
              onAuthRequired={handleAuthRequired}
              hasPreordered={hasPreordered}
            />
            </motion.div>
        </div>
      </div>
      {/* Removed mobile stacked flow; unified parallax across devices */}

      {/* Content sections removed */}

      {/* Typewriter and preorder UI removed */}


      {/* OWN YOUR MEMORIES Message - Only show if user has preordered */}
      {hasPreordered && (
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: showMemoriesText ? 1 : 0,
            y: showMemoriesText ? 0 : -20
          }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            style={{
              textShadow: '0 0 20px rgba(122, 246, 216, 0.5)',
              background: 'linear-gradient(135deg, #7AF6D8, #00D4AA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            animate={{
              textShadow: [
                '0 0 20px rgba(122, 246, 216, 0.5)',
                '0 0 30px rgba(122, 246, 216, 0.8)',
                '0 0 20px rgba(122, 246, 216, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            We received your request to OWN YOUR MEMORIES
          </motion.h1>
        </motion.div>
      )}

      {/* Header with Logo, User Account, and Preorder Button */}
      <Header 
        user={user} 
        onAuthRequired={handleAuthRequired}
        onSignOut={handleSignOut}
        hasPreordered={hasPreordered}
      />

      {/* Custom Mouse Cursor */}
      <CustomCursor />

      {/* Always-visible bottom bar with T&C/Privacy */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-16px)] sm:w-auto flex items-center gap-4 justify-center pointer-events-auto">
              <a
                href="/4bits Terms and Conditions.pdf"
                target="_blank"
                rel="noopener noreferrer"
          className="text-white/70 hover:text-white transition-colors underline text-xs sm:text-sm"
              >
          Terms & Conditions
              </a>
              <a
                href="/4bits Privacy Policy.pdf"
                target="_blank"
                rel="noopener noreferrer"
          className="text-white/70 hover:text-white transition-colors underline text-xs sm:text-sm"
              >
                Privacy Policy
              </a>
            </div>

      {/* Authentication Popup */}
      <AuthPopup 
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Enjoy Freedom button removed per request */}
        </div>
  );
}

export default InteractiveEarthWebsite;

function BillingReceipt({ opacity }: { opacity: number }) {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [years, setYears] = useState(20); // service duration in years

  const pricePerMonth = currency === 'INR' ? 650 : 10; // per spec (monthly)
  const total = pricePerMonth * 12 * years; // yearly calc

  const fmt = (v: number) => currency === 'INR'
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v)
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);

  return (
    <div
      className="pointer-events-auto w-[92%] sm:w-[80%] md:w-[640px]"
      style={{ opacity }}
    >
      <div
        className="relative mx-auto rounded-2xl border border-white/10 bg-[rgba(10,12,20,0.85)] backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)] px-6 py-4 sm:px-8 sm:py-6"
        style={{ transform: `translateZ(0)` }}
      >
        <div className="text-center text-white/90 font-mono text-sm tracking-widest mb-4">
          —— CLOUD STORAGE RECEIPT ——
            </div>
        <div className="h-px w-full bg-white/10" />

        <div className="mt-4 grid grid-cols-2 gap-2 text-[13px] text-white/80 font-mono">
          <div>Service Duration:</div>
          <div className="text-right"><span className="text-white">{years}</span> years</div>
          <div>Monthly Payment:</div>
          <div className="text-right">{fmt(pricePerMonth)}</div>
        </div>

        <div className="my-4 h-px w-full bg-white/10" />
        <div className="grid grid-cols-2 gap-2 text-[14px] font-mono">
          <div className="text-white/80 tracking-wide">TOTAL PAID:</div>
          <div className="text-right text-[#ff6666] font-bold">{fmt(total)}</div>
      </div>

        <div className="my-4 h-px w-full bg-white/10" />
        <div className="grid grid-cols-2 gap-2 font-mono text-[13px]">
          <div className="text-white/70">YOUR OWNERSHIP:</div>
          <div className="text-right text-white">{fmt(0)}</div>
          <div className="text-white/70">THEIR OWNERSHIP:</div>
          <div className="text-right text-[#ff6b6b] font-extrabold">EVERYTHING</div>
        </div>

        <div className="mt-6 text-center text-white/60 text-[12px] font-mono">
          Thank you for renting your memories from us
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between gap-3 text-white/80 text-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1 rounded-md border ${currency === 'INR' ? 'bg-white/15 border-white/30 text-white' : 'border-white/10 text-white/70 hover:bg-white/10'}`}
            >INR</button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-md border ${currency === 'USD' ? 'bg-white/15 border-white/30 text-white' : 'border-white/10 text-white/70 hover:bg-white/10'}`}
            >USD</button>
          </div>
          <div className="font-mono text-white/80">Adjust duration</div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-white/60 text-xs font-mono">1 year</span>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={years}
            onChange={(e) => setYears(parseInt(e.target.value))}
            className="flex-1 accent-[#7AF6D8] h-2 rounded-lg bg-white/10"
          />
          <span className="text-white/60 text-xs font-mono">50 years</span>
        </div>
        <div className="mt-2 text-right text-white/80 text-sm font-mono">
          {years} years
        </div>

      </div>
    </div>
  );
}
