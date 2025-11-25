import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface Task {
  id: string;
  title: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    dots?: Array<{ color: string }>;
    selected?: boolean;
    selectedColor?: string;
  };
}

const TaskCalendarWithLibrary = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Sample tasks
  const tasks: Task[] = [
    { id: '1', title: 'Team Meeting', date: '2024-11-15', priority: 'high' },
    { id: '2', title: 'Code Review', date: '2024-11-15', priority: 'medium' },
    { id: '3', title: 'Buy Groceries', date: '2024-11-18', priority: 'low' },
    { id: '4', title: 'Workout', date: '2024-11-20', priority: 'medium' },
    { id: '5', title: 'Project Deadline', date: '2024-11-25', priority: 'high' },
    { id: '6', title: 'Doctor Appointment', date: '2024-11-25', priority: 'medium' },
    { id: '7', title: 'Team Lunch', date: '2024-11-25', priority: 'low' },
  ];

  // Convert tasks to marked dates
  const getMarkedDates = (): MarkedDates => {
    const marked: MarkedDates = {};

    tasks.forEach(task => {
      if (!marked[task.date]) {
        marked[task.date] = { dots: [] };
      }

      const color = 
        task.priority === 'high' ? '#FB7185' :
        task.priority === 'medium' ? '#FBBF24' :
        '#34D399';

      marked[task.date].dots?.push({ color });
    });

    // Add selected date styling
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#6366F1',
      };
    }

    return marked;
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => task.date === date);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="py-6">
        {/* Calendar Container */}
        <View className="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <Calendar
            // Date handling
            onDayPress={handleDayPress}
            markedDates={getMarkedDates()}
            markingType="multi-dot"
            
            // Styling dengan theme object
            theme={{
              // Background colors
              calendarBackground: '#FFFFFF',
              
              // Text colors
              textSectionTitleColor: '#64748B',
              dayTextColor: '#1E293B',
              todayTextColor: '#6366F1',
              selectedDayTextColor: '#FFFFFF',
              monthTextColor: '#1E293B',
              
              // Font styling
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 12,
              
              // Other colors
              selectedDayBackgroundColor: '#6366F1',
              todayBackgroundColor: 'transparent',
              dotColor: '#6366F1',
              arrowColor: '#64748B',
              disabledArrowColor: '#CBD5E1',
              
              // Margins & paddings
              'stylesheet.calendar.header': {
                header: {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 16,
                  paddingBottom: 16,
                  alignItems: 'center',
                },
                monthText: {
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#1E293B',
                },
                arrow: {
                  padding: 8,
                },
              },
              'stylesheet.day.basic': {
                base: {
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                text: {
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#1E293B',
                },
                today: {
                  borderWidth: 2,
                  borderColor: '#6366F1',
                  borderRadius: 20,
                },
                selected: {
                  backgroundColor: '#6366F1',
                  borderRadius: 20,
                },
              },
            }}
            
            // Additional props
            enableSwipeMonths={true}
            hideExtraDays={true}
            
            // Custom header (optional - untuk styling lebih lanjut)
            renderHeader={(date) => {
              const monthNames = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
              ];
              const month = monthNames[date.getMonth()];
              const year = date.getFullYear();
              
              return (
                <View className="py-4">
                  <Text className="text-lg font-semibold text-slate-800 text-center">
                    {month} {year}
                  </Text>
                </View>
              );
            }}
          />

          {/* Legend */}
          <View className="px-4 pb-4 pt-2 border-t border-slate-100 flex-row justify-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-rose-400" />
              <Text className="text-xs text-slate-600">High</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-amber-300" />
              <Text className="text-xs text-slate-600">Medium</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-xs text-slate-600">Low</Text>
            </View>
          </View>
        </View>

        {/* Task List for Selected Date */}
        {selectedDate && getTasksForDate(selectedDate).length > 0 && (
          <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-4">
            <Text className="text-base font-semibold text-slate-800 mb-3">
              Tasks - {new Date(selectedDate).toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
            
            {getTasksForDate(selectedDate).map(task => {
              const priorityColors = {
                high: 'bg-rose-100 border-rose-300',
                medium: 'bg-amber-100 border-amber-300',
                low: 'bg-emerald-100 border-emerald-300',
              };
              
              const priorityTextColors = {
                high: 'text-rose-700',
                medium: 'text-amber-700',
                low: 'text-emerald-700',
              };

              return (
                <View 
                  key={task.id} 
                  className={`mb-2 p-3 rounded-xl border ${priorityColors[task.priority]}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-slate-800 flex-1">
                      {task.title}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                      <Text className={`text-xs font-semibold ${priorityTextColors[task.priority]} capitalize`}>
                        {task.priority}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {selectedDate && getTasksForDate(selectedDate).length === 0 && (
          <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-8 items-center">
            <Text className="text-slate-400 text-sm">
              Tidak ada tugas untuk tanggal ini
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TaskCalendarWithLibrary;