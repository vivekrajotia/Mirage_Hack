'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Key, Settings, Check, X, AlertCircle, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ApiKeyManagerProps {
  className?: string;
}

const API_KEY_STORAGE_KEY = 'tradevision_custom_gemini_api_key';
const PASSWORD_AUTH_KEY = 'tradevision_api_key_auth';
const REQUIRED_PASSWORD = 'Vivek@123';

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Check password authentication status on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem(PASSWORD_AUTH_KEY);
    if (authStatus === 'authenticated') {
      setIsPasswordAuthenticated(true);
    }

    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedKey) {
      setCustomKey(savedKey);
      setHasCustomKey(true);
    }
  }, []);

  // Handle password verification
  const handlePasswordSubmit = () => {
    if (password === REQUIRED_PASSWORD) {
      setIsPasswordAuthenticated(true);
      localStorage.setItem(PASSWORD_AUTH_KEY, 'authenticated');
      setPasswordError('');
      setPassword('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  // Handle password input key press
  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  // Save custom key to localStorage
  const handleSaveKey = async () => {
    if (!customKey.trim()) {
      setValidationMessage('Please enter a valid API key');
      return;
    }

    // Basic API key format validation for Gemini
    if (!customKey.startsWith('AIza') || customKey.length < 30) {
      setValidationMessage('Invalid Gemini API key format. Keys should start with "AIza" and be at least 30 characters long.');
      return;
    }

    setIsValidating(true);
    setValidationMessage('');

    try {
      // Test the API key with a simple request
      const testResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${customKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (testResponse.ok) {
        localStorage.setItem(API_KEY_STORAGE_KEY, customKey);
        setHasCustomKey(true);
        setValidationMessage('✓ API key validated and saved successfully!');
        
        // Close dialog after a short delay to show success message
        setTimeout(() => {
          setIsOpen(false);
          setValidationMessage('');
        }, 1500);
      } else {
        setValidationMessage('Invalid API key. Please check your key and try again.');
      }
    } catch (error) {
      setValidationMessage('Failed to validate API key. Please check your internet connection and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Clear custom key and revert to default
  const handleClearKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setCustomKey('');
    setHasCustomKey(false);
    setValidationMessage('✓ Custom key cleared. Using default API key.');
    
    // Close dialog after showing success message
    setTimeout(() => {
      setIsOpen(false);
      setValidationMessage('');
    }, 1500);
  };

  // Handle dialog open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setValidationMessage('');
      setShowKey(false);
      setPasswordError('');
      setPassword('');
      setShowPassword(false);
      // Don't reset authentication status when closing dialog
    }
  };

  // Mask the API key for display
  const getMaskedKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '*'.repeat(Math.max(0, key.length - 12)) + key.substring(key.length - 4);
  };

  // Render password authentication step
  const renderPasswordAuthentication = () => (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          Authentication Required
        </DialogTitle>
        <DialogDescription>
          Please enter the required password to access Gemini API Key Management.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handlePasswordKeyPress}
              className="pr-10"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-slate-400" />
              ) : (
                <Eye className="h-4 w-4 text-slate-400" />
              )}
            </Button>
          </div>
        </div>

        {passwordError && (
          <div className="p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
            {passwordError}
          </div>
        )}

        <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Lock className="h-4 w-4" />
            <span>This password protects access to API key management settings.</span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <div className="flex gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handlePasswordSubmit}
            disabled={!password.trim()}
            className="flex-1"
          >
            Authenticate
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );

  // Render API key management step
  const renderApiKeyManagement = () => (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Gemini API Key Management
        </DialogTitle>
        <DialogDescription>
          Set your own Gemini API key for AI insights. Your key is stored locally and used for all AI operations.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Current Status */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Current Status
            </span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {hasCustomKey ? (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Using custom API key: {getMaskedKey(customKey)}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                Using default API key
              </div>
            )}
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <Label htmlFor="apikey">Gemini API Key</Label>
          <div className="relative">
            <Input
              id="apikey"
              type={showKey ? 'text' : 'password'}
              placeholder="Enter your Gemini API key (AIza...)"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? (
                <EyeOff className="h-4 w-4 text-slate-400" />
              ) : (
                <Eye className="h-4 w-4 text-slate-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Validation Message */}
        {validationMessage && (
          <div
            className={`p-3 rounded-md text-sm ${
              validationMessage.startsWith('✓')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {validationMessage}
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>• Get your free Gemini API key from Google AI Studio</p>
          <p>• Your key is stored locally in your browser</p>
          <p>• Clear the key anytime to revert to the default</p>
        </div>
      </div>

      <DialogFooter>
        {hasCustomKey && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleClearKey}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Custom Key
          </Button>
        )}
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveKey}
            disabled={isValidating || !customKey.trim()}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isValidating ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Validating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Key
              </>
            )}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className={className}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 flex-shrink-0 ${
                  hasCustomKey
                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-700 hover:from-green-500/20 hover:to-emerald-500/20'
                    : 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-700 hover:from-blue-500/20 hover:to-indigo-500/20'
                }`}
              >
                <Key className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">API Key</span>
                {hasCustomKey && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs bg-green-100 text-green-700">
                    Custom
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {hasCustomKey
                  ? 'Manage your custom Gemini API key'
                  : 'Set a custom Gemini API key for AI insights'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </DialogTrigger>

      {/* Conditionally render password authentication or API key management */}
      {!isPasswordAuthenticated ? renderPasswordAuthentication() : renderApiKeyManagement()}
    </Dialog>
  );
};

// Utility functions for other components to use
export const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (customKey) {
      return customKey;
    }
  }
  // Return default key if no custom key is found
  return 'AIzaSyCGBg0bHeMOuSdi383Ge3oHDI1dV9kI7X0';
};

export const hasCustomApiKey = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem(API_KEY_STORAGE_KEY);
  }
  return false;
};

export default ApiKeyManager; 