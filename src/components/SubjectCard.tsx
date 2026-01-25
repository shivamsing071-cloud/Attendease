import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SubjectAnalytics {
  name: string;
  totalSlots: number;
  attendedSlots: number;
  attendancePercentage: number;
  isSafe: boolean;
  color: string;
}

export function SubjectCard({ subject }: { subject: SubjectAnalytics }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="font-headline" style={{ color: subject.color }}>{subject.name}</CardTitle>
            <Badge variant={subject.isSafe ? 'default' : 'destructive'} className={cn(subject.isSafe ? 'bg-green-500' : 'bg-red-500', 'text-white')}>
                {subject.isSafe ? 'Safe' : 'Danger'}
            </Badge>
        </div>
        <CardDescription>
          Attended {subject.attendedSlots} of {subject.totalSlots} classes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Attendance</span>
            <span className="font-semibold text-foreground">{subject.attendancePercentage.toFixed(1)}%</span>
        </div>
        <Progress value={subject.attendancePercentage} className="h-2" />
      </CardContent>
    </Card>
  );
}
