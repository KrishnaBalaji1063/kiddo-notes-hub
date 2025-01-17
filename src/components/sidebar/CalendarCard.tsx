import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

interface CalendarCardProps {
  onDateSelect: (date: Date | undefined) => void;
}

export const CalendarCard = ({ onDateSelect }: CalendarCardProps) => {
  return (
    <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-purple-600 dark:text-purple-300">
          <CalendarIcon className="w-4 h-4" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          onSelect={onDateSelect}
          className="rounded-md border-none bg-transparent"
          classNames={{
            months: "space-y-4",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium text-purple-600 dark:text-purple-300",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-full transition-all",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-purple-600/60 dark:text-purple-300/60 rounded-md w-8 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-purple-100 dark:bg-purple-800/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
            day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-full transition-all",
            day_today: "bg-purple-200 dark:bg-purple-700 text-purple-900 dark:text-purple-100",
            day_outside: "text-purple-600/50 dark:text-purple-300/50 opacity-50 aria-selected:bg-purple-100/50 dark:aria-selected:bg-purple-800/50",
            day_disabled: "text-purple-600/50 dark:text-purple-300/50 opacity-50",
            day_range_middle: "aria-selected:bg-purple-100 dark:aria-selected:bg-purple-800 aria-selected:text-purple-900 dark:aria-selected:text-purple-100",
            day_hidden: "invisible",
            day_selected: "bg-purple-600 text-white hover:bg-purple-700 hover:text-white focus:bg-purple-700 focus:text-white dark:bg-purple-500 dark:text-white dark:hover:bg-purple-600",
          }}
        />
      </CardContent>
    </Card>
  );
};