
import { Book, Calendar, Search, Star, Video } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Удобный поиск",
      description: "Быстрый подбор репетиторов по предметам, опыту и стоимости"
    },
    {
      icon: <Star className="h-10 w-10 text-primary" />,
      title: "Проверенные отзывы",
      description: "Репетиторы с реальными отзывами и подтвержденной квалификацией"
    },
    {
      icon: <Video className="h-10 w-10 text-primary" />,
      title: "Онлайн-занятия",
      description: "Проводите занятия онлайн без дополнительных приложений"
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Гибкое расписание",
      description: "Выбирайте удобное время для занятий и управляйте календарем"
    },
    {
      icon: <Book className="h-10 w-10 text-primary" />,
      title: "Учебные материалы",
      description: "Доступ к полезным материалам и образовательным ресурсам"
    }
  ];

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Почему выбирают Stud.rep?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
