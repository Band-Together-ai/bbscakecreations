import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Gift, Mail, Trash2, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const EarlyBirdTab = () => {
  const [emails, setEmails] = useState("");
  const [notes, setNotes] = useState("Early Bird Beta Tester - Lifetime Access");
  const [promoUsers, setPromoUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPromoUsers();
  }, []);

  const fetchPromoUsers = async () => {
    const { data, error } = await supabase
      .from("promo_users")
      .select(`
        *,
        profiles!inner(email)
      `)
      .order("granted_at", { ascending: false });

    if (error) {
      console.error("Error fetching promo users:", error);
      return;
    }

    setPromoUsers(data || []);
  };

  const handleGrantAccess = async () => {
    if (!emails.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }

    setLoading(true);

    // Parse emails (comma-separated or newline-separated)
    const emailList = emails
      .split(/[\n,]/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes("@"));

    if (emailList.length === 0) {
      toast.error("No valid email addresses found");
      setLoading(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let inviteCount = 0;

    for (const email of emailList) {
      try {
        // First, check if user exists by email
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (profileError || !profiles) {
          // User doesn't exist - create invite
          console.log(`User not found for email: ${email}, creating invite...`);
          
          const { error: inviteError } = await supabase.functions.invoke(
            "invite-user",
            {
              body: {
                email,
                promoType: "early_bird_lifetime",
                notes: notes || "Early Bird Beta Tester",
              },
            }
          );

          if (inviteError) {
            console.error(`Error creating invite for ${email}:`, inviteError);
            errorCount++;
          } else {
            inviteCount++;
          }
          continue;
        }

        // Grant promo access to existing user
        const { error: grantError } = await supabase.functions.invoke(
          "grant-promo-access",
          {
            body: {
              targetUserId: profiles.id,
              promoType: "early_bird_lifetime",
              notes: notes || "Early Bird Beta Tester",
            },
          }
        );

        if (grantError) {
          console.error(`Error granting access to ${email}:`, grantError);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`Error processing ${email}:`, err);
        errorCount++;
      }
    }

    setLoading(false);

    if (successCount > 0) {
      toast.success(`✨ Granted lifetime access to ${successCount} existing user(s)!`);
    }

    if (inviteCount > 0) {
      toast.success(
        `📧 Created ${inviteCount} invite(s). Check Supabase invite emails and share the links with users.`,
        { duration: 6000 }
      );
    }

    if (successCount > 0 || inviteCount > 0) {
      setEmails("");
      fetchPromoUsers();
    }

    if (errorCount > 0) {
      toast.error(`Failed to process ${errorCount} email(s)`);
    }
  };

  const handleRevoke = async (userId: string, email: string) => {
    const { error } = await supabase
      .from("promo_users")
      .delete()
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to revoke access");
      return;
    }

    toast.success(`Revoked access for ${email}`);
    fetchPromoUsers();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Grant Early Bird Access
          </CardTitle>
          <CardDescription>
            Give your beta testers lifetime access to all recipes, community, and future features. 
            For existing users, access is granted immediately. For new users, an invite will be created 
            and you can share the link with them manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emails">Email Addresses</Label>
            <Textarea
              id="emails"
              placeholder="Enter email addresses (one per line or comma-separated)&#10;example1@email.com&#10;example2@email.com, example3@email.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              💡 Tip: Existing users get access immediately. New users will receive 
              a Supabase invite email with a signup link - you can also share that link manually.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="e.g., Early Bird Beta Tester - Lifetime Access"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGrantAccess}
            disabled={loading || !emails.trim()}
            className="w-full"
            size="lg"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {loading ? "Processing..." : "Grant Lifetime Access"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Early Bird Users ({promoUsers.length})</CardTitle>
          <CardDescription>
            Users who have been granted lifetime access to all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {promoUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No early bird users yet</p>
              <p className="text-sm">
                Grant access to your first beta testers above
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {promoUsers.map((promo) => (
                  <div
                    key={promo.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">
                          {promo.profiles?.email || "Unknown"}
                        </p>
                        <Badge variant="secondary" className="shrink-0">
                          <Gift className="h-3 w-3 mr-1" />
                          {promo.promo_type}
                        </Badge>
                      </div>
                      {promo.notes && (
                        <p className="text-sm text-muted-foreground truncate">
                          {promo.notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Granted: {new Date(promo.granted_at).toLocaleDateString()}
                        {promo.expires_at &&
                          ` • Expires: ${new Date(promo.expires_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRevoke(promo.user_id, promo.profiles?.email)
                      }
                      className="ml-4 shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">📧 Workflow Reminder</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>
            <strong>New Users:</strong> Enter their email above. They'll receive a 
            Supabase invite email with a signup link. You can also share that link manually 
            via text/email. Promo access is auto-granted when they sign up.
          </p>
          <p>
            <strong>Existing Users:</strong> Enter their email above and they'll 
            immediately get lifetime access to all features.
          </p>
          <p className="pt-2 text-xs">
            ✨ All users get access to all recipes, community, and the "Hey Sasha" AI assistant
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
