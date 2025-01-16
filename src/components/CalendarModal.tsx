import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date | undefined) => void;
}

const CalendarModal = ({ isOpen, onClose, onDateSelect }: CalendarModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [taskTitle, setTaskTitle] = useState("");

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const handleAddTask = () => {
    if (selectedDate && taskTitle) {
      // Here you would typically add the task to your tasks table
      console.log("Adding task:", { date: selectedDate, title: taskTitle });
      setTaskTitle("");
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="top" className="h-[80vh] w-full max-w-3xl mx-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
            <CalendarDays className="w-5 h-5" />
            Select Date
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center gap-6 mt-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border shadow-md"
          />
          {selectedDate && (
            <div className="w-full max-w-md space-y-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
              <h3 className="text-sm font-medium">
                Add task for {selectedDate.toLocaleDateString()}
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter task title..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
                <Button onClick={handleAddTask} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CalendarModal;