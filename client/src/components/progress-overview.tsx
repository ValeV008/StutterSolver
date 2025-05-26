import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/audio-utils";

interface Stats {
  recorded: number;
  total: number;
  duration: number;
  quality: string;
  percentage: number;
}

export function ProgressOverview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-6"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Training Progress</h3>
          <span className="text-sm text-gray-500">
            {stats.recorded} of {Math.max(stats.total, 100)} samples recorded
          </span>
        </div>
        <Progress value={stats.percentage} className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">{stats.recorded}</div>
            <div className="text-sm text-gray-600">Samples Recorded</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-accent mb-1">
              {formatDuration(stats.duration)}
            </div>
            <div className="text-sm text-gray-600">Total Duration</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-secondary mb-1">{stats.quality}</div>
            <div className="text-sm text-gray-600">Audio Quality</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
