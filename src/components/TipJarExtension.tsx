import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, CreditCard } from 'lucide-react';

interface TipJarExtensionProps {
  sessionId: string;
  remainingMinutes: number;
  onExtensionComplete: () => void;
}

export const TipJarExtension = ({ 
  sessionId, 
  remainingMinutes,
  onExtensionComplete 
}: TipJarExtensionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExtension = async (minutes: number, amount: number) => {
    setIsProcessing(true);
    
    try {
      // TODO: When Stripe is enabled, add Stripe payment flow here
      // For now, this is a placeholder structure
      
      const { data, error } = await supabase.functions.invoke('extend-tip-jar-session', {
        body: {
          sessionId,
          additionalMinutes: minutes,
          paymentId: 'pending_stripe_integration' // Will be real payment ID from Stripe
        }
      });

      if (error) throw error;

      toast.success(`Added ${minutes} minutes to your session!`);
      onExtensionComplete();
    } catch (error) {
      console.error('Extension error:', error);
      toast.error('Failed to extend session. Stripe not yet configured.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (remainingMinutes > 5) return null;

  return (
    <Card className="p-4 mb-4 bg-secondary/20 border-secondary">
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-secondary mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            {remainingMinutes <= 1 ? 'Time Almost Up!' : 'Running Low on Time'}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {remainingMinutes <= 1 
              ? 'Your chat session is about to expire. Extend now to keep chatting!'
              : `Only ${remainingMinutes} minutes left. Add more time to continue your conversation.`
            }
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExtension(5, 5)}
              disabled={isProcessing}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              5 min - $5
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExtension(15, 10)}
              disabled={isProcessing}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              15 min - $10
            </Button>
            <Button
              size="sm"
              onClick={() => handleExtension(30, 15)}
              disabled={isProcessing}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              30 min - $15
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            💡 Payments will be processed when Stripe is enabled
          </p>
        </div>
      </div>
    </Card>
  );
};
