
// Utility functions for homework component
export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-800 border-green-200";
    case "not-started": return "bg-gray-100 text-gray-800 border-gray-200";
    case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
    case "overdue": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU");
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "completed": return "Выполнено";
    case "not-started": return "Не начато";
    case "in-progress": return "В процессе";
    case "overdue": return "Просрочено";
    default: return "Неизвестно";
  }
};
