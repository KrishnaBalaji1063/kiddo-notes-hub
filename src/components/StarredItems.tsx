import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

interface StarredItem {
  id: string;
  title: string;
  type: 'note' | 'task';
  due_date?: string | null;
  created_at: string;
}

interface StarredItemsProps {
  items: StarredItem[];
}

export const StarredItems = ({ items }: StarredItemsProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          Starred Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items && items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-800/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/${item.type}s`)}
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {item.type === 'task' && item.due_date
                    ? `Due: ${format(new Date(item.due_date), "PPP")}`
                    : `Created: ${format(new Date(item.created_at), "PPP")}`}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No starred items</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};