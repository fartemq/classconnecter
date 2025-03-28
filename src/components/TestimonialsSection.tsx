
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Мария К.",
      role: "Студентка",
      testimonial: "Благодаря Stud.rep я нашла отличного репетитора по математике. Мои оценки значительно улучшились, и я наконец-то начала понимать предмет!",
      avatar: "МК"
    },
    {
      name: "Алексей П.",
      role: "Родитель школьника",
      testimonial: "Очень удобная платформа для поиска преподавателей. Мой сын занимается с репетитором по физике, и результаты превзошли все ожидания.",
      avatar: "АП"
    },
    {
      name: "Ольга С.",
      role: "Репетитор по английскому",
      testimonial: "Как репетитору, мне нравится прозрачность платформы и удобные инструменты для проведения занятий. Нашла много новых учеников!",
      avatar: "ОС"
    }
  ];

  return (
    <div className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Отзывы наших пользователей</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <Card key={index} className="bg-white">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarFallback className="bg-primary text-white">{item.avatar}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{item.role}</p>
                  <p className="text-gray-600 italic">{item.testimonial}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
