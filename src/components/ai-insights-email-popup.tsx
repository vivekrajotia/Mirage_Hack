'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Mail, Send, Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AIInsightsEmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: (email: string) => Promise<boolean>;
  isLoading?: boolean;
  defaultEmail?: string;
}

export const AIInsightsEmailPopup: React.FC<AIInsightsEmailPopupProps> = ({
  isOpen,
  onClose,
  onSendEmail,
  isLoading = false,
  defaultEmail = 'subhamnaskar671@gmail.com'
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset state when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail);
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, defaultEmail]);

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    setStatus('sending');
    setErrorMessage('');

    try {
      const success = await onSendEmail(email);
      if (success) {
        setStatus('success');
        // Close popup after success animation
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage('Failed to send insights. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      onClose();
    }
  };

  const isValidEmail = email && email.includes('@') && email.includes('.');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
              {status === 'success' ? (
                <CheckCircle className="w-8 h-8 text-white animate-bounce" />
              ) : status === 'error' ? (
                <AlertCircle className="w-8 h-8 text-white animate-pulse" />
              ) : (
                <Mail className="w-8 h-8 text-white" />
              )}
            </div>
            
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {status === 'success' ? 'Insights Sent!' : 'Send AI Insights via Email'}
            </DialogTitle>
            
            <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
              {status === 'success' 
                ? 'Your AI-generated insights have been sent successfully!' 
                : 'Enter your email address to receive personalized AI insights about your trading data'}
            </DialogDescription>
          </DialogHeader>

          {status !== 'success' && (
            <div className="space-y-6">
              {/* Email Input Section */}
              <Card className="border-0 shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Email Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Recipient Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className={`pr-10 transition-all duration-300 ${
                          isValidEmail 
                            ? 'border-green-300 focus:border-green-500 focus:ring-green-200' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        disabled={isSending}
                      />
                      {isValidEmail && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500 animate-fade-in" />
                      )}
                    </div>
                    {errorMessage && (
                      <p className="text-sm text-red-500 flex items-center gap-1 animate-shake">
                        <AlertCircle className="w-4 h-4" />
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  {/* Preview Section */}
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200">
                        Preview
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Your AI insights will include:
                    </p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1 ml-4">
                      <li>• Trading performance analysis</li>
                      <li>• Market trend insights</li>
                      <li>• Risk assessment recommendations</li>
                      <li>• Actionable trading suggestions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSending}
                  className="flex-1 transition-all duration-300 hover:shadow-md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isSending || !isValidEmail}
                  className={`flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                    isSending ? 'animate-pulse' : ''
                  }`}
                >
                  {isSending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Insights...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send AI Insights
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2">
                Successfully Sent!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your AI insights have been delivered to <br />
                <span className="font-semibold text-blue-600 dark:text-blue-400">{email}</span>
              </p>
              <div className="mt-6">
                <Button
                  onClick={handleClose}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </Dialog>
  );
}; 