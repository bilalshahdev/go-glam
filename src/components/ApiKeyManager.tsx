import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key, Save, Check, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ApiKey {
  name: string;
  displayName: string;
  isSet: boolean;
}

export const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyValue, setKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-api-keys', {
        body: { action: 'get' }
      });

      if (error) throw error;
      setApiKeys(data.keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const validateApiKey = async (keyName: string, value: string) => {
    setValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-api-keys', {
        body: { action: 'validate', keyName, keyValue: value }
      });

      if (error) throw error;
      
      if (data.isValid) {
        toast.success(`${keyName.replace(/_/g, ' ')} is valid!`);
        return true;
      } else {
        toast.error(data.errorMessage || 'Invalid API key');
        return false;
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      toast.error('Failed to validate API key');
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleEditKey = (keyName: string) => {
    setEditingKey(keyName);
    setKeyValue("");
    setShowKey(false);
  };

  const handleSaveKey = async () => {
    if (!editingKey || !keyValue.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    const isValid = await validateApiKey(editingKey, keyValue);
    if (isValid) {
      toast.success(`${editingKey.replace(/_/g, ' ')} saved! Please add it to your Supabase secrets.`);
      setEditingKey(null);
      setKeyValue("");
      loadApiKeys();
    }
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setKeyValue("");
    setShowKey(false);
  };

  const getKeyDescription = (keyName: string) => {
    switch (keyName) {
      case 'OPENAI_API_KEY':
        return 'Required for AI-powered try-on features and chat functionality';
      case 'GEMINI_API_KEY':
        return 'Google Gemini AI for advanced image analysis and recommendations';
      case 'REPLICATE_API_KEY':
        return 'Premium AI models for high-quality virtual try-on results';
      case 'HUGGINGFACE_API_KEY':
        return 'Free AI models for basic try-on functionality';
      default:
        return 'API key for external services';
    }
  };

  const getKeyLink = (keyName: string) => {
    switch (keyName) {
      case 'OPENAI_API_KEY':
        return 'https://platform.openai.com/api-keys';
      case 'GEMINI_API_KEY':
        return 'https://makersuite.google.com/app/apikey';
      case 'REPLICATE_API_KEY':
        return 'https://replicate.com/account/api-tokens';
      case 'HUGGINGFACE_API_KEY':
        return 'https://huggingface.co/settings/tokens';
      default:
        return '#';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">API Key Management</h2>
        <p className="text-gray-600">
          Manage your API keys for various AI services. Keys are stored securely in Supabase.
        </p>
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Good News!</p>
              <p>
                The app now includes a local virtual try-on feature that works without any API keys. 
                You can use it immediately for basic makeup and hair effects!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {apiKeys.map((key) => (
          <Card key={key.name} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold">{key.displayName}</h3>
                  {key.isSet ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {getKeyDescription(key.name)}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Status: </span>
                  <span className={key.isSet ? 'text-green-600' : 'text-red-600'}>
                    {key.isSet ? 'Configured' : 'Not configured'}
                  </span>
                </div>

                {editingKey === key.name && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor={`key-${key.name}`}>API Key</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id={`key-${key.name}`}
                            type={showKey ? "text" : "password"}
                            value={keyValue}
                            onChange={(e) => setKeyValue(e.target.value)}
                            placeholder="Enter your API key..."
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={() => setShowKey(!showKey)}
                          >
                            {showKey ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveKey}
                        disabled={validating || !keyValue.trim()}
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {validating ? 'Validating...' : 'Save & Validate'}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Important:</p>
                        <p>After validation, you'll need to add this key to your Supabase project secrets manually.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {editingKey !== key.name && (
                  <Button
                    onClick={() => handleEditKey(key.name)}
                    variant="outline"
                    size="sm"
                  >
                    {key.isSet ? 'Update' : 'Add'} Key
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a 
                    href={getKeyLink(key.name)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Get API Key
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Security Notice:</p>
            <p>
              API keys are validated here but must be manually added to your Supabase project secrets 
              for the application to use them. This ensures maximum security for your sensitive credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
