import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Coffee, TrendingUp, Users, Calendar } from "lucide-react";
import { format } from "date-fns";

interface CoffeeClick {
  id: string;
  user_id: string | null;
  clicked_at: string;
  page_path: string | null;
}

export const CoffeeClicksTab = () => {
  const [clicks, setClicks] = useState<CoffeeClick[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [uniqueUsers, setUniqueUsers] = useState(0);
  const [todayClicks, setTodayClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Get all clicks
      const { data: allClicks, error } = await supabase
        .from('coffee_clicks')
        .select('*')
        .order('clicked_at', { ascending: false });

      if (error) throw error;

      setClicks(allClicks || []);
      setTotalClicks(allClicks?.length || 0);

      // Calculate unique users
      const uniqueUserIds = new Set(
        allClicks?.filter(c => c.user_id).map(c => c.user_id)
      );
      setUniqueUsers(uniqueUserIds.size);

      // Calculate today's clicks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayClicksCount = allClicks?.filter(c => 
        new Date(c.clicked_at) >= today
      ).length || 0;
      setTodayClicks(todayClicksCount);

    } catch (error) {
      console.error('Error fetching coffee clicks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('coffee-clicks-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coffee_clicks'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div className="p-6">Loading coffee click statistics...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-fredoka text-ocean-deep">☕ Coffee Button Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Track engagement with your "Buy me a Coffee" button
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Coffee className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-ocean-wave" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Logged in users who clicked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-coral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayClicks}</div>
            <p className="text-xs text-muted-foreground">Clicks in last 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clicks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Clicks
          </CardTitle>
          <CardDescription>
            Last 50 coffee button interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {clicks.slice(0, 50).map((click) => (
              <div 
                key={click.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Coffee className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium">
                      {click.user_id ? 'Logged in user' : 'Anonymous visitor'}
                    </p>
                    {click.page_path && (
                      <p className="text-xs text-muted-foreground">
                        From: {click.page_path}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(click.clicked_at), 'MMM d, h:mm a')}
                </span>
              </div>
            ))}
            {clicks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No clicks yet. The button will start tracking soon!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
